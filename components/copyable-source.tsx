"use client";

import { Check, Copy } from "lucide-react";
import { useCopy } from "@/lib/use-copy";

export function CopyableSource({ source }: { source: string }) {
    const { copied, copy } = useCopy();

    const onCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        copy(source);
    };

    return (
        <button
            onClick={onCopy}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-cyan-400 transition-colors group/copy relative"
            title="点击复制 Source"
        >
            <span className="truncate max-w-[120px]">{source}</span>
            {copied ? (
                <Check className="w-3 h-3 text-cyan-400" />
            ) : (
                <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
            )}
        </button>
    );
}
