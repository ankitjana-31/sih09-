import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, Compass, TrendingUp, Sliders, Info } from 'lucide-react';
import MoilLogo from './MoilLogo';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutGrid },
    { name: 'Prospectivity Map', path: '/reserves', icon: Compass },
    { name: 'Production & Risk', path: '/production-risk', icon: TrendingUp },
    { name: 'Recommendations', path: '/recommendations', icon: Sliders },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#111415] border-r border-[#282a2b] flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-[#282a2b] flex items-center gap-3">
          <MoilLogo className="w-8 h-8 shrink-0" glow={true} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-sm text-[#e2e2e3]">MOIL</span>
              <span className="bg-[#488085]/20 text-[#98d0d6] border border-[#488085]/40 text-[10px] font-mono px-1.5 py-0.5 rounded leading-none font-semibold">
                CORE
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#8B939C] tracking-wide">
              SIH09 v4.2
            </span>
          </div>
        </div>

        {/* Navigation Category Label */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#1d2021]">
          <span className="text-[10px] font-mono tracking-widest text-[#8B939C] uppercase font-semibold">
            EXPLORATION AI NAV
          </span>
          <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" title="Telemetry Feed Active" />
        </div>

        {/* Navigation List */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === '/dashboard' && location.pathname === '/');

            return (
              <NavLink
                key={item.path}
                to={item.path}
                id={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#1d2021] text-[#00e5ff] border-l-2 border-[#00e5ff] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]'
                    : 'text-[#bfc8c9] hover:text-[#e2e2e3] hover:bg-[#191c1d]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00e5ff]' : 'text-[#8B939C]'}`} />
                <span className="tracking-wide">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Statutory / Operational Disclaimer */}
      <div className="p-3 border-t border-[#282a2b] bg-[#0c0f0f]">
        <div className="border border-[#282a2b] bg-[#111415] p-2.5 rounded text-[11px] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#8B939C]">
              <Info className="w-3.5 h-3.5 text-[#488085]" />
              <span className="font-mono text-[10px] font-bold tracking-wider text-[#e2e2e3]">NOTICE</span>
            </div>
            <span className="font-mono text-[9px] text-[#8B939C] bg-[#1d2021] px-1 py-0.5 rounded border border-[#282a2b]">
              v4.2.1-fused
            </span>
          </div>
          <p className="text-[#8B939C] text-[10.5px] leading-relaxed">
            Prospectivity scores are surface-evidence estimates derived from fused satellite and geological models, not confirmed reserves.
          </p>
          <div className="pt-1.5 border-t border-[#1d2021] flex items-center justify-between text-[10px] font-mono text-[#8B939C]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4C9A6A]" />
              SYS: ONLINE
            </span>
            <span>SYNC 04:20Z</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
