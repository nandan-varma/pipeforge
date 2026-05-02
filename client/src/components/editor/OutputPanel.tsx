import { getPlatform } from '../../lib/platforms'
import { CopyButton } from '../ui/CopyButton'
import { DownloadButton } from '../ui/DownloadButton'
import { SaveButton } from '../ui/SaveButton'
import { StreamingOutput } from './StreamingOutput'
import { YamlEditor } from './YamlEditor'

interface OutputPanelProps {
  output: string
  streaming: boolean
  platform: string
  mode: string
  inputPrompt?: string
  inputYaml?: string
  onChange?: (value: string) => void
}

export function OutputPanel({ output, streaming, platform, mode, inputPrompt, inputYaml, onChange }: OutputPanelProps) {
  const plat = getPlatform(platform)
  const lineCount = output ? output.split('\n').length : 0

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 bg-gray-900 shrink-0">
        {plat && (
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${plat.color}`}>
            {plat.label}
          </span>
        )}
        {lineCount > 0 && (
          <span className="text-xs text-gray-500">{lineCount} lines</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {output && !streaming && (
            <>
              <CopyButton text={output} />
              <DownloadButton yaml={output} platform={platform} />
              <SaveButton
                yaml={output}
                mode={mode}
                platform={platform}
                inputPrompt={inputPrompt}
                inputYaml={inputYaml}
              />
            </>
          )}
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden">
        {!output && !streaming ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-4 opacity-30">
              <rect x="8" y="8" width="48" height="48" rx="6" stroke="currentColor" strokeWidth="2" />
              <path d="M16 24h32M16 32h24M16 40h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="48" cy="40" r="8" fill="currentColor" opacity="0.3" />
              <path d="M45 40l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm">Your generated pipeline will appear here</p>
          </div>
        ) : streaming ? (
          <StreamingOutput value={output} streaming={streaming} className="h-full" />
        ) : (
          <YamlEditor value={output} onChange={onChange} className="h-full" />
        )}
      </div>
    </div>
  )
}
