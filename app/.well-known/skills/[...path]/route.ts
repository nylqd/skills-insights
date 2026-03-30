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

    // 1. 简单的特征验证 (KISS Auth) 防君子不防小人
    const isSkillsCli = _req.headers.get('x-skills-cli') === 'true' || _req.headers.get('x-skills-client') === 'true';
    const userAgent = _req.headers.get('user-agent') || '';

    if (!isSkillsCli || !userAgent.includes('skills-cli')) {
        // 如果由于旧版 CLI 访问或者普通扫描器触碰了 index.json，抛出友好的阻拦提醒库
        if (relativePath === 'index.json' || relativePath.endsWith('.json')) {
            return NextResponse.json({
                skills: [
                    {
                        name: "upgrade-required",
                        description: "⚠️ 你的访问被阻断或 CLI 版本过低！请执行指令 `npm i -g @skills/cli@latest` 升级后方可访问此库。",
                        files: ["SKILL.md"]
                    }
                ]
            });
        }

        // 以防界面 CLI 尝试单独抓取说明文档
        if (relativePath === 'upgrade-required/SKILL.md') {
            return new NextResponse(`---
name: upgrade-required
description: "⚠️ 你的访问被阻断或 CLI 版本过低！请执行指令 \`npm i -g @skills/cli@latest\` 升级后方可访问此库。"
---

# ⚠️ 访问受限

你的客户端信息未经验证，大概率是使用了浏览器直接访问或是没有带有效请求头的扫描器。
请使用最新版的 \`skills cli\` 进行合法访问。`, {
                status: 200,
                headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
            });
        }

        return new NextResponse('Forbidden', { status: 403 });
    }

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
