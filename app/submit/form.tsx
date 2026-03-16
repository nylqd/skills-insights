"use client";

import { useState } from "react";
import { Link as LinkIcon, GitBranch, User, Send } from "lucide-react";
import { useRouter } from "next/navigation";

export function SubmitForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        url: "",
        branch: "main",
        contact_name: "",
    });
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        setErrorMessage("");

        try {
            const res = await fetch("/api/repos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "提交失败");
            }

            setStatus("success");
            setFormData({ url: "", branch: "main", contact_name: "" });
            // Refresh to update the server component's repository list
            router.refresh();
        } catch (err: unknown) {
            setStatus("error");
            if (err instanceof Error) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage("提交失败，请重试");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-6 backdrop-blur-xl shadow-sm transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* URL */}
                <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors">
                        Git 仓库地址 <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LinkIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-colors" />
                        </div>
                        <input
                            type="url"
                            name="url"
                            required
                            placeholder="https://github.com/owner/repo.git"
                            value={formData.url}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Branch */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors">
                        分支
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <GitBranch className="h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            name="branch"
                            placeholder="main"
                            value={formData.branch}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Contact Name */}
                <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 text-nowrap truncate transition-colors">
                        联系人(名字/工号) <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            name="contact_name"
                            required
                            placeholder="张三"
                            value={formData.contact_name}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2">
                    <button
                        type="submit"
                        disabled={status === "submitting"}
                        className={`w-full h-[38px] flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-zinc-900 transition-colors ${status === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {status === "submitting" ? (
                            "提交中..."
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                提交仓库
                            </>
                        )}
                    </button>
                </div>
            </div>

            {status === "success" && (
                <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                    🎉 提交成功！我们将尽快处理你的仓库同步请求。
                </div>
            )}

            {status === "error" && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    提交失败: {errorMessage}
                </div>
            )}


        </form>
    );
}
