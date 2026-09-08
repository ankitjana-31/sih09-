import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMine } from '../store/mineStore';
import { getReserveMap, getProductionForecast, getRiskTier, getRecommendations } from '../api/client';
import { Compass, TrendingUp, AlertTriangle, Sliders, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, Activity, Cpu, Gauge, Zap } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { selectedMineId, selectedMine } = useMine();

  const [forecastData, setForecastData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [reserveGeoJson, setReserveGeoJson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getReserveMap(selectedMineId),
      getProductionForecast(selectedMineId),
      getRiskTier(selectedMineId),
      getRecommendations(selectedMineId),
    ])
      .then(([reserveRes, forecastRes, riskRes, recsRes]) => {
        if (isMounted) {
          setReserveGeoJson(reserveRes);
          setForecastData(forecastRes);
          setRiskData(riskRes);
          setRecommendations(recsRes.recommendations || []);
        }
      })
      .catch((err) => console.error('Dashboard data fetch error:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMineId]);

  const apexFeature = reserveGeoJson?.features?.find((f) => f.properties.isApex);
  const apexScore = apexFeature ? (apexFeature.properties.score * 100).toFixed(1) : '91.4';
  const apexConf = apexFeature ? (apexFeature.properties.confidence * 100).toFixed(1) : '88.2';

  // Active Production Health Nodes for the selected mine
  const productionHealthNodes = [
    {
      id: 'UNIT-01',
      name: `${selectedMine.name} - Pit North Extraction`,
      type: 'Open Cast Mining',
      status: 'OPTIMAL',
      output: '1,420 MT/day',
      grade: '44.2% Mn',
      health: 96,
      telemetry: 'SCADA Feed • Normal Haulage',
    },
    {
      id: 'UNIT-02',
      name: `${selectedMine.name} - Central Main Underground Lode`,
      type: 'Subsurface Stope 04',
      status: 'HIGH OUTPUT',
      output: '1,850 MT/day',
      grade: '46.8% Mn',
      health: 92,
      telemetry: 'Shaft 2 Hoist • Stable Vent',
    },
    {
      id: 'UNIT-03',
      name: `${selectedMine.name} - Primary Crushing & Sizing`,
      type: 'Processing Plant A',
      status: 'OPTIMAL',
      output: '5,100 MT/day',
      grade: 'Size <25mm',
      health: 95,
      telemetry: 'Conveyor C-2 • 98.2% Uptime',
    },
    {
      id: 'UNIT-04',
      name: `${selectedMine.name} - Heavy Media Separation (HMS)`,
      type: 'Beneficiation Unit',
      status: 'OPTIMAL',
      output: '88.4% Recovery',
      grade: '+12% Upgrade',
      health: 91,
      telemetry: 'Dewatering Cyclones • Active',
    },
    {
      id: 'UNIT-05',
      name: `${selectedMine.name} - South Stope Extension`,
      type: 'Exploratory Stope',
      status: 'THROTTLED',
      output: '780 MT/day',
      grade: '39.5% Mn',
      health: 74,
      telemetry: 'Monsoon Seepage • Pumping Active',
    },
    {
      id: 'UNIT-06',
      name: `${selectedMine.name} - Rail Loading Siding`,
      dispatch: 'Logistics Terminal',
      status: 'OPTIMAL',
      output: '3 Rakes / Day',
      grade: 'Class-I Ore',
      health: 98,
      telemetry: 'Weighbridge B • Automated',
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono select-none">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#282a2b]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8B939C]">
            <span>EXPLORATION AI CONSOLE</span>
            <span>/</span>
            <span className="text-[#98d0d6] font-bold">OPERATIONAL OVERVIEW</span>
          </div>
          <h1 className="text-xl font-bold text-[#EDEFF1] tracking-wide mt-1">
            {selectedMine.name.toUpperCase()} // SECTOR CONSOLE
          </h1>
          <div className="text-xs text-[#8B939C] mt-0.5">
            Geological Division: Central Manganese Belt ({selectedMine.state}) • UNFC Classified
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-[#191c1d] border border-[#282a2b] rounded text-xs text-[#8B939C] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4C9A6A] animate-pulse" />
            <span>MODEL WEIGHTS: v4.2.1-FUSED</span>
          </div>
        </div>
      </div>

      {/* 4 High-Level Strategic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Prospectivity Apex */}
        <div
          onClick={() => navigate('/reserves')}
          className="bg-[#191c1d] hover:bg-[#1d2021] border border-[#3A4048] hover:border-[#488085] p-4 rounded cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-[#8B939C]">
            <span className="uppercase font-semibold">PROSPECTIVITY APEX</span>
            <Compass className="w-4 h-4 text-[#488085] group-hover:rotate-45 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-[#98d0d6]">{apexScore}</span>
            <span className="text-xs text-[#8B939C]">/ 100</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#bfc8c9] mt-2 pt-2 border-t border-[#282a2b]">
            <span>Confidence: {apexConf}%</span>
            <span className="text-[#488085] flex items-center gap-0.5 font-semibold">
              Explore Grid <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 2: Production Trajectory */}
        <div
          onClick={() => navigate('/production-risk')}
          className="bg-[#191c1d] hover:bg-[#1d2021] border border-[#3A4048] hover:border-[#488085] p-4 rounded cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-[#8B939C]">
            <span className="uppercase font-semibold">30-DAY TRAJECTORY</span>
            <TrendingUp className="w-4 h-4 text-[#488085] group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-[#EDEFF1]">39,450</span>
            <span className="text-xs text-[#8B939C]">MT</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#bfc8c9] mt-2 pt-2 border-t border-[#282a2b]">
            <span className="text-[#C24E4E]">Deficit: -14,250 MT</span>
            <span className="text-[#488085] flex items-center gap-0.5 font-semibold">
              Trajectory <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 3: Shortfall Risk Tier */}
        <div
          onClick={() => navigate('/production-risk')}
          className="bg-[#191c1d] hover:bg-[#1d2021] border border-[#3A4048] hover:border-[#D1A438] p-4 rounded cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-[#8B939C]">
            <span className="uppercase font-semibold">THREAT LEVEL</span>
            <AlertTriangle className="w-4 h-4 text-[#D1A438]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-[#D1A438]">MEDIUM TIER</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#bfc8c9] mt-2 pt-2 border-t border-[#282a2b]">
            <span>Prob: 8.4% Shortfall</span>
            <span className="text-[#D1A438] flex items-center gap-0.5 font-semibold">
              Inspect Risk <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 4: Active Remediation Plan */}
        <div
          onClick={() => navigate('/recommendations')}
          className="bg-[#191c1d] hover:bg-[#1d2021] border border-[#3A4048] hover:border-[#488085] p-4 rounded cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-[#8B939C]">
            <span className="uppercase font-semibold">ACTION DISPATCH</span>
            <Sliders className="w-4 h-4 text-[#488085]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-[#98d0d6]">+10,300</span>
            <span className="text-xs text-[#8B939C]">MT RECOVERABLE</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#bfc8c9] mt-2 pt-2 border-t border-[#282a2b]">
            <span>2 Active / 4 Prescribed</span>
            <span className="text-[#488085] flex items-center gap-0.5 font-semibold">
              Simulator <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Subsurface Grid Preview & Active Production Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Prospectivity Preview Banner & Cell Breakdown */}
        <div className="lg:col-span-1 bg-[#191c1d] border border-[#282a2b] rounded p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#282a2b]">
              <div className="text-xs font-bold text-[#EDEFF1] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#488085]" />
                <span>SUBSURFACE PROSPECTIVITY</span>
              </div>
              <span className="text-[10px] text-[#488085] bg-[#488085]/10 px-1.5 py-0.5 rounded">
                500M CELL GRID
              </span>
            </div>

            <p className="text-xs text-[#8B939C] mt-2.5 leading-relaxed">
              Multi-modal AI fusion combining Sentinel-2 VNIR/SWIR multispectral imagery, high-resolution aeromagnetic/radiometric grids, and historical lithological borehole intercepts.
            </p>

            {/* Quick Stats Block */}
            <div className="mt-4 bg-[#111415] p-3 rounded border border-[#282a2b] space-y-2 text-xs">
              <div className="flex justify-between text-[#8B939C]">
                <span>Apex Target Cell:</span>
                <strong className="text-[#98d0d6]">{apexFeature?.properties?.cell_id || 'BG-704'}</strong>
              </div>
              <div className="flex justify-between text-[#8B939C]">
                <span>Lithology:</span>
                <span className="text-[#EDEFF1] truncate max-w-[170px]">Gondite-hosted Mn Oxides</span>
              </div>
              <div className="flex justify-between text-[#8B939C]">
                <span>Strike Azimuth:</span>
                <span className="text-[#EDEFF1]">N62°E / Dip: 74°S</span>
              </div>
              <div className="flex justify-between text-[#8B939C]">
                <span>Sparse Borehole Cells:</span>
                <span className="text-[#D1A438]">5 flagged low-evidence</span>
              </div>
            </div>
          </div>

          <button
            id="btn-goto-map"
            onClick={() => navigate('/reserves')}
            className="w-full bg-[#488085] hover:bg-[#5aa1a7] text-[#111415] font-bold py-2.5 px-3 rounded text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Launch Interactive Subsurface Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right 2 Columns: Active Production Health Grid */}
        <div className="lg:col-span-2 bg-[#191c1d] border border-[#282a2b] rounded p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#282a2b]">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#488085]" />
              <h3 className="text-xs font-bold text-[#EDEFF1] tracking-wider uppercase">
                ACTIVE PRODUCTION HEALTH GRID // REAL-TIME TELEMETRY
              </h3>
            </div>
            <span className="text-[10px] text-[#4C9A6A] bg-[#4C9A6A]/10 px-2 py-0.5 rounded border border-[#4C9A6A]/30 flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4C9A6A] animate-pulse" />
              SCADA CONNECTED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
            {productionHealthNodes.map((node) => {
              const isOptimal = node.status === 'OPTIMAL' || node.status === 'HIGH OUTPUT';
              return (
                <div key={node.id} className="bg-[#111415] border border-[#282a2b] p-3 rounded flex flex-col justify-between hover:border-[#488085]/60 transition-colors">
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#8B939C] font-semibold">{node.id} • {node.type}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                        isOptimal ? 'bg-[#4C9A6A]/15 text-[#4C9A6A] border border-[#4C9A6A]/30' : 'bg-[#D1A438]/15 text-[#D1A438] border border-[#D1A438]/30'
                      }`}>
                        {node.status}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-[#EDEFF1] mt-1.5 truncate">
                      {node.name}
                    </div>

                    <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-[#282a2b]">
                      <div>
                        <span className="text-[10px] text-[#8B939C]">RATE: </span>
                        <strong className="text-[#98d0d6]">{node.output}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8B939C]">GRADE: </span>
                        <strong className="text-[#EDEFF1]">{node.grade}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#282a2b]/60 flex items-center justify-between text-[10px]">
                    <span className="text-[#8B939C] truncate">{node.telemetry}</span>
                    <span className="text-[#98d0d6] font-bold">{node.health}% Health</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#282a2b] flex items-center justify-between text-[11px] text-[#8B939C]">
            <span>Active Operational Pits & Processing Plants</span>
            <button
              onClick={() => navigate('/production-risk')}
              className="text-[#488085] hover:text-[#98d0d6] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Tonnage Trajectory & Risk Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Strategic Remediation Preview Strip */}
      <div className="bg-[#191c1d] border border-[#282a2b] rounded p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#282a2b]">
          <div>
            <h3 className="text-sm font-bold text-[#EDEFF1]">
              INTELLIGENT MITIGATION RECOMMENDATIONS SUMMARY
            </h3>
            <p className="text-xs text-[#8B939C] mt-0.5">
              Automated operational work orders prescribed by Shortfall-Net v3.1
            </p>
          </div>

          <button
            id="btn-review-all-recs"
            onClick={() => navigate('/recommendations')}
            className="text-xs text-[#488085] hover:text-[#98d0d6] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Review Full Simulator & Approvals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {recommendations.slice(0, 2).map((rec) => (
            <div key={rec.id} className="bg-[#111415] border border-[#282a2b] p-3 rounded flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#98d0d6]">{rec.id} [{rec.priority}]</span>
                  <span className="text-[#488085] font-bold">+{rec.predicted_recovery_tonnes.toLocaleString()} MT</span>
                </div>
                <div className="text-xs text-[#EDEFF1] font-semibold mt-1 leading-snug">
                  {rec.action_text}
                </div>
                <div className="text-[11px] text-[#8B939C] mt-1">
                  Lead Time: {rec.execution_lead_time} • Cost: ₹{rec.est_cost_lakhs}L
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
