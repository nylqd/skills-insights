import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { pool } from './db';
import { RowDataPacket } from 'mysql2';

// --- Configuration ---

interface RepoConfig {
    url: string;
    branch: string;
    subpath?: string;
}

interface SyncConfig {
    interval_ms?: number;
    repos: RepoConfig[];
}

interface SkillInfo {
    name: string;
    description: string;
    files: string[];
    source_repo: string;
    synced_at: string;
}

const CACHE_DIR = process.env.SKILLS_CACHE_DIR || path.join(process.cwd(), '.skills-cache');
const OUTPUT_DIR = process.env.SKILLS_OUTPUT_DIR || path.join(process.cwd(), '.skills-output');
const SYNC_INTERVAL = parseInt(process.env.SKILLS_SYNC_INTERVAL || '600000', 10); // 10 min default

// --- Git Authentication ---

function getAuthedUrl(repoUrl: string): string {
    const { GIT_USERNAME, GIT_PASSWORD } = process.env;
    if (!GIT_USERNAME || !GIT_PASSWORD) return repoUrl;
    if (!repoUrl.startsWith('https://')) return repoUrl;

    const user = encodeURIComponent(GIT_USERNAME);
    const pass = encodeURIComponent(GIT_PASSWORD);
    return repoUrl.replace('https://', `https://${user}:${pass}@`);
}

// --- Config Loading ---

