import { connection } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export type TopSkill = { skill: string; installs: number; sources: string[] };
export type TopAgent = { agent: string; usages: number };
export type GlobalMetrics = { total_installs: number; total_unique_skills: number };
export type SearchSkillResult = {
    id: string;
    skillId: string;
    name: string;
    installs: number;
    source: string;
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
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT skill, GROUP_CONCAT(DISTINCT source SEPARATOR '||') as sources, COUNT(*) as installs
             FROM skills.telemetry_events
             WHERE event = 'install' AND skill != '' AND skill != 'unknown'
             GROUP BY skill
             ORDER BY installs DESC
             LIMIT ?`,
            [limit]
        );
        return (rows as Array<{ skill: string; sources: string; installs: number }>).map((row) => ({
            skill: row.skill,
            installs: row.installs,
            sources: row.sources ? row.sources.split('||').filter(Boolean) : [],
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
