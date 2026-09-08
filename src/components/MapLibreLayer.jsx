import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import '@maplibre/maplibre-gl-leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapLibreLayer({ styleUrl, apiKey, onError }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let glLayer = null;
    try {
      if (typeof L.maplibreGL === 'function') {
        glLayer = L.maplibreGL({
          style: styleUrl,
          maplibreOptions: {
            transformRequest: (url) => {
              if (url.includes('basemaps.cartocdn.com') && !url.includes('key=')) {
                const sep = url.includes('?') ? '&' : '?';
                return { url: `${url}${sep}key=${apiKey}` };
              }
              return { url };
            },
          },
        });
        glLayer.addTo(map);
      } else {
        if (onError) onError(new Error('L.maplibreGL is not available'));
      }
    } catch (err) {
      console.warn('MapLibre GL Vector layer error, falling back to raster:', err);
      if (onError) onError(err);
    }

    return () => {
      if (glLayer && map) {
        try {
          map.removeLayer(glLayer);
        } catch (e) {
          // ignore cleanup error
        }
      }
    };
  }, [map, styleUrl, apiKey, onError]);

  return null;
}
