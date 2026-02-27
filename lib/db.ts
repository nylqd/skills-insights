import mysql from "mysql2/promise";

// Ensure that we only initialize a single MySQL pool instance
// to avoid exhausting connections in a Serverless or Next.js development environment.

const globalForDB = globalThis as unknown as {
    pool: mysql.Pool | undefined;
};

export const pool =
    globalForDB.pool ||
    mysql.createPool({
        host: process.env.MYSQL_HOST || "127.0.0.1",
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DB || "telemetry",
        waitForConnections: true,
        connectionLimit: 10,
    });

if (process.env.NODE_ENV !== "production") {
    globalForDB.pool = pool;
}

export async function initDatabase() {
    try {
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS telemetry_events (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        event VARCHAR(64) NOT NULL,
        source VARCHAR(64) NOT NULL,
        skill VARCHAR(128) NOT NULL,
        agent VARCHAR(128) NOT NULL,
        cli_version VARCHAR(32) NOT NULL,
        is_ci TINYINT NOT NULL DEFAULT 0,
        INDEX idx_event_skill_ts (event, skill, timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
        console.log("✅ MySQL telemetry_events table is ready.");
    } catch (err) {
        console.error("❌ Failed to initialize MySQL table:", err);
    }
}
