import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { Upload as UploadIcon, FileText, Trash2, BarChart3, Thermometer } from 'lucide-react'

export default function Upload() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const fetchDocs = useCallback(() => {
    if (user?.company_id) {
      api.get(`/documents/company/${user.company_id}`).then((res) => setDocuments(res.data))
    }
  }, [user])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const handleUpload = async (file) => {
    if (!file || !file.name.endsWith('.pdf')) return alert('Only PDF files are supported')
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      fetchDocs()
    } catch (err) {
      alert(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return
    await api.delete(`/documents/${id}`)
    fetchDocs()
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files[0]) }}
      >
        <UploadIcon className="mx-auto mb-4 text-gray-400" size={40} />
        <p className="text-gray-600 mb-2">Drag & drop a PDF report here</p>
        <label className="inline-block cursor-pointer bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
          {uploading ? 'Uploading...' : 'Browse files'}
          <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleUpload(e.target.files[0])} disabled={uploading} />
        </label>
      </div>

      {/* Document list */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white rounded-xl border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-gray-400" size={20} />
              <div>
                <p className="font-medium text-gray-900">{doc.file_name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(doc.upload_date).toLocaleDateString()} · {doc.status}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {doc.status === 'completed' && (
                <>
                  <button onClick={() => navigate(`/compliance/${doc.id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Compliance">
                    <BarChart3 size={18} />
                  </button>
                  <button onClick={() => navigate(`/climate/${doc.id}`)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="Climate Risk">
                    <Thermometer size={18} />
                  </button>
                </>
              )}
              <button onClick={() => handleDelete(doc.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {documents.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No documents uploaded yet.</p>}
      </div>
    </div>
  )
}
