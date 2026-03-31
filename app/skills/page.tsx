import { getSyncedSkills, getSyncedConflicts } from "@/lib/skills-fs";
import { Terminal } from "lucide-react";
import { SyncedSkillsList } from "@/components/synced-skills-list";

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
    const skills = getSyncedSkills();
    const conflicts = getSyncedConflicts();

    return (
        <main>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-2 transition-colors">
                    收录 Skills
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm transition-colors">
                    浏览并搜索已同步的全部 {skills.length} 个 Skills。点击可以查看详情和安装命令。
                </p>
            </div>

            <section>
                <SyncedSkillsList skills={skills} conflicts={conflicts} />
            </section>
        </main>
    );
}
