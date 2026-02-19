import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import ScoreDonut from '../components/ScoreDonut'
import EmissionsChart from '../components/EmissionsChart'
import Heatmap from '../components/Heatmap'

export default function Climate() {
  const { documentId } = useParams()
  const [data, setData] = useState(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    api.get(`/climate/${documentId}`)
      .then((res) => setData(res.data))
      .catch(() => {})
  }, [documentId])

  const runAnalysis = async () => {
    setRunning(true)
    try {
      const res = await api.post(`/climate/analyze/${documentId}`)
      setData(res.data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Analysis failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Climate Risk Analysis</h1>
        <button
          onClick={runAnalysis}
          disabled={running}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {running ? 'Analyzing...' : data ? 'Re-run' : 'Run Analysis'}
        </button>
      </div>

      {data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border p-6 flex flex-col items-center">
              <ScoreDonut score={data.physical_risk_score} label="Physical Risk" />
            </div>
            <div className="bg-white rounded-xl border p-6 flex flex-col items-center">
              <ScoreDonut score={data.transition_risk_score} label="Transition Risk" />
            </div>
            <div className="bg-white rounded-xl border p-6 flex flex-col items-center">
              <ScoreDonut score={data.scenario_alignment_score} label="Scenario Alignment" />
            </div>
          </div>

          <EmissionsChart
            scope1={data.emissions_scope1 || 0}
            scope2={data.emissions_scope2 || 0}
            scope3={data.emissions_scope3 || 0}
          />

          <Heatmap data={data.risk_heatmap_data} />
        </>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p>No climate analysis available. Click "Run Analysis" to begin.</p>
        </div>
      )}
    </div>
  )
}
