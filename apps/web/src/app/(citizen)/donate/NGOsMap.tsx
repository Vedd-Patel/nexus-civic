"use client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix leaflet icon issue in Next.js
export default function NGOsMap({ onSelect, selectedId }: any) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const ngos = [
    { id: 1, name: "City Mission", lat: 51.505, lng: -0.09, dist: "1.2 km" },
    { id: 2, name: "Global Aid", lat: 51.51, lng: -0.1, dist: "2.4 km" },
    { id: 3, name: "Hope Foundation", lat: 51.508, lng: -0.11, dist: "3.1 km" }
  ];

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '300px', width: '100%', zIndex: 0 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {ngos.map(n => (
        <Marker 
           key={n.id} 
           position={[n.lat, n.lng]}
           eventHandlers={{ click: () => onSelect(n) }}
        >
          <Popup>
             <strong>{n.name}</strong><br/>
             {n.dist} away<br/>
             <i style={{fontSize: '11px'}}>{selectedId === n.id ? "Selected" : "Click to select"}</i>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
