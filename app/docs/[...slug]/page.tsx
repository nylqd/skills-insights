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

export default function DocPage({ params }: { params: { slug: string[] } }) {
    const slug = params.slug.join('/');
    const doc = getDocBySlug(slug);

    if (!doc) {
        notFound();
    }

    return (
        <article className="prose prose-invert prose-zinc max-w-none 
          prose-headings:text-zinc-100 
          prose-a:text-cyan-400 hover:prose-a:text-cyan-300 
          prose-pre:bg-zinc-900/80 prose-pre:border prose-pre:border-zinc-800
          prose-strong:text-zinc-200">
            <h1>{doc.meta.title}</h1>
            <p className="text-zinc-500 mb-8 border-b border-zinc-800/50 pb-8">{doc.meta.description}</p>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {doc.content}
            </ReactMarkdown>
        </article>
    );
}
