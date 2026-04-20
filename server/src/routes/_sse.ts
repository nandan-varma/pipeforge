import type { FastifyReply } from 'fastify'

export function setupSse(reply: FastifyReply): (data: object) => void {
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  reply.hijack()
  return (data: object) => {
    reply.raw.write(`data: ${JSON.stringify(data)}\n\n`)
  }
}
