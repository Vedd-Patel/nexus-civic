'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useState, useEffect } from 'react';

// Fix leaflet icon issue in Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface ReportMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  userLocation: { lat: number; lng: number } | null;
}

function LocationMarker({ onLocationSelect, userLocation }: ReportMapProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(userLocation);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (userLocation) {
      setPosition(userLocation);
    }
  }, [userLocation]);

  return position === null ? null : (
    <Marker position={position} />
  );
}

export default function ReportMap({ onLocationSelect, userLocation }: ReportMapProps) {
  const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // SF default

  return (
    <MapContainer 
      center={userLocation || defaultCenter} 
      zoom={13} 
      style={{ height: '300px', width: '100%', borderRadius: '0.75rem', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onLocationSelect={onLocationSelect} userLocation={userLocation} />
    </MapContainer>
  );
}
