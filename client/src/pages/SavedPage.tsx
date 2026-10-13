import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { Star, Copy, Trash2, X, ExternalLink } from 'lucide-react'
import { getPlatform } from '../lib/platforms'
import { YamlEditor } from '../components/editor/YamlEditor'
import { CopyButton } from '../components/ui/CopyButton'
import { DownloadButton } from '../components/ui/DownloadButton'

interface Config {
  id: string
  name: string
  mode: string
  platform: string
  starred: boolean
  createdAt: string
  outputYamlPreview: string
}

interface FullConfig extends Config {
  outputYaml: string
  inputPrompt?: string
}

function PlatformBadge({ platform }: { platform: string }) {
  const plat = getPlatform(platform)
  if (!plat) return null
  return <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${plat.color}`}>{plat.label}</span>
}

function ModeBadge({ mode }: { mode: string }) {
  const colors: Record<string, string> = {
    generate: 'bg-purple-900 text-purple-200',
    migrate: 'bg-blue-900 text-blue-200',
    debug: 'bg-red-900 text-red-200',
  }
  return (
    <span className={`px-2 py-0.5 rounded-sm text-xs font-medium capitalize ${colors[mode] ?? 'bg-gray-800 text-gray-400'}`}>
      {mode}
    </span>
  )
}

function ViewModal({ config, onClose }: { config: FullConfig; onClose: () => void }) {
  const navigate = useNavigate()

  function loadIntoEditor() {
    const params = new URLSearchParams({ loadId: config.id })
    onClose()
    navigate(`/${config.mode === 'generate' ? 'generate' : config.mode}?${params}`)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-100">{config.name}</h2>
            <PlatformBadge platform={config.platform} />
            <ModeBadge mode={config.mode} />
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={config.outputYaml} />
            <DownloadButton yaml={config.outputYaml} platform={config.platform} />
            <button
              onClick={loadIntoEditor}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-sm bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              <ExternalLink size={14} />
              Load into editor
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors ml-1">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <YamlEditor value={config.outputYaml} readOnly className="h-full" />
        </div>
      </div>
    </div>,
    document.body
  )
}

function ConfigCard({
  config,
  onStar,
  onDelete,
  onView,
}: {
  config: Config
  onStar: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}) {
  const date = new Date(config.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3 hover:border-gray-600 transition-colors cursor-pointer group"
      onClick={() => onView(config.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-gray-100 text-sm truncate">{config.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{date}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onStar(config.id) }}
          className={`shrink-0 transition-colors ${config.starred ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`}
          title={config.starred ? 'Unstar' : 'Star'}
        >
          <Star size={16} fill={config.starred ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <PlatformBadge platform={config.platform} />
        <ModeBadge mode={config.mode} />
      </div>

      {config.outputYamlPreview && (
        <pre className="text-xs text-gray-500 font-mono bg-gray-950 rounded-sm p-2 overflow-hidden max-h-16 leading-relaxed">
          {config.outputYamlPreview}
        </pre>
      )}

      <div className="flex items-center gap-2 mt-auto pt-1 border-t border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(config.outputYamlPreview ?? '') }}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          title="Copy"
        >
          <Copy size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(config.id) }}
          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-400 transition-colors ml-auto"
          title="Delete"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>
    </div>
  )
}

export function SavedPage() {
  const [configs, setConfigs] = useState<Config[]>([])
  const [loading, setLoading] = useState(true)
  const [viewConfig, setViewConfig] = useState<FullConfig | null>(null)
  const [filter, setFilter] = useState<{ starred?: boolean; search?: string }>({})

  async function loadConfigs() {
    const params = new URLSearchParams()
    if (filter.starred) params.set('starred', 'true')
    if (filter.search) params.set('search', filter.search)

    const res = await fetch(`/api/configs?${params}`)
    const data = await res.json()
    setConfigs(data)
    setLoading(false)
  }

  useEffect(() => { loadConfigs() }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStar(id: string) {
    await fetch(`/api/configs/${id}/star`, { method: 'PATCH' })
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, starred: !c.starred } : c))
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this config?')) return
    await fetch(`/api/configs/${id}`, { method: 'DELETE' })
    setConfigs(prev => prev.filter(c => c.id !== id))
  }

  async function handleView(id: string) {
    const res = await fetch(`/api/configs/${id}`)
    const data = await res.json()
    setViewConfig(data)
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search configs…"
          onChange={(e) => setFilter(f => ({ ...f, search: e.target.value || undefined }))}
          className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-hidden focus:border-brand-500 text-sm w-64"
        />
        <button
          onClick={() => setFilter(f => ({ ...f, starred: f.starred ? undefined : true }))}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            filter.starred
              ? 'bg-yellow-900/50 border border-yellow-700 text-yellow-300'
              : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200'
          }`}
        >
          <Star size={14} fill={filter.starred ? 'currentColor' : 'none'} />
          Starred
        </button>
        <span className="text-xs text-gray-500 ml-auto">{configs.length} configs</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-500">Loading…</div>
      ) : configs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-600">
          <p className="text-sm">No saved configs yet</p>
          <p className="text-xs mt-1">Generate a pipeline and click "Save" to store it here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {configs.map(config => (
            <ConfigCard
              key={config.id}
              config={config}
              onStar={handleStar}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {viewConfig && (
        <ViewModal config={viewConfig} onClose={() => setViewConfig(null)} />
      )}
    </div>
  )
}
