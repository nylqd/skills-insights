import { getSyncedSkills } from "@/lib/skills-fs";
import { Terminal } from "lucide-react";
import { SyncedSkillsList } from "@/components/synced-skills-list";

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
    const skills = getSyncedSkills();

    return (
        <main>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2 mb-2">
                    <Terminal className="w-6 h-6 text-cyan-400" />
                    收录 Skills
                </h1>
                <p className="text-zinc-400 text-sm">
                    浏览并搜索已同步的全部 {skills.length} 个 Skills。点击可以查看详情和安装命令。
                </p>
            </div>

            <section>
                <SyncedSkillsList skills={skills} />
            </section>
        </main>
    );
}
