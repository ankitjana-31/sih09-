import React, { useState } from 'react';
import MapView from '../components/MapView';

export default function ReserveMap() {
  const [selectedCell, setSelectedCell] = useState(null);

  return (
    <div className="w-full h-full flex-1 flex flex-col font-mono select-none overflow-hidden">
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <MapView onCellSelect={setSelectedCell} />
      </div>
    </div>
  );
}
