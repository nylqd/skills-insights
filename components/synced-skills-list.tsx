"use client";

import { useState, useMemo } from "react";
import { Search, X, Package } from "lucide-react";
import Link from "next/link";
import type { SyncedSkill } from "@/lib/skills-fs";

export function SyncedSkillsList({ skills }: { skills: SyncedSkill[] }) {
    const [query, setQuery] = useState("");

    const filteredSkills = useMemo(() => {
        if (!query.trim()) return skills;
        const q = query.toLowerCase();
        return skills.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q)
        );
    }, [query, skills]);

    return (
        <div>
            {/* Search Input */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                    type="text"
                    placeholder="按名称或描述搜索..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-sm"
                />
                {query && (
                    <button
                        onClick={() => setQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 rounded-md transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Results Grid */}
            {filteredSkills.length === 0 ? (
                <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                    <p className="text-zinc-500 text-sm">未找到与 &quot;{query}&quot; 相关的 Skills</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSkills.map((skill) => (
                        <Link
                            key={skill.name}
                            href={`/skills/${encodeURIComponent(skill.name)}`}
                            className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 hover:bg-zinc-800/40 hover:border-zinc-700/60 transition-all flex flex-col group cursor-pointer"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-zinc-950/80 rounded-lg border border-zinc-800/80 group-hover:border-zinc-700 transition-colors">
                                    <Package className="w-5 h-5 text-cyan-400/80" />
                                </div>
                                <h3 className="text-base font-semibold text-zinc-200 group-hover:text-cyan-400 transition-colors truncate">
                                    {skill.name}
                                </h3>
                            </div>
                            <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed flex-grow">
                                {skill.description || "无描述信息"}
                            </p>
                            <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between text-xs text-zinc-500">
                                <span>{skill.files.length} 个文件</span>
                                <span className="text-cyan-500/0 group-hover:text-cyan-500 transition-colors flex items-center gap-1">
                                    查看详情 &rarr;
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
