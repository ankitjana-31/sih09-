import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { useMine } from '../store/mineStore';
import { LogOut, MapPin, Layers, Radio, CloudRain, User } from 'lucide-react';
import MoilLogo from './MoilLogo';

export default function Header() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mines, selectedMineId, selectMine, selectedSector, telemetry } = useMine();
  const isMapOverview = location.pathname === '/reserves' || location.pathname === '/map';

  return (
    <header className="border-b border-[#282a2b] bg-[#111415] sticky top-0 z-20">
      {/* Primary Bar */}
      <div className="h-14 px-4 flex items-center justify-between gap-4">
        {/* Left Console Designation */}
        <div className="flex items-center gap-3">
          <MoilLogo className="w-5 h-5 hidden sm:block" />
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-[#e2e2e3]">
              MOIL INTELLIGENCE
            </span>
            <span className="text-xs font-mono text-[#8B939C]">/</span>
            <span className="text-xs font-mono text-[#8B939C] hidden md:inline">
              SECTOR CONSOLE
            </span>
          </div>
        </div>

        {/* Center Mine & Sector Pickers */}
        <div className="flex items-center gap-2">
          {/* Sector Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#191c1d] border border-[#282a2b] rounded text-xs font-mono text-[#bfc8c9]">
            <Layers className="w-3.5 h-3.5 text-[#488085]" />
            <span>{selectedSector}</span>
          </div>

          {/* Mine Selector Dropdown */}
          <div className="relative flex items-center">
            <MapPin className="w-3.5 h-3.5 absolute left-2.5 text-[#bd8364] pointer-events-none" />
            <select
              id="mine-selector"
              aria-label="Select MOIL Mine Facility"
              value={selectedMineId}
              onChange={(e) => selectMine(e.target.value)}
              className="bg-[#191c1d] hover:bg-[#1d2021] border border-[#3A4048] hover:border-[#488085] rounded text-xs font-mono text-[#EDEFF1] pl-8 pr-6 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#488085] transition-colors cursor-pointer appearance-none"
            >
              {mines.map((mine) => (
                <option key={mine.id} value={mine.id} className="bg-[#191c1d] text-[#EDEFF1]">
                  {mine.name} ({mine.sector})
                </option>
              ))}
            </select>
            <div className="absolute right-2 pointer-events-none text-[9px] text-[#8B939C]">
              ▼
            </div>
          </div>
        </div>

        {/* User Profile & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 pl-3 border-l border-[#282a2b]">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-[#EDEFF1]">{user?.name || 'Dr. A. Sharma'}</div>
              <div className="text-[10px] font-mono text-[#8B939C]">{user?.role || 'Sr. Mine Planner'}</div>
            </div>
            <div className="w-7 h-7 rounded bg-[#1d2021] border border-[#488085]/60 flex items-center justify-center text-[#98d0d6]" title={user?.badgeId || 'MOIL'}>
              <User className="w-4 h-4" />
            </div>
          </div>

          <button
            id="btn-signout"
            onClick={logout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-[#8B939C] hover:text-[#C24E4E] hover:bg-[#1d2021] border border-transparent hover:border-[#C24E4E]/40 rounded transition-all"
            title="Sign out of MOIL Intelligence System"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Secondary Telemetry Strip */}
      {!isMapOverview && (
        <div className="bg-[#0c0f0f] border-t border-[#1d2021] px-4 py-1.5 flex items-center justify-between text-[10px] font-mono text-[#8B939C] overflow-x-auto whitespace-nowrap scrollbar-none">
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#488085]" />
              <span className="text-[#bfc8c9]">TELEMETRY CYCLE:</span> {telemetry.cycle}
            </span>
            <span className="hidden md:inline">
              <span className="text-[#bfc8c9]">RUN ID:</span> {telemetry.runId}
            </span>
            <span className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-[#488085]" />
              <span className="text-[#bfc8c9]">SENTINEL-2A PASS:</span> {telemetry.sentinelPass}
            </span>
            <span className="flex items-center gap-1.5 text-[#D1A438]">
              <CloudRain className="w-3 h-3" />
              <span className="text-[#bfc8c9]">WEATHER HAZARD:</span> {telemetry.weatherHazard}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden lg:inline text-[#8B939C]">NETWORK LATENCY: <span className="text-[#4C9A6A]">{telemetry.networkLatency}</span></span>
          </div>
        </div>
      )}
    </header>
  );
}
