"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyableCommand({ command }: { command: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-800/60 rounded-lg py-3 px-4 w-full max-w-none font-mono text-sm relative group mb-6 overflow-hidden">
            <span className="text-zinc-600 select-none shrink-0">$</span>
            <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide text-zinc-400">
                {command}
            </div>
            <button
                onClick={handleCopy}
                className="shrink-0 p-1.5 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-cyan-400 group-hover:opacity-100"
                title="Copy command"
            >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>
    );
}
