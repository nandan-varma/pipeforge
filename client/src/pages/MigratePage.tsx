import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useMigrate } from '../hooks/useMigrate'
import { SourcePicker } from '../components/migrate/SourcePicker'
import { TargetPicker } from '../components/migrate/TargetPicker'
import { OutputPanel } from '../components/editor/OutputPanel'

export function MigratePage() {
  const { output, streaming, error, migrate, cancel, abortRef } = useMigrate()
  const [editableOutput, setEditableOutput] = useState('')
  const [sourceYaml, setSourceYaml] = useState('')
  const [sourcePlatform, setSourcePlatform] = useState('circleci')
  const [targetPlatform, setTargetPlatform] = useState('github-actions')

  useEffect(() => {
    if (!streaming && output) setEditableOutput(output)
  }, [streaming, output])

  useEffect(() => () => { abortRef.current?.abort() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleConvert() {
    if (!sourceYaml.trim() || streaming) return
    setEditableOutput('')
    migrate({ sourceYaml, sourcePlatform, targetPlatform })
  }

  const displayOutput = streaming ? output : editableOutput

  return (
    <div className="flex h-full">
      {/* Source panel */}
      <div className="flex-1 border-r border-gray-800 flex flex-col overflow-hidden">
        <SourcePicker
          platform={sourcePlatform}
          onPlatformChange={setSourcePlatform}
          yaml={sourceYaml}
          onYamlChange={setSourceYaml}
          excludePlatform={targetPlatform}
        />
        <div className="p-4 border-t border-gray-800 shrink-0">
          <button
            onClick={handleConvert}
            disabled={!sourceYaml.trim() || streaming || sourcePlatform === targetPlatform}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowRight size={16} />
            {streaming ? 'Converting…' : `Convert to ${targetPlatform.replace('-', ' ')}`}
          </button>
        </div>
      </div>

      {/* Target panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TargetPicker
          platform={targetPlatform}
          onChange={setTargetPlatform}
          excludePlatform={sourcePlatform}
        />
        <div className="flex-1 overflow-hidden flex flex-col">
          {error && (
            <div className="px-4 py-2 bg-red-900/40 border-b border-red-700 text-red-300 text-sm shrink-0">
              {error}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <OutputPanel
              output={displayOutput}
              streaming={streaming}
              platform={targetPlatform}
              mode="migrate"
              inputYaml={sourceYaml}
              onChange={setEditableOutput}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
