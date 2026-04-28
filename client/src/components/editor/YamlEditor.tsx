import { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { yaml } from '@codemirror/lang-yaml'
import { oneDark } from '@codemirror/theme-one-dark'

interface YamlEditorProps {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  className?: string
}

export function YamlEditor({ value, onChange, readOnly = false, className }: YamlEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current) return

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          yaml(),
          oneDark,
          EditorView.editable.of(!readOnly),
          EditorState.readOnly.of(readOnly),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && onChangeRef.current) {
              onChangeRef.current(update.state.doc.toString())
            }
          }),
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
    return () => view.destroy()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps — init once

  // Sync external value changes without recreating the editor
  useEffect(() => {
    const view = editorRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      })
    }
  }, [value])

  return <div ref={containerRef} className={`h-full ${className ?? ''}`} />
}
