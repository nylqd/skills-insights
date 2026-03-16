import { Calendar, GitCommit } from "lucide-react";

export const dynamic = 'force-static';

export default function ChangelogPage() {
    const changelogs = [
        {
            version: "v1.0.0",
            date: "2026-02-27",
            changes: [
                "🎉 首次发布 Skills Insights",
                "✨ 增加大盘数据展示",
                "✨ 增加活跃 Agents 及热门 Skills 统计",
                "🤝 新增微信交流群二维码入口"
            ]
        }
    ];

    return (
        <main className="w-full pr-4">
            <h1 className="text-2xl font-bold mb-8 flex items-center gap-2 text-zinc-900 dark:text-zinc-100 pl-4 md:pl-0 transition-colors">
                更新日志
            </h1>

            <div className="space-y-8">
                {changelogs.map((log) => (
                    <div key={log.version} className="relative pl-10 md:pl-12">
                        {/* Timeline element */}
                        <div className="absolute left-0 top-0 bottom-0 w-10 md:w-12 flex flex-col items-center">
                            <div className="w-px h-full bg-zinc-200 dark:bg-zinc-800/50 transition-colors"></div>
                            <div className="absolute top-8 w-3 h-3 rounded-full border-2 border-cyan-500 bg-white dark:bg-zinc-950 transition-colors"></div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-6 backdrop-blur-xl shadow-sm transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <h3 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-2 transition-colors">
                                    <GitCommit className="w-5 h-5 text-cyan-600 dark:text-cyan-500" />
                                    {log.version}
                                </h3>
                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-500 text-sm font-mono transition-colors">
                                    <Calendar className="w-4 h-4" />
                                    {log.date}
                                </div>
                            </div>
                            <ul className="space-y-3 mt-4">
                                {log.changes.map((change, idx) => (
                                    <li key={idx} className="text-zinc-700 dark:text-zinc-300 text-sm flex items-start gap-2 transition-colors">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>{change}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
