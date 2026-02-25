import { connection } from "next/server";
import { clickhouse } from "@/lib/clickhouse";

export type TopSkill = { skill: string; installs: number };
export type TopAgent = { agent: string; usages: number };
export type GlobalMetrics = { total_installs: number; total_unique_skills: number };

export async function getGlobalMetrics(): Promise<GlobalMetrics> {
    await connection();
    try {
        const result = await clickhouse.query({
            query: `
        SELECT 
          count() as total_installs, 
          uniqExact(skill) as total_unique_skills
        FROM telemetry_events 
        WHERE event = 'install'
        SETTINGS optimize_trivial_count_query = 0
      `,
            format: "JSONEachRow"
        });
        const rows = (await result.json()) as GlobalMetrics[];
        return rows[0] || { total_installs: 0, total_unique_skills: 0 };
    } catch (e: unknown) {
        console.error(e);
        return { total_installs: 0, total_unique_skills: 0 };
    }
}

export async function getTopSkills(limit = 10): Promise<TopSkill[]> {
    await connection();
    try {
        const result = await clickhouse.query({
            query: `
        SELECT skill, count() as installs 
        FROM telemetry_events 
        WHERE event = 'install' AND skill != '' AND skill != 'unknown'
        GROUP BY skill 
        ORDER BY installs DESC 
        LIMIT ${limit}
        SETTINGS optimize_trivial_count_query = 0
      `,
            format: "JSONEachRow"
        });
        return (await result.json()) as TopSkill[];
    } catch (e: unknown) {
        console.error(e);
        return [];
    }
}

export async function getTopAgents(limit = 10): Promise<TopAgent[]> {
    await connection();
    try {
        const result = await clickhouse.query({
            query: `
        SELECT agent, count() as usages 
        FROM telemetry_events 
        WHERE agent != '' AND agent != 'unknown'
        GROUP BY agent 
        ORDER BY usages DESC 
        LIMIT ${limit}
        SETTINGS optimize_trivial_count_query = 0
      `,
            format: "JSONEachRow"
        });
        return (await result.json()) as TopAgent[];
    } catch (e: unknown) {
        console.error(e);
        return [];
    }
}
