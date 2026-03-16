import { SubmittedRepo } from "@/lib/queries";
import { Clock, CheckCircle2, XCircle, GitBranch } from "lucide-react";

function formatTime(dateStr: string | null): string {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

function getStatusBadge(status: 'pending' | 'approved' | 'rejected') {
    switch (status) {
        case 'pending':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                    <Clock className="w-3.5 h-3.5" />
                    审核中
                </span>
            );
        case 'approved':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    已通过
                </span>
            );
        case 'rejected':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                    <XCircle className="w-3.5 h-3.5" />
                    已驳回
                </span>
            );
    }
}

export function SubmittedReposList({ repos }: { repos: SubmittedRepo[] }) {
    if (!repos || repos.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-xl transition-colors shadow-sm">
                <p className="text-zinc-500 text-sm">暂无提交记录</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl overflow-hidden backdrop-blur-xl shadow-sm transition-colors">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800/60 transition-colors">
                    <thead className="bg-zinc-50 dark:bg-zinc-900/80 transition-colors">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                仓库地址
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                状态
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                最近同步
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                提交时间
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 bg-transparent transition-colors">
                        {repos.map((repo) => (
                            <tr key={repo.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-200 truncate max-w-[300px] sm:max-w-md transition-colors" title={repo.url}>
                                            {repo.url}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-500 font-mono transition-colors">
                                            <GitBranch className="w-3 h-3" />
                                            {repo.branch}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(repo.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400 transition-colors">
                                    {repo.last_sync_at 
                                        ? formatTime(repo.last_sync_at) 
                                        : <span className="text-zinc-400 dark:text-zinc-600">-</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-zinc-500">
                                    {formatTime(repo.created_at)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
