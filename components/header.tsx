"use client";

import { Terminal, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useCopy } from "@/lib/use-copy";

export function Header() {
    const { copied, copy } = useCopy();
    const command = "curl -sL https://skills.sh | bash";

    const handleCopy = () => copy(command);

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

            <div className="flex flex-col gap-4 w-full md:w-auto max-w-full mt-4 md:mt-0">
                {/* QR Code section for Community Group - Moved to top */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-900/60 to-zinc-900/20 border border-zinc-800/50 flex flex-row items-center gap-5 hover:border-zinc-700/80 transition-all duration-300 shadow-xl cursor-default group/qr relative z-20">
                    <div className="w-16 h-16 shrink-0 relative flex justify-center items-center">
                        <img src="/qr.png" alt="QR Code Thumbnail" className="w-full h-full object-cover rounded-xl border border-zinc-700/30 group-hover/qr:opacity-90 transition-opacity duration-300" />

                        {/* Popup QR: 起点在左下角，并且向左下方展开。
                            使用 top-full 贴着底边，right-full 贴着左边 (两者交点即为盒子的左下角外沿)。
                            使用 origin-top-right 表示以它自身的右上角为基点展开（即：往坐标系的原点左下方放大）。
                        */}
                        <div className="absolute top-full right-full mt-2 mr-2 origin-top-right opacity-0 invisible group-hover/qr:opacity-100 group-hover/qr:visible scale-50 group-hover/qr:scale-100 transition-all duration-300 ease-out pointer-events-none z-50">
                            <div className="bg-white p-2.5 rounded-2xl shadow-2xl border border-zinc-200">
                                <img src="/qr.png" alt="QR Code Large" className="w-48 h-auto max-w-none object-cover rounded-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col text-left py-1">
                        <div className="text-base font-semibold text-zinc-100 mb-1.5 flex items-center gap-2 group-hover/qr:text-cyan-400 transition-colors">
                            加入交流分享群 👋
                        </div>
                        <div className="text-sm text-zinc-400 leading-relaxed max-w-[200px]">
                            一起探讨 Agents 开发、发现好用的 Skills！
                        </div>
                    </div>
                </div>

                <div className="p-1 rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-800/50 shadow-lg relative z-10 w-full xl:min-w-[420px]">
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
