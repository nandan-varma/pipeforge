import type { ReactNode } from 'react'
import { Tabs } from './Tabs'

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100">
      <Tabs />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
