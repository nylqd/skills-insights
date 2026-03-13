import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { url, branch, contact_name } = body;

        // Basic validation
        if (!url || !contact_name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }

        // Insert into database
        const finalBranch = branch || 'main';
        const status = 'pending'; // Default status

        const [result] = await pool.execute(
            `INSERT INTO skill_repos (url, branch, contact_name, status)
             VALUES (?, ?, ?, ?)`,
            [url, finalBranch, contact_name, status]
        );

        return NextResponse.json({ success: true, message: 'Repository submitted successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error submitting repository:', error);
        return NextResponse.json({ error: 'Failed to submit repository' }, { status: 500 });
    }
}
