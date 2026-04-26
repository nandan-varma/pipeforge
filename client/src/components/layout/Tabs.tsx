import { NavLink } from 'react-router-dom'
import { Wand2, ArrowLeftRight, Bug, Bookmark } from 'lucide-react'

const tabs = [
  { label: 'Generate', path: '/generate', icon: Wand2 },
  { label: 'Migrate',  path: '/migrate',  icon: ArrowLeftRight },
  { label: 'Debug',    path: '/debug',    icon: Bug },
  { label: 'Saved',    path: '/saved',    icon: Bookmark },
]

export function Tabs() {
  return (
    <nav className="flex items-center gap-1 px-4 py-2 border-b border-gray-800 bg-gray-950 shrink-0">
      <span className="text-brand-500 font-bold text-lg mr-6 tracking-tight">
        PipeForge
      </span>
      {tabs.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-600 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`
          }
        >
          <Icon size={15} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
