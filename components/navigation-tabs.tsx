"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, History, MessageSquare } from "lucide-react";
import { clsx } from "clsx";

export function NavigationTabs() {
    const pathname = usePathname();
    const isDocs = pathname?.startsWith("/docs");
    const isChangelog = pathname?.startsWith("/changelog");
    const isFeedback = pathname?.startsWith("/feedback");
    const isHome = pathname === "/";

    return (
        <div className="flex items-center gap-2 mb-10 border-b border-zinc-800/50">
            <Link
                href="/"
                className={clsx(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-[1px]",
                    isHome
                        ? "border-cyan-400 text-cyan-400"
                        : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                )}
            >
                <span className="relative flex h-2 w-2">
                    <span className={clsx("absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75", isHome ? "animate-ping" : "hidden")}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                大盘预览
            </Link>

            <Link
                href="/docs"
                className={clsx(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-[1px]",
                    isDocs
                        ? "border-cyan-400 text-cyan-400"
                        : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                )}
            >
                <BookOpen className="w-4 h-4" />
                探索文档
            </Link>

            <Link
                href="/changelog"
                className={clsx(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-[1px]",
                    isChangelog
                        ? "border-cyan-400 text-cyan-400"
                        : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                )}
            >
                <History className="w-4 h-4" />
                更新日志
            </Link>

            <Link
                href="/feedback"
                className={clsx(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-[1px]",
                    isFeedback
                        ? "border-cyan-400 text-cyan-400"
                        : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                )}
            >
                <MessageSquare className="w-4 h-4" />
                反馈意见
            </Link>
        </div>
    );
}
