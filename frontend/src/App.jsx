import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Compliance from './pages/Compliance'
import Climate from './pages/Climate'
import Reports from './pages/Reports'
import Admin from './pages/Admin'
import DocumentAnalysis from './pages/DocumentAnalysis'
import Layout from './components/Layout'
import { Shield } from 'lucide-react'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
          <Shield size={16} className="text-white" />
        </div>
        <span className="text-base font-semibold text-surface-900 tracking-tight">IFRS Suite</span>
      </div>
      <div className="w-6 h-6 border-2 border-surface-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="upload" element={<Upload />} />
        <Route path="analysis/:documentId" element={<DocumentAnalysis />} />
        <Route path="compliance/:documentId" element={<Compliance />} />
        <Route path="climate/:documentId" element={<Climate />} />
        <Route path="reports/:documentId" element={<Reports />} />
        <Route path="admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}
