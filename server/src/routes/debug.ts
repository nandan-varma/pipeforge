import type { FastifyInstance } from 'fastify'
import { nanoid } from 'nanoid'
import { db } from '../db/client.js'
import { generationHistory } from '../db/schema.js'
import { streamCompletion } from '../services/ai.js'
import { DEBUG_SYSTEM_PROMPT } from '../services/prompts.js'
import { setupSse } from './_sse.js'

export default async function debugRoute(fastify: FastifyInstance) {
  fastify.post('/debug', async (req, reply) => {
    const { yaml, errorMessage, platform, context } = req.body as {
      yaml: string
      errorMessage: string
      platform: string
      context?: string
    }

    if (!yaml?.trim() || !errorMessage?.trim() || !platform) {
      return reply.code(400).send({ error: 'yaml, errorMessage, and platform are required' })
    }

    const send = setupSse(reply)
    const historyId = nanoid()
    const startMs = Date.now()

    const userMessage = [
      `Platform: ${platform}`,
      context ? `Context: ${context}` : '',
      '',
      'Error message:',
      errorMessage,
      '',
      'Pipeline YAML:',
      yaml,
    ].filter(Boolean).join('\n')

    await streamCompletion(
      { system: DEBUG_SYSTEM_PROMPT, userMessage, maxTokens: 6000 },
      {
        onToken: (token) => send({ token }),
        onError: (err) => {
          send({ error: err.message })
          reply.raw.end()
        },
        onDone: async (fullText, usage) => {
          const durationMs = Date.now() - startMs
          const splitIdx = fullText.indexOf('\n# FIXED CONFIG\n')
          const outputYaml = splitIdx >= 0
            ? fullText.slice(splitIdx + '\n# FIXED CONFIG\n'.length).trim()
            : fullText

          await db.insert(generationHistory).values({
            id: historyId,
            mode: 'debug',
            platform,
            inputYaml: yaml,
            outputYaml,
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
