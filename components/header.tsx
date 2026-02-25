"use client";

import { Terminal, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Header() {
    const [copied, setCopied] = useState(false);
    const command = "curl -sL https://skills.sh | bash";

    const handleCopy = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(command);
            } else {
                // Fallback for non-secure contexts or older browsers
                const textArea = document.createElement("textarea");
                textArea.value = command;
                textArea.style.position = "absolute";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                }
                document.body.removeChild(textArea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 w-full">
            <div className="text-center sm:text-left">
                <Link href="/" className="block">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 hover:opacity-90 transition-opacity">
                        Skills <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Insights</span>
                    </h1>
                </Link>
                <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
                    为 AI Agents 打造的可复用能力库。一行命令即可安装，为你的智能体注入专业知识。在这里发现好用的 Skills，实时掌握整个生态的风向。<br />
                    <span className="text-sm mt-2 block text-zinc-500">Skills are reusable capabilities for AI agents. Install them with a single command to give your agents access to procedural knowledge. Discover and monitor the global skills ecosystem in real-time.</span>
                </p>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto max-w-full">
                <div className="p-1 rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-800/50 shadow-lg">
                    <div className="bg-black/50 backdrop-blur rounded-lg px-4 py-3 flex items-center justify-between gap-4 overflow-hidden">
                        <div className="flex items-center gap-3 min-w-0">
                            <Terminal className="w-4 h-4 text-zinc-500 shrink-0" />
                            <div className="overflow-x-auto no-scrollbar">
                                <code className="font-mono text-sm text-zinc-300 select-all whitespace-nowrap">
                                    {command}
                                </code>
                            </div>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="p-2 hover:bg-zinc-800/50 rounded-md transition-colors group shrink-0"
                            title="Copy to clipboard"
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <Copy className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
