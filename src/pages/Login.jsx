import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { isUsingMockApi, setUseMockApi } from '../api/client';
import MoilLogo from '../components/MoilLogo';
import { Lock, User, Key, Shield, ArrowRight, Database, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [username, setUsername] = useState('a.sharma');
  const [password, setPassword] = useState('DGMS-Level4-Pass');
  const [mockMode, setMockMode] = useState(() => isUsingMockApi());
  const [errorMessage, setErrorMessage] = useState('');

  const handleToggleMock = (val) => {
    setMockMode(val);
    setUseMockApi(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials or switch to isolated mock feed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0f0f] text-[#EDEFF1] font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Tactical Grid Background lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#191c1d_1px,transparent_1px),linear-gradient(to_bottom,#191c1d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Center Tactical Modal Container */}
      <div className="w-full max-w-md bg-[#111415] border border-[#3A4048] rounded shadow-2xl p-6 sm:p-8 relative z-10 space-y-6">
        {/* Emblem & Top Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <MoilLogo className="w-16 h-16" glow={true} />
            <span className="absolute -top-1 -right-2 bg-[#488085] text-[#111415] text-[9px] font-bold px-1.5 py-0.2 rounded leading-tight">
              CORE
            </span>
          </div>

          <div>
            <div className="text-[10px] tracking-widest text-[#8B939C] uppercase font-semibold">
              Ministry of Steel • Govt. of India
            </div>
            <h1 className="text-lg font-bold tracking-wider text-[#e2e2e3] mt-0.5">
              MOIL EXPLORATION AI
            </h1>
            <div className="text-[11px] text-[#488085] font-mono">
              SIH-PS9 MINE PLANNING DASHBOARD
            </div>
          </div>
        </div>

        {/* Informational Subtext */}
        <p className="text-xs text-[#8B939C] text-center leading-relaxed border-y border-[#282a2b] py-2.5">
          Subsurface Mineral Prospectivity, Production Tonnage Trajectory & Shortfall Risk Mitigation Console
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-2.5 bg-[#C24E4E]/10 border border-[#C24E4E]/50 rounded text-xs text-[#ffb4ab] flex items-center gap-2">
            <Shield className="w-4 h-4 shrink-0 text-[#C24E4E]" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#8B939C] flex items-center justify-between">
              <span>DESIGNATION / EMPLOYEE ID</span>
              <span className="text-[#488085]">CLEARANCE: LEVEL-4</span>
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 absolute left-3 text-[#8B939C] pointer-events-none" />
              <input
                id="login-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. a.sharma"
                className="w-full bg-[#191c1d] border border-[#3A4048] rounded px-3 py-2 pl-9 text-xs text-[#EDEFF1] focus:outline-none focus:border-[#488085] font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-[#8B939C] flex items-center justify-between">
              <span>SECURE ACCESS PASSCODE</span>
              <span className="text-[#8B939C]">DGMS TOKEN</span>
            </label>
            <div className="relative flex items-center">
              <Key className="w-4 h-4 absolute left-3 text-[#8B939C] pointer-events-none" />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#191c1d] border border-[#3A4048] rounded px-3 py-2 pl-9 text-xs text-[#EDEFF1] focus:outline-none focus:border-[#488085] font-mono"
              />
            </div>
          </div>

          {/* Fail-Safe API Mode Switcher */}
          <div className="bg-[#191c1d] border border-[#282a2b] p-3 rounded space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#bfc8c9] flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#488085]" />
                API Contract Data Source:
              </span>
              <span className={mockMode ? 'text-[#98d0d6] font-bold' : 'text-[#f9b895]'}>
                {mockMode ? 'ISOLATED MOCK' : 'LIVE FASTAPI'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => handleToggleMock(true)}
                className={`py-1.5 px-2 rounded border transition-colors flex items-center justify-center gap-1 ${
                  mockMode
                    ? 'bg-[#488085]/20 border-[#488085] text-[#98d0d6] font-bold'
                    : 'bg-[#111415] border-[#282a2b] text-[#8B939C] hover:text-[#EDEFF1]'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Deterministic Mock</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleMock(false)}
                className={`py-1.5 px-2 rounded border transition-colors flex items-center justify-center gap-1 ${
                  !mockMode
                    ? 'bg-[#bd8364]/20 border-[#bd8364] text-[#f9b895] font-bold'
                    : 'bg-[#111415] border-[#282a2b] text-[#8B939C] hover:text-[#EDEFF1]'
                }`}
              >
                <span>FastAPI (:8000)</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-[#488085] hover:bg-[#5aa1a7] text-[#111415] font-bold py-2.5 px-4 rounded text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Lock className="w-4 h-4 fill-current" />
            <span>{loading ? 'AUTHENTICATING CONSOLE...' : 'INITIALIZE INTELLIGENCE CONSOLE'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Statutory Compliance Footer */}
        <div className="pt-2 border-t border-[#282a2b] text-center space-y-1">
          <div className="text-[10px] text-[#8B939C]">
            AUTHORIZED PERSONNEL ONLY • DGMS & UNFC COMPLIANT LOGGING ACTIVE
          </div>
          <div className="text-[9px] text-[#8B939C]/60">
            BUILD 2025.10.24-RC4 • SHA-256 ENCRYPTED JWT SESSION
          </div>
        </div>
      </div>
    </div>
  );
}
