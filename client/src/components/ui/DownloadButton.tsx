import { useEffect, useRef } from 'react'
import { Download } from 'lucide-react'
import { getPlatformFilename } from '../../lib/platforms'

interface DownloadButtonProps {
  yaml: string
  platform: string
  className?: string
}

export function DownloadButton({ yaml, platform, className }: DownloadButtonProps) {
  const urlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [])

  function handleDownload() {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    const blob = new Blob([yaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    urlRef.current = url

    const a = document.createElement('a')
    a.href = url
    a.download = getPlatformFilename(platform)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <button
      onClick={handleDownload}
      title="Download pipeline file"
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100 transition-colors ${className ?? ''}`}
    >
      <Download size={14} />
      Download
    </button>
  )
}
