"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { CopyableSource } from "@/components/copyable-source";

type Skill = {
    skill: string;
    name?: string;
    installs: number;
    source: string;
};

const DEFAULT_VISIBLE = 10;

export function SearchableSkills({ initialSkills }: { initialSkills: Skill[] }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const isSearching = query.length >= 2;
    const allSkills = isSearching ? results : initialSkills;
    const displaySkills = expanded || isSearching ? allSkills : allSkills.slice(0, DEFAULT_VISIBLE);
    const hasMore = !isSearching && !expanded && allSkills.length > DEFAULT_VISIBLE;

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=50`);
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


    return (
        <div>
            {/* Search Input */}
            <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                    type="text"
                    placeholder="搜索 Skills…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-zinc-950/50 border border-zinc-800/50 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
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
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl backdrop-blur-xl overflow-hidden">
                {loading && displaySkills.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600 text-sm">搜索中…</div>
                ) : displaySkills.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600 text-sm">
                        {isSearching ? `未找到「${query}」相关 Skill` : "暂无数据"}
                    </div>
                ) : (
                    <ul className="divide-y divide-zinc-800/40">
                        {displaySkills.map((item, index) => (
                            <li key={item.skill} className="group flex items-center justify-between px-4 py-2.5 hover:bg-zinc-800/20 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-zinc-600 font-mono text-xs w-5 text-right shrink-0">{index + 1}</span>
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate">{item.skill}</span>
                                        {item.source && <CopyableSource source={item.source} />}
                                    </div>
                                </div>
                                <span className="text-sm font-mono text-zinc-500 group-hover:text-cyan-400 transition-colors tabular-nums shrink-0 ml-3">
                                    {Number(item.installs).toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                {hasMore && (
                    <button
                        onClick={() => setExpanded(true)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-zinc-500 hover:text-zinc-300 border-t border-zinc-800/40 transition-colors"
                    >
                        展开全部 ({allSkills.length})
                        <ChevronDown className="w-3 h-3" />
                    </button>
                )}
                {loading && displaySkills.length > 0 && (
                    <div className="text-center py-1.5 text-zinc-600 text-xs border-t border-zinc-800/40">更新中…</div>
                )}
            </div>
        </div>
    );
}
