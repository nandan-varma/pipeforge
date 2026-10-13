import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Save, X } from 'lucide-react'
import { nanoid } from 'nanoid'

interface SaveButtonProps {
  yaml: string
  mode: string
  platform: string
  inputPrompt?: string
  inputYaml?: string
  className?: string
}

interface SaveModalProps extends SaveButtonProps {
  onClose: () => void
}

function SaveModal({ yaml, mode, platform, inputPrompt, inputYaml, onClose }: SaveModalProps) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSave() {
    if (!name.trim()) return
    setStatus('saving')
    try {
      const res = await fetch('/api/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: nanoid(),
          name: name.trim(),
          mode,
          platform,
          inputPrompt,
          inputYaml,
          outputYaml: yaml,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setStatus('saved')
      setTimeout(onClose, 900)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Save failed')
      setStatus('error')
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Save pipeline</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="Pipeline name…"
          autoFocus
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-hidden focus:border-brand-500 text-sm mb-4"
        />

        {status === 'error' && (
          <p className="text-red-400 text-sm mb-3">{errorMsg}</p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || status === 'saving' || status === 'saved'}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function SaveButton({ yaml, mode, platform, inputPrompt, inputYaml, className }: SaveButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        title="Save pipeline"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-sm bg-brand-600 text-white hover:bg-brand-700 transition-colors ${className ?? ''}`}
      >
        <Save size={14} />
        Save
      </button>
      {showModal && (
        <SaveModal
          yaml={yaml}
          mode={mode}
          platform={platform}
          inputPrompt={inputPrompt}
          inputYaml={inputYaml}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
