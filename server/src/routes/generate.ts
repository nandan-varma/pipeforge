import type { FastifyInstance } from 'fastify'
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
        onDone: async () => {
          send({ done: true })
          reply.raw.end()
        },
      }
    )
  })
}
