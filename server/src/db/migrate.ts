import 'dotenv/config'
import { createClient } from '@libsql/client'
import fs from 'node:fs'
import path from 'node:path'

export async function migrate() {
  const dbPath = process.env.DATABASE_PATH ?? './data/pipeforge.db'
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const client = createClient({ url: `file:${path.resolve(dbPath)}` })

  const statements = [
    `CREATE TABLE IF NOT EXISTS saved_configs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mode TEXT NOT NULL,
      platform TEXT NOT NULL,
      input_prompt TEXT,
      input_yaml TEXT,
      output_yaml TEXT NOT NULL,
      starred INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE INDEX IF NOT EXISTS idx_saved_configs_platform ON saved_configs(platform)`,
    `CREATE INDEX IF NOT EXISTS idx_saved_configs_mode ON saved_configs(mode)`,
    `CREATE INDEX IF NOT EXISTS idx_saved_configs_starred ON saved_configs(starred)`,
  ]

  for (const stmt of statements) {
    await client.execute(stmt)
  }
  await client.close()
}

if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  migrate().then(() => console.log('Migration complete')).catch(console.error)
}
