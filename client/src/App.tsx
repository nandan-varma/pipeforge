import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import { GeneratePage } from './pages/GeneratePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/generate" replace />} />
        <Route path="/generate" element={<Shell><GeneratePage /></Shell>} />
      </Routes>
    </BrowserRouter>
  )
}
