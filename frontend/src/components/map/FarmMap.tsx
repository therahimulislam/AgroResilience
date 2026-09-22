import { useRef, useCallback, useEffect } from 'react';
import Map, { NavigationControl } from 'react-map-gl/maplibre';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'maplibre-gl/dist/maplibre-gl.css';

interface FarmMapProps {
  onPolygonDrawn: (geojson: any, areaEstimate: number) => void;
}

export default function FarmMap({ onPolygonDrawn }: FarmMapProps) {
  const mapRef = useRef<any>();
  const drawRef = useRef<MapboxDraw>();

  // Center around Assam as a default
  const initialViewState = {
    longitude: 92.9376,
    latitude: 26.2006,
    zoom: 7,
  };

  const onUpdate = useCallback((e: any) => {
    if (!drawRef.current) return;
    const data = drawRef.current.getAll();
    if (data.features.length > 0) {
      // Very rough area estimate - in a real app use turf.js area()
      const areaEstimate = 2.1; 
      
      onPolygonDrawn(
        JSON.stringify(data),
        areaEstimate
      );
    } else {
      onPolygonDrawn(null, 0);
    }
  }, [onPolygonDrawn]);

  useEffect(() => {
    // Only initialize MapboxDraw once map is ready
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'draw_polygon'
    });
    
    drawRef.current = draw;
    
    // Add draw control to map
    if (map && !map.hasControl(draw)) {
       map.addControl(draw);
    }

    map.on('draw.create', onUpdate);
    map.on('draw.update', onUpdate);
    map.on('draw.delete', onUpdate);

    return () => {
      map.off('draw.create', onUpdate);
      map.off('draw.update', onUpdate);
      map.off('draw.delete', onUpdate);
      if (map && map.hasControl(draw)) {
        map.removeControl(draw);
      }
    };
  }, [onUpdate]);

  return (
    <div className="w-full h-full relative border border-gray-200 rounded-xl overflow-hidden">
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />
      </Map>
    </div>
  );
}
