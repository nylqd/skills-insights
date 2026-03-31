import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = process.env.SKILLS_OUTPUT_DIR || path.join(process.cwd(), '.skills-output');

export interface SyncedSkill {
    name: string;
    description: string;
    files: string[];
    source_repo?: string;
    synced_at?: string;
}

export interface SyncedConflict {
    name: string;
    description: string;
    source_repo: string;
    kept_repo: string;
}

export interface SyncedSkillsIndex {
    skills: SyncedSkill[];
    conflicts?: SyncedConflict[];
}

export function getSyncedSkills(): SyncedSkill[] {
    const indexPath = path.join(OUTPUT_DIR, '.well-known', 'skills', 'index.json');
    try {
        if (!fs.existsSync(indexPath)) return [];
        const content = fs.readFileSync(indexPath, 'utf-8');
        const data = JSON.parse(content) as SyncedSkillsIndex;
        return data.skills || [];
    } catch (err) {
        console.error('[skills-fs] Failed to read index.json:', err);
        return [];
    }
}

export function getSyncedConflicts(): SyncedConflict[] {
    const indexPath = path.join(OUTPUT_DIR, '.well-known', 'skills', 'index.json');
    try {
        if (!fs.existsSync(indexPath)) return [];
        const content = fs.readFileSync(indexPath, 'utf-8');
        const data = JSON.parse(content) as SyncedSkillsIndex;
        return data.conflicts || [];
    } catch (err) {
        console.error('[skills-fs] Failed to read conflicts from index.json:', err);
        return [];
    }
}

export function getSkillMeta(skillName: string): SyncedSkill | null {
    const skills = getSyncedSkills();
    return skills.find(s => s.name === skillName) ?? null;
}

export function getSkillFile(skillName: string, filename: string): string | null {
    // Prevent path traversal
    if (skillName.includes('..') || filename.includes('..')) {
        return null;
    }

    const filePath = path.join(OUTPUT_DIR, '.well-known', 'skills', skillName, filename);
    try {
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            return null;
        }
        return fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
        console.error(`[skills-fs] Failed to read file ${filename} for skill ${skillName}:`, err);
        return null;
    }
}
