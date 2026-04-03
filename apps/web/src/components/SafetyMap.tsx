'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';

const alertIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface SafetyMapProps {
  userLocation: { lat: number; lng: number } | null;
}

export default function SafetyMap({ userLocation }: SafetyMapProps) {
  const [incidents, setIncidents] = useState<{lat: number, lng: number, desc: string}[]>([]);

  useEffect(() => {
    if (userLocation) {
      // Generate some mock nearby incidents
      setIncidents([
        { lat: userLocation.lat + 0.005, lng: userLocation.lng + 0.005, desc: 'Suspicious Activity Reported' },
        { lat: userLocation.lat - 0.003, lng: userLocation.lng + 0.008, desc: 'Streetlight Outage' },
        { lat: userLocation.lat + 0.004, lng: userLocation.lng - 0.006, desc: 'Noise Complaint' }
      ]);
    }
  }, [userLocation]);

  const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // SF default

  return (
    <MapContainer 
      center={userLocation || defaultCenter} 
      zoom={userLocation ? 14 : 12} 
      style={{ height: '300px', width: '100%', borderRadius: '1rem', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}
      {incidents.map((inc, i) => (
        <Marker key={i} position={inc} icon={alertIcon}>
          <Popup>{inc.desc}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
