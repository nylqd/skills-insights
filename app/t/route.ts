import { NextRequest, NextResponse } from "next/server";
import { clickhouse } from "../../lib/clickhouse";

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

    try {
        // We insert each skill individually for better visualization in leaderboard
        const insertValues = parsedSkills.map((skill) => ({
            event,
            source,
            skill,
            agent: agents,
            cli_version: cliVersion,
            is_ci: isCI,
            // timestamp is automatically filled by ClickHouse if omitted
        }));

        // Fire and forget, don't await ClickHouse in the critical path to block the edge
        clickhouse.insert({
            table: "telemetry_events",
            values: insertValues,
            format: "JSONEachRow",
        }).catch((err: unknown) => {
            console.error("Failed to async insert analytics:", err);
        });

    } catch (err: unknown) {
        console.error("Critical error in telemetry ingest:", err);
    }

    // Always return 204 FAST
    return new NextResponse(null, { status: 204 });
}
