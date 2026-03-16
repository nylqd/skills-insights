"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useCopy } from "@/lib/use-copy";
import { ThemeToggle } from "@/components/theme-toggle";

const ROTATING_WORDS = ["Insights", "Hub", "Radar", "Pulse"];
const TYPE_SPEED = 100;
const DELETE_SPEED = 60;
const PAUSE_AFTER_TYPE = 2000;
const PAUSE_AFTER_DELETE = 400;

export function Header() {
    const { copied, copy } = useCopy();
    const command = "curl -sL https://skills.sh | bash";
    const [displayText, setDisplayText] = useState("");
    const [tick, setTick] = useState(0);
    const phase = useRef<"typing" | "paused" | "deleting" | "waiting">("typing");
    const wordIdx = useRef(0);
    const charIdx = useRef(0);

    useEffect(() => {
        let delay: number;
        const currentWord = ROTATING_WORDS[wordIdx.current] || "";

        switch (phase.current) {
            case "typing":
                if (charIdx.current < currentWord.length) {
                    charIdx.current++;
                    setDisplayText(currentWord.slice(0, charIdx.current));
                    delay = TYPE_SPEED;
                } else {
                    phase.current = "paused";
                    delay = PAUSE_AFTER_TYPE;
                }
                break;
            case "paused":
                phase.current = "deleting";
                delay = 0;
                break;
            case "deleting":
                if (charIdx.current > 0) {
                    charIdx.current--;
                    setDisplayText(currentWord.slice(0, charIdx.current));
                    delay = DELETE_SPEED;
                } else {
                    phase.current = "waiting";
                    delay = PAUSE_AFTER_DELETE;
                }
                break;
            case "waiting":
            default:
                wordIdx.current = (wordIdx.current + 1) % ROTATING_WORDS.length;
                phase.current = "typing";
                delay = 0;
                break;
        }

        const timer = setTimeout(() => {
            setTick((t) => t + 1);
        }, delay);
        return () => clearTimeout(timer);
    }, [tick]);

    const handleCopy = () => copy(command);

    return (
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 w-full">
            <div className="text-center sm:text-left">
                <Link href="/" className="block">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4 hover:opacity-90 transition-opacity flex items-center justify-center sm:justify-start leading-[1.2]">
                        <span className="pb-4">Skills</span>
                        <span className="px-1.5 pb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 select-none">/</span>
                        <span className="inline-flex items-baseline pb-4">
                            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 whitespace-nowrap px-0.5 pb-1 min-h-[1em]">
                                {displayText || "\u200B"}
                            </span>
                            <span className="inline-block w-[3px] h-[0.75em] bg-cyan-400 ml-[2px] rounded-sm animate-blink align-baseline translate-y-[0.05em]" />
                        </span>
                    </h1>
                </Link>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed transition-colors">
                    为 AI Agents 打造的可复用能力库。一行命令即可安装，为你的智能体注入专业知识。在这里发现好用的 Skills，实时掌握整个生态的风向。<br />
                    <span className="text-sm mt-2 block text-zinc-500 dark:text-zinc-500 transition-colors">Skills are reusable capabilities for AI agents. Install them with a single command to give your agents access to procedural knowledge. Discover and monitor the global skills ecosystem in real-time.</span>
                </p>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto max-w-full mt-4 md:mt-0">
                <div className="flex justify-end mb-[-1rem] md:mb-0 md:absolute md:top-8 md:right-8 z-50">
                    <ThemeToggle />
                </div>
                {/* QR Code section for Community Group - Moved to top */}
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/50 flex flex-row items-center gap-5 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all duration-300 shadow-sm dark:shadow-xl cursor-default group/qr relative z-20">
                    <div className="w-16 h-16 shrink-0 relative flex justify-center items-center">
                        <img src="/qr.png" alt="QR Code Thumbnail" className="w-full h-full object-cover rounded-xl border border-zinc-100 dark:border-zinc-700/30 group-hover/qr:opacity-90 transition-opacity duration-300" />

                        {/* Popup QR */}
                        <div className="absolute top-full right-full mt-2 mr-2 origin-top-right opacity-0 invisible group-hover/qr:opacity-100 group-hover/qr:visible scale-50 group-hover/qr:scale-100 transition-all duration-300 ease-out pointer-events-none z-50">
                            <div className="bg-white p-2.5 rounded-2xl shadow-2xl border border-zinc-200">
                                <img src="/qr.png" alt="QR Code Large" className="w-48 h-auto max-w-none object-cover rounded-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col text-left py-1">
                        <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5 flex items-center gap-2 group-hover/qr:text-cyan-600 dark:group-hover/qr:text-cyan-400 transition-colors">
                            加入交流分享群 👋
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[200px] transition-colors">
                            一起探讨 Agents 开发、发现好用的 Skills！
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleCopy}
                    className="bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/50 rounded-lg px-4 py-3 flex items-center justify-between gap-4 overflow-hidden shadow-sm dark:shadow-lg relative z-10 w-full xl:min-w-[420px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700/50 transition-all group/cmd"
                    title="Click to copy"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <Terminal className="w-4 h-4 text-zinc-500 shrink-0" />
                        <div className="overflow-x-auto no-scrollbar">
                            <code className="font-mono text-sm text-zinc-800 dark:text-zinc-300 select-all whitespace-nowrap transition-colors">
                                {command}
                            </code>
                        </div>
                    </div>
                    <div className="p-2 shrink-0">
                        {copied ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <Copy className="w-4 h-4 text-zinc-500 group-hover/cmd:text-zinc-300 transition-colors" />
                        )}
                    </div>
                </button>
            </div>
        </header>
    );
}

