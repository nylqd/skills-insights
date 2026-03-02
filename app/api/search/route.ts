import { NextRequest, NextResponse } from "next/server";
import { searchSkills } from "@/lib/queries";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10") || 10, 50);

    if (query.length < 2) {
        return NextResponse.json({
            query,
            searchType: "fuzzy",
            skills: [],
            count: 0,
            duration_ms: 0,
        });
    }

    const start = Date.now();
    const skills = await searchSkills(query, limit);
    const duration_ms = Date.now() - start;

    return NextResponse.json({
        query,
        searchType: "fuzzy",
        skills,
        count: skills.length,
        duration_ms,
    });
}
