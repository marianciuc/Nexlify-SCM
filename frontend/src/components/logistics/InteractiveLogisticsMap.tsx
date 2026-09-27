import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Truck, MapPin, Navigation, Maximize2, Radio, Layers, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Shipment } from '@/types/scm-domain';

export interface RouteWaypoint {
  name: string;
  lat: number;
  lng: number;
  type: 'ORIGIN' | 'WAYPOINT' | 'DESTINATION';
  eta?: string;
}

export interface InteractiveLogisticsMapProps {
  shipments?: Shipment[];
  onSelectRoute?: (origin: string, destination: string) => void;
  origin?: RouteWaypoint;
  destination?: RouteWaypoint;
  waypoints?: RouteWaypoint[];
  currentLocation?: { lat: number; lng: number; speedKmH: number; heading: number };
  telematics?: {
    driverName: string;
    vehiclePlate: string;
    temperatureCelsius: number;
    etaRemaining: string;
    glecCo2Kg: number;
  };
  height?: string;
  className?: string;
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  warszawa: [52.2297, 21.0122],
  warsaw: [52.2297, 21.0122],
  gdańsk: [54.352, 18.6466],
  gdansk: [54.352, 18.6466],
  wrocław: [51.1079, 17.0385],
  wroclaw: [51.1079, 17.0385],
  katowice: [50.2649, 19.0238],
  poznań: [52.4064, 16.9252],
  poznan: [52.4064, 16.9252],
  szczecin: [53.4285, 14.5528],
  łódź: [51.7592, 19.456],
  lodz: [51.7592, 19.456],
  kraków: [50.0647, 19.945],
  krakow: [50.0647, 19.945],
  gdynia: [54.5189, 18.5305],
};

function getCityCoords(name: string): [number, number] {
  const normalized = name.toLowerCase().replace(/[^a-ząćęłńóśźż]/g, ' ').trim();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (normalized.includes(key)) {
      return coords;
    }
  }
  return [52.0, 19.5]; // Default center of Poland
}

