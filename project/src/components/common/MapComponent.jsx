import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultCenter = [-0.3031, 36.0800]; // Nakuru / Central Kenya region

export default function MapComponent({ 
  markers = [], 
  route = [], 
  height = '350px', 
  center = defaultCenter, 
  zoom = 8 
}) {
  return (
    <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200" style={{ height }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m, idx) => (
          <Marker key={idx} position={m.position || defaultCenter}>
            <Popup>
              <div className="text-sm font-sans">
                <strong className="text-emerald-700 block text-base">{m.title || 'AgroLink Location'}</strong>
                <p className="m-0 text-slate-600">{m.description || 'Verified agricultural point'}</p>
                {m.type && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded font-semibold">
                    {m.type}
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        {route && route.length > 1 && (
          <Polyline positions={route} color="#059669" weight={4} dashArray="5, 10" />
        )}
      </MapContainer>
    </div>
  );
}
