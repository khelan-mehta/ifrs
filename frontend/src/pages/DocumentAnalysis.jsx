import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import ScoreDonut from '../components/ScoreDonut'
import {
  ArrowLeft,
  Play,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Shield,
  Target,
  AlertCircle,
  BarChart3,
  Zap,
  Globe,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Info,
  FileText,
  Building2,
  Award,
} from 'lucide-react'

/* ---------- helpers ---------- */

function ratingColor(rating) {
  if (!rating) return 'text-surface-500'
  const r = rating.toLowerCase()
  if (r.includes('excellent') || r.includes('leading')) return 'text-emerald-600'
  if (r.includes('good') || r.includes('managed')) return 'text-green-600'
  if (r.includes('fair') || r.includes('defined')) return 'text-amber-600'
  if (r.includes('developing')) return 'text-orange-600'
  return 'text-red-600'
}

function ratingBg(rating) {
  if (!rating) return 'bg-surface-100'
  const r = rating.toLowerCase()
  if (r.includes('excellent') || r.includes('leading')) return 'bg-emerald-50'
  if (r.includes('good') || r.includes('managed')) return 'bg-green-50'
  if (r.includes('fair') || r.includes('defined')) return 'bg-amber-50'
  if (r.includes('developing')) return 'bg-orange-50'
  return 'bg-red-50'
}

function scoreColor(score) {
  if (score >= 70) return 'text-emerald-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-600'
}

function scoreBadge(score) {
  if (score >= 70) return { bg: 'bg-emerald-50 text-emerald-700', label: 'Good' }
  if (score >= 40) return { bg: 'bg-amber-50 text-amber-700', label: 'Fair' }
  return { bg: 'bg-red-50 text-red-700', label: 'Needs Work' }
}

function formatValue(val, suffix = '') {
  if (val === null || val === undefined) return 'Not disclosed'
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (typeof val === 'number') return val.toLocaleString() + suffix
  return String(val)
}

/* ---------- Sub-components ---------- */

