import Link from 'next/link';
import { getAllDocs } from '@/lib/docs';

export const metadata = {
    title: 'Documents - Skills Insights',
    description: 'Documentation for Skills Insights API, CLI, and integration.',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    const docs = getAllDocs();

    return (
        <div className="flex flex-col md:flex-row gap-12 w-full">
            <aside className="w-full md:w-64 shrink-0">
                <div className="sticky top-24">
                    <h3 className="text-zinc-500 font-semibold mb-4 uppercase text-xs tracking-wider">导航</h3>
                    <ul className="space-y-3 border-l border-zinc-800/50 pl-4">
                        {docs.map(doc => (
                            <li key={doc.slug}>
                                <Link href={`/docs/${doc.slug}`} className="text-zinc-400 hover:text-cyan-400 text-sm transition-colors block py-0.5">
                                    {doc.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    );
}
