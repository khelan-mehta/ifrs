import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import { FileText, Loader2 } from 'lucide-react'

const REPORT_TYPES = [
  { value: 'governance_disclosure', label: 'Governance Disclosure' },
  { value: 'climate_strategy', label: 'Climate Strategy' },
  { value: 'risk_management', label: 'Risk Management' },
  { value: 'board_summary', label: 'Board Summary' },
  { value: 'integrated_sustainability', label: 'Integrated Sustainability Note' },
]

export default function Reports() {
  const { documentId } = useParams()
  const [reports, setReports] = useState([])
  const [selectedType, setSelectedType] = useState('board_summary')
  const [generating, setGenerating] = useState(false)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get(`/reports/${documentId}`).then((res) => setReports(res.data)).catch(() => {})
  }, [documentId])

  const generate = async () => {
    setGenerating(true)
    try {
      const res = await api.post('/reports/generate', { document_id: documentId, report_type: selectedType })
      setReports((prev) => [res.data, ...prev])
      setExpanded(res.data.id)
    } catch (err) {
      alert(err.response?.data?.detail || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">AI Report Drafting</h1>

      {/* Generator */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-medium text-gray-900 mb-4">Generate New Report</h3>
        <div className="flex gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            {REPORT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <button
            onClick={generate}
            disabled={generating}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {generating && <Loader2 size={16} className="animate-spin" />}
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Report list */}
      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border">
            <button
              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-primary-500" size={18} />
                <div>
                  <p className="font-medium text-gray-900 capitalize">{r.report_type.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</p>
                </div>
              </div>
              <span className="text-gray-400">{expanded === r.id ? '▲' : '▼'}</span>
            </button>
            {expanded === r.id && (
              <div className="px-4 pb-4 border-t">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap mt-4 leading-relaxed">{r.generated_text}</pre>
              </div>
            )}
          </div>
        ))}
        {reports.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No reports generated yet.</p>}
      </div>
    </div>
  )
}
