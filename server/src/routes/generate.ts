import type { FastifyInstance } from 'fastify'
import { nanoid } from 'nanoid'
import { db } from '../db/client.js'
import { generationHistory } from '../db/schema.js'
import { streamCompletion } from '../services/ai.js'
import { GENERATE_SYSTEM_PROMPT } from '../services/prompts.js'
import { setupSse } from './_sse.js'

function buildUserMessage(prompt: string, platform: string): string {
  return `Generate a CI/CD pipeline for platform: ${platform}\n\nStack and requirements:\n${prompt}`
}

export default async function generateRoute(fastify: FastifyInstance) {
  fastify.post('/generate', async (req, reply) => {
    const { prompt, platform } = req.body as {
      prompt: string
      platform: string
    }

    const send = setupSse(reply)
    const historyId = nanoid()
    const startMs = Date.now()

    await streamCompletion(
      {
        system: GENERATE_SYSTEM_PROMPT,
        userMessage: buildUserMessage(prompt, platform),
      },
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
            mode: 'generate',
            platform,
            inputPrompt: prompt,
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
