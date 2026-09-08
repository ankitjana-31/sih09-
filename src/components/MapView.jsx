import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Circle, Marker, Tooltip, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import MapLibreLayer from './MapLibreLayer';
import { useMine } from '../store/mineStore';
import { getReserveMap } from '../api/client';
import EvidenceBreakdown from './EvidenceBreakdown';
import {
  Search,
  Compass,
  Plus,
  Minus,
  MapPin,
  Satellite,
  Layers,
  Box,
  Check,
  X,
  Zap,
  Globe,
  CheckCircle2,
} from 'lucide-react';

// Default India Manganese Belt Coordinates
const INDIA_CENTER = [21.8, 79.8];
const INDIA_ZOOM = 6;
const REGIONAL_ZOOM = 10;
const MINE_ZOOM = 14.5;

// Authenticated CARTO API Key provided by user
const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY || 'cb1_30qh_1_ba70bb74dca1ab39e3880072';

// Vector Basemap Styles (rendered via MapLibre GL Layer in Leaflet)
const VECTOR_STYLES = {
  dark: {
    id: 'dark',
    name: 'DARK MATTER',
    styleUrl: `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json?key=${CARTO_API_KEY}`,
    attribution: '&copy; CARTO &copy; OpenStreetMap',
  },
  voyager: {
    id: 'voyager',
    name: 'VOYAGER',
    styleUrl: `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json?key=${CARTO_API_KEY}`,
    attribution: '&copy; CARTO &copy; OpenStreetMap',
  },
  positron: {
    id: 'positron',
    name: 'POSITRON',
    styleUrl: `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json?key=${CARTO_API_KEY}`,
    attribution: '&copy; CARTO &copy; OpenStreetMap',
  },
};

// Raster Basemap Presets (rendered via Leaflet TileLayer with retina support)
const RASTER_PRESETS = {
  dark: {
    id: 'dark',
    name: 'DARK MATTER',
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
    attribution: '&copy; CARTO &copy; OpenStreetMap',
    subdomains: 'abcd',
    maxZoom: 19,
  },
  voyager: {
    id: 'voyager',
    name: 'VOYAGER',
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
    attribution: '&copy; CARTO &copy; OpenStreetMap',
    subdomains: 'abcd',
    maxZoom: 19,
  },
  positron: {
    id: 'positron',
    name: 'POSITRON',
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
    attribution: '&copy; CARTO &copy; OpenStreetMap',
    subdomains: 'abcd',
    maxZoom: 19,
  },
  satellite: {
    id: 'satellite',
    name: 'SATELLITE',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; DigitalGlobe, GeoEye, Earthstar',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 18,
  },
  shadedRelief: {
    id: 'shadedRelief',
    name: '3D SHADED RELIEF',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri &copy; USGS, AeroGRID, IGN, IGP',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 17,
  },
};

// Deterministic Balaghat 500m Subsurface Mine Grid Mock Generator
const BALAGHAT_GRID_DATA = [
  [
    { id: 'BG-671', score: 0.311, isSparse: false, conf: 0.54 },
    { id: 'BG-672', score: 0.220, isSparse: true, conf: 0.32 },
    { id: 'BG-673', score: 0.318, isSparse: false, conf: 0.58 },
    { id: 'BG-674', score: 0.887, isSparse: false, conf: 0.86 },
    { id: 'BG-675', score: 0.250, isSparse: true, conf: 0.31 },
    { id: 'BG-676', score: 0.193, isSparse: false, conf: 0.45 },
    { id: 'BG-677', score: 0.125, isSparse: false, conf: 0.39 },
  ],
  [
    { id: 'BG-686', score: 0.284, isSparse: false, conf: 0.52 },
    { id: 'BG-687', score: 0.693, isSparse: false, conf: 0.77 },
    { id: 'BG-688', score: 0.678, isSparse: false, conf: 0.76 },
    { id: 'BG-689', score: 0.795, isSparse: false, conf: 0.84 },
    { id: 'BG-690', score: 0.821, isSparse: false, conf: 0.85 },
    { id: 'BG-691', score: 0.813, isSparse: false, conf: 0.83 },
    { id: 'BG-692', score: 0.210, isSparse: true, conf: 0.34 },
  ],
  [
    { id: 'BG-701', score: 0.228, isSparse: false, conf: 0.49 },
    { id: 'BG-702', score: 0.540, isSparse: false, conf: 0.71 },
    { id: 'BG-703', score: 0.742, isSparse: false, conf: 0.81 },
    { id: 'BG-704', score: 0.914, isSparse: false, conf: 0.882, isApex: true },
    { id: 'BG-705', score: 0.821, isSparse: false, conf: 0.85 },
    { id: 'BG-706', score: 0.613, isSparse: false, conf: 0.74 },
    { id: 'BG-707', score: 0.349, isSparse: false, conf: 0.61 },
  ],
  [
    { id: 'BG-716', score: 0.272, isSparse: false, conf: 0.51 },
    { id: 'BG-717', score: 0.396, isSparse: false, conf: 0.63 },
    { id: 'BG-718', score: 0.683, isSparse: false, conf: 0.76 },
    { id: 'BG-719', score: 0.698, isSparse: false, conf: 0.87 },
    { id: 'BG-720', score: 0.598, isSparse: false, conf: 0.72 },
    { id: 'BG-721', score: 0.240, isSparse: true, conf: 0.33 },
    { id: 'BG-722', score: 0.218, isSparse: false, conf: 0.48 },
  ],
  [
    { id: 'BG-731', score: 0.214, isSparse: false, conf: 0.46 },
    { id: 'BG-732', score: 0.180, isSparse: false, conf: 0.42 },
    { id: 'BG-733', score: 0.275, isSparse: false, conf: 0.50 },
    { id: 'BG-734', score: 0.382, isSparse: false, conf: 0.62 },
    { id: 'BG-735', score: 0.241, isSparse: false, conf: 0.49 },
    { id: 'BG-736', score: 0.143, isSparse: false, conf: 0.38 },
    { id: 'BG-737', score: 0.190, isSparse: true, conf: 0.30 },
  ],
];

