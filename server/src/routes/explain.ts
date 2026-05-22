import type { FastifyInstance } from 'fastify'
import { client } from '../services/ai.js'
import { EXPLAIN_SYSTEM_PROMPT } from '../services/prompts.js'

export default async function explainRoute(fastify: FastifyInstance) {
  fastify.post('/explain', async (req, reply) => {
    const { yaml, stepName, platform } = req.body as {
      yaml: string
      stepName: string
      platform: string
    }

    if (!yaml?.trim() || !stepName?.trim() || !platform) {
      return reply.code(400).send({ error: 'yaml, stepName, and platform are required' })
    }

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 400,
      system: [
        {
          type: 'text',
          text: EXPLAIN_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Platform: ${platform}\nStep name: ${stepName}\n\nFull pipeline YAML:\n${yaml}`,
        },
      ],
    })

    const textBlock = msg.content.find(b => b.type === 'text')
    return { explanation: textBlock?.type === 'text' ? textBlock.text : '' }
  })
}
