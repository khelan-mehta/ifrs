import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import {
  Upload as UploadIcon,
  FileText,
  Trash2,
  BarChart3,
  Thermometer,
  FileEdit,
  CheckCircle2,
  Clock,
  XCircle,
  Zap,
} from 'lucide-react'

const statusConfig = {
  completed: { badge: 'badge-success', icon: CheckCircle2, label: 'Ready' },
  processing: { badge: 'badge-warning', icon: Clock, label: 'Processing' },
  failed: { badge: 'badge-danger', icon: XCircle, label: 'Failed' },
}

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

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  const handleUpload = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      return alert('Only PDF files are supported')
    }
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      fetchDocs()
    } catch (err) {
      alert(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return
    try {
      await api.delete(`/documents/${id}`)
      fetchDocs()
    } catch {
      alert('Failed to delete document')
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-header">Document Management</h1>
        <p className="text-sm text-surface-500 mt-1">
          Upload sustainability reports for AI-powered analysis
        </p>
      </div>

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          dragOver
            ? 'border-primary-400 bg-primary-50/50 shadow-glow'
            : 'border-surface-200 hover:border-surface-300 bg-white'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleUpload(e.dataTransfer.files[0])
        }}
      >
        <div className="flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              dragOver ? 'bg-primary-100 text-primary-600' : 'bg-surface-100 text-surface-400'
            }`}
          >
            <UploadIcon size={28} />
          </div>
          <p className="text-surface-700 font-medium mb-1">
            {dragOver ? 'Drop your file here' : 'Drag & drop a PDF report'}
          </p>
          <p className="text-sm text-surface-400 mb-4">or click to browse files (max 50MB)</p>
          <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
            <UploadIcon size={16} />
            {uploading ? 'Uploading...' : 'Choose File'}
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files[0])}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Document list */}
      <div>
        <h2 className="section-header mb-4">
          Uploaded Documents ({documents.length})
        </h2>
        <div className="space-y-3">
          {documents.map((doc) => {
            const status = statusConfig[doc.status] || statusConfig.processing
            const StatusIcon = status.icon
            return (
              <div
                key={doc.id}
                className="card-hover p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <FileText size={18} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900 text-sm">
                      {doc.file_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-surface-400">
                        {new Date(doc.upload_date).toLocaleDateString()}
                      </span>
                      <span className={status.badge}>
                        <StatusIcon size={12} className="mr-1" />
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {doc.status === 'completed' && (
                    <>
                      <button
                        onClick={() => navigate(`/analysis/${doc.id}`)}
                        className="btn-ghost flex items-center gap-1.5 text-indigo-600"
                        title="Full Document Analysis"
                      >
                        <Zap size={16} />
                        <span className="hidden sm:inline text-xs">Analyze</span>
                      </button>
                      <button
                        onClick={() => navigate(`/compliance/${doc.id}`)}
                        className="btn-ghost flex items-center gap-1.5 text-primary-600"
                        title="Compliance Analysis"
                      >
                        <BarChart3 size={16} />
                        <span className="hidden sm:inline text-xs">Compliance</span>
                      </button>
                      <button
                        onClick={() => navigate(`/climate/${doc.id}`)}
                        className="btn-ghost flex items-center gap-1.5 text-amber-600"
                        title="Climate Risk"
                      >
                        <Thermometer size={16} />
                        <span className="hidden sm:inline text-xs">Climate</span>
                      </button>
                      <button
                        onClick={() => navigate(`/reports/${doc.id}`)}
                        className="btn-ghost flex items-center gap-1.5 text-violet-600"
                        title="Generate Reports"
                      >
                        <FileEdit size={16} />
                        <span className="hidden sm:inline text-xs">Reports</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="btn-danger p-2"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
          {documents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center mb-3">
                <FileText size={22} className="text-surface-400" />
              </div>
              <p className="text-sm text-surface-500">No documents uploaded yet.</p>
              <p className="text-xs text-surface-400 mt-0.5">
                Upload a PDF to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