function generateLocalMineGeoJson(mine) {
  const baseLat = mine?.lat || 21.8706;
  const baseLng = mine?.lng || 80.1967;
  const prefix = mine?.id === 'balaghat' ? 'BG' : mine?.id === 'gumgaon' ? 'GM' : mine?.id === 'dongri_buzurg' ? 'DB' : 'UK';
  const cellSize = 0.0045; // roughly 500m
  const rows = 5;
  const cols = 7;
  const startRow = 2;
  const startCol = 3;

  const features = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const item = BALAGHAT_GRID_DATA[r][c];
      const isApex = item.isApex || (r === 2 && c === 3);
      const cell_id = mine?.id === 'balaghat' ? item.id : `${prefix}-${671 + r * 15 + c}`;
      const cellLat = baseLat + (r - startRow) * cellSize;
      const cellLng = baseLng + (c - startCol) * cellSize;
      const half = cellSize / 2;

      const polygonCoords = [
        [
          [cellLng - half, cellLat - half],
          [cellLng + half, cellLat - half],
          [cellLng + half, cellLat + half],
          [cellLng - half, cellLat + half],
          [cellLng - half, cellLat - half],
        ],
      ];

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: polygonCoords,
        },
        properties: {
          cell_id,
          score: item.score,
          confidence: item.conf,
          evidence_flag: item.isSparse ? 'LOW_EVIDENCE' : 'OK',
          breakdown: {
            geological: isApex ? 0.942 : 0.74,
            spectral: isApex ? 0.865 : 0.68,
            structural: isApex ? 0.865 : 0.62,
            borehole: isApex ? 0.898 : item.isSparse ? 0 : 0.71,
            geophysical: isApex ? 0.724 : item.isSparse ? 0 : 0.58,
            environmental: 0.84,
          },
          validation_status: item.isSparse ? 'SPARSE' : 'EVIDENCED',
          model_version: 'v4.2.1-fused',
          center: [cellLat, cellLng],
          isApex,
          strike_azimuth: mine?.strike || 'N62°E',
          lithology: item.isSparse ? 'Undifferentiated Biotite Schist' : 'Gondite-hosted Manganese Ore Intercept',
          drillhole_ref: item.isSparse ? 'NONE (Unperforated)' : `DH-${prefix}-2024-${80 + c}: 42.6% Mn @ 84mRL`,
        },
      });
    }
  }

  return {
    type: 'FeatureCollection',
    features,
    metadata: {
      mine_id: mine?.id || 'balaghat',
      mine_name: mine?.name || 'Balaghat Mine',
      center: [baseLat, baseLng],
      apex_cell_id: mine?.id === 'balaghat' ? 'BG-704' : `${prefix}-704`,
      model_version: 'XGB-Ensemble v4.2.1',
      resolution: '500m x 500m Subsurface Block',
    },
  };
}

// Animated Camera Controller
function MapCameraController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [center?.[0], center?.[1], zoom, map]);
  return null;
}

// Map Resizer to ensure proper rendering across container sizes
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  return null;
}

// Minimalist Drillhole Collar Icon (Cyan glowing pin)
const createBoreholePinIcon = () => {
  return L.divIcon({
    className: 'custom-bh-pin',
    html: `
      <div style="width: 8px; height: 8px; margin-left: -4px; margin-top: -4px;" class="rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] border border-white"></div>
    `,
    iconSize: [8, 8],
    iconAnchor: [4, 4],
  });
};

