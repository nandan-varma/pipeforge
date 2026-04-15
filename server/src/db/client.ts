import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema.js'
import fs from 'node:fs'
import path from 'node:path'

const dbPath = process.env.DATABASE_PATH ?? './data/pipeforge.db'
const dir = path.dirname(dbPath)
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

const libsqlClient = createClient({
  url: `file:${path.resolve(dbPath)}`,
})

export const db = drizzle(libsqlClient, { schema })
