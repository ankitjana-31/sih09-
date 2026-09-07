import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ShieldAlert, Activity } from 'lucide-react';

export default function RiskPanel({ riskData }) {
  const navigate = useNavigate();

  const {
    risk_tier = 'MEDIUM',
    risk_score_pct = 8.4,
    deficit_mt = -14250,
    narrative = 'Balaghat Sector 04 faces a probable 8.4% production shortfall over the next 30 days driven primarily by mechanical uncoupling and pit water accumulation.',
    top_factors = [],
    model_version = 'Shortfall-Net v3.1',
    data_as_of = '24 Oct, 06:00 IST'
  } = riskData || {};

  // Semantic color for risk tier
  const getTierColor = (tier) => {
    switch (tier) {
      case 'CRITICAL':
        return { bg: 'bg-[#C24E4E]/15', border: 'border-[#C24E4E]', text: 'text-[#C24E4E]', dot: 'bg-[#C24E4E]' };
      case 'HIGH':
        return { bg: 'bg-[#D97F3D]/15', border: 'border-[#D97F3D]', text: 'text-[#D97F3D]', dot: 'bg-[#D97F3D]' };
      case 'MEDIUM':
        return { bg: 'bg-[#D1A438]/15', border: 'border-[#D1A438]', text: 'text-[#D1A438]', dot: 'bg-[#D1A438]' };
      default:
        return { bg: 'bg-[#4C9A6A]/15', border: 'border-[#4C9A6A]', text: 'text-[#4C9A6A]', dot: 'bg-[#4C9A6A]' };
    }
  };

  const tierStyle = getTierColor(risk_tier);

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-[#C24E4E]/20 text-[#ffb4ab] border-[#C24E4E]/40';
      case 'HIGH':
        return 'bg-[#D97F3D]/20 text-[#tertiary] border-[#D97F3D]/40';
      case 'MEDIUM':
        return 'bg-[#D1A438]/20 text-[#D1A438] border-[#D1A438]/40';
      default:
        return 'bg-[#4C9A6A]/20 text-[#4C9A6A] border-[#4C9A6A]/40';
    }
  };

  return (
    <div id="risk-panel-container" className="bg-[#191c1d] border border-[#282a2b] rounded p-4 font-mono select-none flex flex-col justify-between">
      <div>
        {/* Header with Risk Tier Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-[#282a2b]">
          <div className="text-[10px] text-[#8B939C] uppercase tracking-wider font-semibold">
            AGGREGATED THREAT INDEX
          </div>

          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold ${tierStyle.bg} ${tierStyle.border} ${tierStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${tierStyle.dot} animate-pulse`} />
            <span>{risk_tier} RISK TIER</span>
          </div>
        </div>

        {/* Primary Probability Readout */}
        <div className="py-3 border-b border-[#282a2b]">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#EDEFF1]">
              {risk_score_pct}%
            </span>
            <span className="text-xs text-[#8B939C]">
              Projected 30-Day Deficit Probability
            </span>
          </div>
          <p className="text-[#bfc8c9] text-xs leading-relaxed mt-2">
            {narrative}
          </p>
        </div>

        {/* Ranked Attribution Factors */}
        <div className="py-3">
          <div className="flex items-center justify-between text-[10px] text-[#8B939C] uppercase tracking-wider mb-2 font-semibold">
            <span>RANKED ATTRIBUTION CONTRIBUTORS</span>
            <span className="text-[#C24E4E]">
              {Math.abs(deficit_mt).toLocaleString()} MT NET GAP
            </span>
          </div>

          <div className="space-y-3">
            {top_factors.map((item, idx) => (
              <div key={item.id || idx} className="bg-[#111415] border border-[#282a2b] p-2.5 rounded">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#EDEFF1]">
                    #{idx + 1} {item.factor}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getSeverityBadge(item.severity)}`}>
                    {item.severity}
                  </span>
                </div>

                <div className="text-[11px] text-[#8B939C] mt-1 leading-tight">
                  {item.description}
                </div>

                {/* Progress bar and stats */}
                <div className="mt-2 space-y-1">
                  <div className="w-full h-1.5 bg-[#191c1d] rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: `${item.pct_contribution}%`,
                        backgroundColor: item.color || '#488085',
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#8B939C] pt-0.5">
                    <span>Contrib: <strong className="text-[#EDEFF1]">{item.pct_contribution}%</strong></span>
                    <span>Est. Loss: <strong className="text-[#EDEFF1]">{item.est_loss_tonnes.toLocaleString()} MT</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer & Action */}
      <div className="pt-3 mt-2 border-t border-[#282a2b] space-y-2">
        <button
          id="btn-goto-recommendations"
          onClick={() => navigate('/recommendations')}
          className="w-full bg-[#111415] hover:bg-[#488085] text-[#EDEFF1] hover:text-[#111415] border border-[#3A4048] hover:border-[#488085] py-2 px-3 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer group"
        >
          <span>Send to Recommendations Engine</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="flex justify-between text-[9px] text-[#8B939C]">
          <span>Model: {model_version}</span>
          <span>Data as of: {data_as_of}</span>
        </div>
      </div>
    </div>
  );
}
