import React, { useState, useEffect } from 'react';
import { useMine } from '../store/mineStore';
import { getProductionForecast, getRiskTier } from '../api/client';
import TrendChart from '../components/TrendChart';
import RiskPanel from '../components/RiskPanel';
import { TrendingUp, ShieldAlert, AlertTriangle, RefreshCw } from 'lucide-react';

export default function ProductionRisk() {
  const { selectedMineId, selectedMine } = useMine();
  const [forecastData, setForecastData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getProductionForecast(selectedMineId),
      getRiskTier(selectedMineId),
    ])
      .then(([forecastRes, riskRes]) => {
        setForecastData(forecastRes);
        setRiskData(riskRes);
      })
      .catch((err) => console.error('Production risk fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [selectedMineId]);

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#282a2b]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8B939C]">
            <span>MINING INTELLIGENCE</span>
            <span>/</span>
            <span className="text-[#98d0d6] font-bold">PRODUCTION & RISK ANALYSIS</span>
          </div>
          <h1 className="text-xl font-bold text-[#EDEFF1] tracking-wide mt-1">
            {selectedMine.name.toUpperCase()} // TONNAGE TRAJECTORY & THREAT MATRIX
          </h1>
          <div className="text-xs text-[#8B939C] mt-0.5">
            Audit Data: LSTM-2.8 Ensemble Model • Synchronized with Balaghat SCADA & Weighbridge Telemetry
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3 py-1.5 bg-[#191c1d] hover:bg-[#282a2b] border border-[#3A4048] rounded text-xs text-[#EDEFF1] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#488085] ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Weights</span>
          </button>
        </div>
      </div>

      {/* Main Grid: TrendChart on left/center (2 cols) and RiskPanel on right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <TrendChart forecastData={forecastData} />

          {/* Operational Context note */}
          <div className="bg-[#191c1d] border border-[#282a2b] p-3 rounded text-xs text-[#bfc8c9] leading-relaxed">
            <span className="text-[#98d0d6] font-bold mr-1">SCADA INTEGRATION NOTE:</span>
            Production variance is computed against the approved DGMS annual mine plan. Rainfall anomalies logged via automated rain gauge at Balaghat Pit 3 were incorporated into soil shear and haul road rolling resistance parameters.
          </div>
        </div>

        <div className="lg:col-span-1">
          <RiskPanel riskData={riskData} />
        </div>
      </div>
    </div>
  );
}
