import React, { useState, useEffect } from 'react';
import { simulateScenario } from '../api/client';
import { Play, Check, AlertTriangle, Bookmark, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ScenarioSimulator({ mineId = 'balaghat' }) {
  const [selectedActionIds, setSelectedActionIds] = useState(['PR-01', 'PR-02']);
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [committedMsg, setCommittedMsg] = useState(null);

  const availableActions = [
    {
      id: 'PR-01',
      title: 'Reroute EX-02...',
      fullTitle: 'Reroute Excavator EX-02 to Bench 12 Ore Face',
      tonnes: 6200,
      cost: '₹4.8L',
      note: 'Resource clash: None',
      statusPill: 'FEASIBLE',
    },
    {
      id: 'PR-02',
      title: 'Deploy Submer...',
      fullTitle: 'Deploy 2x 150HP High-Head Submersible Pumps',
      tonnes: 4100,
      cost: '₹2.4L',
      note: 'Power: 33kV Line ready',
      statusPill: 'FEASIBLE',
    },
    {
      id: 'PR-03',
      title: 'Electronic Se...',
      fullTitle: 'Execute Controlled Secondary Blasting via Electronic Detonators',
      tonnes: 2800,
      cost: '₹1.8L',
      note: 'DGMS nighttime blasting restriction',
      statusPill: 'CONDITIONAL',
    },
    {
      id: 'PR-04',
      title: 'Third Shift O...',
      fullTitle: 'Third Shift Maintenance Overtime & CV-04 Splicing',
      tonnes: 1900,
      cost: '₹2.2L',
      note: 'Cost penalty: +₹2.2L overtime',
      statusPill: 'FEASIBLE',
    },
  ];

  const handleToggleAction = (actionId) => {
    setSelectedActionIds((prev) =>
      prev.includes(actionId) ? prev.filter((id) => id !== actionId) : [...prev, actionId]
    );
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    simulateScenario(mineId, selectedActionIds)
      .then((res) => {
        if (isMounted) setSimulationResult(res);
      })
      .catch((err) => console.error('Simulation error:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [mineId, selectedActionIds]);

  const handleCommit = () => {
    setCommittedMsg(`Scenario committed: ${simulationResult?.scenario_id}. Work orders dispatched to Balaghat Dispatch Center.`);
    setTimeout(() => setCommittedMsg(null), 4500);
  };

  const isBlocked = simulationResult?.feasibility === 'blocked';
  const mitigationPct = simulationResult?.mitigation_pct || 0;
  const unmitigatedPct = Math.max(0, (100 - mitigationPct).toFixed(1));

  return (
    <div
      id="scenario-simulator-panel"
      className="bg-[#191c1d] border border-[#3A4048] rounded p-4 font-mono select-none flex flex-col justify-between"
    >
      <div>
        {/* Header with Feasibility Pill */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#282a2b]">
          <span className="text-[10px] text-[#8B939C] uppercase tracking-wider font-semibold">
            WHAT-IF SIMULATOR
          </span>

          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold ${
              isBlocked
                ? 'bg-[#C24E4E]/20 text-[#ffb4ab] border-[#C24E4E]'
                : 'bg-[#488085]/20 text-[#98d0d6] border-[#488085]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isBlocked ? 'bg-[#C24E4E]' : 'bg-[#488085]'}`} />
            <span>{isBlocked ? 'BLOCKED CONFLICT' : 'FEASIBLE EXECUTION PLAN'}</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-2.5">
          <h3 className="text-sm font-bold text-[#EDEFF1]">
            Operational Scenario Synthesis
          </h3>
          <p className="text-[11px] text-[#8B939C] mt-1 leading-snug">
            Toggle AI recommendations to simulate collective tonnage remediation, hydraulic impact, and Capex footprint.
          </p>
        </div>

        {/* 3 Metric Cards: Baseline, Simulated Recovery, Net Residual */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="bg-[#111415] border border-[#282a2b] p-2 rounded">
            <div className="text-[9px] text-[#8B939C] uppercase">PROJECTED DEFICIT</div>
            <div className="text-sm font-bold text-[#C24E4E] mt-0.5">
              -14,250 <span className="text-[9px] font-normal">MT</span>
            </div>
            <div className="text-[8px] text-[#8B939C] mt-0.5">Unmitigated Baseline</div>
          </div>

          <div className="bg-[#111415] border border-[#488085]/40 p-2 rounded">
            <div className="text-[9px] text-[#488085] uppercase font-bold">SIMULATED RECOVERY</div>
            <div className="text-sm font-bold text-[#98d0d6] mt-0.5">
              +{simulationResult?.predicted_recovery_tonnes?.toLocaleString() || 0} <span className="text-[9px] font-normal">MT</span>
            </div>
            <div className="text-[8px] text-[#98d0d6] mt-0.5">
              {mitigationPct}% Mitigation
            </div>
          </div>

          <div className="bg-[#111415] border border-[#282a2b] p-2 rounded">
            <div className="text-[9px] text-[#8B939C] uppercase">NET RESIDUAL</div>
            <div className="text-sm font-bold text-[#EDEFF1] mt-0.5">
              {simulationResult?.net_residual_tonnes?.toLocaleString() || 0} <span className="text-[9px] font-normal">MT</span>
            </div>
            <div className="text-[8px] text-[#8B939C] mt-0.5">Residual Gap</div>
          </div>
        </div>

        {/* Visual Allocation Split Bar */}
        <div className="mt-3 bg-[#111415] p-2.5 rounded border border-[#282a2b]">
          <div className="flex justify-between text-[10px] text-[#8B939C] mb-1">
            <span>TONNAGE SHORTFALL ALLOCATION</span>
            <span>
              RECOVERED: <strong className="text-[#98d0d6]">{mitigationPct}%</strong> | UNRECOVERED: <strong className="text-[#C24E4E]">{unmitigatedPct}%</strong>
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#191c1d] rounded overflow-hidden flex">
            <div
              className="h-full bg-[#488085] transition-all duration-300"
              style={{ width: `${Math.min(100, mitigationPct)}%` }}
              title={`Remediated Ore Body: ${mitigationPct}%`}
            />
            <div
              className="h-full bg-[#C24E4E]/60 transition-all duration-300"
              style={{ width: `${Math.max(0, 100 - mitigationPct)}%` }}
              title={`Unmitigated Margin: ${unmitigatedPct}%`}
            />
          </div>

          <div className="flex justify-between text-[9px] text-[#8B939C] mt-1">
            <span className="flex items-center gap-1 text-[#98d0d6]">
              <span className="w-1.5 h-1.5 rounded-none bg-[#488085]" />
              REMEDIATED ORE BODY
            </span>
            <span className="flex items-center gap-1 text-[#C24E4E]">
              <span className="w-1.5 h-1.5 rounded-none bg-[#C24E4E]/60" />
              UNMITIGATED DEFICIT MARGIN
            </span>
          </div>
        </div>

        {/* Action Toggle Injections */}
        <div className="mt-3">
          <div className="flex justify-between items-center text-[10px] text-[#8B939C] uppercase font-semibold mb-2">
            <span>SELECTABLE ACTION INJECTIONS</span>
            <span>{selectedActionIds.length} Active / {availableActions.length} Available</span>
          </div>

          <div className="space-y-1.5">
            {availableActions.map((action) => {
              const isChecked = selectedActionIds.includes(action.id);
              return (
                <div
                  key={action.id}
                  onClick={() => handleToggleAction(action.id)}
                  className={`flex items-center justify-between p-2 rounded border text-xs cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-[#1d2021] border-[#488085]/50 text-[#EDEFF1]'
                      : 'bg-[#111415] border-[#282a2b] text-[#8B939C] hover:border-[#3A4048]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Toggle Switch */}
                    <div
                      className={`w-7 h-4 rounded-full p-0.5 transition-colors ${
                        isChecked ? 'bg-[#488085]' : 'bg-[#282a2b]'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-white transition-transform ${
                          isChecked ? 'translate-x-3' : 'translate-x-0'
                        }`}
                      />
                    </div>

                    <div>
                      <div className="font-semibold text-[#EDEFF1] text-[11px]">
                        {action.id}: {action.title} +{action.tonnes.toLocaleString()} MT
                      </div>
                      <div className="text-[10px] text-[#8B939C] truncate max-w-[210px]">
                        {action.note}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#f9b895] bg-[#111415] px-1.5 py-0.5 rounded border border-[#282a2b]">
                    {action.cost}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Block Warning if conflicting actions selected */}
        {isBlocked && (
          <div className="mt-3 p-2 bg-[#C24E4E]/10 border border-[#C24E4E]/50 rounded text-[11px] text-[#ffb4ab] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#C24E4E] mt-0.5" />
            <div>
              <strong className="block text-[#C24E4E] font-bold">CONSTRAINT CONFLICT DETECTED:</strong>
              <span>{simulationResult.block_reason}</span>
            </div>
          </div>
        )}

        {/* Capex & ROI Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-[#282a2b] text-[11px]">
          <div>
            <div className="text-[9px] text-[#8B939C] uppercase">EST. IMPLEMENTATION CAPEX:</div>
            <div className="font-bold text-[#f9b895] mt-0.5">
              ₹{simulationResult?.est_capex_lakhs || 0} Lakhs
            </div>
          </div>

          <div>
            <div className="text-[9px] text-[#8B939C] uppercase">NET VALUE RECOVERED:</div>
            <div className="font-bold text-[#98d0d6] mt-0.5">
              ₹{simulationResult?.net_value_lakhs || 0} Lakhs
            </div>
          </div>

          <div>
            <div className="text-[9px] text-[#8B939C] uppercase">RETURN ON REMEDIATION:</div>
            <div className="font-bold text-[#EDEFF1] mt-0.5">
              {simulationResult?.roi_multiplier || '0.0x'}
            </div>
          </div>
        </div>
      </div>

      {/* Execution Buttons & Preset Actions */}
      <div className="mt-4 pt-3 border-t border-[#282a2b] space-y-2">
        <button
          id="btn-commit-scenario"
          disabled={isBlocked || selectedActionIds.length === 0}
          onClick={handleCommit}
          className="w-full bg-[#488085] hover:bg-[#5aa1a7] disabled:bg-[#282a2b] disabled:text-[#8B939C] text-[#111415] font-bold py-2 px-3 rounded text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Commit Selected Scenario & Issue Work Orders</span>
        </button>

        {committedMsg && (
          <div className="p-2 bg-[#488085]/20 border border-[#488085] rounded text-[10px] text-[#98d0d6] flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{committedMsg}</span>
          </div>
        )}

        <button
          id="btn-save-preset"
          onClick={() => {
            setCommittedMsg('Scenario preset saved as [Balaghat-Oct-Sim-B] in MOIL registry.');
            setTimeout(() => setCommittedMsg(null), 3000);
          }}
          className="w-full bg-[#111415] hover:bg-[#1d2021] text-[#8B939C] hover:text-[#EDEFF1] border border-[#282a2b] py-1.5 px-3 rounded text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Bookmark className="w-3 h-3" />
          <span>Save Scenario Preset (Balaghat-Oct-Sim-B)</span>
        </button>

        <div className="flex justify-between items-center text-[9px] text-[#8B939C] pt-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#488085]" />
            {simulationResult?.model_version || 'Sim-MonteCarlo v2.1 Engine'}
          </span>
          <span>Latency: {simulationResult?.latency_ms || 120}ms</span>
        </div>
      </div>
    </div>
  );
}
