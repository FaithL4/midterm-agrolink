import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Navigation, MapPin, Clock, ShieldCheck, Phone, MessageSquare, 
  ArrowRight, Zap, CheckCircle2, AlertTriangle, Play, RefreshCw, 
  Compass, AlertCircle, Copy, Edit2, Info, Bell, Star, ChevronDown, Check 
} from 'lucide-react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute, useAuth } from '../../context/AuthContext';
import MapComponent from '../../components/common/MapComponent';
import api from '../../api/client';

function TrackingContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State variables for tracking
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [speed, setSpeed] = useState(60);
  const [distanceTraveled, setDistanceTraveled] = useState(126);
  const [remainingDistance, setRemainingDistance] = useState(42);
  const [etaMins, setEtaMins] = useState(35);
  const [currentStatus, setCurrentStatus] = useState('in_transit');
  const [liveLocationText, setLiveLocationText] = useState('Nakuru - Nairobi Highway');

  // Coordinates array Nakuru -> Naivasha -> Nairobi
  const pathCoordinates = [
    [-0.303, 36.08], // Nakuru
    [-0.505, 36.25], // Gilgil
    [-0.7172, 36.4310], // Naivasha
    [-0.950, 36.60], // Limuru
    [-1.286, 36.817], // Nairobi
  ];

  // Moving truck state along path
  const [truckPosIndex, setTruckPosIndex] = useState(2); // Starts near Naivasha

  const defaultDelivery = {
    id: "DEL-000245",
    isMock: true,
    status: "in_transit",
    pickup_hub: "Green Valley Farm",
    pickup_county: "Nakuru, Lanet",
    pickup_phone: "0712 345 678",
    dropoff_name: "John Mwangi",
    dropoff_county: "Westlands, Nairobi",
    dropoff_phone: "0722 987 654",
    product: "Tomatoes",
    quantity: "500 Kg",
    delivery_fee: 2500,
    distance: 168,
    eta: "35 min",
    special_instructions: "Handle with care. Keep away from direct sunlight.",
    order_id: "ORD-12054",
    payment_status: "Pending",
    payment_method: "AgroLink Wallet",
    perishable: true,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&q=80",
    timestamps: {
      accepted: "08:10 AM",
      heading_to_pickup: "08:25 AM",
      picked_up: "09:05 AM"
    }
  };

  const loadActiveDelivery = () => {
    setLoading(true);
    api.getDeliveries()
      .then((d) => {
        const list = d.results || d || [];
        const active = list.find(item => ['accepted', 'travelling_to_pickup', 'picked_up', 'in_transit', 'arrived'].includes(item.status));
        if (active) {
          setDelivery({ ...defaultDelivery, ...active, isMock: false });
          setCurrentStatus(active.status);
        } else {
          setDelivery(defaultDelivery);
          setCurrentStatus(defaultDelivery.status);
        }
      })
      .catch(() => {
        setDelivery(defaultDelivery);
        setCurrentStatus(defaultDelivery.status);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadActiveDelivery();
  }, []);

  // Simulated live coordinate/speed ticker running every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate speed slightly
      setSpeed(prev => {
        const diff = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const newSpeed = prev + diff;
        return Math.max(45, Math.min(75, newSpeed));
      });

      // Advance truck along path coordinates
      setTruckPosIndex(prev => {
        const next = prev + 1;
        if (next >= pathCoordinates.length) {
          return 0; // Loop back to Nakuru Pickup for infinite demo
        }
        return next;
      });

      // Decrease remaining distance, increase distance traveled
      setRemainingDistance(prev => {
        const next = prev - 1.2;
        return next > 0 ? parseFloat(next.toFixed(1)) : 0;
      });

      setDistanceTraveled(prev => {
        const next = prev + 1.2;
        return next < 168 ? parseFloat(next.toFixed(1)) : 168;
      });

      // Decrement ETA
      setEtaMins(prev => {
        const next = prev - 1;
        return next > 0 ? next : 1;
      });

      // Randomize highway locations based on index
      const locations = ['Nakuru Highway', 'Naivasha Highway', 'Kijabe Viewpoint', 'Limuru Interchange', 'Nairobi Bypass'];
      setLiveLocationText(locations[truckPosIndex % locations.length]);

    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [truckPosIndex]);

  // Automatic geofencing status updates based on simulated transporter position coordinates
  useEffect(() => {
    if (!delivery) return;

    let targetStatus = '';
    let toastMsg = '';

    if (truckPosIndex === 0) {
      targetStatus = 'picked_up';
      toastMsg = '📍 Auto-Geofence: Arrived at Green Valley Farm! Status updated to Product Collected.';
    } else if (truckPosIndex > 0 && truckPosIndex < pathCoordinates.length - 1) {
      targetStatus = 'in_transit';
      toastMsg = '📍 Auto-Geofence: Departed pickup hub. Status updated to In Transit.';
    } else if (truckPosIndex === pathCoordinates.length - 1) {
      targetStatus = 'arrived';
      toastMsg = '📍 Auto-Geofence: Arrived at Westlands Nairobi! Status updated to Arrived.';
    }

    if (targetStatus && targetStatus !== currentStatus) {
      setCurrentStatus(targetStatus);
      toast.info(toastMsg, { autoClose: 4000 });

      // Automatically synchronize this state update to the backend database!
      if (!delivery.isMock) {
        api.request(`/deliveries/${delivery.id}/update_status/`, {
          method: 'POST',
          body: JSON.stringify({ status: targetStatus }),
        }).catch(err => console.error("Auto-geofence database sync failed:", err));
      }
    }
  }, [truckPosIndex, delivery]);

  // WebSocket Live Updates listener
  useEffect(() => {
    const handleWsDelivery = (e) => {
      const updatedDel = e.detail;
      if (delivery && String(updatedDel.id) === String(delivery.id)) {
        setDelivery(prev => ({ ...prev, ...updatedDel }));
        setCurrentStatus(updatedDel.status);
      }
    };

    window.addEventListener('ws:delivery_update', handleWsDelivery);
    return () => {
      window.removeEventListener('ws:delivery_update', handleWsDelivery);
    };
  }, [delivery]);

  const handleSaveStatus = async () => {
    if (!delivery) return;
    const reqId = delivery.id;

    if (delivery.isMock) {
      toast.success(`✓ Delivery status saved: ${currentStatus.replace('_', ' ').toUpperCase()}`);
      setDelivery(prev => ({
        ...prev,
        status: currentStatus,
        timestamps: {
          ...prev.timestamps,
          [currentStatus]: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      }));
      return;
    }

    try {
      const res = await api.request(`/deliveries/${reqId}/update_status/`, {
        method: 'POST',
        body: JSON.stringify({ status: currentStatus }),
      });
      setDelivery(prev => ({ ...prev, ...res }));
      toast.success(`✓ Delivery status saved: ${currentStatus.replace('_', ' ').toUpperCase()}`);
    } catch (err) {
      toast.error(err.message || "Failed to save delivery status.");
    }
  };

  if (loading) return <LoadingSpinner />;

  // Leaflet map configuration
  const truckPosition = pathCoordinates[truckPosIndex];
  
  const mapMarkers = [
    { position: pathCoordinates[0], title: 'Green Valley Farm', description: 'Nakuru Pickup Point', type: 'Pickup' },
    { position: truckPosition, title: 'My Truck Location', description: `${liveLocationText} (Cruising at ${speed} Km/h)`, type: 'Transporter' },
    { position: pathCoordinates[pathCoordinates.length - 1], title: 'John Mwangi', description: 'Nairobi Dropoff Point', type: 'Destination' },
  ];

  return (
    <div className="space-y-6 font-sans text-slate-800 antialiased">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Live Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">Live updates every 10 seconds</p>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-4 text-xs font-bold self-end md:self-auto">
          {/* Notifications */}
          <button className="relative p-2 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200/60 text-slate-600">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full">5</span>
          </button>
          
          {/* Chat */}
          <button onClick={() => navigate('/transporter/chat')} className="relative p-2 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200/60 text-slate-600">
            <MessageSquare className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full">3</span>
          </button>

          {/* Profile Card */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80" 
              alt="Transporter Avatar" 
              className="w-6 h-6 rounded-full object-cover border border-emerald-200" 
            />
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-800 leading-none">John Kamau</p>
              <div className="flex items-center gap-0.5 mt-0.5 text-amber-500">
                <span className="text-[9px] font-black text-slate-500">4.8</span>
                <Star className="w-2.5 h-2.5 fill-current" />
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Map & Metrics (span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Map block widget */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 relative">
            
            {/* Top map controls overlay */}
            <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl p-3 text-xs font-bold shadow-lg z-[1000] w-36">
              <span className="text-[8px] text-slate-400 font-black block uppercase tracking-wider">ETA</span>
              <h4 className="text-emerald-700 text-lg font-black mt-0.5">{etaMins} min</h4>
              <p className="text-[9px] text-slate-500 font-medium mt-0.5">Arrive by 11:20 AM</p>
            </div>

            <div className="absolute top-8 right-8 z-[1000]">
              <button className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold shadow-md flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-500" /> Traffic <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            <div className="h-[400px] rounded-2xl overflow-hidden border border-slate-150 relative">
              <MapComponent 
                center={[-0.7172, 36.4310]} 
                zoom={8} 
                markers={mapMarkers} 
                route={pathCoordinates}
                height="100%"
              />

              {/* Highway current position float */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-2.5 text-[9px] font-bold shadow-md z-[1000] w-40">
                <span className="text-slate-400 font-black block uppercase tracking-wider text-[7px]">Current Location</span>
                <p className="text-slate-800 font-extrabold truncate mt-0.5">{liveLocationText}</p>
                <p className="text-slate-600 mt-0.5">Speed: <strong className="text-emerald-700">{speed} km/h</strong></p>
              </div>
            </div>

            {/* Speeds & Distance Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 shadow-inner">
                <span className="text-[8px] text-slate-400 font-black block uppercase tracking-wider">Current Speed</span>
                <h3 className="text-lg font-black text-emerald-700 mt-1">{speed} km/h</h3>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 shadow-inner">
                <span className="text-[8px] text-slate-400 font-black block uppercase tracking-wider">Distance Traveled</span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{distanceTraveled} km</h3>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 shadow-inner">
                <span className="text-[8px] text-slate-400 font-black block uppercase tracking-wider">Remaining Distance</span>
                <h3 className="text-lg font-black text-sky-700 mt-1">{remainingDistance} km</h3>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 shadow-inner">
                <span className="text-[8px] text-slate-400 font-black block uppercase tracking-wider">ETA</span>
                <h3 className="text-lg font-black text-purple-700 mt-1">{etaMins} min</h3>
                <p className="text-[9px] text-slate-500 font-medium mt-0.5">11:20 AM</p>
              </div>
            </div>

            {/* Route buttons overview */}
            <div className="flex flex-col md:flex-row items-center justify-between border-t border-slate-100 pt-4 gap-3 text-xs">
              <div className="text-left w-full md:w-auto">
                <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Route Overview</span>
                <p className="text-slate-800 font-bold mt-0.5">Total Distance: 168 km &bull; Est. Time: 2 hr 15 min</p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-[10px] transition-colors">
                  Open in Google Maps
                </button>
                <button className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-[10px] transition-colors">
                  Open in Waze
                </button>
                <button onClick={() => toast.info("Recalculating route coordinates...")} className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Grid: Status Update Form, Support & Route Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Update status selector */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-slate-900 text-xs">Update Delivery Status</h4>
              
              <div className="space-y-3.5 text-xs font-bold text-slate-700">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="radio" 
                    name="status_grp" 
                    value="picked_up"
                    checked={currentStatus === 'picked_up'}
                    onChange={(e) => setCurrentStatus(e.target.value)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Arrived at Pickup</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="radio" 
                    name="status_grp" 
                    value="product_collected"
                    checked={currentStatus === 'product_collected' || currentStatus === 'picked_up'}
                    onChange={() => setCurrentStatus('picked_up')}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Product Picked Up</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="radio" 
                    name="status_grp" 
                    value="in_transit"
                    checked={currentStatus === 'in_transit'}
                    onChange={(e) => setCurrentStatus(e.target.value)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>In Transit</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="radio" 
                    name="status_grp" 
                    value="arrived"
                    checked={currentStatus === 'arrived'}
                    onChange={(e) => setCurrentStatus(e.target.value)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Arrived at Destination</span>
                </label>
              </div>

              <button 
                onClick={handleSaveStatus}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs shadow-sm transition-colors text-center block"
              >
                Save Status Update
              </button>
            </div>

            {/* 2. Emergency & Support */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-slate-900 text-xs">Emergency & Support</h4>
              
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button onClick={() => toast.info("Reported trip delay.")} className="py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Report Delay
                </button>
                <button onClick={() => toast.warn("Alert sent to logistics.")} className="py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-400" /> Report Issue
                </button>
              </div>

              <a 
                href="tel:+254700000000"
                className="w-full py-3 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> SOS Emergency
              </a>
            </div>

            {/* 3. Route Analytics */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3.5 text-xs text-slate-700">
              <h4 className="font-extrabold text-slate-900 text-xs">Route Analytics</h4>
              
              <div className="flex justify-between items-center">
                <span>Total Distance</span>
                <strong className="text-slate-900">168 km</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Travel Time</span>
                <strong className="text-slate-900">2 hr 10 min</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Avg. Speed</span>
                <strong className="text-slate-900">65 km/h</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Stops</span>
                <strong className="text-slate-900">0</strong>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Active Delivery details sidebar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-5 text-xs">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Delivery ID: {delivery.id}</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Order ID: {delivery.order_id} <Copy className="w-3 h-3 inline cursor-pointer text-slate-300 hover:text-slate-500 ml-1" /></p>
            </div>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-black rounded-full text-[9px] uppercase">
              In Transit
            </span>
          </div>

          {/* Stepper timeline */}
          <div className="space-y-3">
            <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Delivery Progress</span>
            
            <div className="relative pl-6 space-y-4 text-xs font-bold">
              <span className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200" />

              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-emerald-500 text-white">
                  <Check className="w-2.5 h-2.5" />
                </span>
                <div className="flex justify-between items-start">
                  <span>Accepted</span>
                  <span className="text-[9px] text-slate-400 font-normal">{delivery.timestamps?.accepted || '08:10 AM'}</span>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-emerald-500 text-white">
                  <Check className="w-2.5 h-2.5" />
                </span>
                <div className="flex justify-between items-start">
                  <span>Heading to Pickup</span>
                  <span className="text-[9px] text-slate-400 font-normal">{delivery.timestamps?.heading_to_pickup || '08:25 AM'}</span>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-emerald-500 text-white">
                  <Check className="w-2.5 h-2.5" />
                </span>
                <div className="flex justify-between items-start">
                  <span>Picked Up</span>
                  <span className="text-[9px] text-slate-400 font-normal">{delivery.timestamps?.picked_up || '09:05 AM'}</span>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-orange-500 text-white" />
                <div className="flex justify-between items-start">
                  <span>In Transit</span>
                  <span className="text-[9px] text-orange-600">Active</span>
                </div>
              </div>

              <div className="relative opacity-60">
                <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-slate-200" />
                <div className="flex justify-between items-start">
                  <span className="text-slate-400">Arriving</span>
                  <span className="text-[9px] text-slate-400 font-normal">--</span>
                </div>
              </div>

              <div className="relative opacity-60">
                <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-slate-200" />
                <div className="flex justify-between items-start">
                  <span className="text-slate-400">Delivered</span>
                  <span className="text-[9px] text-slate-400 font-normal">--</span>
                </div>
              </div>

            </div>
          </div>

          {/* Delivery Information */}
          <div className="space-y-3.5 border-t border-slate-100 pt-4">
            <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Delivery Information</span>
            
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 p-2.5 rounded-2xl">
              <img src={delivery.image} alt={delivery.product} className="w-9 h-9 rounded-lg object-cover" />
              <div>
                <h5 className="font-extrabold text-slate-900 leading-none">{delivery.product}</h5>
                <p className="text-[9px] text-slate-500 font-bold mt-0.5">{delivery.quantity} &bull; <span className="text-green-700">Perishable</span></p>
              </div>
            </div>

            <div className="space-y-3 text-[11px] font-bold text-slate-700 pl-1">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center font-bold text-[9px] flex-shrink-0 mt-0.5">F</div>
                <div>
                  <h6 className="text-slate-800 leading-none">{delivery.pickup_hub || 'Green Valley Farm'}</h6>
                  <p className="text-[9px] text-slate-400 mt-0.5">0712 345 678 &bull; {delivery.pickup_county}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center font-bold text-[9px] flex-shrink-0 mt-0.5">B</div>
                <div>
                  <h6 className="text-slate-800 leading-none">{delivery.dropoff_name || 'John Mwangi'}</h6>
                  <p className="text-[9px] text-slate-400 mt-0.5">0722 987 654 &bull; {delivery.dropoff_county}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions grid */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Quick Actions</span>
            
            <div className="grid grid-cols-3 gap-2 font-bold text-[9px]">
              <button onClick={() => toast.info("Status options are located at the bottom left.")} className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-1 text-slate-700">
                Update Status
              </button>
              <button onClick={() => toast.success("GPS direction launched.")} className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-1 text-slate-700">
                Navigate
              </button>
              <button onClick={() => toast.info("Coordinates shared with customer.")} className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-1 text-slate-700">
                Share Location
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
              <a href={`tel:${delivery.dropoff_phone}`} className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-1 text-slate-700">
                Call Buyer
              </a>
              <button onClick={() => navigate('/transporter/chat')} className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-1 text-slate-700">
                <MessageSquare className="w-3 h-3 text-emerald-600" /> Message Buyer
              </button>
              <a href={`tel:${delivery.pickup_phone}`} className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-1 text-slate-700">
                Call Farmer
              </a>
              <button onClick={() => navigate('/transporter/chat')} className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-1 text-slate-700">
                <MessageSquare className="w-3 h-3 text-emerald-600" /> Message Farmer
              </button>
            </div>
          </div>

          {/* Delivery Notes */}
          <div className="border-t border-slate-100 pt-4 relative">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Delivery Notes</span>
              <button className="text-slate-400 hover:text-slate-600">
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
            <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-150/60 leading-relaxed text-[11px]">
              {delivery.special_instructions}
            </p>
          </div>

          {/* Notifications feed widget */}
          <div className="border-t border-slate-100 pt-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Notifications</span>
              <button className="text-[9px] text-sky-600 hover:underline font-extrabold">View All</button>
            </div>

            <div className="space-y-3 text-[10px] font-bold text-slate-700">
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-[8px] flex-shrink-0 mt-0.5">✓</div>
                <div className="flex-1 min-w-0">
                  <p>Buyer viewed your live location</p>
                  <span className="text-[8px] text-slate-400 font-normal mt-0.5">2 min ago</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center font-bold text-[8px] flex-shrink-0 mt-0.5">!</div>
                <div className="flex-1 min-w-0">
                  <p>Traffic congestion ahead on A104</p>
                  <span className="text-[8px] text-slate-400 font-normal mt-0.5">10 min ago</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-[8px] flex-shrink-0 mt-0.5">✉</div>
                <div className="flex-1 min-w-0">
                  <p>Farmer sent you a message</p>
                  <span className="text-[8px] text-slate-400 font-normal mt-0.5">15 min ago</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function Tracking() {
  return (
    <ProtectedRoute roles={['transporter']}>
      <DashboardLayout>
        <TrackingContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
