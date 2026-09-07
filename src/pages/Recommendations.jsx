import React, { useState, useEffect } from 'react';
import { useMine } from '../store/mineStore';
import { getRecommendations, approveRecommendation } from '../api/client';
import RecommendationCard from '../components/RecommendationCard';
import ScenarioSimulator from '../components/ScenarioSimulator';
import { Sliders, CheckCircle2, AlertCircle, Filter, RefreshCw } from 'lucide-react';

export default function Recommendations() {
  const { selectedMineId, selectedMine } = useMine();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'approved'

  const fetchRecs = () => {
    setLoading(true);
    getRecommendations(selectedMineId)
      .then((res) => {
        setRecommendations(res.recommendations || []);
      })
      .catch((err) => console.error('Recommendations fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecs();
  }, [selectedMineId]);

  // Optimistic approval handler
  const handleApprove = async (recId) => {
    // Optimistically update
    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === recId
          ? { ...r, approval_status: 'approved', approved_by: 'Dr. A. Sharma', dispatch_id: `DISP-${Math.floor(Math.random() * 8000 + 1000)}` }
          : r
      )
    );

    try {
      await approveRecommendation(recId, 'approved');
    } catch (err) {
      console.error('Approval failed:', err);
      // Rollback on failure
      fetchRecs();
    }
  };

  // Optimistic reject handler
  const handleReject = async (recId) => {
    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === recId
          ? { ...r, approval_status: 'rejected' }
          : r
      )
    );

    try {
      await approveRecommendation(recId, 'rejected');
    } catch (err) {
      console.error('Reject failed:', err);
      fetchRecs();
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    if (filterTab === 'pending') return r.approval_status === 'pending';
    if (filterTab === 'approved') return r.approval_status === 'approved';
    return true;
  });

  const pendingCount = recommendations.filter((r) => r.approval_status === 'pending').length;
  const approvedCount = recommendations.filter((r) => r.approval_status === 'approved').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#282a2b]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8B939C]">
            <span>MITIGATION ENGINE</span>
            <span>/</span>
            <span className="text-[#98d0d6] font-bold">WORK ORDERS & WHAT-IF SIMULATOR</span>
          </div>
          <h1 className="text-xl font-bold text-[#EDEFF1] tracking-wide mt-1">
            {selectedMine.name.toUpperCase()} // REMEDIATION ACTION CONSOLE
          </h1>
          <div className="text-xs text-[#8B939C] mt-0.5">
            Model: Mitigation-Net v3.1 • Algorithmic Work Order Dispatch for Shortfall Recovery
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRecs}
            disabled={loading}
            className="px-3 py-1.5 bg-[#191c1d] hover:bg-[#282a2b] border border-[#3A4048] rounded text-xs text-[#EDEFF1] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#488085] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Engine</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#282a2b] pb-2 text-xs">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded transition-colors ${
            filterTab === 'all'
              ? 'bg-[#488085] text-[#111415] font-bold'
              : 'bg-[#191c1d] text-[#8B939C] hover:text-[#EDEFF1]'
          }`}
        >
          ALL PRESCRIPTIONS ({recommendations.length})
        </button>

        <button
          onClick={() => setFilterTab('pending')}
          className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
            filterTab === 'pending'
              ? 'bg-[#D1A438] text-[#111415] font-bold'
              : 'bg-[#191c1d] text-[#8B939C] hover:text-[#EDEFF1]'
          }`}
        >
          <span>PENDING APPROVAL</span>
          <span className="bg-[#111415] text-[#D1A438] px-1 py-0.2 rounded text-[10px]">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setFilterTab('approved')}
          className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
            filterTab === 'approved'
              ? 'bg-[#4C9A6A] text-[#111415] font-bold'
              : 'bg-[#191c1d] text-[#8B939C] hover:text-[#EDEFF1]'
          }`}
        >
          <span>DISPATCHED / APPROVED</span>
          <span className="bg-[#111415] text-[#4C9A6A] px-1 py-0.2 rounded text-[10px]">
            {approvedCount}
          </span>
        </button>
      </div>

      {/* Main Grid: Left Column (Action Cards) & Right Column (Scenario Simulator) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recommendation Cards List (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#8B939C] font-semibold">
            <span>PRIORITIZED OPERATIONAL ACTIONS</span>
            <span>SHOWING {filteredRecs.length} ACTIONS</span>
          </div>

          {filteredRecs.length === 0 ? (
            <div className="bg-[#191c1d] border border-[#282a2b] p-8 text-center text-xs text-[#8B939C] rounded">
              No recommendations found matching filter.
            </div>
          ) : (
            filteredRecs.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </div>

        {/* What-If Simulator Panel (5 columns) */}
        <div className="lg:col-span-5">
          <div className="sticky top-20">
            <ScenarioSimulator mineId={selectedMineId} />
          </div>
        </div>
      </div>
    </div>
  );
}
