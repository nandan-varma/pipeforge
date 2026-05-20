import { useState, useRef, useCallback } from 'react'
import { consumeSse } from './useGenerate'

interface DebugParams {
  yaml: string
  errorMessage: string
  platform: string
  context?: string
}

interface DebugState {
  rawOutput: string
  diagnosis: string
  fixedYaml: string
  streaming: boolean
  error: string | null
}

const SPLIT_MARKER = '\n# FIXED CONFIG\n'

export function useDebug() {
  const [state, setState] = useState<DebugState>({
    rawOutput: '',
    diagnosis: '',
    fixedYaml: '',
    streaming: false,
    error: null,
  })
  const abortRef = useRef<AbortController | null>(null)

  const debug = useCallback(async (params: DebugParams) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState({ rawOutput: '', diagnosis: '', fixedYaml: '', streaming: true, error: null })

    try {
      const res = await fetch('/api/debug', {
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

      let accumulated = ''

      await consumeSse(res, controller, (token) => {
        accumulated += token
        setState(s => ({ ...s, rawOutput: accumulated }))
      }, () => {
        const splitIdx = accumulated.indexOf(SPLIT_MARKER)
        const diagnosis = splitIdx >= 0
          ? accumulated.slice(0, splitIdx).replace(/^# DIAGNOSIS\n/, '').trim()
          : accumulated.trim()
        const fixedYaml = splitIdx >= 0
          ? accumulated.slice(splitIdx + SPLIT_MARKER.length).trim()
          : ''
        setState(s => ({ ...s, streaming: false, diagnosis, fixedYaml }))
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

  return { ...state, debug, cancel, abortRef }
}
