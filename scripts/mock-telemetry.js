async function runMocks() {
  const SKILLS = [
    "brainstorming", "systematic-debugging", "test-driven-development",
    "executing-plans", "writing-skills", "react-expert",
    "tailwind-master", "clickhouse-guru", "nextjs-wizard"
  ];

  const AGENTS = ["antigravity", "cursor", "copilot", "chatgpt"];

  console.log("🚀 Starting mock telemetry ingestion...");

  for (let i = 0; i < 50; i++) {
    // Pick 1-3 random skills
    const numSkills = Math.floor(Math.random() * 3) + 1;
    const selectedSkills = [];
    for (let j = 0; j < numSkills; j++) {
      selectedSkills.push(SKILLS[Math.floor(Math.random() * SKILLS.length)]);
    }

    const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)];

    // Construct Query Parameters
    const params = new URLSearchParams({
      event: "install",
      source: "github",
      skills: selectedSkills.join(","),
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

  console.log("\n✅ Mock telemetry injection complete!");
}

runMocks();
