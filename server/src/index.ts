import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { migrate } from './db/migrate.js'
import generateRoute from './routes/generate.js'
import migrateRoute from './routes/migrate.js'
import debugRoute from './routes/debug.js'
import explainRoute from './routes/explain.js'

await migrate()

const fastify = Fastify({ logger: { level: 'info' } })

await fastify.register(cors, {
  origin: 'http://localhost:5173',
})

await fastify.register(
  async (app) => {
    await app.register(generateRoute)
    await app.register(migrateRoute)
    await app.register(debugRoute)
    await app.register(explainRoute)
  },
  { prefix: '/api' }
)

fastify.get('/health', async () => ({ ok: true }))

const port = parseInt(process.env.PORT ?? '3001')
await fastify.listen({ port, host: '0.0.0.0' })
