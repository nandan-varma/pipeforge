import { YamlEditor } from '../editor/YamlEditor'
import { PlatformSelector } from '../generate/PlatformSelector'

interface SourcePickerProps {
  platform: string
  onPlatformChange: (id: string) => void
  yaml: string
  onYamlChange: (yaml: string) => void
  excludePlatform?: string
}

const PLATFORM_HINTS: Record<string, string> = {
  'circleci': 'version: 2.1',
  'gitlab-ci': 'stages:',
  'github-actions': 'on:',
  'bitbucket': 'pipelines:',
  'jenkins': 'pipeline {',
}

function autoDetectPlatform(yaml: string): string | null {
  for (const [id, hint] of Object.entries(PLATFORM_HINTS)) {
    if (yaml.includes(hint)) return id
  }
  return null
}

export function SourcePicker({ platform, onPlatformChange, yaml, onYamlChange, excludePlatform }: SourcePickerProps) {
  function handleAutoDetect() {
    const detected = autoDetectPlatform(yaml)
    if (detected) onPlatformChange(detected)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 shrink-0 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Source Platform</label>
          <PlatformSelector value={platform} onChange={onPlatformChange} exclude={excludePlatform} />
        </div>
        <button
          onClick={handleAutoDetect}
          disabled={!yaml.trim()}
          className="text-xs text-brand-400 hover:text-brand-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          Auto-detect from YAML
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <YamlEditor value={yaml} onChange={onYamlChange} className="h-full" />
      </div>
    </div>
  )
}
