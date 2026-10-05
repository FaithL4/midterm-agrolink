import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Truck, Package, DollarSign, Star, Navigation, MapPin, Clock, 
  CheckCircle, AlertCircle, MessageSquare, ArrowRight, ShieldCheck, 
  Zap, Calendar, BarChart2, User, Phone, Power, Check, X, Eye 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip 
} from 'recharts';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute, useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import MapComponent from '../../components/common/MapComponent';
import MuiDataTable from '../../components/common/MuiDataTable';

function TransporterDashboardContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Deliveries State
  const [deliveries, setDeliveries] = useState([]);
  
  // Real-time route parameters
  const routePoints = [
    [-0.3031, 36.0800], // Nakuru Pick Up
    [-0.7172, 36.4310], // Naivasha Stopover
    [-1.286389, 36.817223], // Nairobi Wholesale Market
  ];

  const routeMarkers = [
    { position: [-0.3031, 36.0800], title: 'Farmer Pickup Point', description: 'Dry White Maize ( Kamau Farm, Nakuru )', type: 'Pickup' },
    { position: [-0.7172, 36.4310], title: 'Naivasha Weighbridge Checkpoint', description: 'Cargo Inspection Passed', type: 'Transit' },
    { position: [-1.286389, 36.817223], title: 'Buyer Delivery Hub', description: 'Naivas Distribution Center, Industrial Area', type: 'Destination' },
  ];

  // Default synthetic trips
  const defaultDeliveries = [
    {
      id: 'DEL-8801',
      order_id: 'ORD-0980',
      buyer_name: 'Naivas Supermarket',
      farmer_name: 'John Kamau',
      pickup_location: 'Subukia Farm, Nakuru County',
      delivery_location: 'Industrial Area Depot, Nairobi',
      pickup_time: '08:30 AM',
      cargo: '50 Bags Dry White Maize (4.5 Tons)',
      fee: 35000,
      status: 'in_transit',
      distance: '158 Km',
      eta: '45 mins'
    },
    {
      id: 'DEL-8802',
      order_id: 'ORD-0981',
      buyer_name: 'Mercy Atieno',
      farmer_name: 'Mary Wanjiku',
      pickup_location: 'Molo Agricultural Hub, Nakuru',
      delivery_location: 'Kilimani Apartments, Nairobi',
      pickup_time: '11:00 AM',
      cargo: '20 Crates Beef Tomatoes (600 Kg)',
      fee: 14000,
      status: 'ready_for_pickup',
      distance: '162 Km',
      eta: '2 hrs 10 mins'
    },
    {
      id: 'DEL-8803',
      order_id: 'ORD-0982',
      buyer_name: 'Zucchini Green Grocers',
      farmer_name: 'Peter Mwangi',
      pickup_location: 'Kieni East, Nyeri County',
      delivery_location: 'Westlands Mall Store #12, Nairobi',
      pickup_time: '02:15 PM',
      cargo: '30 Bags Irish Potatoes (1.8 Tons)',
      fee: 22000,
      status: 'accepted',
      distance: '145 Km',
      eta: '3 hrs'
    },
    {
      id: 'DEL-8799',
      order_id: 'ORD-0975',
      buyer_name: 'John K.',
      farmer_name: 'Koech Agro',
      pickup_location: 'Eldoret Sector 4, Uasin Gishu',
      delivery_location: 'Nakuru Town Depot',
      pickup_time: 'Yesterday',
      cargo: '150 Crates Hass Avocados',
      fee: 28000,
      status: 'delivered',
      distance: '95 Km',
      eta: 'Completed'
    }
  ];

  // Incoming Job Request Alert
  const newJobRequest = {
    id: 'DEL-8810',
    order_id: 'ORD-0995',
    buyer_name: 'FreshAnce Grocers Ltd',
    farmer_name: 'Njoroge Farmers Co-op',
    pickup_location: 'Naivasha Greenhouses, Nakuru',
    delivery_location: 'City Market, Nairobi CBD',
    cargo: '80 Crates Fresh Capsicum & Spinach',
    distance: '92 Km',
    estimated_time: '1 hr 35 mins',
    payout: 24500
  };

  useEffect(() => {
    api.getDeliveries()
      .then((d) => {
        const list = d.results || d;
        setDeliveries(list.length > 0 ? list : defaultDeliveries);
      })
      .catch(() => {
        setDeliveries(defaultDeliveries);
      })
      .finally(() => setLoading(false));

    // Show instant delivery request popup after 2 seconds
    const timer = setTimeout(() => {
      setShowRequestModal(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleWsDelivery = (e) => {
      const updatedDel = e.detail;
      setDeliveries((prev) => {
        const exists = prev.some((d) => d.id === updatedDel.id);
        if (exists) {
          return prev.map((d) => (d.id === updatedDel.id ? updatedDel : d));
        } else {
          return [updatedDel, ...prev];
        }
      });
      // Show job request modal if new request is pending and availability is online
      if (updatedDel.status === 'pending' && !updatedDel.transporter && isOnline) {
        toast.info("🔔 New Delivery request received!");
        setShowRequestModal(true);
      }
    };

    window.addEventListener('ws:delivery_update', handleWsDelivery);
    return () => {
      window.removeEventListener('ws:delivery_update', handleWsDelivery);
    };
  }, [isOnline]);

  const handleAcceptRequest = () => {
    setShowRequestModal(false);
    toast.success(`Trip Request Accepted! Earnings: KES ${newJobRequest.payout.toLocaleString()}`, { autoClose: 3000 });
    setDeliveries(prev => [
      {
        id: newJobRequest.id,
        order_id: newJobRequest.order_id,
        buyer_name: newJobRequest.buyer_name,
        farmer_name: newJobRequest.farmer_name,
        pickup_location: newJobRequest.pickup_location,
        delivery_location: newJobRequest.delivery_location,
        pickup_time: 'Immediate',
        cargo: newJobRequest.cargo,
        fee: newJobRequest.payout,
        status: 'accepted',
        distance: newJobRequest.distance,
        eta: newJobRequest.estimated_time
      },
      ...prev
    ]);
  };

  const handleDeclineRequest = () => {
    setShowRequestModal(false);
    toast.info("Trip request declined. Looking for next available load...");
  };

  const handleToggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (nextState) {
      toast.success("🟢 You are now ONLINE & ready to receive agricultural cargo requests!", { autoClose: 2500 });
    } else {
      toast.warn("⚪ You are now OFFLINE. No new trip requests will be assigned.", { autoClose: 2500 });
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'pending' || s === 'pending_request') {
      return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200">🟡 Pending Request</span>;
    }
    if (s === 'accepted') {
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200">🟢 Accepted</span>;
    }
    if (s === 'ready_for_pickup') {
      return <span className="px-3 py-1 bg-earth-100 text-earth-800 rounded-full text-xs font-bold border border-earth-200">🟠 Ready for Pickup</span>;
    }
    if (s === 'in_transit' || s === 'picked_up') {
      return <span className="px-3 py-1 bg-earth-100 text-earth-800 rounded-full text-xs font-bold border border-earth-200">🟠 In Transit</span>;
    }
    if (s === 'delivered' || s === 'completed') {
      return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">🟢 Delivered</span>;
    }
    return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">{status}</span>;
  };

  // Chart Data
  const earningsData = [
    { day: 'Mon', Earnings: 18000, Trips: 3 },
    { day: 'Tue', Earnings: 24000, Trips: 4 },
    { day: 'Wed', Earnings: 32000, Trips: 5 },
    { day: 'Thu', Earnings: 28000, Trips: 4 },
    { day: 'Fri', Earnings: 42500, Trips: 6 },
    { day: 'Sat', Earnings: 38000, Trips: 5 },
    { day: 'Sun', Earnings: 22000, Trips: 3 },
  ];

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* 1. Header & Online/Offline Status Switch */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Welcome Back, {user?.first_name} {user?.last_name || 'Transporter'}! 🚚
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            <span>&bull; Registered Vehicle: <strong className="text-slate-800 font-mono">{user?.profile?.vehicle_plate ? `${user.profile.vehicle_plate} (${user.profile.vehicle_type})` : 'KCJ 892X (Isuzu 5-Ton)'}</strong></span>
          </p>
        </div>

        {/* Online / Offline Availability Switch */}
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-600">Driver Availability:</span>
          <button
            onClick={handleToggleOnline}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-sm ${
              isOnline 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
            }`}
          >
            <Power className="w-4 h-4" />
            {isOnline ? '🟢 ONLINE (Ready for Trips)' : '⚪ OFFLINE'}
          </button>
        </div>
      </div>

      {/* 2. 6 Bolt-Style Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Active Deliveries */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-4 rounded-3xl shadow-sm">
          <div className="p-2 bg-white/20 rounded-xl w-fit mb-2">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-100">Active Deliveries</span>
          <h3 className="text-xl font-black mt-0.5">3 Trips</h3>
          <p className="text-[11px] text-green-200 mt-1">In transit to buyers</p>
        </div>

        {/* Pending Requests */}
        <div className="bg-gradient-to-br from-earth-500 to-earth-700 text-white p-4 rounded-3xl shadow-sm">
          <div className="p-2 bg-white/20 rounded-xl w-fit mb-2">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-earth-100">Pending Requests</span>
          <h3 className="text-xl font-black mt-0.5">5 New Jobs</h3>
          <p className="text-[11px] text-earth-200 mt-1">Ready for pickup</p>
        </div>

        {/* Completed Deliveries */}
        <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-4 rounded-3xl shadow-sm">
          <div className="p-2 bg-white/20 rounded-xl w-fit mb-2">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-100">Completed</span>
          <h3 className="text-xl font-black mt-0.5">148 Trips</h3>
          <p className="text-[11px] text-green-200 mt-1">98.5% Success rate</p>
        </div>

        {/* Today's Earnings */}
        <div className="bg-gradient-to-br from-earth-500 to-amber-600 text-white p-4 rounded-3xl shadow-sm">
          <div className="p-2 bg-white/20 rounded-xl w-fit mb-2">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-earth-100">Today's Earnings</span>
          <h3 className="text-xl font-black mt-0.5">KES 42,500</h3>
          <p className="text-[11px] text-earth-200 mt-1">Instant Payouts</p>
        </div>

        {/* Rating */}
        <div className="bg-gradient-to-br from-teal-600 to-green-700 text-white p-4 rounded-3xl shadow-sm">
          <div className="p-2 bg-white/20 rounded-xl w-fit mb-2">
            <Star className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-100">Average Rating</span>
          <h3 className="text-xl font-black mt-0.5">4.9 ★</h3>
          <p className="text-[11px] text-green-200 mt-1">112 Top Reviews</p>
        </div>

        {/* Total Distance */}
        <div className="bg-gradient-to-br from-earth-600 to-earth-700 text-white p-4 rounded-3xl shadow-sm">
          <div className="p-2 bg-white/20 rounded-xl w-fit mb-2">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-earth-100">Distance</span>
          <h3 className="text-xl font-black mt-0.5">342 Km</h3>
          <p className="text-[11px] text-earth-200 mt-1">Covered today</p>
        </div>
      </div>


      {/* 3. Quick Actions Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Quick Logistics Controls</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <button 
            onClick={() => navigate('/transporter/deliveries')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Package className="w-4 h-4" /> View Delivery Requests ({defaultDeliveries.length})
          </button>
          <button 
            onClick={() => navigate('/transporter/tracking')}
            className="px-4 py-2 bg-earth-500 hover:bg-earth-600 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Navigation className="w-4 h-4" /> Start Navigation Map
          </button>
          <button 
            onClick={() => navigate('/farmer/chat')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" /> Open Messages
          </button>
        </div>
      </div>

      {/* 4 & 5. Today's Deliveries + Real-Time Live GPS Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Today's Deliveries Stream (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" /> Today's Cargo Deliveries
              </h3>
              <p className="text-xs text-slate-400">Assigned trips from farmers to buyer distribution points</p>
            </div>
            <button 
              onClick={() => navigate('/transporter/deliveries')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {deliveries.map((del) => (
              <div 
                key={del.id} 
                className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-200 transition-all space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-xs font-mono">{del.id}</span>
                    <span className="text-[11px] text-slate-400 font-mono">&bull; #{del.order_id}</span>
                  </div>
                  {getStatusBadge(del.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Farmer Pickup Point:</span>
                    <strong className="text-slate-800">{del.farmer_name}</strong>
                    <p className="text-slate-500 truncate">{del.pickup_location}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Buyer Destination:</span>
                    <strong className="text-slate-800">{del.buyer_name}</strong>
                    <p className="text-slate-500 truncate">{del.delivery_location}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="font-bold text-slate-700">{del.cargo}</span>
                  <span className="font-black text-emerald-700 text-sm">KES {Number(del.fee).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Interactive Leaflet GPS Map (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" /> Live GPS Navigation Map
                </h3>
                <p className="text-xs text-slate-400">Real-time trip route & checkpoint markers</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold animate-pulse">
                LIVE TRIP
              </span>
            </div>

            <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <MapComponent 
                center={[-0.7172, 36.4310]} 
                zoom={9} 
                routePoints={routePoints} 
                markers={routeMarkers} 
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Current Route:</span>
              <span className="text-emerald-700">Subukia Farm ➔ Nairobi Depot</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Distance / ETA:</span>
              <span>158 Km &bull; 45 Mins remaining</span>
            </div>
          </div>
        </div>

      </div>

      {/* 8. Earnings Analytics Chart & Reports */}
      <div id="earnings" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-600" /> Weekly Earnings Overview
            </h3>
            <p className="text-xs text-slate-400">Total freight payouts earned this week</p>
          </div>
          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Total Week: KES 204,500
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `KES ${val/1000}k`} />
              <RechartsTooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Earnings']} />
              <Bar dataKey="Earnings" fill="#059669" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-time Delivery Request Modal (Bolt Alert Style) */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Zap className="w-5 h-5 text-white animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider">New Delivery Request!</h3>
                    <p className="text-xs text-amber-100">Agricultural Cargo Load Alert</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-mono font-bold">0:45s</span>
              </div>

              {/* Body Details */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Payout</span>
                    <h2 className="text-2xl font-black text-emerald-700">KES {Number(newJobRequest.payout).toLocaleString()}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Trip Distance</span>
                    <p className="font-black text-slate-800 text-sm">{newJobRequest.distance} ({newJobRequest.estimated_time})</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Pickup Location (Farmer):</span>
                    <strong className="text-slate-900">{newJobRequest.farmer_name}</strong>
                    <p className="text-slate-600">{newJobRequest.pickup_location}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Delivery Destination (Buyer):</span>
                    <strong className="text-slate-900">{newJobRequest.buyer_name}</strong>
                    <p className="text-slate-600">{newJobRequest.delivery_location}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Cargo Details:</span>
                    <p className="font-bold text-emerald-800">{newJobRequest.cargo}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleDeclineRequest}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all"
                  >
                    ❌ Decline
                  </button>
                  <button
                    onClick={handleAcceptRequest}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1 transition-all"
                  >
                    ✅ Accept Delivery
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TransporterDashboard() {
  return (
    <ProtectedRoute roles={['transporter']}>
      <DashboardLayout>
        <TransporterDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
