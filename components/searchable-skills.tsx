"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { CopyableSource } from "@/components/copyable-source";

type Skill = {
    skill: string;
    name?: string;
    installs: number;
    source: string;
};

export function SearchableSkills({ initialSkills }: { initialSkills: Skill[] }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const isSearching = query.length >= 2;
    const displaySkills = isSearching ? results : initialSkills;

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`);
                const data = await res.json();
                setResults(
                    data.skills.map((s: { skillId: string; name: string; installs: number; source: string }) => ({
                        skill: s.skillId || s.name,
                        installs: s.installs,
                        source: s.source,
                    }))
                );
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 200);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    const maxInstalls = Number(displaySkills[0]?.installs) || 1;

    return (
        <div>
            {/* Search Input */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                    type="text"
                    placeholder="搜索 Skills…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-zinc-950/50 border border-zinc-800/50 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                />
                {query && (
                    <button
                        onClick={() => setQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Results */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl backdrop-blur-xl overflow-hidden p-6">
                {loading && displaySkills.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">搜索中…</div>
                ) : displaySkills.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                        {isSearching ? `未找到「${query}」相关 Skill` : "暂无数据。"}
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {displaySkills.map((item, index) => {
                            const pct = Math.max(2, (Number(item.installs) / maxInstalls) * 100);
                            return (
                                <li key={item.skill} className="relative group rounded-lg overflow-hidden bg-zinc-950/50 border border-zinc-800/50">
                                    <div className="flex items-center justify-between z-10 relative px-4 py-3">
                                        <div className="flex items-center gap-4">
                                            <span className="text-zinc-500 font-mono text-sm w-4">{index + 1}</span>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">{item.skill}</span>
                                                {item.source && <CopyableSource source={item.source} />}
                                            </div>
                                        </div>
                                        <span className="font-mono text-zinc-400 group-hover:text-cyan-400 transition-colors">
                                            {Number(item.installs).toLocaleString()}
                                        </span>
                                    </div>
                                    <div
                                        className="absolute inset-y-0 left-0 bg-cyan-950/30 group-hover:bg-cyan-900/40 transition-all duration-500 ease-out z-0"
                                        style={{ width: `${pct}%` }}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                )}
                {loading && displaySkills.length > 0 && (
                    <div className="text-center py-2 text-zinc-600 text-xs mt-2">更新中…</div>
                )}
            </div>
        </div>
    );
}
