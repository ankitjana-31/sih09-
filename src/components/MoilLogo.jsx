import React from 'react';

export default function MoilLogo({ className = "w-8 h-8", glow = false }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} ${glow ? 'filter drop-shadow-[0_0_8px_rgba(72,128,133,0.6)]' : ''}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Hexagon Frame (Teal) */}
      <polygon
        points="50,6 88,28 88,72 50,94 12,72 12,28"
        stroke="#488085"
        strokeWidth="3.5"
        fill="#111415"
      />

      {/* 3D Wireframe / Isometric Axis Lines */}
      <line x1="50" y1="6" x2="50" y2="28" stroke="#3A4048" strokeWidth="2" />
      <line x1="88" y1="28" x2="69" y2="39" stroke="#3A4048" strokeWidth="2" />
      <line x1="88" y1="72" x2="69" y2="61" stroke="#3A4048" strokeWidth="2" />
      <line x1="50" y1="94" x2="50" y2="72" stroke="#3A4048" strokeWidth="2" />
      <line x1="12" y1="72" x2="31" y2="61" stroke="#3A4048" strokeWidth="2" />
      <line x1="12" y1="28" x2="31" y2="39" stroke="#3A4048" strokeWidth="2" />

      {/* Middle dashed circle (Teal) */}
      <circle
        cx="50"
        cy="50"
        r="24"
        stroke="#488085"
        strokeWidth="2"
        strokeDasharray="4 3"
      />

      {/* Inner Hexagon (Bronze/Amber) */}
      <polygon
        points="50,28 69,39 69,61 50,72 31,61 31,39"
        stroke="#bd8364"
        strokeWidth="2.5"
        fill="none"
      />

      {/* Center Core Circle (Teal) */}
      <circle
        cx="50"
        cy="50"
        r="9"
        fill="#488085"
      />
    </svg>
  );
}
