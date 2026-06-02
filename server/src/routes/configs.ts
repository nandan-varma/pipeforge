import type { FastifyInstance } from 'fastify'
import { eq, desc, and, like } from 'drizzle-orm'
import { db } from '../db/client.js'
import { savedConfigs } from '../db/schema.js'

export default async function configsRoute(fastify: FastifyInstance) {
  // GET /api/configs — list without full outputYaml
  fastify.get('/configs', async (req) => {
    const { platform, mode, search, starred } = req.query as {
      platform?: string
      mode?: string
      search?: string
      starred?: string
    }

    const conditions = [
      platform ? eq(savedConfigs.platform, platform) : undefined,
      mode ? eq(savedConfigs.mode, mode) : undefined,
      search ? like(savedConfigs.name, `%${search}%`) : undefined,
      starred === 'true' ? eq(savedConfigs.starred, true) : undefined,
    ].filter((c): c is NonNullable<typeof c> => c !== undefined)

    const results = await db
      .select({
        id: savedConfigs.id,
        name: savedConfigs.name,
        mode: savedConfigs.mode,
        platform: savedConfigs.platform,
        starred: savedConfigs.starred,
        createdAt: savedConfigs.createdAt,
        outputYamlPreview: savedConfigs.outputYaml,
      })
      .from(savedConfigs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(savedConfigs.createdAt))

    return results.map(r => ({
      ...r,
      outputYamlPreview: r.outputYamlPreview?.split('\n').slice(0, 3).join('\n') ?? '',
    }))
  })

  // GET /api/configs/:id — full config
  fastify.get('/configs/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const rows = await db
      .select()
      .from(savedConfigs)
      .where(eq(savedConfigs.id, id))

    if (!rows.length) return reply.code(404).send({ error: 'Config not found' })
    return rows[0]
  })

  // POST /api/configs — save config
  fastify.post('/configs', async (req, reply) => {
    const body = req.body as {
      id: string
      name: string
      mode: string
      platform: string
      inputPrompt?: string
      inputYaml?: string
      outputYaml: string
    }

    if (!body.id || !body.name || !body.mode || !body.platform || !body.outputYaml) {
      return reply.code(400).send({ error: 'id, name, mode, platform, and outputYaml are required' })
    }

    await db.insert(savedConfigs).values({
      id: body.id,
      name: body.name,
      mode: body.mode,
      platform: body.platform,
      inputPrompt: body.inputPrompt,
      inputYaml: body.inputYaml,
      outputYaml: body.outputYaml,
    })

    return reply.code(201).send({ id: body.id })
  })

  // DELETE /api/configs/:id
  fastify.delete('/configs/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    await db.delete(savedConfigs).where(eq(savedConfigs.id, id))
    return reply.code(204).send()
  })

  // PATCH /api/configs/:id/star — toggle starred
  fastify.patch('/configs/:id/star', async (req, reply) => {
    const { id } = req.params as { id: string }
    const rows = await db
      .select({ starred: savedConfigs.starred })
      .from(savedConfigs)
      .where(eq(savedConfigs.id, id))

    if (!rows.length) return reply.code(404).send({ error: 'Config not found' })
    const newStarred = !rows[0].starred

    await db
      .update(savedConfigs)
      .set({ starred: newStarred })
      .where(eq(savedConfigs.id, id))

    return { starred: newStarred }
  })
}
