import { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { yaml } from '@codemirror/lang-yaml'
import { oneDark } from '@codemirror/theme-one-dark'

interface StreamingOutputProps {
  value: string
  streaming: boolean
  className?: string
}

export function StreamingOutput({ value, streaming, className }: StreamingOutputProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorView | null>(null)
  const prevValueRef = useRef('')

  useEffect(() => {
    if (!containerRef.current) return

    const view = new EditorView({
      state: EditorState.create({
        doc: '',
        extensions: [
          basicSetup,
          yaml(),
          oneDark,
          EditorView.editable.of(false),
          EditorState.readOnly.of(true),
          EditorView.theme({
            '&': { height: '100%', backgroundColor: '#1a1a2e' },
            '.cm-scroller': { overflow: 'auto' },
            '.cm-content': { fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '13px' },
            '.cm-gutters': { backgroundColor: '#16213e', borderRight: '1px solid #2d3748' },
          }),
        ],
      }),
      parent: containerRef.current,
    })

    editorRef.current = view
    prevValueRef.current = ''
    return () => view.destroy()
  }, [])

  // Append only the new portion of value (incremental dispatch for smooth streaming)
  useEffect(() => {
    const view = editorRef.current
    if (!view) return

    const prev = prevValueRef.current
    if (value === prev) return

    if (value.startsWith(prev)) {
      // Append only the new suffix
      const newPart = value.slice(prev.length)
      view.dispatch({
        changes: { from: view.state.doc.length, insert: newPart },
        scrollIntoView: true,
      })
    } else {
      // Full replace (e.g. on reset)
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      })
    }
    prevValueRef.current = value
  }, [value])

  return (
    <div className={`relative h-full ${className ?? ''}`}>
      <div ref={containerRef} className="h-full" />
      {streaming && (
        <div className="absolute bottom-3 right-4 flex items-center gap-2 text-xs text-brand-400">
          <span className="streaming-cursor" />
          <span>Generating…</span>
        </div>
      )}
    </div>
  )
}
