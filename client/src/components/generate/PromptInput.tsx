interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function PromptInput({ value, onChange, disabled }: PromptInputProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      rows={6}
      placeholder="Describe your stack and deployment needs. E.g: Node.js 20 app, PostgreSQL database, Jest tests, deploy to AWS ECS on merge to main."
      className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500 resize-y text-sm font-mono leading-relaxed disabled:opacity-50"
    />
  )
}
