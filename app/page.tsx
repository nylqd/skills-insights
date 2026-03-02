import { getGlobalMetrics, getTopAgents, getTopSkills, TopAgent } from "@/lib/queries";
import { Terminal, Cpu, DownloadCloud, Zap } from "lucide-react";
import { SearchableSkills } from "@/components/searchable-skills";

export const dynamic = 'force-dynamic';
export default async function Home() {
    const metrics = await getGlobalMetrics();
    const topSkills = await getTopSkills(10);
    const topAgents = await getTopAgents(5);

    return (
        <main>
            {/* Global Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <MetricsCard
                    title="总安装量"
                    value={Number(metrics.total_installs).toLocaleString()}
                    icon={<DownloadCloud className="w-5 h-5 text-cyan-400" />}
                />
                <MetricsCard
                    title="收录 Skills"
                    value={Number(metrics.total_unique_skills).toLocaleString()}
                    icon={<Zap className="w-5 h-5 text-indigo-400" />}
                />
                <MetricsCard
                    title="活跃 Agents"
                    value={topAgents.length.toString() + "+"}
                    icon={<Cpu className="w-5 h-5 text-purple-400" />}
                />
            </div>

            {/* Leaderboards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Skills List */}
                <section className="lg:col-span-2">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        <Terminal className="w-6 h-6" /> 热门 Skills 排行榜
                    </h2>
                    <SearchableSkills initialSkills={topSkills} />
                </section>

                {/* Top Agents Panel */}
                <section className="col-span-1">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        <Cpu className="w-6 h-6" /> 活跃 Agents
                    </h2>
                    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl backdrop-blur-xl overflow-hidden p-6">
                        {topAgents.length === 0 ? (
                            <div className="text-center py-12 text-zinc-500">暂无数据。</div>
                        ) : (
                            <ul className="space-y-4">
                                {topAgents.map((item: TopAgent, index: number) => (
                                    <li key={item.agent || "unknown"} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-zinc-600 font-mono text-xs">{index + 1}</span>
                                            <span className="text-sm font-medium text-zinc-300">{item.agent || "Unknown"}</span>
                                        </div>
                                        <span className="px-2 py-1 rounded bg-zinc-800 text-xs font-mono text-zinc-400">
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
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-zinc-700/50 transition-colors">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-zinc-400 font-medium text-sm">{title}</h3>
                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-bold text-zinc-100 relative z-10">{value}</div>
            {/* Soft hover glow */}
            <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
