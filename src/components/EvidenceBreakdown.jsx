import React, { useState } from 'react';
import { Crosshair, Flag, CheckCircle2, ShieldCheck, Check } from 'lucide-react';

export default function EvidenceBreakdown({ cell, allCells = [], onSelect, onProposeDrillhole }) {
  const [drillholeProposed, setDrillholeProposed] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);

  // Fallback to BG-704 if no cell is provided
  const currentCell = cell || {
    cell_id: 'BG-704',
    score: 0.914,
    confidence: 0.882,
    validation_status: 'EVIDENCED',
    isApex: true,
  };

  const cellId = currentCell.cell_id || 'BG-704';
  const scoreVal = currentCell.score != null ? (currentCell.score * 100).toFixed(1) : '91.4';
  const confVal = currentCell.confidence != null ? (currentCell.confidence * 100).toFixed(1) : '88.2';

  // Dynamic factors or calibrated values for BG-704
  const isApex = currentCell.isApex || cellId === 'BG-704';
  const factors = isApex
    ? [
        { label: 'Satellite Hyperspectral / Lithology', val: 94.2 },
        { label: 'Historical Drill Core Intercepts', val: 89.8 },
        { label: 'Structural Synclinal Axis Proximity', val: 86.5 },
        { label: 'Aeromagnetic / Radiometric Correlation', val: 72.4 },
      ]
    : [
        { label: 'Satellite Hyperspectral / Lithology', val: Math.min(96, Math.round(Number(scoreVal) * 1.05)) },
        { label: 'Historical Drill Core Intercepts', val: Math.min(95, Math.round(Number(scoreVal) * 0.98)) },
        { label: 'Structural Synclinal Axis Proximity', val: Math.min(92, Math.round(Number(scoreVal) * 0.94)) },
        { label: 'Aeromagnetic / Radiometric Correlation', val: Math.min(90, Math.round(Number(scoreVal) * 0.85)) },
      ];

  // 6 Neighbor survey cells (as shown in image)
  const defaultNeighbors = [
    { id: 'BG-689', score: '79.5', label: 'NORTH', isTarget: false },
    { id: 'BG-704', score: '91.4', label: 'TARGET', isTarget: true },
    { id: 'BG-705', score: '82.1', label: 'EAST', isTarget: false },
    { id: 'BG-703', score: '74.2', label: 'WEST', isTarget: false },
    { id: 'BG-719', score: '69.8', label: 'SOUTH', isTarget: false },
    { id: 'BG-690', score: '82.1', label: 'NE APEX', isTarget: false },
  ];

  return (
    <div
      id="target-evidence-inspector"
      className="w-full h-full bg-[#111415] border-l border-[#282a2b] flex flex-col justify-between font-mono select-none overflow-y-auto"
    >
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#282a2b]">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-[#00e5ff]" />
            <span className="font-bold text-[#EDEFF1] tracking-wider text-xs uppercase">
              TARGET EVIDENCE INSPECTOR
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#488085]/20 text-[#00e5ff] border border-[#00e5ff]/50">
            EVIDENCED
          </span>
        </div>

        {/* Section 1: Grid Cell Reference & ML Score */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[9.5px] text-[#8B939C] uppercase tracking-wider">
                GRID CELL REFERENCE
              </div>
              <div className="text-2xl font-bold font-mono text-[#EDEFF1] mt-0.5">
                {cellId}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[9.5px] text-[#8B939C] uppercase tracking-wider font-mono">
                UTM ZONE 44N
              </div>
              <div className="flex items-baseline justify-end gap-1 mt-0.5">
                <span className="text-2xl font-bold font-mono text-[#00e5ff]">
                  {scoreVal}
                </span>
                <span className="text-[10px] text-[#8B939C] uppercase">
                  / 100 ML SCORE
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs font-mono text-[#8B939C]">
            CONFIDENCE RATING:{' '}
            <span className="text-[#EDEFF1] font-bold">
              {confVal}% HIGH PROBABILITY
            </span>
          </div>
        </div>

        <div className="border-t border-[#282a2b]" />

        {/* Section 2: Geological Weighting Factors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#8B939C] uppercase font-bold tracking-wider">
              GEOLOGICAL WEIGHTING FACTORS
            </span>
            <span className="text-[#8B939C] uppercase text-[9px]">
              FUSED MODEL
            </span>
          </div>

          <div className="space-y-2.5">
            {factors.map((f) => (
              <div key={f.label} className="space-y-1">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-[#bfc8c9] truncate max-w-[260px]">
                    {f.label}
                  </span>
                  <span className="text-[#00e5ff] font-bold font-mono text-[11px]">
                    {f.val.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#191c1d] rounded-full overflow-hidden border border-[#282a2b]">
                  <div
                    className="h-full bg-gradient-to-r from-[#488085] to-[#00e5ff] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, f.val)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#282a2b]" />

        {/* Section 3: Neighboring Survey Cells */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-mono text-[#8B939C] uppercase font-bold tracking-wider">
            NEIGHBORING SURVEY CELLS
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            {defaultNeighbors.map((n) => {
              const isCurrent = cellId === n.id;
              const isHigh = Number(n.score) >= 80;
              return (
                <button
                  key={n.id}
                  onClick={() => onSelect && onSelect(n.id)}
                  className={`p-2 rounded text-left transition-all border ${
                    isCurrent
                      ? 'border-[#00e5ff] bg-[#00e5ff]/15 ring-1 ring-[#00e5ff]'
                      : 'border-[#282a2b] bg-[#191c1d] hover:border-[#488085]'
                  }`}
                >
                  <div className="text-[10px] text-[#bfc8c9] font-bold">{n.id}</div>
                  <div
                    className={`text-sm font-bold mt-0.5 ${
                      isCurrent || isHigh ? 'text-[#00e5ff]' : 'text-[#bd8364]'
                    }`}
                  >
                    {n.score}
                  </div>
                  <div className="text-[8.5px] text-[#8B939C] mt-0.5 uppercase tracking-wider">
                    {n.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="p-4 border-t border-[#282a2b] bg-[#111415]">
        <button
          onClick={() => setShowProposalModal(true)}
          className={`w-full py-2.5 px-4 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
            drillholeProposed
              ? 'bg-[#4C9A6A] text-[#EDEFF1] border border-[#4C9A6A]'
              : 'bg-[#98d0d6] hover:bg-[#b5e7eb] text-[#0c0f0f] active:scale-[0.99]'
          }`}
        >
          {drillholeProposed ? (
            <>
              <Check className="w-4 h-4" />
              <span>DRILLHOLE PROPOSAL LOGGED (DH-BAL-704)</span>
            </>
          ) : (
            <>
              <Flag className="w-4 h-4 text-[#0c0f0f]" />
              <span>PROPOSE EXPLORATORY DRILL HOLE</span>
            </>
          )}
        </button>
      </div>

      {/* Proposal Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111415] border border-[#00e5ff] rounded-lg max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#282a2b]">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-[#00e5ff]" />
                <span className="font-bold text-[#EDEFF1] text-xs uppercase tracking-wider">
                  CONFIRM EXPLORATORY DRILL HOLE PROPOSAL
                </span>
              </div>
              <button
                onClick={() => setShowProposalModal(false)}
                className="text-[#8B939C] hover:text-[#EDEFF1] text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono text-[#bfc8c9]">
              <div className="flex justify-between py-1 border-b border-[#282a2b]">
                <span className="text-[#8B939C]">TARGET CELL:</span>
                <span className="text-[#00e5ff] font-bold">{cellId} (Apex Horizon)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#282a2b]">
                <span className="text-[#8B939C]">COLLAR COORDS:</span>
                <span className="text-[#EDEFF1]">21°54'02"N, 80°12'45"E</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#282a2b]">
                <span className="text-[#8B939C]">SURFACE ELEVATION:</span>
                <span className="text-[#EDEFF1]">364m RL</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#282a2b]">
                <span className="text-[#8B939C]">PLANNED DEPTH:</span>
                <span className="text-[#EDEFF1]">180m Inclined Core</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#282a2b]">
                <span className="text-[#8B939C]">AZIMUTH / DIP:</span>
                <span className="text-[#EDEFF1]">N62°E / -60°</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#282a2b]">
                <span className="text-[#8B939C]">FUSED ML SCORE:</span>
                <span className="text-[#00e5ff] font-bold">{scoreVal} / 100</span>
              </div>
            </div>

            <p className="text-[10.5px] text-[#8B939C] leading-relaxed">
              Target intercepts high-grade Gondite manganese ore horizon with verified structural synclinal closure and aeromagnetic anomaly correlation.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowProposalModal(false)}
                className="flex-1 py-2 bg-[#191c1d] hover:bg-[#282a2b] text-[#bfc8c9] rounded text-xs font-mono font-semibold"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  setDrillholeProposed(true);
                  setShowProposalModal(false);
                  if (onProposeDrillhole) onProposeDrillhole(cellId);
                }}
                className="flex-1 py-2 bg-[#00e5ff] hover:bg-[#488085] text-[#0c0f0f] font-bold rounded text-xs font-mono"
              >
                SUBMIT PROPOSAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