export const InteractiveLogisticsMap: React.FC<InteractiveLogisticsMapProps> = ({
  shipments,
  onSelectRoute,
  origin,
  destination,
  waypoints,
  currentLocation,
  telematics,
  height = '440px',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    shipments && shipments.length > 0 ? shipments[0]! : null
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(82);

  // Active Origin & Destination
  const activeOrigin: RouteWaypoint = origin || {
    name: selectedShipment?.origin || 'Warszawa Central DC (DC-01)',
    lat: getCityCoords(selectedShipment?.origin || 'Warszawa')[0],
    lng: getCityCoords(selectedShipment?.origin || 'Warszawa')[1],
    type: 'ORIGIN',
  };

  const activeDestination: RouteWaypoint = destination || {
    name: selectedShipment?.destination || 'Gdańsk Sea Port Terminal',
    lat: getCityCoords(selectedShipment?.destination || 'Gdańsk')[0],
    lng: getCityCoords(selectedShipment?.destination || 'Gdańsk')[1],
    type: 'DESTINATION',
    eta: selectedShipment?.eta || '45 min',
  };

  const activeWaypoints: RouteWaypoint[] = waypoints || [
    {
      name: 'Mid-route S7 Logistics Checkpoint',
      lat: (activeOrigin.lat + activeDestination.lat) / 2 + 0.1,
      lng: (activeOrigin.lng + activeDestination.lng) / 2 - 0.2,
      type: 'WAYPOINT',
    },
  ];

  const truckLat = (activeOrigin.lat * 0.35 + activeDestination.lat * 0.65);
  const truckLng = (activeOrigin.lng * 0.35 + activeDestination.lng * 0.65);

  const activeTelematics = telematics || {
    driverName: 'Tomasz Lewandowski (ID: DRV-091)',
    vehiclePlate: selectedShipment?.vehicle || 'WI 49102 (Scania R450)',
    temperatureCelsius: 4.2,
    etaRemaining: selectedShipment?.eta || '45 min',
    glecCo2Kg: 38.4,
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [52.8, 19.5],
      zoom: 6,
      zoomControl: true,
      attributionControl: true,
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap | GraphHopper 9.x VRP Engine',
    }).addTo(map);

    const routeCoords: [number, number][] = [
      [activeOrigin.lat, activeOrigin.lng],
      ...activeWaypoints.map((w) => [w.lat, w.lng] as [number, number]),
      [activeDestination.lat, activeDestination.lng],
    ];

    // Glow underlay
    L.polyline(routeCoords, {
      color: '#059669',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Main route line
    L.polyline(routeCoords, {
      color: '#10b981',
      weight: 4,
      opacity: 0.9,
      dashArray: '8, 8',
    }).addTo(map);

    // Origin Icon
    const originIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="background:#0f172a; border:2.5px solid #10b981; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.4);">
          <div style="width:10px; height:10px; background:#10b981; border-radius:50%;"></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    L.marker([activeOrigin.lat, activeOrigin.lng], { icon: originIcon })
      .addTo(map)
      .bindPopup(`<strong>Origin:</strong> ${activeOrigin.name}`);

    // Destination Icon
    const destIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="background:#0f172a; border:2.5px solid #ef4444; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.4);">
          <div style="width:10px; height:10px; background:#ef4444; border-radius:50%;"></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    L.marker([activeDestination.lat, activeDestination.lng], { icon: destIcon })
      .addTo(map)
      .bindPopup(`<strong>Destination:</strong> ${activeDestination.name}<br/>ETA: ${activeDestination.eta || 'Scheduled'}`);

    // Vehicle Marker
    const vehicleIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="background:#10b981; color:white; border:2px solid white; border-radius:50%; width:38px; height:38px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 16px rgba(16,185,129,0.85); cursor:pointer;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    L.marker([truckLat, truckLng], { icon: vehicleIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family:sans-serif; min-width:180px;">
          <strong style="color:#0f172a; font-size:13px;">${activeTelematics.vehiclePlate}</strong>
          <div style="font-size:11px; color:#475569; margin-top:2px;">Driver: ${activeTelematics.driverName}</div>
          <hr style="margin:6px 0; border:0; border-top:1px solid #e2e8f0;" />
          <div style="display:flex; justify-content:space-between; font-size:11px;">
            <span>Speed:</span><strong style="color:#10b981;">${simSpeed} km/h</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px;">
            <span>Cargo Temp:</span><strong style="color:#2563eb;">+${activeTelematics.temperatureCelsius}°C</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px;">
            <span>ETA:</span><strong style="color:#0f172a;">${activeTelematics.etaRemaining}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px;">
            <span>CO2:</span><strong>${activeTelematics.glecCo2Kg} kg</strong>
          </div>
        </div>
      `);

    map.fitBounds(L.latLngBounds(routeCoords), { padding: [45, 45] });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [selectedShipment, origin, destination, waypoints, simSpeed]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const routeCoords: [number, number][] = [
      [activeOrigin.lat, activeOrigin.lng],
      ...activeWaypoints.map((w) => [w.lat, w.lng] as [number, number]),
      [activeDestination.lat, activeDestination.lng],
    ];
    mapInstanceRef.current.fitBounds(L.latLngBounds(routeCoords), { padding: [45, 45] });
  };

  const handleToggleSimulation = () => {
    setIsSimulating(!isSimulating);
    setSimSpeed(!isSimulating ? 88 : 0);
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
      {/* Top Overlay Badge Bar */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 pointer-events-auto">
        <Badge className="bg-slate-900/90 text-white text-xs gap-1.5 backdrop-blur-md px-3 py-1 shadow-md border border-slate-700/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Radio className="h-3 w-3 text-emerald-400" />
          <span>GraphHopper 9.x Live TMS Map</span>
        </Badge>

        <Badge variant="outline" className="bg-white/90 dark:bg-slate-900/90 text-xs backdrop-blur-md">
          Speed: <strong className="ml-1 text-emerald-600 font-mono">{simSpeed} km/h</strong>
        </Badge>

        <Badge variant="outline" className="bg-white/90 dark:bg-slate-900/90 text-xs backdrop-blur-md">
          Reefer: <strong className="ml-1 text-blue-600 font-mono">+{activeTelematics.temperatureCelsius}°C</strong>
        </Badge>
      </div>

      {/* Top Right Controls & Shipment selector */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 pointer-events-auto">
        {shipments && shipments.length > 1 && (
          <select
            value={selectedShipment?.id || ''}
            onChange={(e) => {
              const found = shipments.find((s) => s.id === e.target.value);
              if (found) {
                setSelectedShipment(found);
                if (onSelectRoute) {
                  onSelectRoute(found.origin, found.destination);
                }
              }
            }}
            className="h-8 text-xs bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-300 dark:border-slate-700 rounded-md px-2 py-0"
          >
            {shipments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.trackingNumber} ({s.origin} ➔ {s.destination})
              </option>
            ))}
          </select>
        )}

        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs bg-white/90 dark:bg-slate-900/90 backdrop-blur-md gap-1"
          onClick={handleRecenter}
        >
          <Maximize2 className="h-3 w-3" />
          Fit Route
        </Button>

        <Button
          size="sm"
          className={`h-8 text-xs gap-1 text-white ${
            isSimulating ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
          onClick={handleToggleSimulation}
        >
          <Navigation className="h-3 w-3" />
          {isSimulating ? 'Pause GPS' : 'Simulate GPS'}
        </Button>
      </div>

      {/* Leaflet DOM element */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0" />

      {/* Bottom Telematics HUD */}
      <div className="bg-slate-50 dark:bg-slate-900/95 p-3 border-t border-slate-200 dark:border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <span className="text-slate-500 block text-2xs uppercase">Driver & Vehicle:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{activeTelematics.vehiclePlate}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-2xs uppercase">Active Corridor:</span>
          <span className="font-mono text-slate-800 dark:text-slate-200">
            {activeOrigin.name.split(' ')[0]} ➔ {activeDestination.name.split(' ')[0]}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-2xs uppercase">Estimated ETA:</span>
          <span className="font-bold text-emerald-600">{activeTelematics.etaRemaining}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-2xs uppercase">GLEC Standard Emissions:</span>
          <span className="font-mono text-slate-800 dark:text-slate-200">{activeTelematics.glecCo2Kg} kg CO2e</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveLogisticsMap;
