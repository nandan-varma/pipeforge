import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
import path from 'path'

const dbPath = process.env.DATABASE_PATH ?? './data/pipeforge.db'

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: `file:${path.resolve(dbPath)}`,
  },
})
