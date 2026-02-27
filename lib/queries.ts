import { connection } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export type TopSkill = { skill: string; installs: number };
export type TopAgent = { agent: string; usages: number };
export type GlobalMetrics = { total_installs: number; total_unique_skills: number };

export async function getGlobalMetrics(): Promise<GlobalMetrics> {
    await connection();
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT COUNT(*) as total_installs,
                    COUNT(DISTINCT skill) as total_unique_skills
             FROM telemetry_events
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
            `SELECT skill, COUNT(*) as installs
             FROM telemetry_events
             WHERE event = 'install' AND skill != '' AND skill != 'unknown'
             GROUP BY skill
             ORDER BY installs DESC
             LIMIT ?`,
            [limit]
        );
        return rows as TopSkill[];
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
             FROM telemetry_events
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
