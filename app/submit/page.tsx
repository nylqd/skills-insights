import { getSubmittedRepos } from "@/lib/queries";
import { SubmittedReposList } from "@/components/submitted-repos-list";
import { SubmitForm } from "./form";

export const dynamic = 'force-dynamic';

export default async function SubmitPage() {
    const repos = await getSubmittedRepos();

    return (
        <main>
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2 text-zinc-100">
                    提交 Skills 仓库
                </h1>
                <p className="text-zinc-400 text-sm">
                    将你的 Agent Skills 仓库提交到平台进行同步与分发。请确保仓库内的技能配置符合标准格式。
                </p>
            </div>

            <div className="space-y-8">
                {/* Top: Form */}
                <section>
                    <SubmitForm />
                </section>

                {/* Bottom: Status */}
                <section className="flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 text-zinc-300 flex items-center gap-2">
                        提交记录
                    </h2>
                    <div className="w-full">
                        <SubmittedReposList repos={repos} />
                    </div>
                </section>
            </div>
        </main>
    );
}


