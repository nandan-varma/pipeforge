import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGenerate } from '../hooks/useGenerate'
import { PromptPanel } from '../components/editor/PromptPanel'
import { OutputPanel } from '../components/editor/OutputPanel'

export function GeneratePage() {
  const { output, streaming, error, generate, cancel, abortRef } = useGenerate()
  const [editableOutput, setEditableOutput] = useState('')
  const [platform, setPlatform] = useState('github-actions')
  const [prompt, setPrompt] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const [initials, setInitials] = useState<{ platform?: string; prompt?: string } | null>(null)

  useEffect(() => {
    const loadId = searchParams.get('loadId')
    if (!loadId) return

    fetch(`/api/configs/${loadId}`)
      .then(r => r.json())
      .then(config => {
        if (config.outputYaml) setEditableOutput(config.outputYaml)
        if (config.platform) setPlatform(config.platform)
        setInitials({ platform: config.platform, prompt: config.inputPrompt ?? '' })
        setSearchParams({}, { replace: true })
      })
      .catch(() => setSearchParams({}, { replace: true }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!streaming && output) {
      setEditableOutput(output)
    }
  }, [streaming, output])

  useEffect(() => () => { abortRef.current?.abort() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const displayOutput = streaming ? output : editableOutput

  return (
    <div className="flex h-full">
      <div className="w-[420px] shrink-0 border-r border-gray-800 overflow-hidden flex flex-col">
        <PromptPanel
          onGenerate={(params) => {
            setEditableOutput('')
            setPlatform(params.platform)
            setPrompt(params.prompt)
            generate(params)
          }}
          onCancel={cancel}
          streaming={streaming}
          initialPlatform={initials?.platform}
          initialPrompt={initials?.prompt}
        />
      </div>

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
            platform={platform}
            mode="generate"
            inputPrompt={prompt}
            onChange={setEditableOutput}
          />
        </div>
      </div>
    </div>
  )
}
