import { connection } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export type TopSkill = { skill: string; installs: number; sources: string[]; sourceInstalls: Record<string, number> };
export type TopAgent = { agent: string; usages: number };
export type GlobalMetrics = { total_installs: number; total_unique_skills: number };
export type SearchSkillResult = {
    id: string;
    skillId: string;
    name: string;
    installs: number;
    source: string;
};
export type SubmittedRepo = {
    id: number;
    url: string;
    branch: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    last_sync_at: string | null;
    contact_name: string;
};

export async function getGlobalMetrics(): Promise<GlobalMetrics> {
    await connection();
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT COUNT(*) as total_installs,
                    COUNT(DISTINCT skill) as total_unique_skills
             FROM skills.telemetry_events
             WHERE event = 'install'`
        );
        return (rows[0] as GlobalMetrics) || { total_installs: 0, total_unique_skills: 0 };
    } catch (e: unknown) {
        console.error(e);
        return { total_installs: 0, total_unique_skills: 0 };
    }
}

export async function getTopSkills(limit = 10): Promise<TopSkill[]> {
    await connection();
    try {
        // Query per-source installs, then aggregate in JS
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT skill, source, COUNT(*) as installs
             FROM skills.telemetry_events
             WHERE event = 'install' AND skill != '' AND skill != 'unknown'
             GROUP BY skill, source
             ORDER BY installs DESC`,
        );

        // Aggregate by skill
        const skillMap = new Map<string, { installs: number; sources: string[]; sourceInstalls: Record<string, number> }>();
        for (const row of rows as Array<{ skill: string; source: string; installs: number }>) {
            const existing = skillMap.get(row.skill);
            if (existing) {
                existing.installs += row.installs;
                if (row.source && !existing.sources.includes(row.source)) {
                    existing.sources.push(row.source);
                }
                if (row.source) {
                    existing.sourceInstalls[row.source] = row.installs;
                }
            } else {
                skillMap.set(row.skill, {
                    installs: row.installs,
                    sources: row.source ? [row.source] : [],
                    sourceInstalls: row.source ? { [row.source]: row.installs } : {},
                });
            }
        }

        // Sort by total installs and take top N
        return Array.from(skillMap.entries())
            .sort((a, b) => b[1].installs - a[1].installs)
            .slice(0, limit)
            .map(([skill, data]) => ({
                skill,
                ...data,
            }));
    } catch (e: unknown) {
        console.error(e);
        return [];
    }
}

export async function getTopAgents(limit = 10): Promise<TopAgent[]> {
    await connection();
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT agent, COUNT(*) as usages
             FROM skills.telemetry_events
             WHERE agent != '' AND agent != 'unknown'
             GROUP BY agent
             ORDER BY usages DESC
             LIMIT ?`,
            [limit]
        );
        return rows as TopAgent[];
    } catch (e: unknown) {
        console.error(e);
        return [];
    }
}

export async function searchSkills(query: string, limit = 10): Promise<SearchSkillResult[]> {
    await connection();
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT skill, source, COUNT(*) as installs
             FROM skills.telemetry_events
             WHERE event = 'install' AND skill != '' AND skill != 'unknown'
               AND skill LIKE ?
             GROUP BY skill, source
             ORDER BY installs DESC
             LIMIT ?`,
            [`%${query}%`, limit]
        );
        return (rows as Array<{ skill: string; source: string; installs: number }>).map((row) => ({
            id: row.source ? `${row.source}/${row.skill}` : row.skill,
            skillId: row.skill,
            name: row.skill,
            installs: row.installs,
            source: row.source || "",
        }));
    } catch (e: unknown) {
        console.error(e);
        return [];
    }
}

export async function getSubmittedRepos(): Promise<SubmittedRepo[]> {
    await connection();
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT id, url, branch, status, created_at, last_sync_at, contact_name
             FROM skills.skill_repos
             ORDER BY created_at DESC`
        );
        return rows as SubmittedRepo[];
    } catch (e: unknown) {
        console.error(e);
        return [];
    }
}
