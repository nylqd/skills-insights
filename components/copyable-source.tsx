"use client";

import { Check, Copy } from "lucide-react";
import { useCopy } from "@/lib/use-copy";

function getProtocolLabel(source: string): string {
    if (source.startsWith("git@") || source.startsWith("ssh://")) return "SSH";
    if (source.startsWith("https://")) return "HTTPS";
    if (source.startsWith("http://")) return "HTTP";
    return "URL";
}

function CopyableCommand({ command, label }: { command: string; label: string }) {
    const { copied, copy } = useCopy();

    const onCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        copy(command);
    };

    return (
        <button
            onClick={onCopy}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-cyan-400 transition-colors group/copy min-w-0"
            title={`复制 ${label} 命令`}
        >
            <span className="inline-flex items-center gap-1 font-mono shrink-0">
                <span className="w-10 text-center text-zinc-500 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800/60 px-1 py-0.5 rounded text-[10px] leading-none border border-zinc-200 dark:border-transparent transition-colors">{label}</span>
            </span>
            <span className="truncate">{command}</span>
            {copied ? (
                <Check className="w-3 h-3 text-cyan-400 shrink-0" />
            ) : (
                <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity shrink-0" />
            )}
        </button>
    );
}

export function CopyableSourceCommands({ sources, skill, sourceInstalls }: { sources: string[]; skill: string; sourceInstalls?: Record<string, number> }) {
    if (!sources || sources.length === 0) return null;

    return (
        <div className="flex flex-col gap-0.5">
            {sources.map((source) => (
                <div key={source} className="flex items-center gap-1.5 min-w-0">
                    {sourceInstalls && sourceInstalls[source] !== undefined && (
                        <span className="w-8 text-right text-[10px] font-mono text-cyan-600 dark:text-cyan-400/70 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/30 px-1.5 py-0.5 rounded leading-none tabular-nums shrink-0 transition-colors">
                            {Number(sourceInstalls[source]).toLocaleString()}
                        </span>
                    )}
                    <CopyableCommand
                        command={`skills add ${source} --skill ${skill}`}
                        label={getProtocolLabel(source)}
                    />
                </div>
            ))}
        </div>
    );
}
