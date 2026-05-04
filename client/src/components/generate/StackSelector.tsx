const STACK_CHIPS = [
  'Node.js', 'Python', 'Go', 'Java', 'Ruby', 'Rust',
  'Docker', 'PostgreSQL', 'MySQL', 'Redis', 'MongoDB',
  'AWS', 'GCP', 'Azure', 'Kubernetes', 'Terraform',
]

interface StackSelectorProps {
  onAdd: (text: string) => void
}

export function StackSelector({ onAdd }: StackSelectorProps) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">Quick add to prompt:</p>
      <div className="flex flex-wrap gap-1.5">
        {STACK_CHIPS.map(chip => (
          <button
            key={chip}
            onClick={() => onAdd(chip)}
            className="px-2 py-1 rounded text-xs font-mono bg-gray-800 text-gray-400 border border-gray-700 hover:border-brand-500 hover:text-brand-400 transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}
