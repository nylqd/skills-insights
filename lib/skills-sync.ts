import { exec } from 'child_process';
import util from 'util';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { pool } from './db';
import { RowDataPacket } from 'mysql2';

const execAsync = util.promisify(exec);

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
    hash: string;
    synced_at: string;
}

interface ConflictInfo {
    name: string;
    description: string;
    source_repo: string;
    kept_repo: string;
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

async function cloneOrPull(repo: RepoConfig, cacheDir: string): Promise<boolean> {
    const name = path.basename(repo.url, '.git');
    const repoDir = path.join(cacheDir, name);
    const authedUrl = getAuthedUrl(repo.url);

    try {
        if (fs.existsSync(path.join(repoDir, '.git'))) {
            console.log(`[skills-sync] Pulling ${name} (${repo.branch})`);
            await execAsync(`git -C "${repoDir}" fetch origin ${repo.branch} --depth 1`, {
                timeout: 60_000,
            });
            await execAsync(`git -C "${repoDir}" reset --hard origin/${repo.branch}`, {
                timeout: 30_000,
            });
        } else {
            console.log(`[skills-sync] Cloning ${name} (${repo.branch})`);
            fs.mkdirSync(cacheDir, { recursive: true });
            await execAsync(
                `git clone --branch "${repo.branch}" --depth 1 "${authedUrl}" "${repoDir}"`,
                { timeout: 120_000 }
            );
        }
        return true;
    } catch (err) {
        console.error(`[skills-sync] Failed to sync ${name}:`, err instanceof Error ? err.message : err);
        return false;
    }
}

const SKILLS_DEBUG = process.env.SKILLS_DEBUG === '1';

function computeSkillContentHash(skillDir: string, files: string[]): string {
    const hash = crypto.createHash('sha256');
    const skillName = path.basename(skillDir);
    for (const file of files) {
        const fullPath = path.join(skillDir, file);
        const content = fs.readFileSync(fullPath);
        hash.update(file); // include relative path so renames are detected
        hash.update(content);

        if (SKILLS_DEBUG) {
            const fileHash = crypto.createHash('sha256').update(file).update(content).digest('hex').slice(0, 12);
            console.log(`[skills-debug] ${skillName}/${file}  hash=${fileHash}  size=${content.length}`);
        }
    }
    const result = hash.digest('hex').slice(0, 12);
    if (SKILLS_DEBUG) {
        console.log(`[skills-debug] ${skillName} => total_hash=${result}  files=${files.length}`);
    }
    return result;
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
        // Skip directories/files that change between git operations or are irrelevant
        if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.DS_Store') continue;

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

interface ScanResult {
    skills: SkillInfo[];
    conflicts: ConflictInfo[];
}

async function scanAndCopySkills(cacheDir: string, tmpDir: string): Promise<ScanResult> {
    const wellKnownDir = path.join(tmpDir, '.well-known', 'skills');
    fs.mkdirSync(wellKnownDir, { recursive: true });
    console.log(`[skills-sync] Building skills in temporary directory: ${tmpDir}`);

    const skills: SkillInfo[] = [];
    const conflicts: ConflictInfo[] = [];
    const syncedAt = new Date().toISOString();
    // Track seen skill names for first-wins deduplication
    const seenSkills = new Map<string, string>(); // skillName -> source_repo url

    const config = await loadConfig();
    for (const repo of config.repos) {
        const repoName = path.basename(repo.url, '.git');
        const repoDir = path.join(cacheDir, repoName);
        const scanRoot = repo.subpath
            ? path.join(repoDir, repo.subpath)
            : repoDir;

        const skillMdFiles = findSkillMdFiles(scanRoot);

        for (const skillMdPath of skillMdFiles) {
            const skillDir = path.dirname(skillMdPath);
            const skillName = path.basename(skillDir);

            // Deduplicate: first repo wins, skip duplicates
            const existingRepo = seenSkills.get(skillName);
            if (existingRepo) {
                console.warn(`[skills-sync] Duplicate skill "${skillName}" from ${repo.url} skipped (already provided by ${existingRepo})`);
                conflicts.push({
                    name: skillName,
                    description: extractSkillDescription(skillMdPath),
                    source_repo: repo.url,
                    kept_repo: existingRepo,
                });
                continue;
            }
            seenSkills.set(skillName, repo.url);

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

            // Compute content hash from skill files
            const skillHash = computeSkillContentHash(skillDir, sortedFiles);

            skills.push({
                name: skillName,
                description: extractSkillDescription(skillMdPath),
                files: sortedFiles,
                source_repo: repo.url,
                hash: skillHash,
                synced_at: syncedAt,
            });
        }
    }

    return { skills, conflicts };
}

// --- Index Generation ---

function generateIndex(skills: SkillInfo[], conflicts: ConflictInfo[], outputDir: string): void {
    const indexPath = path.join(outputDir, '.well-known', 'skills', 'index.json');
    // Conform to cloudflare/agent-skills-discovery-rfc
    // source_repo, synced_at, conflicts are extra fields — RFC clients will ignore them
    const index = {
        skills: skills.map(s => ({
            name: s.name,
            description: s.description,
            files: s.files,
            source_repo: s.source_repo,
            hash: s.hash,
            synced_at: s.synced_at,
        })),
        conflicts: conflicts.length > 0 ? conflicts : undefined,
    };
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');

    // Generate individual skill JSON files
    for (const skill of index.skills) {
        const skillPath = path.join(outputDir, '.well-known', 'skills', `${skill.name}.json`);
        fs.writeFileSync(skillPath, JSON.stringify(skill, null, 2), 'utf-8');
    }

    console.log(`[skills-sync] Generated index.json with ${skills.length} skills and ${conflicts.length} conflicts`);
}

// --- Change Detection ---

interface ExistingSkillMeta {
    hash: string;
    synced_at: string;
}

function loadExistingSkillMetas(outputDir: string): Map<string, ExistingSkillMeta> {
    const metas = new Map<string, ExistingSkillMeta>();
    const indexPath = path.join(outputDir, '.well-known', 'skills', 'index.json');
    try {
        if (fs.existsSync(indexPath)) {
            const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
            for (const skill of data.skills || []) {
                if (skill.name && skill.hash) {
                    metas.set(skill.name, { hash: skill.hash, synced_at: skill.synced_at || '' });
                }
            }
        }
    } catch {
        // If index.json is corrupt or missing, treat as no existing data
    }
    return metas;
}

// --- Main Entry Points ---

export async function syncAll(): Promise<void> {
    console.log('[skills-sync] Starting sync...');
    const config = await loadConfig();

    if (config.repos.length === 0) {
        console.log('[skills-sync] No repos configured, skipping');
        return;
    }

    // Load existing hashes from current index.json for change detection BEFORE swapping
    const existingMetas = loadExistingSkillMetas(OUTPUT_DIR);

    // 1. Clone/pull all repos
    for (const repo of config.repos) {
        const success = await cloneOrPull(repo, CACHE_DIR);
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

    // 2. Scan and build new skill list (with per-skill hashes) into a temporary directory
    const tmpDir = `${OUTPUT_DIR}.tmp-${Date.now()}`;
    const { skills, conflicts } = await scanAndCopySkills(CACHE_DIR, tmpDir);

    // 3. Compare per-skill hashes with existing index to detect changes
    let hasChanges = false;

    for (const skill of skills) {
        const existing = existingMetas.get(skill.name);
        if (!existing || existing.hash !== skill.hash) {
            console.log(`[skills-sync] Change detected in skill "${skill.name}": ${existing?.hash || '(new)'} -> ${skill.hash}`);
            hasChanges = true;
        } else {
            // Preserve original synced_at for unchanged skills
            skill.synced_at = existing.synced_at;
        }
    }

    // Also detect if skills were removed
    for (const [name] of existingMetas) {
        if (!skills.find(s => s.name === name)) {
            console.log(`[skills-sync] Skill "${name}" removed`);
            hasChanges = true;
        }
    }

    if (!hasChanges) {
        console.log('[skills-sync] No skill-level changes detected, skipping index generation.');
        // Wipe the unused tmpDir since nothing changed
        fs.rm(tmpDir, { recursive: true, force: true }, () => { });
        return;
    }

    // 4. Generate index inside the temporary directory
    generateIndex(skills, conflicts, tmpDir);

    // 5. Atomic swap: replace the formal output directory with the temporary directory
    console.log(`[skills-sync] Preparing atomic swap from temporary dir: ${tmpDir}`);
    const oldDir = `${OUTPUT_DIR}.old-${Date.now()}`;
    const outputExists = fs.existsSync(OUTPUT_DIR);

    if (outputExists) {
        console.log(`[skills-sync] Existing output dir detected, moving aside to: ${oldDir}`);
        fs.renameSync(OUTPUT_DIR, oldDir);
    }

    console.log(`[skills-sync] Renaming temporary dir to formal output dir: ${OUTPUT_DIR}`);
    fs.renameSync(tmpDir, OUTPUT_DIR);

    if (outputExists) {
        // Clean up old dir in background (non-blocking)
        console.log(`[skills-sync] Triggering background cleanup for old dir: ${oldDir}`);
        fs.rm(oldDir, { recursive: true, force: true }, (err) => {
            if (err) {
                console.error(`[skills-sync] Background cleanup failed for ${oldDir}:`, err);
            } else {
                console.log(`[skills-sync] Background cleanup finished successfully for: ${oldDir}`);
            }
        });
    }

    console.log(`[skills-sync] Sync complete. ${skills.length} skills available, ${conflicts.length} conflicts.`);
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
