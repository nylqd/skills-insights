import { getSkillFile, getSkillMeta } from "@/lib/skills-fs";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, FileText, Info, ExternalLink, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";
import { CopyableCommand } from "@/components/copyable-command";

export const dynamic = 'force-dynamic';

export default async function SkillDetailPage(
    { params }: { params: Promise<{ name: string }> }
) {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    let rawMarkdownContent = getSkillFile(decodedName, "SKILL.md");
    if (!rawMarkdownContent) {
        rawMarkdownContent = getSkillFile(decodedName, "skill.md");
    }

    if (!rawMarkdownContent) {
        notFound();
    }

    const { data: frontmatter, content: markdownBody } = matter(rawMarkdownContent);
    const installCommand = `skills add http://skills.sh --skill ${decodedName}`;
    const hasFrontmatter = Object.keys(frontmatter).length > 0;
    const meta = getSkillMeta(decodedName);

    return (
        <main className="max-w-4xl mx-auto">
            <Link
                href="/skills"
                className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 mb-8 transition-colors"
            >
                <ChevronLeft className="w-4 h-4" /> 返回 Skills 列表
            </Link>

            <header className="mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800/50 transition-colors">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 transition-colors">{decodedName}</h1>

                {/* Source info bar */}
                {meta && (meta.source_repo || meta.synced_at) && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        {meta.source_repo && (
                            <a
                                href={meta.source_repo.replace(/\.git$/, '')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 hover:border-cyan-300 dark:hover:border-cyan-600/50 transition-all"
                            >
                                <ExternalLink className="w-3 h-3" />
                                {meta.source_repo.replace(/^https?:\/\//, '').replace(/\.git$/, '')}
                            </a>
                        )}
                        {meta.synced_at && (
                            <span className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 transition-colors">
                                <Clock className="w-3 h-3" />
                                同步于 {new Date(meta.synced_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
                            </span>
                        )}
                    </div>
                )}

                <CopyableCommand command={installCommand} />
            </header>

            <article className="prose dark:prose-invert prose-zinc max-w-none prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-a:text-cyan-600 dark:prose-a:text-cyan-400 hover:prose-a:text-cyan-700 dark:hover:prose-a:text-cyan-300 prose-code:text-cyan-700 dark:prose-code:text-cyan-300 prose-code:bg-cyan-50 dark:prose-code:bg-cyan-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-pre:bg-zinc-50 dark:prose-pre:bg-zinc-900/80 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800/50 transition-colors">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/30 text-sm font-mono text-zinc-500 dark:text-zinc-300 transition-colors">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <span>SKILL.md</span>
                </div>

                {hasFrontmatter && (
                    <div className="not-prose mb-8 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl overflow-hidden shadow-sm transition-colors">
                        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/80 flex items-center gap-2 transition-colors">
                            <Info className="w-4 h-4 text-zinc-400" />
                            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Skill Metadata</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50 transition-colors">
                                    {Object.entries(frontmatter).map(([key, value]) => (
                                        <tr key={key} className="hover:bg-white dark:hover:bg-zinc-800/30 transition-colors">
                                            <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400 w-1/4 bg-zinc-100/30 dark:bg-zinc-950/30 align-top">
                                                {key}
                                            </th>
                                            <td className="px-6 py-3 text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdownBody}
                </ReactMarkdown>
            </article>
        </main>
    );
}

