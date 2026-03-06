async function runMocks() {
  // Skills with their possible sources (some have both SSH + HTTPS to test merging)
  const SKILL_SOURCES = {
    "brainstorming": ["https://gitee.example.com/team/agent-skills.git", "git@gitee.example.com:team/agent-skills.git"],
    "systematic-debugging": ["https://gitee.example.com/team/agent-skills.git", "git@gitee.example.com:team/agent-skills.git"],
    "test-driven-development": ["https://gitee.example.com/team/agent-skills.git", "git@gitee.example.com:team/agent-skills.git"],
    "executing-plans": ["https://github.com/vercel-labs/skills.git", "git@github.com:vercel-labs/skills.git"],
    "writing-skills": ["https://github.com/vercel-labs/skills.git"],
    "react-expert": ["https://github.com/vercel-labs/agent-skills.git"],
    "tailwind-master": ["git@gitee.example.com:team/frontend-skills.git", "https://gitee.example.com/team/frontend-skills.git", "https://github.com/vercel-labs/agent-skills.git"],
    "clickhouse-guru": ["git@gitee.example.com:team/data-skills.git"],
    "nextjs-wizard": ["https://github.com/vercel-labs/skills.git", "git@github.com:vercel-labs/skills.git"],
    "tailwind-master1": ["https://github.com/vercel-labs/agent-skills.git"],
    "clickhouse-guru1": ["git@gitee.example.com:team/data-skills.git", "https://gitee.example.com/team/data-skills.git"],
    "nextjs-wizard1": ["https://github.com/vercel-labs/skills.git"],
    "tailwind-master2": ["https://github.com/vercel-labs/agent-skills.git"],
    "clickhouse-guru2": ["https://gitee.example.com/team/data-skills.git"],
    "nextjs-wizard2": ["https://github.com/vercel-labs/skills.git"],
  };

  const SKILLS = Object.keys(SKILL_SOURCES);
  const AGENTS = ["antigravity", "cursor", "copilot", "chatgpt"];

  console.log("🚀 Starting mock telemetry ingestion...");
  console.log(`   ${SKILLS.length} skills, some with multiple sources (SSH + HTTPS)`);

  for (let i = 0; i < 80; i++) {
    // Pick 1-3 random skills
    const numSkills = Math.floor(Math.random() * 3) + 1;
    const selectedSkills = [];
    const selectedSources = [];

    for (let j = 0; j < numSkills; j++) {
      const skill = SKILLS[Math.floor(Math.random() * SKILLS.length)];
      const sources = SKILL_SOURCES[skill];
      // Randomly pick one of the available sources for this skill
      const source = sources[Math.floor(Math.random() * sources.length)];
      selectedSkills.push(skill);
      selectedSources.push(source);
    }

    const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)];

    // Send one request per skill (source is per-skill)
    for (let k = 0; k < selectedSkills.length; k++) {
      const params = new URLSearchParams({
        event: "install",
        source: selectedSources[k],
        skills: selectedSkills[k],
        agents: agent,
        v: "1.0.0",
        ci: Math.random() > 0.8 ? "1" : "0",
      });

      try {
        const res = await fetch(`http://localhost:3000/t?${params.toString()}`);
        if (res.status === 204) {
          process.stdout.write(".");
        } else {
          console.error("\n❌ Unexpected status:", res.status);
        }
      } catch (err) {
        console.error("\n❌ Fetch error:", err.message);
      }
    }
  }

  console.log("\n✅ Mock telemetry injection complete!");
}

runMocks();
