import React, { createContext, useContext, useState } from 'react';
import { MOIL_MINES } from '../api/client';

const MineContext = createContext(null);

export function MineProvider({ children }) {
  const [selectedMineId, setSelectedMineId] = useState('balaghat');
  const [selectedSector, setSelectedSector] = useState('MANGANESE BELT SECTOR 04');
  const [selectedCell, setSelectedCell] = useState(null);
  const [layerVisibility, setLayerVisibility] = useState({
    prospectivity: true,
    ndvi: true,
    soilMoisture: false,
    borehole: true,
    magRad: false,
  });

  const selectedMine = MOIL_MINES.find((m) => m.id === selectedMineId) || MOIL_MINES[0];

  const toggleLayer = (layerKey) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  const selectMine = (mineId) => {
    setSelectedMineId(mineId);
    setSelectedCell(null);
  };

  const value = {
    mines: MOIL_MINES,
    selectedMineId,
    selectedMine,
    selectedSector,
    setSelectedSector,
    selectedCell,
    setSelectedCell,
    layerVisibility,
    toggleLayer,
    selectMine,
    telemetry: {
      cycle: '2025.10-M04',
      runId: 'SIH-ML-9081-FUSED',
      sentinelPass: '04:20Z',
      weatherHazard: 'Monsoon Decay (Pit 3)',
      sysStatus: 'ONLINE',
      syncTime: '04:20Z',
      networkLatency: '32ms',
    },
  };

  return <MineContext.Provider value={value}>{children}</MineContext.Provider>;
}

export function useMine() {
  const context = useContext(MineContext);
  if (!context) {
    throw new Error('useMine must be used within a MineProvider');
  }
  return context;
}
