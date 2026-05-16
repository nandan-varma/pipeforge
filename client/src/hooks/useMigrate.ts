import { useState, useRef, useCallback } from 'react'
import { consumeSse } from './useGenerate'

interface MigrateParams {
  sourceYaml: string
  sourcePlatform: string
  targetPlatform: string
}

interface MigrateState {
  output: string
  streaming: boolean
  error: string | null
  historyId: string | null
}

export function useMigrate() {
  const [state, setState] = useState<MigrateState>({
    output: '',
    streaming: false,
    error: null,
    historyId: null,
  })
  const abortRef = useRef<AbortController | null>(null)

  const migrate = useCallback(async (params: MigrateParams) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState({ output: '', streaming: true, error: null, historyId: null })

    try {
      const res = await fetch('/api/migrate', {
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

  return { ...state, migrate, cancel, abortRef }
}
