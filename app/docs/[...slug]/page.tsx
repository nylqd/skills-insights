import { getDocBySlug, getAllDocs } from '@/lib/docs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const docs = getAllDocs();
    return docs.map((doc) => ({
        slug: doc.slug.split('/')
    }));
}

export default async function DocPage(props: { params: Promise<{ slug: string[] }> }) {
    const params = await props.params;
    const slug = params.slug.join('/');
    const doc = getDocBySlug(slug);

    if (!doc) {
        notFound();
    }

    return (
        <article className="prose dark:prose-invert prose-zinc max-w-none 
          prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 
          prose-a:text-cyan-600 dark:prose-a:text-cyan-400 hover:prose-a:text-cyan-700 dark:hover:prose-a:text-cyan-300 
          prose-pre:bg-zinc-50 dark:prose-pre:bg-zinc-900/80 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800
          prose-strong:text-zinc-800 dark:prose-strong:text-zinc-200 transition-colors">
            <h1 className="text-zinc-900 dark:text-zinc-100">{doc.meta.title}</h1>
            <div className="text-zinc-500 dark:text-zinc-400 mb-8 border-b border-zinc-200 dark:border-zinc-800/50 pb-6 flex flex-col gap-1 transition-colors">
                {doc.meta.date && <time dateTime={doc.meta.date as string} className="text-sm">{doc.meta.date as string}</time>}
                {doc.meta.description && <span className="text-zinc-600 dark:text-zinc-500">{doc.meta.description}</span>}
            </div>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {doc.content}
            </ReactMarkdown>
        </article>
    );
}
