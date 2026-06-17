import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export interface StreamCallbacks {
  onToken: (token: string) => void
  onError: (err: Error) => void
  onDone: (fullText: string, usage: { inputTokens: number; outputTokens: number }) => void
}

export interface AiStreamParams {
  system: string
  userMessage: string
  maxTokens?: number
}

export async function streamCompletion(
  params: AiStreamParams,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: params.maxTokens ?? 4096,
    system: [
      {
        type: 'text',
        text: params.system,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: params.userMessage }],
  })

  signal?.addEventListener('abort', () => {
    try { stream.controller.abort() } catch (_) { /* ignore */ }
  })

  let fullText = ''

  stream.on('text', (delta: string) => {
    fullText += delta
    callbacks.onToken(delta)
  })

  try {
    const final = await stream.finalMessage()
    callbacks.onDone(fullText, {
      inputTokens: final.usage.input_tokens,
      outputTokens: final.usage.output_tokens,
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') return
    callbacks.onError(err instanceof Error ? err : new Error(String(err)))
  }
}

export { client }
