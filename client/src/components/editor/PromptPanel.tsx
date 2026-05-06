import { useState } from 'react'
import { Wand2, X } from 'lucide-react'
import { PlatformSelector } from '../generate/PlatformSelector'
import { StackSelector } from '../generate/StackSelector'
import { PromptInput } from '../generate/PromptInput'

const EXTRAS = [
  { id: 'cache-deps',    label: 'Cache dependencies' },
  { id: 'docker-build',  label: 'Docker build & push' },
  { id: 'matrix-test',   label: 'Matrix testing' },
  { id: 'security-scan', label: 'Security scan' },
  { id: 'notify-slack',  label: 'Slack notifications' },
  { id: 'auto-version',  label: 'Auto version bump' },
]

interface PromptPanelProps {
  onGenerate: (params: { prompt: string; platform: string; extras: string[] }) => void
  onCancel: () => void
  streaming: boolean
  initialPlatform?: string
  initialPrompt?: string
}

export function PromptPanel({ onGenerate, onCancel, streaming, initialPlatform, initialPrompt }: PromptPanelProps) {
  const [platform, setPlatform] = useState(initialPlatform ?? 'github-actions')
  const [prompt, setPrompt] = useState(initialPrompt ?? '')
  const [extras, setExtras] = useState<string[]>([])

  function handleAddChip(chip: string) {
    setPrompt(p => p ? `${p}, ${chip}` : chip)
  }

  function toggleExtra(id: string) {
    setExtras(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  function handleSubmit() {
    if (!prompt.trim() || streaming) return
    onGenerate({ prompt, platform, extras })
  }

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Platform</label>
        <PlatformSelector value={platform} onChange={setPlatform} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Description</label>
        <PromptInput value={prompt} onChange={setPrompt} disabled={streaming} />
        <div className="mt-2">
          <StackSelector onAdd={handleAddChip} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Extras</label>
        <div className="grid grid-cols-2 gap-2">
          {EXTRAS.map(extra => (
            <label key={extra.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={extras.includes(extra.id)}
                onChange={() => toggleExtra(extra.id)}
                className="rounded border-gray-600 bg-gray-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-gray-900"
              />
              <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                {extra.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-auto flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!prompt.trim() || streaming}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Wand2 size={16} />
          {streaming ? 'Generating…' : 'Generate pipeline'}
        </button>
        {streaming && (
          <button
            onClick={onCancel}
            className="px-3 py-2.5 rounded-lg bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
            title="Cancel"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
