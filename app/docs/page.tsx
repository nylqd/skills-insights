import { getAllDocs } from '@/lib/docs';
import Link from 'next/link';

export default function DocsIndex() {
    const docs = getAllDocs();

    return (
        <div>
            <h1 className="text-2xl font-bold text-zinc-100 mb-6">探索文档</h1>
            <p className="text-zinc-400 text-lg mb-12 max-w-2xl">
                探索 Skills Insights 生态系统的指南、常见问题解答及集成细节。
                我们在此为您提供关于 CLI 工具、智能体配置以及面板集成的完整说明。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {docs.map((doc) => (
                    <Link href={`/docs/${doc.slug}`} key={doc.slug} className="block group">
                        <div className="h-full bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-xl group-hover:bg-zinc-800/50 group-hover:border-zinc-700/50 transition-all">
                            <h2 className="text-xl font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors mb-2">{doc.title}</h2>
                            {doc.description && <p className="text-zinc-500 text-sm line-clamp-2">{doc.description}</p>}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