async function loadConfig(): Promise<SyncConfig> {
    const config: SyncConfig = { repos: [] };

    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT url, branch FROM skills.skill_repos WHERE status = 'approved'`
        );
        for (const row of rows) {
            config.repos.push({ url: row.url, branch: row.branch });
        }
        console.log(`[skills-sync] Loaded ${config.repos.length} approved repos from database`);
    } catch (err) {
        console.error('[skills-sync] Failed to load repos from database:', err);
    }

    return config;
}

// --- Git Operations ---

function cloneOrPull(repo: RepoConfig, cacheDir: string): boolean {
    const name = path.basename(repo.url, '.git');
    const repoDir = path.join(cacheDir, name);
    const authedUrl = getAuthedUrl(repo.url);

    try {
        if (fs.existsSync(path.join(repoDir, '.git'))) {
            console.log(`[skills-sync] Pulling ${name} (${repo.branch})`);
            execSync(`git -C "${repoDir}" fetch origin ${repo.branch} --depth 1`, {
                stdio: 'pipe',
                timeout: 60_000,
            });
            execSync(`git -C "${repoDir}" reset --hard origin/${repo.branch}`, {
                stdio: 'pipe',
                timeout: 30_000,
            });
        } else {
            console.log(`[skills-sync] Cloning ${name} (${repo.branch})`);
            fs.mkdirSync(cacheDir, { recursive: true });
            execSync(
                `git clone --branch "${repo.branch}" --depth 1 "${authedUrl}" "${repoDir}"`,
                { stdio: 'pipe', timeout: 120_000 }
            );
        }
        return true;
    } catch (err) {
        console.error(`[skills-sync] Failed to sync ${name}:`, err instanceof Error ? err.message : err);
        return false;
    }
}

// --- Skill Discovery ---

function findSkillMdFiles(dir: string): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    function walk(current: string) {
        const entries = fs.readdirSync(current, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name === 'node_modules' || entry.name === '.git') continue;

            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.name === 'SKILL.md') {
                results.push(fullPath);
            }
        }
    }

    walk(dir);
    return results;
}

function extractSkillDescription(skillMdPath: string): string {
    try {
        const content = fs.readFileSync(skillMdPath, 'utf-8');
        // Extract YAML frontmatter description
        const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
        if (fmMatch) {
            const descMatch = fmMatch[1].match(/description:\s*(.+)/);
            if (descMatch) return descMatch[1].trim();
        }
        // Fallback: first heading or first line
        const headingMatch = content.match(/^#\s+(.+)/m);
        if (headingMatch) return headingMatch[1].trim();
        return '';
    } catch {
        return '';
    }
}

function listFilesRecursive(dir: string): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...listFilesRecursive(fullPath));
        } else {
            results.push(fullPath);
        }
    }
    return results;
}

// --- Scan & Copy ---

async function scanAndCopySkills(cacheDir: string, outputDir: string): Promise<SkillInfo[]> {
    const wellKnownDir = path.join(outputDir, '.well-known', 'skills');
    // Clean output dir
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(wellKnownDir, { recursive: true });

    const skills: SkillInfo[] = [];
    const syncedAt = new Date().toISOString();

    const config = await loadConfig();
    for (const repo of config.repos) {
        const repoName = path.basename(repo.url, '.git');
        const scanRoot = repo.subpath
            ? path.join(cacheDir, repoName, repo.subpath)
            : path.join(cacheDir, repoName);

        const skillMdFiles = findSkillMdFiles(scanRoot);

        for (const skillMdPath of skillMdFiles) {
            const skillDir = path.dirname(skillMdPath);
            const skillName = path.basename(skillDir);
            const destDir = path.join(wellKnownDir, skillName);

            // Copy all files in the skill directory
            fs.mkdirSync(destDir, { recursive: true });
            const allFiles = listFilesRecursive(skillDir);
            const relFiles: string[] = [];

            for (const file of allFiles) {
                const rel = path.relative(skillDir, file);
                const destFile = path.join(destDir, rel);
                fs.mkdirSync(path.dirname(destFile), { recursive: true });
                fs.copyFileSync(file, destFile);
                relFiles.push(rel);
            }

            // RFC requires SKILL.md to be first in files array
            const sortedFiles = relFiles.sort((a, b) => {
                if (a === 'SKILL.md') return -1;
                if (b === 'SKILL.md') return 1;
                return a.localeCompare(b);
            });

            skills.push({
                name: skillName,
                description: extractSkillDescription(skillMdPath),
                files: sortedFiles,
                source_repo: repo.url,
                synced_at: syncedAt,
            });
        }
    }

    return skills;
}

// --- Index Generation ---

function generateIndex(skills: SkillInfo[], outputDir: string): void {
    const indexPath = path.join(outputDir, '.well-known', 'skills', 'index.json');
    // Conform to cloudflare/agent-skills-discovery-rfc
    // source_repo and synced_at are extra fields — RFC clients will ignore them
    const index = {
        skills: skills.map(s => ({
            name: s.name,
            description: s.description,
            files: s.files,
            source_repo: s.source_repo,
            synced_at: s.synced_at,
        })),
    };
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
    console.log(`[skills-sync] Generated index.json with ${skills.length} skills`);
}

// --- Main Entry Points ---

export async function syncAll(): Promise<void> {
    console.log('[skills-sync] Starting sync...');
    const config = await loadConfig();

    if (config.repos.length === 0) {
        console.log('[skills-sync] No repos configured, skipping');
        return;
    }

    // 1. Clone/pull all repos
    for (const repo of config.repos) {
        const success = cloneOrPull(repo, CACHE_DIR);
        if (success) {
            try {
                await pool.execute(
                    `UPDATE skills.skill_repos SET last_sync_at = NOW() WHERE url = ?`,
                    [repo.url]
                );
            } catch (dbErr) {
                console.error(`[skills-sync] Failed to update last_sync_at for ${repo.url}`, dbErr);
            }
        }
    }

    // 2. Scan and copy skills
    const skills = await scanAndCopySkills(CACHE_DIR, OUTPUT_DIR);

    // 3. Generate index
    generateIndex(skills, OUTPUT_DIR);

    console.log(`[skills-sync] Sync complete. ${skills.length} skills available.`);
}

export function startSyncLoop(): void {
    console.log(`[skills-sync] Starting sync loop...`);

    async function runLoop() {
        try {
            await syncAll();
        } catch (err) {
            console.error('[skills-sync] Sync failed:', err);
        }

        // Read interval dynamically for the next run so config changes apply without restart
        const config = await loadConfig();
        const nextInterval = config.interval_ms || SYNC_INTERVAL;
        console.log(`[skills-sync] Next sync in ${nextInterval}ms...`);
        setTimeout(runLoop, nextInterval);
    }

    // Run immediately on startup
    runLoop();
}
