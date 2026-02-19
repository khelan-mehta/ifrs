import { useState, useEffect } from 'react'
import api from '../api/client'
import { Trash2, Users, Building2 } from 'lucide-react'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [region, setRegion] = useState('')

  useEffect(() => {
    api.get('/admin/users').then((res) => setUsers(res.data)).catch(console.error)
  }, [])

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return
    await api.delete(`/admin/users/${id}`)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  const createCompany = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/companies', { name: companyName, industry, region })
      setCompanyName('')
      setIndustry('')
      setRegion('')
      alert('Company created')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed')
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>

      {/* Create Company */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={18} className="text-primary-600" />
          <h3 className="font-medium text-gray-900">Create Company</h3>
        </div>
        <form onSubmit={createCompany} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" className="border rounded-lg px-3 py-2 text-sm" required />
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Industry" className="border rounded-lg px-3 py-2 text-sm" required />
          <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Region" className="border rounded-lg px-3 py-2 text-sm" required />
          <button type="submit" className="bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Create</button>
        </form>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-primary-600" />
          <h3 className="font-medium text-gray-900">Users ({users.length})</h3>
        </div>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{u.email}</p>
                <p className="text-xs text-gray-500">{u.role} · {new Date(u.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => deleteUser(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
