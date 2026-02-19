import { useState, useEffect } from 'react'
import api from '../api/client'
import {
  Trash2,
  Users,
  Building2,
  Plus,
  Shield,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [region, setRegion] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/users').then((res) => setUsers(res.data)).catch(console.error)
  }, [])

  const deleteUser = async (id) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch {
      setError('Failed to delete user')
    }
  }

  const createCompany = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await api.post('/admin/companies', { name: companyName, industry, region })
      setCompanyName('')
      setIndustry('')
      setRegion('')
      setSuccess(`Company "${res.data.name}" created successfully (ID: ${res.data.id})`)
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create company')
    }
  }

  const roleConfig = {
    admin: 'badge-danger',
    analyst: 'badge-info',
    viewer: 'badge-neutral',
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-header">Admin Panel</h1>
        <p className="text-sm text-surface-500 mt-1">Manage users, companies, and system settings</p>
      </div>

      {/* Status messages */}
      {success && (
        <div className="flex items-start gap-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl p-4 ring-1 ring-emerald-100 animate-slide-up">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 text-red-700 text-sm rounded-xl p-4 ring-1 ring-red-100 animate-slide-up">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Create Company */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
            <Building2 size={18} className="text-primary-500" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 text-sm">Create Company</h3>
            <p className="text-xs text-surface-400">Add a new organization to the platform</p>
          </div>
        </div>
        <form onSubmit={createCompany} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company name"
            className="input-field"
            required
          />
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Industry"
            className="input-field"
            required
          />
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Region"
            className="input-field"
            required
          />
          <button type="submit" className="btn-primary flex items-center justify-center gap-2">
            <Plus size={16} />
            Create
          </button>
        </form>
      </div>

      {/* User Management */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
            <Users size={18} className="text-primary-500" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 text-sm">User Management</h3>
            <p className="text-xs text-surface-400">{users.length} registered users</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-surface-50 hover:bg-surface-50/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                        <Shield size={14} className="text-primary-500" />
                      </div>
                      <span className="font-medium text-surface-800">{u.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={roleConfig[u.role] || 'badge-neutral'}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-surface-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="btn-danger p-2"
                      title="Delete user"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-surface-400">No users found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