function CollapsibleSection({ title, icon: Icon, score, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const badge = score !== undefined && score !== null ? scoreBadge(score) : null

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface-50/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-7 h-7 bg-surface-100 rounded-md flex items-center justify-center shrink-0">
              <Icon size={14} className="text-surface-500" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-surface-900">{title}</h3>
            {badge && (
              <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-md text-[11px] font-medium ${badge.bg}`}>
                {score}/100 &middot; {badge.label}
              </span>
            )}
          </div>
        </div>
        {open ? (
          <ChevronDown size={16} className="text-surface-400" />
        ) : (
          <ChevronRight size={16} className="text-surface-400" />
        )}
      </button>
      {open && <div className="border-t border-surface-100 px-5 py-4 space-y-4">{children}</div>}
    </div>
  )
}

function SubSection({ title, score, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-md border border-surface-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-50/30 transition-colors text-left"
      >
        <span className="text-[13px] font-medium text-surface-800">{title}</span>
        <div className="flex items-center gap-2">
          {score !== undefined && score !== null && (
            <span className={`text-[13px] font-semibold tabular-nums ${scoreColor(score)}`}>{score}</span>
          )}
          {open ? <ChevronDown size={13} className="text-surface-400" /> : <ChevronRight size={13} className="text-surface-400" />}
        </div>
      </button>
      {open && <div className="border-t border-surface-50 px-4 py-2.5 space-y-2 bg-surface-50/30">{children}</div>}
    </div>
  )
}

function MetricRow({ label, value, suffix = '' }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs text-surface-500">{label}</span>
      <span className="text-xs font-medium text-surface-800">{formatValue(value, suffix)}</span>
    </div>
  )
}

function FindingsList({ findings }) {
  if (!findings?.length) return null
  return (
    <div className="space-y-1 mt-2">
      <p className="text-[10px] font-medium text-surface-500 uppercase tracking-wider">Findings</p>
      {findings.map((f, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <CheckCircle2 size={11} className="text-primary-400 mt-0.5 shrink-0" />
          <span className="text-xs text-surface-600 leading-relaxed">{f}</span>
        </div>
      ))}
    </div>
  )
}

function GapsList({ gaps, title = 'Compliance Gaps' }) {
  if (!gaps?.length) return null
  return (
    <div className="mt-3">
      <p className="text-[10px] font-medium text-red-500 uppercase tracking-wider mb-1">{title}</p>
      {gaps.map((g, i) => (
        <div key={i} className="flex items-start gap-1.5 mb-0.5">
          <XCircle size={11} className="text-red-400 mt-0.5 shrink-0" />
          <span className="text-xs text-surface-600 leading-relaxed">{g}</span>
        </div>
      ))}
    </div>
  )
}

function RecommendationsList({ recommendations }) {
  if (!recommendations?.length) return null
  return (
    <div className="mt-3">
      <p className="text-[10px] font-medium text-primary-500 uppercase tracking-wider mb-1">Recommendations</p>
      {recommendations.map((r, i) => (
        <div key={i} className="flex items-start gap-1.5 mb-0.5">
          <TrendingUp size={11} className="text-primary-400 mt-0.5 shrink-0" />
          <span className="text-xs text-surface-600 leading-relaxed">{r}</span>
        </div>
      ))}
    </div>
  )
}

function AIAnalysisBox({ text, title = 'AI Analysis' }) {
  if (!text) return null
  return (
    <div className="mt-3 bg-surface-50 rounded-md p-3 border border-surface-100">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Zap size={11} className="text-primary-500" />
        <p className="text-[10px] font-medium text-primary-600 uppercase tracking-wider">{title}</p>
      </div>
      <p className="text-xs text-surface-700 leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  )
}

function StringList({ items, icon: Icon = Info, color = 'text-surface-400' }) {
  if (!items?.length) return <span className="text-xs text-surface-400">None identified</span>
  return (
    <div className="space-y-0.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <Icon size={11} className={`${color} mt-0.5 shrink-0`} />
          <span className="text-xs text-surface-600">{item}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------- Section Renderers ---------- */

function OverviewSection({ data }) {
  if (!data || data.error) return null
  return (
    <CollapsibleSection title="Document Overview" icon={FileText} score={data.document_completeness_score} defaultOpen={true}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-surface-50 rounded-md p-2.5">
          <p className="text-[10px] text-surface-400 mb-0.5">Document Type</p>
          <p className="text-xs font-medium text-surface-800">{data.document_type || 'N/A'}</p>
        </div>
        <div className="bg-surface-50 rounded-md p-2.5">
          <p className="text-[10px] text-surface-400 mb-0.5">Reporting Period</p>
          <p className="text-xs font-medium text-surface-800">{data.reporting_period || 'N/A'}</p>
        </div>
        <div className="bg-surface-50 rounded-md p-2.5">
          <p className="text-[10px] text-surface-400 mb-0.5">Company</p>
          <p className="text-xs font-medium text-surface-800">{data.company_name || 'N/A'}</p>
        </div>
        <div className="bg-surface-50 rounded-md p-2.5">
          <p className="text-[10px] text-surface-400 mb-0.5">Industry</p>
          <p className="text-xs font-medium text-surface-800">{data.industry_sector || 'N/A'}</p>
        </div>
      </div>

      {data.reporting_frameworks?.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-surface-400 mb-1.5">Reporting Frameworks</p>
          <div className="flex flex-wrap gap-1">
            {data.reporting_frameworks.map((fw, i) => (
              <span key={i} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-md text-[10px] font-medium">
                {fw}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.document_summary && (
        <div className="mb-3">
          <p className="text-[10px] font-medium text-surface-500 uppercase tracking-wider mb-1">Executive Summary</p>
          <p className="text-xs text-surface-700 leading-relaxed">{data.document_summary}</p>
        </div>
      )}

      {data.key_highlights?.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-medium text-surface-500 uppercase tracking-wider mb-1.5">Key Highlights</p>
          <StringList items={data.key_highlights} icon={CheckCircle2} color="text-emerald-400" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-surface-50 rounded-md p-3 text-center">
          <p className="text-[10px] text-surface-400 mb-0.5">Document Completeness</p>
          <p className={`text-xl font-semibold tabular-nums ${scoreColor(data.document_completeness_score || 0)}`}>
            {data.document_completeness_score || 0}
          </p>
          <p className="text-[10px] text-surface-400">/ 100</p>
        </div>
        <div className="bg-surface-50 rounded-md p-3 text-center">
          <p className="text-[10px] text-surface-400 mb-0.5">IFRS Readiness</p>
          <p className={`text-xl font-semibold tabular-nums ${scoreColor(data.ifrs_readiness_score || 0)}`}>
            {data.ifrs_readiness_score || 0}
          </p>
          <p className="text-[10px] text-surface-400">/ 100</p>
        </div>
      </div>

      <AIAnalysisBox text={data.ai_assessment} title="AI Document Assessment" />
    </CollapsibleSection>
  )
}

function GovernanceSection({ data }) {
  if (!data || data.error) return null
  return (
    <CollapsibleSection title="Governance (IFRS S1)" icon={Shield} score={data.governance_score}>
      <div className="space-y-2">
        <SubSection title="Board Oversight" score={data.board_oversight?.score}>
          <MetricRow label="Climate oversight" value={data.board_oversight?.has_climate_oversight} />
          {data.board_oversight?.oversight_description && (
            <p className="text-xs text-surface-600 mt-1">{data.board_oversight.oversight_description}</p>
          )}
          <FindingsList findings={data.board_oversight?.findings} />
        </SubSection>

        <SubSection title="Review Frequency" score={data.review_frequency?.score}>
          <MetricRow label="Frequency" value={data.review_frequency?.frequency} />
          <MetricRow label="Meetings per year" value={data.review_frequency?.meetings_per_year} />
          <FindingsList findings={data.review_frequency?.findings} />
        </SubSection>

        <SubSection title="ESG Expertise" score={data.expertise?.score}>
          <MetricRow label="ESG expertise %" value={data.expertise?.esg_expertise_percent} suffix="%" />
          <MetricRow label="Dedicated committee" value={data.expertise?.has_dedicated_committee} />
          <MetricRow label="Committee name" value={data.expertise?.committee_name} />
          <FindingsList findings={data.expertise?.findings} />
        </SubSection>

        <SubSection title="Compensation Linkage" score={data.compensation_linkage?.score}>
          <MetricRow label="Exec comp linked %" value={data.compensation_linkage?.exec_comp_linked_percent} suffix="%" />
          {data.compensation_linkage?.linkage_description && (
            <p className="text-xs text-surface-600 mt-1">{data.compensation_linkage.linkage_description}</p>
          )}
          <FindingsList findings={data.compensation_linkage?.findings} />
        </SubSection>

        <SubSection title="Reporting Structure" score={data.reporting_structure?.score}>
          <MetricRow label="Reporting level" value={data.reporting_structure?.reporting_level} />
          {data.reporting_structure?.description && (
            <p className="text-xs text-surface-600 mt-1">{data.reporting_structure.description}</p>
          )}
          <FindingsList findings={data.reporting_structure?.findings} />
        </SubSection>
      </div>

      <GapsList gaps={data.gaps} />
      <RecommendationsList recommendations={data.recommendations} />
      <AIAnalysisBox text={data.ai_analysis} title="Governance AI Analysis" />
    </CollapsibleSection>
  )
}

function StrategySection({ data }) {
  if (!data || data.error) return null
  return (
    <CollapsibleSection title="Strategy (IFRS S1)" icon={Target} score={data.strategy_score}>
      <div className="space-y-2">
        <SubSection title="Financial Materiality" score={data.financial_materiality?.score}>
          <MetricRow label="Revenue at risk %" value={data.financial_materiality?.revenue_at_risk_percent} suffix="%" />
          <MetricRow label="CapEx sustainability %" value={data.financial_materiality?.capex_sustainability_percent} suffix="%" />
          <MetricRow label="OpEx climate programs" value={data.financial_materiality?.opex_climate_programs} />
          <MetricRow label="Sustainable revenue %" value={data.financial_materiality?.sustainable_revenue_percent} suffix="%" />
          <FindingsList findings={data.financial_materiality?.findings} />
          <AIAnalysisBox text={data.financial_materiality?.ai_analysis} title="Financial Materiality Analysis" />
        </SubSection>

        <SubSection title="Climate Scenario Analysis" score={data.climate_scenario_analysis?.score}>
          <MetricRow label="Conducted" value={data.climate_scenario_analysis?.conducted} />
          <MetricRow label="Temperature alignment" value={data.climate_scenario_analysis?.temperature_alignment} />
          <MetricRow label="Projected revenue impact" value={data.climate_scenario_analysis?.projected_revenue_impact} />
          <MetricRow label="Projected asset impact" value={data.climate_scenario_analysis?.projected_asset_impact} />
          {data.climate_scenario_analysis?.scenarios_tested?.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-surface-400 mb-1">Scenarios Tested</p>
              <div className="flex flex-wrap gap-1">
                {data.climate_scenario_analysis.scenarios_tested.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[10px] font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}
          {data.climate_scenario_analysis?.models_used?.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-surface-400 mb-1">Models Used</p>
              <div className="flex flex-wrap gap-1">
                {data.climate_scenario_analysis.models_used.map((m, i) => (
                  <span key={i} className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-md text-[10px] font-medium">{m}</span>
                ))}
              </div>
            </div>
          )}
          <FindingsList findings={data.climate_scenario_analysis?.findings} />
          <AIAnalysisBox text={data.climate_scenario_analysis?.ai_analysis} title="Scenario Analysis Quality" />
        </SubSection>

        <SubSection title="Business Model Resilience" score={data.business_model_resilience?.score}>
          <MetricRow label="Transition plan exists" value={data.business_model_resilience?.transition_plan_exists} />
          {data.business_model_resilience?.adaptation_measures?.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-surface-400 mb-1">Adaptation Measures</p>
              <StringList items={data.business_model_resilience.adaptation_measures} icon={Shield} color="text-green-400" />
            </div>
          )}
          <FindingsList findings={data.business_model_resilience?.findings} />
        </SubSection>

        <SubSection title="Climate Opportunities" score={null}>
          <MetricRow label="Quantified" value={data.opportunities?.quantified} />
          {data.opportunities?.identified_opportunities?.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-surface-400 mb-1">Identified Opportunities</p>
              <StringList items={data.opportunities.identified_opportunities} icon={TrendingUp} color="text-emerald-400" />
            </div>
          )}
          <FindingsList findings={data.opportunities?.findings} />
        </SubSection>
      </div>

      <GapsList gaps={data.gaps} />
      <RecommendationsList recommendations={data.recommendations} />
      <AIAnalysisBox text={data.ai_analysis} title="Strategy AI Analysis" />
    </CollapsibleSection>
  )
}

function RiskManagementSection({ data }) {
  if (!data || data.error) return null
  return (
    <CollapsibleSection title="Risk Management (IFRS S1)" icon={AlertCircle} score={data.risk_management_score}>
      <div className="space-y-2">
        <SubSection title="Risk Identification" score={data.risk_identification?.score}>
          <MetricRow label="Risks identified" value={data.risk_identification?.climate_risks_identified} />
          {data.risk_identification?.process_description && (
            <p className="text-xs text-surface-600 mt-1">{data.risk_identification.process_description}</p>
          )}
          {data.risk_identification?.risk_categories?.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-surface-400 mb-1">Risk Categories</p>
              <div className="flex flex-wrap gap-1">
                {data.risk_identification.risk_categories.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 rounded-md text-[10px] font-medium">{c}</span>
                ))}
              </div>
            </div>
          )}
          <FindingsList findings={data.risk_identification?.findings} />
        </SubSection>

        <SubSection title="Risk Assessment" score={data.risk_assessment?.score}>
          <MetricRow label="Assessment frequency" value={data.risk_assessment?.assessment_frequency} />
          <MetricRow label="Prioritization method" value={data.risk_assessment?.prioritization_method} />
          <MetricRow label="Financial impact quantified" value={data.risk_assessment?.financial_impact_quantified} />
          <MetricRow label="Top risk financial impact" value={data.risk_assessment?.top_risk_financial_impact} />
          <FindingsList findings={data.risk_assessment?.findings} />
        </SubSection>

        <SubSection title="ERM Integration" score={data.erm_integration?.score}>
          <MetricRow label="Integrated into ERM" value={data.erm_integration?.integrated_into_erm} />
          {data.erm_integration?.integration_description && (
            <p className="text-xs text-surface-600 mt-1">{data.erm_integration.integration_description}</p>
          )}
          <FindingsList findings={data.erm_integration?.findings} />
        </SubSection>

        <SubSection title="Risk Mitigation" score={data.risk_mitigation?.score}>
          {data.risk_mitigation?.monitoring_process && (
            <p className="text-xs text-surface-600">{data.risk_mitigation.monitoring_process}</p>
          )}
          {data.risk_mitigation?.mitigation_strategies?.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-surface-400 mb-1">Mitigation Strategies</p>
              <StringList items={data.risk_mitigation.mitigation_strategies} icon={Shield} color="text-blue-400" />
            </div>
          )}
          <FindingsList findings={data.risk_mitigation?.findings} />
        </SubSection>

        <SubSection title="Physical Risk Detail" score={null}>
          <MetricRow label="Flood exposure" value={data.physical_risk_detail?.flood_exposure} />
          <MetricRow label="Drought exposure" value={data.physical_risk_detail?.drought_exposure} />
          <MetricRow label="Wildfire exposure" value={data.physical_risk_detail?.wildfire_exposure} />
          <MetricRow label="Heat stress exposure" value={data.physical_risk_detail?.heat_stress_exposure} />
          <MetricRow label="Sea level exposure" value={data.physical_risk_detail?.sea_level_exposure} />
          <MetricRow label="Estimated physical risk loss" value={data.physical_risk_detail?.estimated_physical_risk_loss} />
          <MetricRow label="Insurance impact" value={data.physical_risk_detail?.insurance_impact} />
          <FindingsList findings={data.physical_risk_detail?.findings} />
        </SubSection>

        <SubSection title="Transition Risk Detail" score={null}>
          <MetricRow label="Regulatory exposure" value={data.transition_risk_detail?.regulatory_exposure} />
          <MetricRow label="Carbon pricing exposure" value={data.transition_risk_detail?.carbon_pricing_exposure} />
          <MetricRow label="Technology risk" value={data.transition_risk_detail?.technology_risk} />
          <MetricRow label="Market risk" value={data.transition_risk_detail?.market_risk} />
          <MetricRow label="Reputation risk" value={data.transition_risk_detail?.reputation_risk} />
          <MetricRow label="Stranded asset value" value={data.transition_risk_detail?.stranded_asset_value} />
          <MetricRow label="Revenue at risk %" value={data.transition_risk_detail?.revenue_at_risk_percent} suffix="%" />
          <FindingsList findings={data.transition_risk_detail?.findings} />
        </SubSection>
      </div>

      <GapsList gaps={data.gaps} />
      <RecommendationsList recommendations={data.recommendations} />
      <AIAnalysisBox text={data.ai_analysis} title="Risk Management AI Analysis" />
    </CollapsibleSection>
  )
}

function MetricsTargetsSection({ data }) {
  if (!data || data.error) return null
  return (
    <CollapsibleSection title="Metrics & Targets (IFRS S1/S2)" icon={BarChart3} score={data.metrics_targets_score}>
      <div className="space-y-2">
        <SubSection title="GHG Emissions" score={data.ghg_emissions?.score}>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-surface-50 rounded-md p-2 text-center">
              <p className="text-[10px] text-surface-400">Scope 1</p>
              <p className="text-[13px] font-semibold text-primary-600 tabular-nums">{formatValue(data.ghg_emissions?.scope1, ' tCO2e')}</p>
            </div>
            <div className="bg-surface-50 rounded-md p-2 text-center">
              <p className="text-[10px] text-surface-400">Scope 2</p>
              <p className="text-[13px] font-semibold text-violet-600 tabular-nums">{formatValue(data.ghg_emissions?.scope2, ' tCO2e')}</p>
            </div>
            <div className="bg-surface-50 rounded-md p-2 text-center">
              <p className="text-[10px] text-surface-400">Scope 3</p>
              <p className="text-[13px] font-semibold text-purple-600 tabular-nums">{formatValue(data.ghg_emissions?.scope3, ' tCO2e')}</p>
            </div>
            <div className="bg-surface-50 rounded-md p-2 text-center">
              <p className="text-[10px] text-surface-400">Total</p>
              <p className="text-[13px] font-semibold text-surface-800 tabular-nums">{formatValue(data.ghg_emissions?.total_emissions, ' tCO2e')}</p>
            </div>
          </div>
          <MetricRow label="Emissions intensity" value={data.ghg_emissions?.emissions_intensity} />
          <MetricRow label="Intensity metric" value={data.ghg_emissions?.intensity_metric} />
          <MetricRow label="Verification status" value={data.ghg_emissions?.verification_status} />
          <MetricRow label="Methodology" value={data.ghg_emissions?.methodology} />
          <MetricRow label="Base year" value={data.ghg_emissions?.base_year} />
          <MetricRow label="Base year emissions" value={data.ghg_emissions?.base_year_emissions} suffix=" tCO2e" />
          <MetricRow label="YoY change" value={data.ghg_emissions?.year_over_year_change_percent} suffix="%" />
          <FindingsList findings={data.ghg_emissions?.findings} />
          <AIAnalysisBox text={data.ghg_emissions?.ai_analysis} title="Emissions Reporting Analysis" />
        </SubSection>

        <SubSection title="Energy Metrics" score={data.energy?.score}>
          <MetricRow label="Total energy" value={data.energy?.total_energy_mwh} suffix=" MWh" />
          <MetricRow label="Renewable energy" value={data.energy?.renewable_energy_mwh} suffix=" MWh" />
          <MetricRow label="Renewable %" value={data.energy?.renewable_energy_percent} suffix="%" />
          <MetricRow label="Energy intensity" value={data.energy?.energy_intensity} />
          <MetricRow label="Fuel consumption" value={data.energy?.fuel_consumption} />
          <FindingsList findings={data.energy?.findings} />
        </SubSection>

        <SubSection title="Climate Targets" score={data.targets?.score}>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-emerald-50 rounded-md p-2 text-center">
              <p className="text-[10px] text-emerald-600">Net Zero Target</p>
              <p className="text-base font-semibold text-emerald-700">{data.targets?.net_zero_target_year || 'N/A'}</p>
            </div>
            <div className="bg-amber-50 rounded-md p-2 text-center">
              <p className="text-[10px] text-amber-600">Interim Target</p>
              <p className="text-base font-semibold text-amber-700">{data.targets?.interim_target_year || 'N/A'}</p>
            </div>
          </div>
          <MetricRow label="Reduction target %" value={data.targets?.reduction_target_percent} suffix="%" />
          <MetricRow label="Reduction achieved %" value={data.targets?.reduction_achieved_percent} suffix="%" />
          <MetricRow label="Scope coverage" value={data.targets?.scope_coverage} />
          <MetricRow label="SBTi validated" value={data.targets?.sbti_validated} />
          <MetricRow label="SBTi status" value={data.targets?.sbti_status} />
          <MetricRow label="Offsets disclosed" value={data.targets?.offset_usage_disclosed} />
          <MetricRow label="Internal carbon price" value={data.targets?.internal_carbon_price} />
          <FindingsList findings={data.targets?.findings} />
          <AIAnalysisBox text={data.targets?.ai_analysis} title="Targets Ambition & Progress" />
        </SubSection>

        <SubSection title="Water Metrics" score={null}>
          <MetricRow label="Disclosed" value={data.water_metrics?.disclosed} />
          <MetricRow label="Total withdrawal" value={data.water_metrics?.total_withdrawal} />
          <MetricRow label="Water intensity" value={data.water_metrics?.water_intensity} />
          <FindingsList findings={data.water_metrics?.findings} />
        </SubSection>

        <SubSection title="Waste Metrics" score={null}>
          <MetricRow label="Disclosed" value={data.waste_metrics?.disclosed} />
          <MetricRow label="Total waste" value={data.waste_metrics?.total_waste} />
          <MetricRow label="Recycling rate" value={data.waste_metrics?.recycling_rate} suffix="%" />
          <FindingsList findings={data.waste_metrics?.findings} />
        </SubSection>
      </div>

      <GapsList gaps={data.gaps} />
      <RecommendationsList recommendations={data.recommendations} />
      <AIAnalysisBox text={data.ai_analysis} title="Metrics & Targets AI Analysis" />
    </CollapsibleSection>
  )
}

function OverallAssessmentSection({ data, scores }) {
  if (!data) return null
  return (
    <CollapsibleSection title="Overall AI Assessment" icon={Award} score={null} defaultOpen={true}>
      {data.overall_compliance_rating && (
        <div className={`inline-flex items-center px-3 py-1.5 rounded-md ${ratingBg(data.overall_compliance_rating)} mb-3`}>
          <Award size={14} className={`${ratingColor(data.overall_compliance_rating)} mr-1.5`} />
          <span className={`text-[13px] font-semibold ${ratingColor(data.overall_compliance_rating)}`}>
            {data.overall_compliance_rating}
          </span>
        </div>
      )}

      {data.maturity_level && (
        <div className="mb-3">
          <span className="px-2.5 py-1 bg-violet-50 text-violet-700 rounded-md text-xs font-medium">
            Maturity: {data.maturity_level}
          </span>
        </div>
      )}

      {data.executive_summary && (
        <div className="bg-surface-50 rounded-md p-3 mb-3">
          <p className="text-[10px] font-medium text-surface-500 uppercase tracking-wider mb-1.5">Executive Summary</p>
          <p className="text-[13px] text-surface-700 leading-relaxed">{data.executive_summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {data.s1_compliance_status && (
          <div className="rounded-md border border-surface-100 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Shield size={13} className="text-primary-500" />
              <h4 className="text-[13px] font-semibold text-surface-800">IFRS S1 Status</h4>
              <span className={`ml-auto text-xs font-semibold ${ratingColor(data.s1_compliance_status.rating)}`}>
                {data.s1_compliance_status.rating}
              </span>
            </div>
            {data.s1_compliance_status.key_strengths?.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-medium text-emerald-500 uppercase mb-0.5">Strengths</p>
                <StringList items={data.s1_compliance_status.key_strengths} icon={CheckCircle2} color="text-emerald-400" />
              </div>
            )}
            {data.s1_compliance_status.critical_gaps?.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-medium text-red-500 uppercase mb-0.5">Critical Gaps</p>
                <StringList items={data.s1_compliance_status.critical_gaps} icon={XCircle} color="text-red-400" />
              </div>
            )}
            {data.s1_compliance_status.priority_actions?.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-primary-500 uppercase mb-0.5">Priority Actions</p>
                <StringList items={data.s1_compliance_status.priority_actions} icon={TrendingUp} color="text-primary-400" />
              </div>
            )}
          </div>
        )}

        {data.s2_compliance_status && (
          <div className="rounded-md border border-surface-100 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Globe size={13} className="text-amber-500" />
              <h4 className="text-[13px] font-semibold text-surface-800">IFRS S2 Status</h4>
              <span className={`ml-auto text-xs font-semibold ${ratingColor(data.s2_compliance_status.rating)}`}>
                {data.s2_compliance_status.rating}
              </span>
            </div>
            {data.s2_compliance_status.key_strengths?.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-medium text-emerald-500 uppercase mb-0.5">Strengths</p>
                <StringList items={data.s2_compliance_status.key_strengths} icon={CheckCircle2} color="text-emerald-400" />
              </div>
            )}
            {data.s2_compliance_status.critical_gaps?.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-medium text-red-500 uppercase mb-0.5">Critical Gaps</p>
                <StringList items={data.s2_compliance_status.critical_gaps} icon={XCircle} color="text-red-400" />
              </div>
            )}
            {data.s2_compliance_status.priority_actions?.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-primary-500 uppercase mb-0.5">Priority Actions</p>
                <StringList items={data.s2_compliance_status.priority_actions} icon={TrendingUp} color="text-primary-400" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {data.investor_readiness && (
          <div className="bg-surface-50 rounded-md p-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-medium text-surface-500 uppercase">Investor Readiness</p>
              <span className={`text-base font-semibold tabular-nums ${scoreColor(data.investor_readiness.score || 0)}`}>
                {data.investor_readiness.score || 0}
              </span>
            </div>
            <p className="text-xs text-surface-600 leading-relaxed">{data.investor_readiness.assessment}</p>
          </div>
        )}
        {data.regulatory_readiness && (
          <div className="bg-surface-50 rounded-md p-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-medium text-surface-500 uppercase">Regulatory Readiness</p>
              <span className={`text-base font-semibold tabular-nums ${scoreColor(data.regulatory_readiness.score || 0)}`}>
                {data.regulatory_readiness.score || 0}
              </span>
            </div>
            <p className="text-xs text-surface-600 leading-relaxed">{data.regulatory_readiness.assessment}</p>
          </div>
        )}
      </div>

      {data.detailed_narrative && (
        <AIAnalysisBox text={data.detailed_narrative} title="Comprehensive AI Narrative" />
      )}

      {data.benchmarking_notes && (
        <div className="mt-3 bg-blue-50 rounded-md p-3 border border-blue-100">
          <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wider mb-1">Industry Benchmarking</p>
          <p className="text-xs text-surface-700 leading-relaxed">{data.benchmarking_notes}</p>
        </div>
      )}

      {data.year_over_year_potential && (
        <div className="mt-2 bg-emerald-50 rounded-md p-3 border border-emerald-100">
          <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider mb-1">Improvement Potential</p>
          <p className="text-xs text-surface-700 leading-relaxed">{data.year_over_year_potential}</p>
        </div>
      )}
    </CollapsibleSection>
  )
}

/* ---------- Main Page ---------- */

export default function DocumentAnalysis() {
  const { documentId } = useParams()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .get(`/document-analysis/${documentId}`)
      .then((res) => setAnalysis(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [documentId])

  const runAnalysis = async () => {
    setRunning(true)
    setError(null)
    try {
      const res = await api.post(`/document-analysis/run/${documentId}`)
      setAnalysis(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 text-[13px] text-surface-500 hover:text-surface-700 mb-2 transition-colors"
          >
            <ArrowLeft size={13} />
            Back to Documents
          </Link>
          <h1 className="page-header">Document Analysis</h1>
          <p className="text-[13px] text-surface-500 mt-0.5">
            Comprehensive multi-level AI analysis with IFRS S1/S2 metrics
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={running}
          className="btn-primary flex items-center gap-2"
        >
          {running ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              {analysis ? <RefreshCw size={15} /> : <Play size={15} />}
              {analysis ? 'Re-run Analysis' : 'Run Full Analysis'}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 text-red-700 text-[13px] rounded-lg p-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-4 w-40 mb-2" />
              <div className="skeleton h-3 w-full mb-1.5" />
              <div className="skeleton h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : analysis ? (
        <>
          {/* Score Overview Bar */}
          <div className="card">
            <div className="px-5 py-3.5 border-b border-surface-100">
              <h3 className="text-sm font-semibold text-surface-900">Score Overview</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { label: 'S1 Overall', key: 's1_overall' },
                  { label: 'S2 Overall', key: 's2_overall' },
                  { label: 'Governance', key: 'governance' },
                  { label: 'Strategy', key: 'strategy' },
                  { label: 'Risk Mgmt', key: 'risk_management' },
                  { label: 'Metrics', key: 'metrics_targets' },
                  { label: 'Completeness', key: 'document_completeness' },
                  { label: 'IFRS Ready', key: 'ifrs_readiness' },
                ].map(({ label, key }) => {
                  const val = analysis.scores?.[key] || 0
                  return (
                    <div key={key} className="text-center">
                      <ScoreDonut score={val} label={label} size={80} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Section Details */}
          <OverviewSection data={analysis.overview} />
          <GovernanceSection data={analysis.governance} />
          <StrategySection data={analysis.strategy} />
          <RiskManagementSection data={analysis.risk_management} />
          <MetricsTargetsSection data={analysis.metrics_targets} />
          <OverallAssessmentSection data={analysis.overall_assessment} scores={analysis.scores} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 bg-surface-100 rounded-lg flex items-center justify-center mb-3">
            <Zap size={22} className="text-surface-400" />
          </div>
          <h2 className="text-base font-semibold text-surface-800 mb-1">Ready for Deep Analysis</h2>
          <p className="text-[13px] text-surface-500 text-center max-w-md">
            Click "Run Full Analysis" to generate a comprehensive multi-level AI analysis
            covering all IFRS S1 and S2 metrics, sub-section breakdowns, and AI insights.
          </p>
        </div>
      )}
    </div>
  )
}
