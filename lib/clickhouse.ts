import { createClient } from "@clickhouse/client";

// Ensure that we only initialize a single ClickHouse client instance
// to avoid exhausting connections in a Serverless or Next.js development environment.

const globalForClickHouse = globalThis as unknown as { clickhouse: any };

export const clickhouse =
  globalForClickHouse.clickhouse ||
  createClient({
    url: process.env.CLICKHOUSE_URL || "http://127.0.0.1:8123",
    username: process.env.CLICKHOUSE_USER || "default",
    password: process.env.CLICKHOUSE_PASSWORD || "",
    database: process.env.CLICKHOUSE_DB || "default",
  });

if (process.env.NODE_ENV !== "production") {
  globalForClickHouse.clickhouse = clickhouse;
}

export async function initDatabase() {
  try {
    await clickhouse.exec({
      query: `
        CREATE TABLE IF NOT EXISTS telemetry_events (
            timestamp DateTime DEFAULT now(),
            event String,
            source String,
            skill String,
            agent String,
            cli_version String,
            is_ci UInt8
        ) ENGINE = MergeTree()
        ORDER BY (event, skill, timestamp)
      `,
    });
    console.log("✅ ClickHouse telemetry_events table is ready.");
  } catch (err) {
    console.error("❌ Failed to initialize ClickHouse table:", err);
  }
}
