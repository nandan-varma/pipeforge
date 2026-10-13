import { YamlEditor } from '../editor/YamlEditor'
import { PlatformSelector } from '../generate/PlatformSelector'
import { Bug, X } from 'lucide-react'

interface ErrorInputProps {
  platform: string
  onPlatformChange: (id: string) => void
  yaml: string
  onYamlChange: (yaml: string) => void
  errorMessage: string
  onErrorChange: (msg: string) => void
  context: string
  onContextChange: (ctx: string) => void
  onSubmit: () => void
  onCancel: () => void
  streaming: boolean
}

export function ErrorInput({
  platform, onPlatformChange,
  yaml, onYamlChange,
  errorMessage, onErrorChange,
  context, onContextChange,
  onSubmit, onCancel,
  streaming,
}: ErrorInputProps) {
  const canSubmit = yaml.trim() && errorMessage.trim() && platform && !streaming

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Platform</label>
        <PlatformSelector value={platform} onChange={onPlatformChange} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Pipeline YAML</label>
        <div className="h-64 border border-gray-700 rounded-lg overflow-hidden">
          <YamlEditor value={yaml} onChange={onYamlChange} className="h-full" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Error Message</label>
        <textarea
          value={errorMessage}
          onChange={(e) => onErrorChange(e.target.value)}
          rows={4}
          placeholder="Paste the error output from your CI/CD system…"
          className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-red-300 placeholder-gray-500 focus:outline-hidden focus:border-red-500 resize-y text-sm font-mono"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Additional Context (optional)</label>
        <input
          type="text"
          value={context}
          onChange={(e) => onContextChange(e.target.value)}
          placeholder="E.g: Failing on push to feature branch, works on main"
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-hidden focus:border-brand-500 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-700 text-white font-medium text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Bug size={16} />
          {streaming ? 'Diagnosing…' : 'Diagnose & fix'}
        </button>
        {streaming && (
          <button
            onClick={onCancel}
            className="px-3 py-2.5 rounded-lg bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
