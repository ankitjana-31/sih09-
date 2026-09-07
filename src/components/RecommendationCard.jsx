import React, { useState } from 'react';
import { Check, X, Clock, AlertTriangle, ShieldCheck, FileCheck, Layers } from 'lucide-react';

export default function RecommendationCard({ recommendation, onApprove, onReject }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    id,
    action_text,
    priority,
    seq,
    predicted_recovery_tonnes,
    approval_status = 'pending',
    cause_factor,
    cause_pct,
    deficit_restoration_pct,
    execution_lead_time,
    dispatch_staging,
    est_cost_lakhs,
    cost_breakdown,
    geotechnical_fs,
    geotechnical_status,
    water_level_reduction,
    power_infrastructure,
    discharge_metrics,
    crusher_throughput,
    regulatory_clearance,
    detonation_window,
    regulatory_warning,
    approved_by,
    dispatch_id,
  } = recommendation;

  const handleAction = async (status) => {
    setIsUpdating(true);
    try {
      if (status === 'approved' && onApprove) {
        await onApprove(id);
      } else if (status === 'rejected' && onReject) {
        await onReject(id);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const isApproved = approval_status === 'approved';
  const isRejected = approval_status === 'rejected';

  // Priority color
  const getPriorityStyle = (p) => {
    switch (p) {
      case 'URGENT':
        return 'bg-[#C24E4E]/20 text-[#ffb4ab] border-[#C24E4E]/50';
      case 'HIGH IMPACT':
        return 'bg-[#bd8364]/20 text-[#f9b895] border-[#bd8364]/50';
      case 'OPERATIONAL':
        return 'bg-[#488085]/20 text-[#98d0d6] border-[#488085]/50';
      default:
        return 'bg-[#282a2b] text-[#bfc8c9] border-[#3A4048]';
    }
  };

  return (
    <div
      id={`recommendation-card-${id}`}
      className={`bg-[#191c1d] border rounded p-4 font-mono select-none transition-all ${
        isApproved
          ? 'border-[#488085]/60 bg-[#1d2021]'
          : isRejected
          ? 'border-[#C24E4E]/40 opacity-75'
          : 'border-[#3A4048] hover:border-[#488085]/40'
      }`}
    >
      {/* Header Badge Row */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#282a2b]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getPriorityStyle(priority)}`}>
            {id} [{priority}]
          </span>
          {seq && (
            <span className="text-[10px] text-[#8B939C]">
              SEQ: {seq}
            </span>
          )}
        </div>

        {/* Approval Status Pill */}
        <div>
          {isApproved ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#488085]/20 text-[#98d0d6] border border-[#488085] text-[10px] font-bold">
              <Check className="w-3 h-3" />
              APPROVED
            </span>
          ) : isRejected ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#C24E4E]/20 text-[#ffb4ab] border border-[#C24E4E] text-[10px] font-bold">
              <X className="w-3 h-3" />
              REJECTED
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#111415] text-[#D1A438] border border-[#D1A438]/50 text-[10px] font-bold">
              <Clock className="w-3 h-3" />
              PENDING APPROVAL
            </span>
          )}
        </div>
      </div>

      {/* Recoverable tonnage callout */}
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-xs text-[#8B939C] uppercase font-semibold">RECOVERABLE:</span>
        <span className="text-base font-bold text-[#98d0d6]">
          +{predicted_recovery_tonnes.toLocaleString()} MT
        </span>
      </div>

      {/* Action Title */}
      <h4 className="text-sm font-semibold text-[#EDEFF1] mt-1.5 leading-snug">
        {action_text}
      </h4>

      {/* Root Cause description */}
      <div className="mt-2 text-xs text-[#bfc8c9] bg-[#111415] p-2 rounded border border-[#282a2b] flex items-start gap-2">
        <span className="text-[#8B939C] uppercase text-[10px] font-bold shrink-0">ROOT CAUSE:</span>
        <span>{cause_factor} ({cause_pct}% contribution to current deficit)</span>
      </div>

      {/* Telemetry Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-2 border-t border-[#282a2b] text-[11px]">
        {deficit_restoration_pct && (
          <div className="bg-[#111415] p-2 rounded border border-[#282a2b]">
            <div className="text-[9px] text-[#8B939C] uppercase">DEFICIT RESTORATION</div>
            <div className="font-bold text-[#EDEFF1] mt-0.5">{deficit_restoration_pct}% of Shortfall</div>
            <div className="w-full h-1 bg-[#191c1d] rounded mt-1 overflow-hidden">
              <div className="h-full bg-[#488085]" style={{ width: `${deficit_restoration_pct}%` }} />
            </div>
          </div>
        )}

        {execution_lead_time && (
          <div className="bg-[#111415] p-2 rounded border border-[#282a2b]">
            <div className="text-[9px] text-[#8B939C] uppercase">EXECUTION LEAD TIME</div>
            <div className="font-bold text-[#EDEFF1] mt-0.5">{execution_lead_time}</div>
            <div className="text-[9px] text-[#8B939C] mt-0.5 truncate">{dispatch_staging || 'Dispatch staged'}</div>
          </div>
        )}

        {est_cost_lakhs && (
          <div className="bg-[#111415] p-2 rounded border border-[#282a2b]">
            <div className="text-[9px] text-[#8B939C] uppercase">ESTIMATED COST</div>
            <div className="font-bold text-[#f9b895] mt-0.5">₹{est_cost_lakhs} Lakhs</div>
            <div className="text-[9px] text-[#8B939C] mt-0.5 truncate">{cost_breakdown || 'Operational OPEX'}</div>
          </div>
        )}

        {water_level_reduction && (
          <div className="bg-[#111415] p-2 rounded border border-[#282a2b]">
            <div className="text-[9px] text-[#8B939C] uppercase">WATER REDUCTION</div>
            <div className="font-bold text-[#98d0d6] mt-0.5">{water_level_reduction}</div>
            <div className="text-[9px] text-[#8B939C] mt-0.5">{power_infrastructure}</div>
          </div>
        )}

        {crusher_throughput && (
          <div className="bg-[#111415] p-2 rounded border border-[#282a2b]">
            <div className="text-[9px] text-[#8B939C] uppercase">CRUSHER IMPACT</div>
            <div className="font-bold text-[#EDEFF1] mt-0.5">{crusher_throughput}</div>
            <div className="text-[9px] text-[#8B939C] mt-0.5">{regulatory_clearance}</div>
          </div>
        )}

        {discharge_metrics && (
          <div className="bg-[#111415] p-2 rounded border border-[#282a2b]">
            <div className="text-[9px] text-[#8B939C] uppercase">DISCHARGE METRICS</div>
            <div className="font-bold text-[#EDEFF1] mt-0.5">{discharge_metrics}</div>
          </div>
        )}
      </div>

      {/* Geotechnical or Regulatory notes */}
      {geotechnical_status && (
        <div className="mt-2 text-[10px] text-[#488085] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{geotechnical_status}</span>
        </div>
      )}

      {regulatory_warning && (
        <div className="mt-2 text-[10px] text-[#D1A438] flex items-center gap-1.5 bg-[#D1A438]/10 p-1.5 rounded border border-[#D1A438]/30">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{regulatory_warning}</span>
        </div>
      )}

      {approved_by && (
        <div className="mt-2 text-[10px] text-[#98d0d6] flex items-center gap-1.5 pt-1.5 border-t border-[#282a2b]">
          <FileCheck className="w-3.5 h-3.5 text-[#488085]" />
          <span>Approved by {approved_by} • Dispatch ID: {dispatch_id}</span>
        </div>
      )}

      {/* Action Buttons */}
      {!isApproved && !isRejected && (
        <div className="mt-3 pt-3 border-t border-[#282a2b] flex items-center gap-2">
          <button
            id={`btn-approve-${id}`}
            disabled={isUpdating}
            onClick={() => handleAction('approved')}
            className="flex-1 bg-[#488085] hover:bg-[#5aa1a7] text-[#111415] font-bold py-1.5 px-3 rounded text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Approve Action</span>
          </button>

          <button
            id={`btn-reject-${id}`}
            disabled={isUpdating}
            onClick={() => handleAction('rejected')}
            className="bg-[#111415] hover:bg-[#C24E4E]/20 text-[#8B939C] hover:text-[#ffb4ab] border border-[#3A4048] hover:border-[#C24E4E]/50 font-medium py-1.5 px-3 rounded text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>
        </div>
      )}
    </div>
  );
}
