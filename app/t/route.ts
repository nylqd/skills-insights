import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    // Parse required fields
    const event = searchParams.get("event") || "unknown";
    const source = searchParams.get("source") || "unknown";
    const agents = searchParams.get("agents") || "";
    const cliVersion = searchParams.get("v") || "";
    const isCI = searchParams.get("ci") === "1" ? 1 : 0;

    // Extract and split multiple skills
    const skillsParam = searchParams.get("skills") || "";
    const parsedSkills = skillsParam
        ? skillsParam.split(",").map((s) => s.trim()).filter(Boolean)
        : ["unknown"]; // at least one event entry

    console.log(`[telemetry] GET /t event=${event} source=${source} skills=${skillsParam} agent=${agents} v=${cliVersion} ci=${isCI}`);

    try {
        // We insert each skill individually for better visualization in leaderboard
        const insertValues = parsedSkills.map((skill) => [
            event, source, skill, agents, cliVersion, isCI,
        ]);

        // Fire and forget, don't await MySQL in the critical path to block the edge
        pool.query(
            "INSERT INTO telemetry_events (event, source, skill, agent, cli_version, is_ci) VALUES ?",
            [insertValues]
        ).then(() => {
            console.log(`[telemetry] ✅ Inserted ${insertValues.length} row(s)`);
        }).catch((err: unknown) => {
            console.error("[telemetry] ❌ Failed to insert:", err);
        });

    } catch (err: unknown) {
        console.error("[telemetry] ❌ Critical error:", err);
    }

    // Always return 204 FAST
    return new NextResponse(null, { status: 204 });
}
