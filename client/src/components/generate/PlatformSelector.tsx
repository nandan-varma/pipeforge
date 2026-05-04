import { PLATFORMS } from '../../lib/platforms'

interface PlatformSelectorProps {
  value: string
  onChange: (id: string) => void
  exclude?: string
}

export function PlatformSelector({ value, onChange, exclude }: PlatformSelectorProps) {
  const platforms = PLATFORMS.filter(p => p.id !== exclude)

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map(platform => (
        <button
          key={platform.id}
          onClick={() => onChange(platform.id)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
            value === platform.id
              ? 'border-brand-500 bg-brand-600 text-white'
              : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500 hover:text-gray-200'
          }`}
        >
          {platform.label}
        </button>
      ))}
    </div>
  )
}
