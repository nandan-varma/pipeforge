import { useState, useRef, useCallback } from 'react'

interface GenerateParams {
  prompt: string
  platform: string
  extras: string[]
}

interface GenerateState {
  output: string
  streaming: boolean
  error: string | null
  historyId: string | null
}

export function useGenerate() {
  const [state, setState] = useState<GenerateState>({
    output: '',
    streaming: false,
    error: null,
    historyId: null,
  })
  const abortRef = useRef<AbortController | null>(null)

  const generate = useCallback(async (params: GenerateParams) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState({ output: '', streaming: true, error: null, historyId: null })

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: controller.signal,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Request failed' }))
        setState(s => ({ ...s, streaming: false, error: data.error ?? 'Request failed' }))
        return
      }

      await consumeSse(res, controller, (token) => {
        setState(s => ({ ...s, output: s.output + token }))
      }, (historyId) => {
        setState(s => ({ ...s, streaming: false, historyId }))
      }, (err) => {
        setState(s => ({ ...s, streaming: false, error: err }))
      })
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setState(s => ({ ...s, streaming: false, error: (err as Error).message }))
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setState(s => ({ ...s, streaming: false }))
  }, [])

  return { ...state, generate, cancel, abortRef }
}

export async function consumeSse(
  res: Response,
  controller: AbortController,
  onToken: (token: string) => void,
  onDone: (historyId: string | null) => void,
  onError: (msg: string) => void
) {
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (controller.signal.aborted) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const payload = JSON.parse(line.slice(6))
          if (payload.error) { onError(payload.error); return }
          if (payload.token) onToken(payload.token)
          if (payload.done) onDone(payload.historyId ?? null)
        } catch {
          // malformed SSE event — skip
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
