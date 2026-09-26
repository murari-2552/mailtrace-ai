import React, { useEffect, useRef } from 'react';
import { Globe, MapPin, ShieldAlert, Wifi, Server } from 'lucide-react';
import L from 'leaflet';
import { GeoLocationInfo } from '../../types';

interface GeoLocationMapProps {
  locations: GeoLocationInfo[];
}

export const GeoLocationMap: React.FC<GeoLocationMapProps> = ({ locations }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing map if re-rendering
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center
    const defaultCenter: [number, number] = locations.length > 0 && locations[0].lat !== 0
      ? [locations[0].lat, locations[0].lon]
      : [25, 30];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 2.5,
      minZoom: 1.5,
      attributionControl: false
    });
    mapInstanceRef.current = map;

    // Dark-mode CartoDB tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    const latlngs: [number, number][] = [];

    locations.forEach((loc, idx) => {
      if (loc.lat === 0 && loc.lon === 0) return;
      const coord: [number, number] = [loc.lat, loc.lon];
      latlngs.push(coord);

      const isOrigin = loc.role.toLowerCase().includes('origin');
      const markerColor = isOrigin ? '#EF4444' : (loc.is_vpn || loc.is_tor ? '#F59E0B' : '#06B6D4');

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="
          background-color: ${markerColor};
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 3px solid #0F172A;
          box-shadow: 0 0 12px ${markerColor};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0F172A;
          font-weight: bold;
          font-size: 10px;
          font-family: monospace;
        ">${idx + 1}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const popupHtml = `
        <div style="font-family: monospace; font-size: 11px; color: #E2E8F0; background: #0F172A; padding: 10px; border-radius: 6px; border: 1px solid #334155; min-width: 180px;">
          <strong style="color: ${markerColor}; text-transform: uppercase;">${loc.role}</strong><br/>
          <strong>IP:</strong> ${loc.ip}<br/>
          <strong>Location:</strong> ${loc.city || 'Unknown'}, ${loc.country}<br/>
          <strong>ISP:</strong> ${loc.isp || 'N/A'}<br/>
          <strong>ASN:</strong> ${loc.asn || 'N/A'}<br/>
          ${loc.is_tor ? '<span style="color: #EF4444; font-weight: bold;">[TOR EXIT NODE]</span><br/>' : ''}
          ${loc.is_vpn ? '<span style="color: #F59E0B; font-weight: bold;">[VPN / PROXY]</span><br/>' : ''}
          <small style="color: #94A3B8;">Confidence: ${loc.confidence}%</small>
        </div>
      `;

      L.marker(coord, { icon: customIcon })
        .addTo(map)
        .bindPopup(popupHtml);
    });

    // Draw routing arc polyline if multiple locations exist
    if (latlngs.length > 1) {
      L.polyline(latlngs, {
        color: '#06B6D4',
        weight: 2,
        opacity: 0.6,
        dashArray: '6, 8'
      }).addTo(map);

      map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locations]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            IP GEOLOCATION & INFRASTRUCTURE INTELLIGENCE
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {locations.length} Geocoded Infrastructure Endpoint{locations.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Interactive Leaflet Container */}
      <div className="rounded-xl overflow-hidden border border-slate-800 h-80 relative shadow-inner bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Approximate Disclaimer Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-start gap-2.5 text-xs text-slate-400 font-mono">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>FORENSIC DISCLAIMER:</strong> IP geolocation provides an estimated routing/network location based on BGP and ASN registries. It does not establish the physical location, identity, or culpability of an individual sender.
        </span>
      </div>

      {/* IP Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {locations.map((loc, idx) => (
          <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {loc.ip}
              </span>
              <span className="text-[10px] text-slate-400 uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                {loc.role}
              </span>
            </div>

            <div className="space-y-1 text-slate-300">
              <div>
                <span className="text-slate-500">Location:</span> {loc.city ? `${loc.city}, ` : ''}{loc.country}
              </div>
              <div>
                <span className="text-slate-500">Coordinates:</span> {loc.lat.toFixed(4)}, {loc.lon.toFixed(4)}
              </div>
              <div className="truncate" title={loc.isp || 'N/A'}>
                <span className="text-slate-500">ISP / Host:</span> {loc.isp || 'N/A'}
              </div>
              <div>
                <span className="text-slate-500">ASN:</span> {loc.asn || 'AS Unknown'}
              </div>
            </div>

            {/* VPN / TOR Indicators */}
            <div className="pt-2 border-t border-slate-800/70 flex flex-wrap gap-1.5 text-[10px]">
              {loc.is_tor && (
                <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
                  TOR EXIT NODE
                </span>
              )}
              {loc.is_vpn && (
                <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                  VPN / PROXY DETECTED
                </span>
              )}
              {!loc.is_tor && !loc.is_vpn && (
                <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  STANDARD ROUTING
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
