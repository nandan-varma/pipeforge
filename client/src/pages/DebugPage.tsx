import { useEffect, useState } from 'react'
import { useDebug } from '../hooks/useDebug'
import { ErrorInput } from '../components/debug/ErrorInput'
import { YamlEditor } from '../components/editor/YamlEditor'
import { CopyButton } from '../components/ui/CopyButton'
import { DownloadButton } from '../components/ui/DownloadButton'
import { SaveButton } from '../components/ui/SaveButton'
import { StreamingOutput } from '../components/editor/StreamingOutput'

export function DebugPage() {
  const { rawOutput, diagnosis, fixedYaml, streaming, error, debug, cancel, abortRef } = useDebug()
  const [platform, setPlatform] = useState('github-actions')
  const [yaml, setYaml] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [context, setContext] = useState('')
  const [editableFixed, setEditableFixed] = useState('')

  useEffect(() => {
    if (!streaming && fixedYaml) setEditableFixed(fixedYaml)
  }, [streaming, fixedYaml])

  useEffect(() => () => { abortRef.current?.abort() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const hasResult = !streaming && (diagnosis || fixedYaml)

  return (
    <div className="flex h-full overflow-y-auto">
      {/* Input column */}
      <div className="w-[480px] shrink-0 border-r border-gray-800 p-4 overflow-y-auto">
        <ErrorInput
          platform={platform}
          onPlatformChange={setPlatform}
          yaml={yaml}
          onYamlChange={setYaml}
          errorMessage={errorMessage}
          onErrorChange={setErrorMessage}
          context={context}
          onContextChange={setContext}
          onSubmit={() => {
            setEditableFixed('')
            debug({ yaml, errorMessage, platform, context })
          }}
          onCancel={cancel}
          streaming={streaming}
        />
        {error && (
          <div className="mt-3 px-3 py-2 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Output column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* While streaming, show raw output */}
        {streaming && (
          <StreamingOutput value={rawOutput} streaming={streaming} className="h-full" />
        )}

        {/* After streaming: diagnosis + fixed YAML */}
        {hasResult && (
          <>
            {/* Diagnosis */}
            <div className="border-b border-gray-800 p-4 shrink-0">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Diagnosis</h3>
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{diagnosis}</p>
            </div>

            {/* Fixed config */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 bg-gray-900 shrink-0">
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Fixed config</h3>
                <div className="ml-auto flex items-center gap-2">
                  {editableFixed && (
                    <>
                      <CopyButton text={editableFixed} />
                      <DownloadButton yaml={editableFixed} platform={platform} />
                      <SaveButton yaml={editableFixed} mode="debug" platform={platform} inputYaml={yaml} />
                    </>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {editableFixed ? (
                  <YamlEditor value={editableFixed} onChange={setEditableFixed} className="h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                    No fixed YAML returned
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!streaming && !hasResult && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600">
            <p className="text-sm">Diagnosis and fixed pipeline will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
