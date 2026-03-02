import { getGlobalMetrics, getTopAgents, getTopSkills, TopAgent } from "@/lib/queries";
import { Terminal, Cpu, DownloadCloud, Zap } from "lucide-react";
import { SearchableSkills } from "@/components/searchable-skills";

export const dynamic = 'force-dynamic';
export default async function Home() {
    const metrics = await getGlobalMetrics();
    const topSkills = await getTopSkills(50);
    const topAgents = await getTopAgents(5);

    return (
        <main>
            {/* Global Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <MetricsCard
                    title="总安装量"
                    value={Number(metrics.total_installs).toLocaleString()}
                    icon={<DownloadCloud className="w-4 h-4 text-cyan-400" />}
                />
                <MetricsCard
                    title="收录 Skills"
                    value={Number(metrics.total_unique_skills).toLocaleString()}
                    icon={<Zap className="w-4 h-4 text-indigo-400" />}
                />
                <MetricsCard
                    title="活跃 Agents"
                    value={topAgents.length.toString() + "+"}
                    icon={<Cpu className="w-4 h-4 text-purple-400" />}
                />
            </div>

            {/* Leaderboards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Skills List */}
                <section className="lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-zinc-300">
                        <Terminal className="w-4 h-4 text-zinc-500" /> 热门 Skills 排行榜
                    </h2>
                    <SearchableSkills initialSkills={topSkills} />
                </section>

                {/* Top Agents Panel */}
                <section className="col-span-1">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-zinc-300">
                        <Cpu className="w-4 h-4 text-zinc-500" /> 活跃 Agents
                    </h2>
                    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl backdrop-blur-xl overflow-hidden">
                        {topAgents.length === 0 ? (
                            <div className="text-center py-8 text-zinc-600 text-sm">暂无数据</div>
                        ) : (
                            <ul className="divide-y divide-zinc-800/60">
                                {topAgents.map((item: TopAgent, index: number) => (
                                    <li key={item.agent || "unknown"} className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-800/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="text-zinc-600 font-mono text-xs w-4 text-right">{index + 1}</span>
                                            <span className="text-sm font-medium text-zinc-300">{item.agent || "Unknown"}</span>
                                        </div>
                                        <span className="text-xs font-mono text-zinc-500 tabular-nums">
                                            {Number(item.usages).toLocaleString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </div>
        </main >
    );
}

function MetricsCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-5 py-4 backdrop-blur-xl relative overflow-hidden group hover:border-zinc-700/50 transition-colors">
            <div className="flex items-center justify-between mb-2 relative z-10">
                <h3 className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{title}</h3>
                <div className="p-1.5 bg-zinc-950/80 rounded-md border border-zinc-800/60">
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-bold text-zinc-100 relative z-10 tabular-nums">{value}</div>
            <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
