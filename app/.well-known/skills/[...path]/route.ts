import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = process.env.SKILLS_OUTPUT_DIR || path.join(process.cwd(), '.skills-output');

const MIME_TYPES: Record<string, string> = {
    '.json': 'application/json',
    '.md': 'text/markdown; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.yaml': 'text/yaml; charset=utf-8',
    '.yml': 'text/yaml; charset=utf-8',
    '.sh': 'text/x-shellscript; charset=utf-8',
    '.ts': 'text/typescript; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.py': 'text/x-python; charset=utf-8',
};

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    const { path: segments } = await params;
    const relativePath = segments.join('/');

    // Prevent path traversal
    if (relativePath.includes('..')) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const filePath = path.join(OUTPUT_DIR, '.well-known', 'skills', relativePath);

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const content = fs.readFileSync(filePath);

    return new NextResponse(content, {
        status: 200,
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=60',
            'Access-Control-Allow-Origin': '*',
        },
    });
}