// Tactical Apex Reticle Icon in Center of BG-704
const createApexReticleIcon = () => {
  return L.divIcon({
    className: 'apex-reticle-icon',
    html: `
      <div style="position: relative; width: 28px; height: 28px; margin-left: -14px; margin-top: -14px; pointer-events: none;">
        <div style="position: absolute; inset: 0; border: 1.5px dashed #00e5ff; border-radius: 50%;" class="animate-spin-slow"></div>
        <div style="position: absolute; inset: 4px; border: 1px solid #00e5ff; border-radius: 50%; opacity: 0.8;"></div>
        <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #00e5ff; transform: translateY(-50%);"></div>
        <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: #00e5ff; transform: translateX(-50%);"></div>
        <div style="position: absolute; inset: 9px; background: #00e5ff; border-radius: 50%; box-shadow: 0 0 10px #00e5ff;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Radius Distance Tag Badge Icon (Along outer decay ring)
const createRadiusTagIcon = () => {
  return L.divIcon({
    className: 'radius-tag-icon',
    html: `
      <div style="transform: translate(-50%, -50%);" class="px-2 py-0.5 bg-[#111415]/95 border border-[#00e5ff]/70 rounded text-[8.5px] text-[#00e5ff] font-mono whitespace-nowrap shadow-2xl backdrop-blur-md flex items-center gap-1.5 pointer-events-none">
        <span class="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-ping"></span>
        <span class="font-bold tracking-wider">PROSPECTIVITY DECAY RADIUS: 1,150M</span>
      </div>
    `,
    iconSize: [0, 0],
  });
};

// Cell ID & Score Text Label Icon (Placed in Center of Each 500m Grid Cell)
const createCellLabelIcon = (cellId, score, isSparse, isApex, isTeal, isCopper) => {
  const scoreText = isSparse ? 'sparse' : (score * 100).toFixed(1);

  let scoreColor = '#6b7280';
  let cellIdColor = '#8B939C';

  if (isApex) {
    scoreColor = '#00e5ff';
    cellIdColor = '#FFFFFF';
  } else if (isTeal) {
    scoreColor = '#22d3ee';
    cellIdColor = '#e2e8f0';
  } else if (isCopper) {
    scoreColor = '#fbbf24';
    cellIdColor = '#f3f4f6';
  } else if (isSparse) {
    scoreColor = '#9ca3af';
    cellIdColor = '#6b7280';
  }

  return L.divIcon({
    className: 'custom-cell-label',
    html: `
      <div style="transform: translate(-30px, -16px); width: 60px; height: 32px; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; user-select: none;">
        <span style="font-family: monospace; font-size: 8px; line-height: 1; color: ${cellIdColor}; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${cellId}</span>
        <span style="font-family: monospace; font-size: 10.5px; line-height: 1.2; font-weight: 800; color: ${scoreColor}; font-style: ${isSparse ? 'italic' : 'normal'}; text-shadow: 0 1px 3px rgba(0,0,0,0.9);">${scoreText}</span>
      </div>
    `,
    iconSize: [0, 0],
  });
};

// Floating Navigation & Zoom Controls
function FloatingNavControls({ onFlyIndia, onFlyMine }) {
  const map = useMap();
  return (
    <div className="absolute top-4 right-4 z-[400] flex flex-col gap-1.5 select-none">
      <button
        onClick={() => map.zoomIn()}
        className="w-7 h-7 bg-[#111415]/90 hover:bg-[#282a2b] border border-[#3A4048] text-[#EDEFF1] rounded flex items-center justify-center transition-colors shadow-lg cursor-pointer"
        title="Zoom in"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-7 h-7 bg-[#111415]/90 hover:bg-[#282a2b] border border-[#3A4048] text-[#EDEFF1] rounded flex items-center justify-center transition-colors shadow-lg cursor-pointer"
        title="Zoom out"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onFlyIndia}
        className="w-7 h-7 bg-[#111415]/90 hover:bg-[#282a2b] border border-[#3A4048] text-[#EDEFF1] hover:text-[#00e5ff] rounded flex items-center justify-center transition-colors shadow-lg cursor-pointer"
        title="Reset to India Overview"
      >
        <Compass className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onFlyMine}
        className="w-7 h-7 bg-[#111415]/90 hover:bg-[#282a2b] border border-[#3A4048] text-[#EDEFF1] hover:text-[#00e5ff] rounded flex items-center justify-center transition-colors shadow-lg cursor-pointer"
        title="Center on Mine Sub-grid"
      >
        <Layers className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function MapView({ onCellSelect }) {
  const {
    mines,
    selectedMineId,
    selectMine,
    selectedMine,
    layerVisibility,
    toggleLayer,
  } = useMine();

  // Basemap engine mode: 'vector' (MapLibre GL Vector Tiles) vs 'raster' (TileLayer)
  const [basemapMode, setBasemapMode] = useState('raster');
  const [activeBasemap, setActiveBasemap] = useState('dark');
  const [is3DMode, setIs3DMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Deterministic fake data fallback so Balaghat mine grid always renders immediately
  const [reserveGeoJson, setReserveGeoJson] = useState(() => generateLocalMineGeoJson(selectedMine));
  const [inspectedCell, setInspectedCell] = useState(() => {
    const init = generateLocalMineGeoJson(selectedMine);
    return init.features.find((f) => f.properties.isApex)?.properties || null;
  });
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([selectedMine.lat, selectedMine.lng]);
  const [mapZoom, setMapZoom] = useState(MINE_ZOOM);
  const [activeViewMode, setActiveViewMode] = useState('grid');

  // Subheader layer toggles
  const [ndviActive, setNdviActive] = useState(true);
  const [magRadActive, setMagRadActive] = useState(false);
  const [radiusActive, setRadiusActive] = useState(true);

  const searchContainerRef = useRef(null);

  // Outside click for search dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search list of MOIL mines
  const filteredMines = useMemo(() => {
    if (!searchQuery.trim()) return mines;
    const q = searchQuery.toLowerCase();
    return mines.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.sector.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q)
    );
  }, [mines, searchQuery]);

  // Synchronize map center when selected mine changes
  useEffect(() => {
    setMapCenter([selectedMine.lat, selectedMine.lng]);
    setMapZoom(MINE_ZOOM);
    setActiveViewMode('grid');
  }, [selectedMineId, selectedMine.lat, selectedMine.lng]);

  // Load Reserve GeoJSON with guaranteed fallback to Balaghat grid
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getReserveMap(selectedMineId)
      .then((data) => {
        if (isMounted && data?.features?.length) {
          setReserveGeoJson(data);
          const apex = data.features.find((f) => f.properties.isApex);
          if (apex) {
            setInspectedCell(apex.properties);
            if (onCellSelect) onCellSelect(apex.properties);
          }
        }
      })
      .catch((err) => {
        console.warn('API map fetch failed, using deterministic local mine reserve grid:', err);
        if (isMounted) {
          const fallbackData = generateLocalMineGeoJson(selectedMine);
          setReserveGeoJson(fallbackData);
          const apex = fallbackData.features.find((f) => f.properties.isApex);
          if (apex) {
            setInspectedCell(apex.properties);
            if (onCellSelect) onCellSelect(apex.properties);
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMineId, selectedMine]);

  // Handle place selection in search bar -> Auto zoom to place and mining area!
  const handleSelectPlace = (mine) => {
    selectMine(mine.id);
    setSearchQuery(mine.name);
    setIsSearchOpen(false);
    setMapCenter([mine.lat, mine.lng]);
    setMapZoom(MINE_ZOOM);
    setActiveViewMode('grid');
  };

  // Navigation handlers
  const handleFlyToIndia = () => {
    setMapCenter(INDIA_CENTER);
    setMapZoom(INDIA_ZOOM);
    setActiveViewMode('india');
  };

  const handleFlyToRegional = () => {
    setMapCenter([selectedMine.lat, selectedMine.lng]);
    setMapZoom(REGIONAL_ZOOM);
    setActiveViewMode('regional');
  };

  const handleFlyToGrid = () => {
    setMapCenter([selectedMine.lat, selectedMine.lng]);
    setMapZoom(MINE_ZOOM);
    setActiveViewMode('grid');
  };

  // Find apex cell
  const apexFeature = useMemo(() => {
    if (!reserveGeoJson?.features) return null;
    return reserveGeoJson.features.find((f) => f.properties.isApex);
  }, [reserveGeoJson]);

  // Style calculator for subsurface 500m grid cells (translucent glow for clarity)
  const getCellStyle = (properties, isSelected) => {
    const { cell_id, score, evidence_flag, isApex } = properties;
    const isLowEvidence = evidence_flag === 'LOW_EVIDENCE';

    // Apex high target cell (BG-704)
    if (isApex || cell_id === 'BG-704') {
      return {
        fillColor: '#00e5ff',
        fillOpacity: isSelected ? 0.75 : 0.48,
        color: isSelected ? '#ffffff' : '#00e5ff',
        weight: isSelected ? 3 : 2.5,
      };
    }

    // Sparse borehole cells
    if (isLowEvidence) {
      return {
        fillColor: '#14181a',
        fillOpacity: 0.35,
        color: isSelected ? '#00e5ff' : '#4b5563',
        weight: isSelected ? 2 : 1,
        dashArray: '3, 4',
      };
    }

    // Teal / Cyan cluster (High prospectivity around apex)
    const isTealCluster =
      ['BG-689', 'BG-690', 'BG-691', 'BG-703', 'BG-705', 'BG-719'].includes(cell_id) ||
      (score >= 0.70 && !['BG-674', 'BG-687', 'BG-688', 'BG-718'].includes(cell_id));

    if (isTealCluster) {
      return {
        fillColor: '#1096a5',
        fillOpacity: isSelected ? 0.70 : 0.40,
        color: isSelected ? '#ffffff' : '#22d3ee',
        weight: isSelected ? 2.5 : 1.5,
      };
    }

    // Warm Amber / Copper Orange cluster
    const isCopperAmberCluster =
      ['BG-674', 'BG-687', 'BG-688', 'BG-702', 'BG-706', 'BG-717', 'BG-718', 'BG-720', 'BG-734'].includes(cell_id) ||
      (score >= 0.38 && score < 0.70);

    if (isCopperAmberCluster) {
      return {
        fillColor: '#c8732d',
        fillOpacity: isSelected ? 0.72 : 0.42,
        color: isSelected ? '#ffffff' : '#e58e3c',
        weight: isSelected ? 2.5 : 1.5,
      };
    }

    // Sterile / Low Background (< 0.38)
    return {
      fillColor: '#181e22',
      fillOpacity: isSelected ? 0.6 : 0.35,
      color: isSelected ? '#00e5ff' : '#2d373d',
      weight: isSelected ? 2 : 1,
    };
  };

  const currentRasterBasemap = RASTER_PRESETS[activeBasemap] || RASTER_PRESETS.dark;
  const currentVectorStyle = VECTOR_STYLES[activeBasemap] || VECTOR_STYLES.dark;
  const mineIndex = mines.findIndex((m) => m.id === selectedMineId);

  // State boundary line coordinates (subtle dashed vector line near Balaghat)
  const stateBoundaryCoords = useMemo(() => {
    const lat = selectedMine.lat - 0.007;
    const lng = selectedMine.lng;
    return [
      [lat - 0.005, lng - 0.03],
      [lat, lng - 0.01],
      [lat + 0.003, lng + 0.01],
      [lat + 0.008, lng + 0.035],
    ];
  }, [selectedMine.lat, selectedMine.lng]);

  return (
    <div className="relative w-full h-full bg-[#0c0f0f] overflow-hidden flex flex-col font-mono select-none">
      {/* Top HUD Subheader matching Google Stitch prototype */}
      <div className="bg-[#111415] border-b border-[#282a2b] px-4 py-2 flex flex-col gap-2 z-20 flex-shrink-0">
        {/* Row 1: Mine selector badge + Interactive Search Bar + Scale Buttons + 3D Toggle */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Active Mine Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#191c1d] border border-[#282a2b] rounded text-xs shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-[#c8732d]" />
            <span className="font-bold text-[#EDEFF1] tracking-wider uppercase">
              {selectedMine.name}, {selectedMine.state === 'Madhya Pradesh' ? 'MP' : 'MH'} [{selectedMine.sector.toUpperCase()}]
            </span>
            <span className="text-[10px] text-[#8B939C] bg-[#111415] px-1.5 py-0.5 rounded border border-[#282a2b] font-semibold">
              {mineIndex !== -1 ? mineIndex + 1 : 1} OF {mines.length}
            </span>
            <span className="hidden sm:inline text-[10px] text-[#8B939C] border-l border-[#282a2b] pl-2 font-mono">
              {selectedMine.lat.toFixed(4)}°N, {selectedMine.lng.toFixed(4)}°E
            </span>
          </div>

          {/* Center: Search Bar with Auto-Zoom on Place Selection */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md min-w-[240px]">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-[#00e5ff] pointer-events-none" />
              <input
                type="text"
                placeholder="Search MOIL mine or area (e.g. Balaghat, Ukwa, Gumgaon)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full bg-[#191c1d] hover:bg-[#1d2021] border border-[#3A4048] focus:border-[#00e5ff] rounded text-xs text-[#EDEFF1] pl-8 pr-7 py-1 focus:outline-none focus:ring-1 focus:ring-[#00e5ff] transition-all placeholder:text-[#8B939C]/70 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-[#8B939C] hover:text-[#EDEFF1] p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Auto-suggest Search Dropdown */}
            {isSearchOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#111415]/95 border border-[#3A4048] rounded shadow-2xl z-[500] max-h-60 overflow-y-auto backdrop-blur-md divide-y divide-[#282a2b]">
                <div className="p-1.5 text-[9px] text-[#8B939C] uppercase font-bold tracking-wider bg-[#191c1d] flex items-center justify-between">
                  <span>SELECT MINING ASSET TO AUTO-ZOOM</span>
                  <span className="text-[8px] text-[#00e5ff]">AUTO-ZOOM ACTIVE</span>
                </div>
                {filteredMines.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectPlace(m)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#191c1d] transition-colors cursor-pointer ${
                      m.id === selectedMineId ? 'bg-[#488085]/20 text-[#00e5ff]' : 'text-[#EDEFF1]'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#c8732d]" />
                        <span>{m.name}</span>
                        {m.id === selectedMineId && (
                          <span className="text-[9px] bg-[#00e5ff]/20 text-[#00e5ff] px-1 py-0.2 rounded border border-[#00e5ff]/40">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#8B939C] mt-0.5">
                        {m.sector} • {m.type}
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-[#8B939C] font-mono">
                      {m.lat.toFixed(4)}°N, {m.lng.toFixed(4)}°E
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Scale Buttons & 3D Perspective Toggle */}
          <div className="flex items-center gap-2">
            {/* 3D Background Effect Toggle */}
            <button
              onClick={() => setIs3DMode(!is3DMode)}
              className={`px-2.5 py-1 rounded text-xs border flex items-center gap-1.5 transition-all cursor-pointer ${
                is3DMode
                  ? 'bg-[#00e5ff]/15 border-[#00e5ff] text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                  : 'bg-[#191c1d] border-[#282a2b] text-[#8B939C] hover:text-[#EDEFF1]'
              }`}
              title="Toggle 3D Terrain Perspective Angle (12° oblique)"
            >
              <Box className="w-3 h-3" />
              <span className="font-bold">{is3DMode ? '3D PERSPECTIVE' : '2D NADIR'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${is3DMode ? 'bg-[#00e5ff] animate-pulse' : 'bg-[#8B939C]'}`} />
            </button>

            {/* Scale View Selectors */}
            <div className="flex items-center border border-[#282a2b] rounded overflow-hidden text-xs font-mono">
              <button
                onClick={handleFlyToIndia}
                className={`px-2.5 py-1 transition-colors cursor-pointer ${
                  activeViewMode === 'india'
                    ? 'bg-[#488085] text-[#111415] font-bold'
                    : 'bg-[#191c1d] text-[#8B939C] hover:text-[#EDEFF1]'
                }`}
              >
                [A] INDIA BELT
              </button>
              <button
                onClick={handleFlyToRegional}
                className={`px-2.5 py-1 border-l border-[#282a2b] transition-colors cursor-pointer ${
                  activeViewMode === 'regional'
                    ? 'bg-[#488085] text-[#111415] font-bold'
                    : 'bg-[#191c1d] text-[#8B939C] hover:text-[#EDEFF1]'
                }`}
              >
                [B] REGIONAL
              </button>
              <button
                onClick={handleFlyToGrid}
                className={`px-2.5 py-1 border-l border-[#282a2b] transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeViewMode === 'grid'
                    ? 'bg-[#488085]/30 text-[#00e5ff] font-bold border-l border-[#00e5ff]/50'
                    : 'bg-[#191c1d] text-[#8B939C] hover:text-[#EDEFF1]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse" />
                <span>[C] 500M SUB-GRID</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Layer Checkboxes + Basemap Mode Switcher (Vector vs Raster) */}
        <div className="flex items-center justify-between text-xs text-[#bfc8c9] flex-wrap gap-2 pt-1 border-t border-[#282a2b]/60">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={layerVisibility.prospectivity}
                onChange={() => toggleLayer('prospectivity')}
                className="w-3.5 h-3.5 accent-[#00e5ff] bg-[#111415] rounded cursor-pointer"
              />
              <span className="font-bold text-[#00e5ff]">500M ML GRID</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={radiusActive}
                onChange={() => setRadiusActive(!radiusActive)}
                className="w-3.5 h-3.5 accent-[#00e5ff] bg-[#111415] rounded cursor-pointer"
              />
              <span className="font-bold text-[#EDEFF1]">1.1KM DECAY RADIUS</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={layerVisibility.borehole}
                onChange={() => toggleLayer('borehole')}
                className="w-3.5 h-3.5 accent-[#00e5ff] bg-[#111415] rounded cursor-pointer"
              />
              <span className="font-bold text-[#EDEFF1]">BOREHOLE COLLARS</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={ndviActive}
                onChange={() => setNdviActive(!ndviActive)}
                className="w-3.5 h-3.5 accent-[#00e5ff] bg-[#111415] rounded cursor-pointer"
              />
              <span className="font-medium text-[#EDEFF1]">NDVI</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#8B939C]">
              <input
                type="checkbox"
                checked={magRadActive}
                onChange={() => setMagRadActive(!magRadActive)}
                className="w-3.5 h-3.5 accent-[#00e5ff] bg-[#111415] rounded cursor-pointer"
              />
              <span className="font-medium">MAG/RAD</span>
            </label>
          </div>

          {/* Sleek Basemap Engine & Style Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Authenticated CARTO API Key Indicator */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded text-[9.5px] bg-[#191c1d] border border-[#282a2b] text-[#8B939C]"
              title={`CARTO API Key authenticated: ${CARTO_API_KEY}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[#10b981] font-semibold">CARTO AUTH: OK</span>
              <span className="text-[#8B939C] font-mono">({CARTO_API_KEY.substring(0, 8)}...)</span>
            </div>

            {/* Vector vs Raster Mode Segmented Toggle */}
            <div className="flex items-center border border-[#282a2b] rounded overflow-hidden text-[10px] font-mono">
              <button
                onClick={() => setBasemapMode('vector')}
                className={`px-2 py-0.5 flex items-center gap-1 transition-colors cursor-pointer ${
                  basemapMode === 'vector'
                    ? 'bg-[#00e5ff]/20 text-[#00e5ff] font-bold border-r border-[#00e5ff]/40'
                    : 'bg-[#111415] text-[#8B939C] hover:text-[#EDEFF1]'
                }`}
                title="Use CARTO Vector Basemap Tiles via MapLibre GL"
              >
                <Zap className="w-2.5 h-2.5 text-[#00e5ff]" />
                VECTOR (GL)
              </button>
              <button
                onClick={() => setBasemapMode('raster')}
                className={`px-2 py-0.5 transition-colors cursor-pointer ${
                  basemapMode === 'raster'
                    ? 'bg-[#1d2021] text-[#00e5ff] font-bold'
                    : 'bg-[#111415] text-[#8B939C] hover:text-[#EDEFF1]'
                }`}
                title="Use Authenticated CARTO & Esri Raster Tiles"
              >
                RASTER
              </button>
            </div>

            {/* Basemap Style Presets Switcher */}
            <div className="flex items-center border border-[#282a2b] rounded overflow-hidden text-[10px]">
              <button
                onClick={() => setActiveBasemap('dark')}
                className={`px-2 py-0.5 transition-colors cursor-pointer ${
                  activeBasemap === 'dark' ? 'bg-[#1d2021] text-[#00e5ff] font-bold' : 'bg-[#111415] text-[#8B939C]'
                }`}
              >
                DARK
              </button>
              <button
                onClick={() => setActiveBasemap('voyager')}
                className={`px-2 py-0.5 border-l border-[#282a2b] transition-colors cursor-pointer ${
                  activeBasemap === 'voyager' ? 'bg-[#1d2021] text-[#00e5ff] font-bold' : 'bg-[#111415] text-[#8B939C]'
                }`}
              >
                VOYAGER
              </button>
              <button
                onClick={() => setActiveBasemap('positron')}
                className={`px-2 py-0.5 border-l border-[#282a2b] transition-colors cursor-pointer ${
                  activeBasemap === 'positron' ? 'bg-[#1d2021] text-[#00e5ff] font-bold' : 'bg-[#111415] text-[#8B939C]'
                }`}
              >
                POSITRON
              </button>
              <button
                onClick={() => {
                  setActiveBasemap('satellite');
                  setBasemapMode('raster'); // Satellite is raster imagery
                }}
                className={`px-2 py-0.5 border-l border-[#282a2b] transition-colors flex items-center gap-1 cursor-pointer ${
                  activeBasemap === 'satellite' ? 'bg-[#1d2021] text-[#00e5ff] font-bold' : 'bg-[#111415] text-[#8B939C]'
                }`}
              >
                <Satellite className="w-2.5 h-2.5 text-[#c8732d]" />
                SATELLITE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Left Map Container + Right Docked Target Evidence Inspector */}
      <div className="relative flex-1 w-full flex overflow-hidden">
        {/* Left Map View with 3D perspective container */}
        <div className={`relative flex-1 h-full overflow-hidden map-3d-wrapper ${is3DMode ? 'is-3d' : 'is-2d'}`}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            zoomControl={false}
            className="w-full h-full"
            style={{ background: '#0c0f0f' }}
          >
            {/* Reactive Camera & Resize Handlers */}
            <MapCameraController center={mapCenter} zoom={mapZoom} />
            <MapResizer />

            {/* Basemap Rendering: Vector (MapLibre GL) or Raster (Leaflet TileLayer) */}
            {basemapMode === 'vector' && activeBasemap !== 'satellite' && activeBasemap !== 'shadedRelief' ? (
              <MapLibreLayer
                key={`vector-${activeBasemap}`}
                styleUrl={currentVectorStyle.styleUrl}
                apiKey={CARTO_API_KEY}
                onError={() => {
                  console.warn('Vector basemap encountered an error, falling back to raster.');
                  setBasemapMode('raster');
                }}
              />
            ) : (
              <TileLayer
                key={`raster-${currentRasterBasemap.id}`}
                attribution={currentRasterBasemap.attribution}
                url={currentRasterBasemap.url}
                maxZoom={currentRasterBasemap.maxZoom}
                subdomains={currentRasterBasemap.subdomains}
              />
            )}

            {/* 3D Shaded Relief / Hillshade Layer for 3D Topographic Terrain Effect */}
            <TileLayer
              key="shaded-relief-layer"
              url={RASTER_PRESETS.shadedRelief.url}
              opacity={is3DMode ? 0.35 : 0.15}
              maxZoom={17}
              subdomains={RASTER_PRESETS.shadedRelief.subdomains}
            />

            {/* Subsurface 500m Grid Cells (Prospectivity ML Layer) */}
            {layerVisibility.prospectivity &&
              reserveGeoJson?.features?.map((feature) => {
                const { cell_id, score, evidence_flag, isApex } = feature.properties;
                const isLowEvidence = evidence_flag === 'LOW_EVIDENCE';
                const coords = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
                const isSelected = inspectedCell?.cell_id === cell_id;
                const style = getCellStyle(feature.properties, isSelected);

                const isTeal =
                  ['BG-689', 'BG-690', 'BG-691', 'BG-703', 'BG-705', 'BG-719'].includes(cell_id) ||
                  (score >= 0.70 && !['BG-674', 'BG-687', 'BG-688', 'BG-718'].includes(cell_id));
                const isCopper =
                  ['BG-674', 'BG-687', 'BG-688', 'BG-702', 'BG-706', 'BG-717', 'BG-718', 'BG-720', 'BG-734'].includes(cell_id) ||
                  (score >= 0.38 && score < 0.70);

                return (
                  <React.Fragment key={cell_id}>
                    <Polygon
                      positions={coords}
                      pathOptions={style}
                      eventHandlers={{
                        click: () => {
                          setInspectedCell(feature.properties);
                          if (onCellSelect) onCellSelect(feature.properties);
                        },
                      }}
                    />

                    {/* Numeric and ID Label in Center of Cell */}
                    <Marker
                      position={feature.properties.center}
                      interactive={false}
                      icon={createCellLabelIcon(cell_id, score, isLowEvidence, isApex, isTeal, isCopper)}
                    />
                  </React.Fragment>
                );
              })}

            {/* Concentric Probability Radius Rings */}
            {radiusActive && apexFeature && layerVisibility.prospectivity && (
              <>
                {/* Inner Probability Core Ring (Radius ~380m) */}
                <Circle
                  center={apexFeature.properties.center}
                  radius={380}
                  pathOptions={{
                    color: '#00e5ff',
                    weight: 1.8,
                    dashArray: '4, 4',
                    fillColor: '#00e5ff',
                    fillOpacity: 0.08,
                  }}
                />

                {/* Outer Prospectivity Decay Ring (Radius ~1,150m) */}
                <Circle
                  center={apexFeature.properties.center}
                  radius={1150}
                  pathOptions={{
                    color: '#00e5ff',
                    weight: 1.6,
                    dashArray: '6, 8',
                    fillColor: 'transparent',
                  }}
                />

                {/* Radius Distance Tag Badge along the outer ring arc */}
                <Marker
                  position={[
                    apexFeature.properties.center[0] - 0.009,
                    apexFeature.properties.center[1] - 0.005,
                  ]}
                  interactive={false}
                  icon={createRadiusTagIcon()}
                />

                {/* Center Tactical Targeting Reticle at Apex BG-704 */}
                <Marker
                  position={apexFeature.properties.center}
                  interactive={false}
                  icon={createApexReticleIcon()}
                />

                {/* Fixed Callout HUD attached to target apex cell (BG-704) */}
                <Marker
                  position={apexFeature.properties.center}
                  interactive={true}
                  icon={L.divIcon({
                    className: 'apex-callout-hud',
                    html: `
                      <div style="transform: translate(24px, -84px); width: 230px;" class="bg-[#111415]/95 border border-[#00e5ff] rounded p-2.5 text-left shadow-2xl backdrop-blur-md pointer-events-auto">
                        <div class="text-[9.5px] font-bold text-[#00e5ff] uppercase flex items-center justify-between">
                          <span>TARGET APEX • CELL BG-704</span>
                          <span class="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping"></span>
                        </div>
                        <div class="text-[8.5px] text-[#8B939C] mt-0.5 font-mono">
                          LAT: ${apexFeature.properties.center[0].toFixed(4)}°N • LON: ${apexFeature.properties.center[1].toFixed(4)}°E • UTM 44N
                        </div>
                        <div class="mt-1.5 pt-1.5 border-t border-[#282a2b] flex items-baseline justify-between font-mono">
                          <span class="text-[9.5px] text-[#EDEFF1]">ML SCORE: <strong class="text-[#00e5ff]">91.4%</strong></span>
                          <span class="text-[8px] text-[#8B939C]">CONFIDENCE: 88.2%</span>
                        </div>
                        <div class="mt-1 text-[8px] text-[#bfc8c9] truncate font-mono">
                          Gondite Mn Ore Intercept (42.6% Mn)
                        </div>
                      </div>
                    `,
                  })}
                />
              </>
            )}

            {/* Subtle State Boundary Vector Line */}
            <Polyline
              positions={stateBoundaryCoords}
              pathOptions={{
                color: '#3A4048',
                weight: 1.5,
                dashArray: '6, 6',
              }}
            >
              <Tooltip sticky>
                <span className="text-[10px] font-mono">
                  STATE BOUNDARY: MADHYA PRADESH / MAHARASHTRA
                </span>
              </Tooltip>
            </Polyline>

            {/* Borehole Collars on Grid (Cyan dots) */}
            {layerVisibility.borehole &&
              reserveGeoJson?.features?.map((feature) => {
                const { cell_id, drillhole_ref, evidence_flag } = feature.properties;
                if (evidence_flag === 'LOW_EVIDENCE' || !drillhole_ref || drillhole_ref.startsWith('NONE')) {
                  return null;
                }
                return (
                  <Marker
                    key={`bh-${cell_id}`}
                    position={feature.properties.center}
                    icon={createBoreholePinIcon()}
                    eventHandlers={{
                      click: () => {
                        setInspectedCell(feature.properties);
                        if (onCellSelect) onCellSelect(feature.properties);
                      },
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -6]}>
                      <div className="text-[9.5px] font-mono leading-tight">
                        <div className="font-bold text-[#00e5ff]">{drillhole_ref.split(':')[0]}</div>
                        <div className="text-[#EDEFF1]">{drillhole_ref.split(':')[1] || 'Assay Confirmed'}</div>
                      </div>
                    </Tooltip>
                  </Marker>
                );
              })}

            {/* Floating Navigation Controls */}
            <FloatingNavControls
              onFlyIndia={handleFlyToIndia}
              onFlyMine={handleFlyToGrid}
            />
          </MapContainer>

          {/* 3D Atmospheric Horizon Haze Vignette Overlay */}
          {is3DMode && (
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0c0f0f]/90 via-[#0c0f0f]/30 to-transparent pointer-events-none z-[399]" />
          )}

          {/* Bottom-Left: PROSPECTIVITY INDEX SPECTRUM v4.2 matching prototype */}
          <div
            id="prospectivity-index-spectrum"
            className="absolute bottom-4 left-4 z-[1000] bg-[#111415]/95 border border-[#282a2b] p-3 rounded shadow-2xl w-84 max-w-[calc(100vw-32px)] backdrop-blur-md font-mono select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between text-[9px] pb-1.5 border-b border-[#282a2b]">
              <span className="font-bold text-[#EDEFF1] tracking-wider uppercase flex items-center gap-1.5">
                <span>PROSPECTIVITY INDEX SPECTRUM</span>
              </span>
              <span className="text-[#8B939C] text-[8.5px] font-mono bg-[#191c1d] px-1.5 py-0.2 rounded border border-[#282a2b]">
                v4.2-fused
              </span>
            </div>

            {/* Continuous Color Gradient Bar */}
            <div className="mt-2">
              <div className="w-full h-3.5 rounded bg-gradient-to-r from-[#181e22] via-[#8c6049] via-[#c8732d] via-[#1096a5] to-[#00e5ff] border border-[#3A4048] shadow-inner" />
              <div className="flex justify-between text-[8px] text-[#8B939C] mt-1 font-mono">
                <span>0 (LOW/STERILE)</span>
                <span>50 (MID-GEOLOGY)</span>
                <span className="text-[#00e5ff] font-bold">100 (HIGH APEX)</span>
              </div>
            </div>

            {/* Sub-Legend Tags */}
            <div className="mt-2.5 pt-1.5 border-t border-[#282a2b] grid grid-cols-2 gap-1.5 text-[8px] text-[#8B939C]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-[#4b5563] border border-dashed border-[#8B939C]" />
                <span>SPARSE BOREHOLE</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full border border-dashed border-[#00e5ff] bg-[#00e5ff]/20" />
                <span className="text-[#00e5ff]">1.1KM DECAY RING</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-[#c8732d]" />
                <span>AMBER HALO (38-70%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-[#1096a5]" />
                <span className="text-[#22d3ee]">TEAL CLUSTER (&gt;70%)</span>
              </span>
            </div>

            {/* Metadata Footer */}
            <div className="mt-2 pt-1 border-t border-[#282a2b]/60 flex items-center justify-between text-[7.5px] text-[#8B939C]">
              <span>500M SUB-BLOCK RESOLUTION</span>
              <span className="text-[#00e5ff]">XGB-FUSED PROSPECTIVITY</span>
            </div>
          </div>
        </div>

        {/* Right Docked Panel: TARGET EVIDENCE INSPECTOR */}
        <div className="w-[380px] xl:w-[410px] shrink-0 h-full hidden md:block">
          <EvidenceBreakdown
            cell={inspectedCell || apexFeature?.properties}
            allCells={reserveGeoJson?.features}
            onSelect={(neighborId) => {
              const f = reserveGeoJson?.features?.find((x) => x.properties.cell_id === neighborId);
              if (f) {
                setInspectedCell(f.properties);
                if (onCellSelect) onCellSelect(f.properties);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
