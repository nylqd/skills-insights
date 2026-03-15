import { getGlobalMetrics, getTopAgents, getTopSkills, TopAgent } from "@/lib/queries";
import { Terminal, Cpu } from "lucide-react";
import { SearchableSkills } from "@/components/searchable-skills";
import { getSyncedSkills } from "@/lib/skills-fs";

export const dynamic = 'force-dynamic';
export default async function Home() {
    const metrics = await getGlobalMetrics();
    const topSkills = await getTopSkills(50);
    const topAgents = await getTopAgents(5);
    const syncedSkills = getSyncedSkills();
    const indexedSkills = syncedSkills.map(s => s.name);

    return (
        <main>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Skills List */}
                <section className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2 text-zinc-100">
                        <Terminal className="w-5 h-5 text-zinc-500" /> 热门 Skills 排行榜
                        <span className="text-sm font-normal text-zinc-500">（总安装量 {Number(metrics.total_installs).toLocaleString()}）</span>
                    </h2>
                    <SearchableSkills initialSkills={topSkills} indexedSkills={indexedSkills} />
                </section>

                {/* Top Agents Panel */}
                <section className="col-span-1">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2 text-zinc-100">
                        <Cpu className="w-5 h-5 text-zinc-500" /> 活跃 Agents
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
        </main>
    );
}

