import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import {
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react'

const REPORT_TYPES = [
  { value: 'governance_disclosure', label: 'Governance Disclosure', desc: 'Board-level governance section' },
  { value: 'climate_strategy', label: 'Climate Strategy', desc: 'Risks, opportunities & scenario analysis' },
  { value: 'risk_management', label: 'Risk Management', desc: 'Risk identification & assessment' },
  { value: 'board_summary', label: 'Board Summary', desc: 'Executive sustainability overview' },
  { value: 'integrated_sustainability', label: 'Integrated Note', desc: 'Full annual report section' },
]

export default function Reports() {
  const { documentId } = useParams()
  const [reports, setReports] = useState([])
  const [selectedType, setSelectedType] = useState('board_summary')
  const [generating, setGenerating] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    api.get(`/reports/${documentId}`)
      .then((res) => setReports(res.data))
      .catch(() => {})
  }, [documentId])

  const generate = async () => {
    setGenerating(true)
    try {
      const res = await api.post('/reports/generate', {
        document_id: documentId,
        report_type: selectedType,
      })
      setReports((prev) => [res.data, ...prev])
      setExpanded(res.data.id)
    } catch (err) {
      alert(err.response?.data?.detail || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = async (text, id) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <Link to="/upload" className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700 mb-3 transition-colors">
          <ArrowLeft size={14} />
          Back to Documents
        </Link>
        <h1 className="page-header">AI Report Drafting</h1>
        <p className="text-sm text-surface-500 mt-1">Generate IFRS-compliant report sections using AI</p>
      </div>

      {/* Generator */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
            <Sparkles size={16} className="text-primary-500" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 text-sm">Generate New Report</h3>
            <p className="text-xs text-surface-400">Select a report type and generate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-field"
          >
            {REPORT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} - {t.desc}
              </option>
            ))}
          </select>
          <button
            onClick={generate}
            disabled={generating}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report list */}
      <div>
        <h2 className="section-header mb-4">
          Generated Reports ({reports.length})
        </h2>
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="card overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                    <FileText size={16} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900 text-sm capitalize">
                      {r.report_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {expanded === r.id ? (
                  <ChevronUp size={18} className="text-surface-400" />
                ) : (
                  <ChevronDown size={18} className="text-surface-400" />
                )}
              </button>
              {expanded === r.id && (
                <div className="px-5 pb-5 border-t border-surface-100 animate-slide-up">
                  <div className="flex justify-end mt-3 mb-2">
                    <button
                      onClick={() => copyToClipboard(r.generated_text, r.id)}
                      className="btn-ghost flex items-center gap-1.5 text-xs"
                    >
                      {copied === r.id ? (
                        <>
                          <Check size={14} className="text-emerald-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-surface-50 rounded-xl p-5">
                    <pre className="text-sm text-surface-700 whitespace-pre-wrap leading-relaxed font-sans">
                      {r.generated_text}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
          {reports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center mb-3">
                <FileText size={22} className="text-surface-400" />
              </div>
              <p className="text-sm text-surface-500">No reports generated yet.</p>
              <p className="text-xs text-surface-400 mt-0.5">
                Select a report type above and click Generate
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
