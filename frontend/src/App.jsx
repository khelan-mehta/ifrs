import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Compliance from './pages/Compliance'
import Climate from './pages/Climate'
import Reports from './pages/Reports'
import Admin from './pages/Admin'
import Layout from './components/Layout'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
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
        <Route path="compliance/:documentId" element={<Compliance />} />
        <Route path="climate/:documentId" element={<Climate />} />
        <Route path="reports/:documentId" element={<Reports />} />
        <Route path="admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}
