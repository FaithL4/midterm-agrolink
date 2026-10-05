import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Truck, Clock, Navigation, CheckCircle2 } from 'lucide-react';
import DashboardLayout, { PageHeader } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../context/AuthContext';
import L from 'leaflet';
import api from '../../api/client';

// Fix Leaflet Default Icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function TrackingContent() {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [eta, setEta] = useState(24); // mock 24 minutes
  const [delivery, setDelivery] = useState(null);

  // Mock driver coordinates starting from Nakuru Farmer towards Nairobi/Molo
  const pathCoordinates = [
    [-0.303, 36.08], // Nakuru Center
    [-0.312, 36.095],
    [-0.325, 36.115],
    [-0.338, 36.130],
    [-0.350, 36.148],
    [-0.362, 36.160],
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        const res = await api.request('/deliveries/');
        const list = Array.isArray(res) ? res : (res.results || []);
        // Find active delivery
        const active = list.find(d => d.status !== 'delivered' && d.status !== 'cancelled');
        if (active) {
          setDelivery(active);
        }
      } catch (err) {
        console.error("Failed to fetch active delivery info", err);
      }
    };
    fetchDelivery();
  }, []);

  useEffect(() => {
    const handleWsDeliveryUpdate = (e) => {
      const updatedDelivery = e.detail;
      if (delivery && String(updatedDelivery.id) === String(delivery.id)) {
        setDelivery(updatedDelivery);
      }
    };

    window.addEventListener('ws:delivery_update', handleWsDeliveryUpdate);
    return () => {
      window.removeEventListener('ws:delivery_update', handleWsDeliveryUpdate);
    };
  }, [delivery]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Map
    mapInstance.current = L.map(mapContainer.current).setView([-0.303, 36.08], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstance.current);

    // Add Farmer Marker
    L.marker([-0.303, 36.08])
      .addTo(mapInstance.current)
      .bindPopup('🌾 Farmer Warehouse (Nakuru)')
      .openPopup();

    // Add Buyer Destination Marker
    L.marker([-0.362, 36.160])
      .addTo(mapInstance.current)
      .bindPopup('🏠 Delivery Destination');

    // Add route line
    L.polyline(pathCoordinates, { color: '#15803d', weight: 4 }).addTo(mapInstance.current);

    // Create a Custom moving truck marker
    const truckIcon = L.divIcon({
      html: `<div style="background-color: #15803d; color: white; padding: 6px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">🚚</div>`,
      className: 'custom-truck-icon',
      iconSize: [32, 32],
    });

    markerRef.current = L.marker([-0.303, 36.08], { icon: truckIcon }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Simulate vehicle movement along coordinates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % pathCoordinates.length;
        const coords = pathCoordinates[next];

        // Move Leaflet marker
        if (markerRef.current) {
          markerRef.current.setLatLng(coords);
        }

        // Adjust mock ETA
        setEta((prevEta) => Math.max(5, prevEta - 3));

        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <PageHeader 
        title="Live Delivery Tracking" 
        subtitle="Track your organic farm produce from Nakuru to your kitchen in real time" 
      />

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Live Map */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-150 p-4 shadow-sm h-[500px] flex flex-col justify-between">
          <div ref={mapContainer} className="w-full h-full rounded-2xl overflow-hidden z-10" />
        </div>

        {/* Right Column: Driver Details & Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Driver Card */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <Truck className="text-green-700" size={18} />
              Delivery Partner
            </h3>
            
            <div className="flex items-center gap-4">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" 
                alt="Driver Profile"
                className="w-14 h-14 rounded-2xl object-cover border border-gray-150"
              />
              <div>
                <p className="font-bold text-gray-900 text-sm">{delivery?.transporter_name || "Joseph Njoroge"}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  {delivery?.transporter_vehicle || "Toyota Probox"} · {delivery?.transporter_plate || "KCG 489X"}
                </p>
                <p className="text-[10px] text-green-750 font-bold mt-1">⭐ {(delivery?.transporter_rating || 4.9).toFixed(1)} Rating</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex gap-2">
              <a 
                href={`tel:${delivery?.transporter_phone || "+254700000000"}`}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-250 text-gray-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Phone size={14} />
                Call Driver
              </a>
              <button 
                onClick={() => navigate('/buyer/chat', { state: { activeConvId: 2 } })}
                className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                Message
              </button>
            </div>
          </div>

          {/* Stepper Status Progress */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <Clock className="text-green-700" size={18} />
              Estimated Arrival: <span className="text-green-800 font-black">{eta} mins</span>
            </h3>

            <div className="space-y-4 pt-2">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-green-700 flex items-center justify-center text-white text-[10px]">✓</div>
                  <div className="w-0.5 h-8 bg-green-700"></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Order Accepted</p>
                  <p className="text-[10px] text-gray-500 font-medium">Farmer accepted order and packing crops.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-green-700 flex items-center justify-center text-white text-[10px]">✓</div>
                  <div className="w-0.5 h-8 bg-green-700"></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Picked Up</p>
                  <p className="text-[10px] text-gray-500 font-medium">Driver loaded crates at Nakuru Warehouse.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-green-700 flex items-center justify-center text-white text-[10px] animate-pulse">🚗</div>
                  <div className="w-0.5 h-8 bg-gray-200"></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-green-750">In Transit</p>
                  <p className="text-[10px] text-gray-500 font-medium">Vehicle is moving along Nakuru expressway.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-[10px]">🏠</div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400">Delivered</p>
                  <p className="text-[10px] text-gray-400 font-medium">Arrival at destination coordinates.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Tracking() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TrackingContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
