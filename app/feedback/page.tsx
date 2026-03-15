export default function FeedbackPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-320px)] min-h-[600px]">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-zinc-100 mb-4">反馈意见</h1>
                <p className="text-zinc-400 text-lg max-w-2xl">
                    我们非常重视您的反馈。请在下方提交您的建议或遇到的问题，帮助我们不断改进 Skills Insights。
                </p>
            </div>

            <div className="flex-1 w-full bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-xl transition-all relative">
                {/* 预留的 Iframe 嵌入点 */}
                <iframe
                    src="about:blank" // 替换为实际的外部反馈系统 URL
                    className="w-full h-full border-0"
                    title="External Feedback System"
                />

                {/* 占位提示（当 src 为空或 about:blank 时显示） */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
                    <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 border border-zinc-700/50">
                        <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-medium text-zinc-300 mb-2">反馈系统加载中</h3>
                    <p className="text-zinc-500 max-w-sm">
                        外部反馈系统即将在此处加载。如果您看到此提示，请通过修改代码中的 <code>iframe src</code> 来接入您的反馈系统。
                    </p>
                </div>
            </div>
        </div>
    );
}
