import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import ScanRepository from './pages/ScanRepository'

function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/"     element={<Dashboard />} />
          <Route path="/scan" element={<ScanRepository />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}