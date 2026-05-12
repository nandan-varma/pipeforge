import type { FastifyInstance } from 'fastify'
import { nanoid } from 'nanoid'
import { db } from '../db/client.js'
import { generationHistory } from '../db/schema.js'
import { streamCompletion } from '../services/ai.js'
import { MIGRATE_SYSTEM_PROMPT } from '../services/prompts.js'
import { setupSse } from './_sse.js'

export default async function migrateRoute(fastify: FastifyInstance) {
  fastify.post('/migrate', async (req, reply) => {
    const { sourceYaml, sourcePlatform, targetPlatform } = req.body as {
      sourceYaml: string
      sourcePlatform: string
      targetPlatform: string
    }

    if (!sourceYaml?.trim() || !sourcePlatform || !targetPlatform) {
      return reply.code(400).send({ error: 'sourceYaml, sourcePlatform, and targetPlatform are required' })
    }
    if (sourcePlatform === targetPlatform) {
      return reply.code(400).send({ error: 'Source and target platforms must be different' })
    }

    const send = setupSse(reply)
    const historyId = nanoid()
    const startMs = Date.now()

    const userMessage = `Convert this ${sourcePlatform} pipeline configuration to ${targetPlatform}:\n\n${sourceYaml}`

    await streamCompletion(
      { system: MIGRATE_SYSTEM_PROMPT, userMessage },
      {
        onToken: (token) => send({ token }),
        onError: (err) => {
          send({ error: err.message })
          reply.raw.end()
        },
        onDone: async (fullText, usage) => {
          const durationMs = Date.now() - startMs
          await db.insert(generationHistory).values({
            id: historyId,
            mode: 'migrate',
            platform: targetPlatform,
            inputYaml: sourceYaml,
            outputYaml: fullText,
            durationMs,
            tokenCount: usage.inputTokens + usage.outputTokens,
          })
          send({ done: true, historyId })
          reply.raw.end()
        },
      }
    )
  })
}
