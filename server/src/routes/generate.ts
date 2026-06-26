import type { FastifyInstance } from 'fastify'
import { nanoid } from 'nanoid'
import { db } from '../db/client.js'
import { generationHistory } from '../db/schema.js'
import { streamCompletion } from '../services/ai.js'
import { GENERATE_SYSTEM_PROMPT } from '../services/prompts.js'
import { setupSse } from './_sse.js'

const EXTRAS_INSTRUCTIONS: Record<string, string> = {
  'cache-deps': 'Include aggressive dependency caching to speed up subsequent runs.',
  'docker-build': 'Include a Docker image build and push step (use DOCKER_USERNAME and DOCKER_PASSWORD secrets).',
  'notify-slack': 'Add a Slack notification step on failure (use SLACK_WEBHOOK_URL secret).',
  'matrix-test': 'Run tests across multiple language/runtime versions using a matrix strategy.',
  'security-scan': 'Add a security vulnerability scan step (use Trivy or Snyk).',
  'auto-version': 'Automatically bump the semver version on merge to main.',
}

function buildUserMessage(prompt: string, platform: string, extras: string[]): string {
  const extrasText = extras.length > 0
    ? '\nAdditional requirements:\n' + extras
        .map(e => `- ${EXTRAS_INSTRUCTIONS[e] ?? e}`)
        .join('\n')
    : ''

  return `Generate a CI/CD pipeline for platform: ${platform}\n\nStack and requirements:\n${prompt}${extrasText}`
}

export default async function generateRoute(fastify: FastifyInstance) {
  fastify.post('/generate', async (req, reply) => {
    const { prompt, platform, extras = [] } = req.body as {
      prompt: string
      platform: string
      extras?: string[]
    }

    if (!prompt?.trim() || !platform) {
      return reply.code(400).send({ error: 'prompt and platform are required' })
    }

    const send = setupSse(reply)
    const historyId = nanoid()
    const startMs = Date.now()

    await streamCompletion(
      {
        system: GENERATE_SYSTEM_PROMPT,
        userMessage: buildUserMessage(prompt, platform, extras),
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
