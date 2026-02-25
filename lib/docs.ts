import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const docsDirectory = path.join(process.cwd(), 'docs');

export interface DocMeta {
    slug: string;
    title: string;
    date?: string;
    description?: string;
    [key: string]: unknown;
}

export function getAllDocs(): DocMeta[] {
    if (!fs.existsSync(docsDirectory)) return [];

    const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
        const files = fs.readdirSync(dirPath);

        files.forEach(function (file) {
            if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
            } else if (file.endsWith('.md')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        });

        return arrayOfFiles;
    };

    const filePaths = getAllFiles(docsDirectory);

    let docs = filePaths.map((filePath) => {
        const relPath = path.relative(docsDirectory, filePath);
        const slug = relPath.replace(/\.md$/, '').split(path.sep).join('/');

        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContents);

        return {
            slug,
            title: data.title || slug,
            date: data.date || '',
            description: data.description || '',
            ...data,
        } as DocMeta;
    });

    docs = docs.sort((a, b) => {
        if (a.date && b.date) {
            return a.date < b.date ? 1 : -1;
        }
        return 0;
    });

    return docs;
}

export function getDocBySlug(slug: string) {
    const fullPath = path.join(docsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
        return null;
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
        slug,
        meta: {
            title: data.title || slug,
            date: data.date || '',
            description: data.description || '',
            ...data,
        } as DocMeta,
        content,
    };
}
