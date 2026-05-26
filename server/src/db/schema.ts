import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const savedConfigs = sqliteTable('saved_configs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  mode: text('mode').notNull(),
  platform: text('platform').notNull(),
  inputPrompt: text('input_prompt'),
  inputYaml: text('input_yaml'),
  outputYaml: text('output_yaml').notNull(),
  starred: integer('starred', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const generationHistory = sqliteTable('generation_history', {
  id: text('id').primaryKey(),
  mode: text('mode').notNull(),
  platform: text('platform').notNull(),
  inputPrompt: text('input_prompt'),
  inputYaml: text('input_yaml'),
  outputYaml: text('output_yaml').notNull(),
  durationMs: integer('duration_ms'),
  tokenCount: integer('token_count'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export type SavedConfig = typeof savedConfigs.$inferSelect
export type NewSavedConfig = typeof savedConfigs.$inferInsert
export type GenerationHistory = typeof generationHistory.$inferSelect
export type NewGenerationHistory = typeof generationHistory.$inferInsert
