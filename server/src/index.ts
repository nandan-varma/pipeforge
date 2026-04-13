import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { migrate } from './db/migrate.js'

await migrate()

const fastify = Fastify({ logger: { level: 'info' } })

await fastify.register(cors, {
  origin: 'http://localhost:5173',
})

fastify.get('/health', async () => ({ ok: true }))

const port = parseInt(process.env.PORT ?? '3001')
await fastify.listen({ port, host: '0.0.0.0' })
