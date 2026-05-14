import { PlatformSelector } from '../generate/PlatformSelector'

interface TargetPickerProps {
  platform: string
  onChange: (id: string) => void
  excludePlatform?: string
}

export function TargetPicker({ platform, onChange, excludePlatform }: TargetPickerProps) {
  return (
    <div className="p-4 border-b border-gray-800">
      <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Target Platform</label>
      <PlatformSelector value={platform} onChange={onChange} exclude={excludePlatform} />
    </div>
  )
}
