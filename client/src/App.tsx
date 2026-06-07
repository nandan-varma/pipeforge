import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import { GeneratePage } from './pages/GeneratePage'
import { MigratePage } from './pages/MigratePage'
import { DebugPage } from './pages/DebugPage'
import { SavedPage } from './pages/SavedPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/generate" replace />} />
        <Route path="/generate" element={<Shell><GeneratePage /></Shell>} />
        <Route path="/migrate"  element={<Shell><MigratePage /></Shell>} />
        <Route path="/debug"    element={<Shell><DebugPage /></Shell>} />
        <Route path="/saved"    element={<Shell><SavedPage /></Shell>} />
      </Routes>
    </BrowserRouter>
  )
}
