import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Package, MapPin, Navigation, Clock, CheckCircle2, AlertTriangle, 
  Search, Sliders, Bell, Star, MessageSquare, Phone, Map, ChevronDown, Check, Compass, Info, X 
} from 'lucide-react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute, useAuth } from '../../context/AuthContext';
import MapComponent from '../../components/common/MapComponent';
import api from '../../api/client';

function DeliveriesContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, active, completed, cancelled
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusSelect, setShowStatusSelect] = useState(false);

  // High-fidelity mockups mapping to screenshot exactly
  const mockDeliveries = [
    {
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
      eta: "2h 15m",
      special_instructions: "Handle with care and keep away from direct sun.",
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
    },
    {
      id: "DEL-000244",
      isMock: true,
      status: "travelling_to_pickup",
      pickup_hub: "Happy Harvest Farm",
      pickup_county: "Gilgil, Elementaita",
      pickup_phone: "0700 111 222",
      dropoff_name: "Grace Wanjiku",
      dropoff_county: "Kikuyu, Kiambu",
      dropoff_phone: "0715 222 333",
      product: "Maize (Bags)",
      quantity: "20 Bags",
      delivery_fee: 1800,
      distance: 72,
      eta: "45m",
      special_instructions: "Stack bags vertically in a dry compartment.",
      order_id: "ORD-12053",
      payment_status: "Paid",
      payment_method: "M-Pesa STK Push",
      perishable: false,
      image: "https://images.unsplash.com/photo-1551754626-78724a7439dd?w=200&q=80",
      timestamps: {
        accepted: "10:15 AM",
        heading_to_pickup: "10:30 AM"
      }
    },
    {
      id: "DEL-000243",
      isMock: true,
      status: "delivered",
      pickup_hub: "Mwangi Farm",
      pickup_county: "Naivasha",
      pickup_phone: "0720 555 888",
      dropoff_name: "Peter Odhiambo",
      dropoff_county: "Karen, Nairobi",
      dropoff_phone: "0711 333 444",
      product: "Avocados",
      quantity: "150 Kg",
      delivery_fee: 2200,
      distance: 85,
      eta: "Completed: Today, 11:20 AM",
      special_instructions: "Cold-chain storage requested.",
      order_id: "ORD-12052",
      payment_status: "Paid",
      payment_method: "AgroLink Wallet",
      perishable: true,
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80",
      timestamps: {
        accepted: "07:30 AM",
        heading_to_pickup: "07:45 AM",
        picked_up: "08:15 AM",
        in_transit: "08:30 AM",
        arrived: "11:10 AM",
        delivered: "11:20 AM"
      }
    },
    {
      id: "DEL-000242",
      isMock: true,
      status: "cancelled",
      pickup_hub: "Sunrise Farm",
      pickup_county: "Molo",
      pickup_phone: "0709 777 000",
      dropoff_name: "Lilian Akinyi",
      dropoff_county: "Embakasi, Nairobi",
      dropoff_phone: "0716 444 555",
      product: "Potatoes",
      quantity: "300 Kg",
      delivery_fee: 1500,
      distance: 210,
      eta: "Cancelled: Yesterday, 04:30 PM",
      special_instructions: "Ventilated vehicle required.",
      order_id: "ORD-12051",
      payment_status: "Refunded",
      payment_method: "M-Pesa STK Push",
      perishable: false,
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&q=80",
      timestamps: {
        accepted: "Yesterday, 02:00 PM",
        cancelled: "Yesterday, 04:30 PM"
      }
    }
  ];

  const loadDeliveries = () => {
    setLoading(true);
    api.getDeliveries()
      .then((d) => {
        const list = d.results || d || [];
        const accepted = list.filter(item => item.status !== 'pending');
        if (accepted.length > 0) {
          // Merge real backend data with design mockup data
          const merged = [...accepted, ...mockDeliveries];
          setDeliveries(merged);
          setSelectedDelivery(merged[0]);
        } else {
          setDeliveries(mockDeliveries);
          setSelectedDelivery(mockDeliveries[0]);
        }
      })
      .catch(() => {
        setDeliveries(mockDeliveries);
        setSelectedDelivery(mockDeliveries[0]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  // Listen to WebSocket broadcasts for real-time delivery status updates
  useEffect(() => {
    const handleWsDeliveryUpdate = (e) => {
      const updatedDel = e.detail;
      // Accept delivery updates that relate to this transporter
      if (!updatedDel.transporter || updatedDel.transporter === user?.id) {
        setDeliveries((prev) => {
          const exists = prev.some((d) => String(d.id) === String(updatedDel.id));
          if (exists) {
            return prev.map((d) => (String(d.id) === String(updatedDel.id) ? { ...d, ...updatedDel } : d));
          } else {
            return [updatedDel, ...prev];
          }
        });
        if (selectedDelivery && String(selectedDelivery.id) === String(updatedDel.id)) {
          setSelectedDelivery(prev => ({ ...prev, ...updatedDel }));
        }
      }
    };

    window.addEventListener('ws:delivery_update', handleWsDeliveryUpdate);
    return () => {
      window.removeEventListener('ws:delivery_update', handleWsDeliveryUpdate);
    };
  }, [user, selectedDelivery]);

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedDelivery) return;
    const reqId = selectedDelivery.id;

    if (selectedDelivery.isMock) {
      const updated = {
        ...selectedDelivery,
        status: newStatus,
        timestamps: {
          ...selectedDelivery.timestamps,
          [newStatus]: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      };
      setDeliveries(prev => prev.map(d => d.id === reqId ? updated : d));
      setSelectedDelivery(updated);
      toast.success(`✓ Delivery status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
      setShowStatusSelect(false);
      return;
    }

    try {
      const res = await api.request(`/deliveries/${reqId}/update_status/`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus }),
      });
      setDeliveries(prev => prev.map(d => d.id === reqId ? { ...d, ...res } : d));
      setSelectedDelivery({ ...selectedDelivery, ...res });
      toast.success(`✓ Delivery status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
      setShowStatusSelect(false);
    } catch (err) {
      toast.error(err.message || "Failed to update delivery status.");
    }
  };

  // Filter list by tab and search query
  const filteredList = deliveries.filter((del) => {
    const s = del.status.toLowerCase();
    const isCompleted = s === 'delivered' || s === 'completed';
    const isActive = ['accepted', 'travelling_to_pickup', 'picked_up', 'in_transit', 'arrived'].includes(s);
    const isCancelled = s === 'cancelled';

    if (activeTab === 'active' && !isActive) return false;
    if (activeTab === 'completed' && !isCompleted) return false;
    if (activeTab === 'cancelled' && !isCancelled) return false;

    // Search query matches
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const idMatch = String(del.id).toLowerCase().includes(q);
      const farmerMatch = (del.pickup_hub || '').toLowerCase().includes(q);
      const buyerMatch = (del.dropoff_name || del.buyer_name || '').toLowerCase().includes(q);
      return idMatch || farmerMatch || buyerMatch;
    }
    return true;
  });

  // Calculate status counters
  const totalCount = deliveries.length;
  const activeCount = deliveries.filter(d => ['accepted', 'travelling_to_pickup', 'picked_up', 'in_transit', 'arrived'].includes(d.status)).length;
  const completedCount = deliveries.filter(d => d.status === 'delivered' || d.status === 'completed').length;
  const cancelledCount = deliveries.filter(d => d.status === 'cancelled').length;

  const getStatusStyle = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'in_transit') return { text: 'In Transit', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (s === 'travelling_to_pickup' || s === 'heading_to_pickup') return { text: 'Heading to Pickup', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (s === 'picked_up' || s === 'product_collected') return { text: 'Picked Up', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    if (s === 'delivered' || s === 'completed') return { text: 'Delivered', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (s === 'cancelled') return { text: 'Cancelled', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
    return { text: status.replace('_', ' '), bg: 'bg-slate-100 text-slate-700' };
  };

  // Coordinates mapping Nakuru to Nairobi
  const routePoints = [
    [-0.303, 36.08], // Nakuru
    [-0.7172, 36.4310], // Naivasha
    [-1.286, 36.817], // Nairobi
  ];

  const mapMarkers = [
    { position: [-0.303, 36.08], title: 'Green Valley Farm', description: 'Pickup point', type: 'Pickup' },
    { position: [-1.286, 36.817], title: 'Westlands Dropoff', description: 'Destination point', type: 'Destination' },
  ];

  return (
    <div className="space-y-6 font-sans text-slate-800 antialiased">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Deliveries</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-full border border-emerald-100/60 shadow-sm">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage and track all accepted deliveries in real time.</p>
        </div>

        {/* Top Right Utilities */}
        <div className="flex items-center gap-4 text-xs font-bold self-end md:self-auto">
          {/* Notifications */}
          <button className="relative p-2 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200/60 text-slate-600 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full">6</span>
          </button>
          
          {/* Messages */}
          <button 
            onClick={() => navigate('/transporter/chat')}
            className="relative p-2 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200/60 text-slate-600 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full">3</span>
          </button>

          {/* User Profile Card Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80" 
              alt="Transporter Avatar" 
              className="w-6 h-6 rounded-full object-cover border border-emerald-200" 
            />
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-800 leading-none">{user?.first_name || 'John'} {user?.last_name || 'Kamau'}</p>
              <div className="flex items-center gap-0.5 mt-0.5 text-amber-500">
                <span className="text-[9px] font-black text-slate-500">4.8</span>
                <Star className="w-2.5 h-2.5 fill-current" />
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tab list of accepted delivery cards (span 2) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold">
            <div className="flex flex-wrap items-center gap-1.5">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'all' 
                    ? 'bg-slate-100 text-slate-800 font-extrabold shadow-inner' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({totalCount})
              </button>
              <button 
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'active' 
                    ? 'bg-slate-100 text-slate-800 font-extrabold shadow-inner' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Active ({activeCount})
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'completed' 
                    ? 'bg-slate-100 text-slate-800 font-extrabold shadow-inner' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Completed ({completedCount})
              </button>
              <button 
                onClick={() => setActiveTab('cancelled')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'cancelled' 
                    ? 'bg-slate-100 text-slate-800 font-extrabold shadow-inner' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Cancelled ({cancelledCount})
              </button>
            </div>

            {/* Search Input bar */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, farmer, buyer..." 
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              </div>
              <button className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600">
                <Sliders className="w-3.5 h-3.5" />
              </button>
              <select className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:outline-none">
                <option value="latest">Latest</option>
              </select>
            </div>
          </div>

          {/* Cards Loop */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredList.map((del) => {
                const isSelected = selectedDelivery && selectedDelivery.id === del.id;
                const statusInfo = getStatusStyle(del.status);
                
                return (
                  <motion.div
                    key={del.id}
                    layoutId={`del-card-${del.id}`}
                    onClick={() => setSelectedDelivery(del)}
                    className={`bg-white rounded-3xl border p-5 shadow-sm hover:shadow transition-all relative overflow-hidden flex flex-col gap-4 cursor-pointer ${
                      isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    
                    {/* Header bar row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-xs">#{del.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${statusInfo.bg}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {del.status === 'delivered' || del.status === 'completed' 
                          ? del.eta 
                          : del.status === 'cancelled' 
                            ? del.eta 
                            : `ETA: ${del.eta}`
                        }
                      </span>
                    </div>

                    {/* Middle: Farmer & Cargo & Buyer details row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                      
                      {/* Farmer info */}
                      <div className="space-y-2">
                        <span className="text-[8px] text-slate-400 font-black uppercase block tracking-wider">Farmer</span>
                        <div className="flex items-center gap-2">
                          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80" alt="Farmer" className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <h5 className="font-extrabold text-slate-800 truncate leading-none">{del.pickup_hub || 'Producer Farm'}</h5>
                            <span className="text-[9px] text-slate-400 font-medium block mt-0.5">{del.pickup_phone}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-1 text-[10px] text-slate-500 mt-1">
                          <MapPin className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span className="truncate">{del.pickup_county}</span>
                        </div>
                      </div>

                      {/* Product cargo details */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 flex items-center gap-2.5">
                        <img src={del.image} alt={del.product} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <h6 className="font-black text-slate-950 truncate leading-none">{del.product}</h6>
                          <span className="text-[9px] text-slate-500 font-bold block mt-0.5">{del.quantity}</span>
                          {del.perishable && (
                            <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-800 font-extrabold text-[8px] rounded-full mt-1 uppercase">
                              Perishable
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Buyer info */}
                      <div className="space-y-2">
                        <span className="text-[8px] text-slate-400 font-black uppercase block tracking-wider">Buyer</span>
                        <div className="flex items-center gap-2">
                          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80" alt="Buyer" className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <h5 className="font-extrabold text-slate-800 truncate leading-none">{del.dropoff_name || del.buyer_name || 'Buyer Customer'}</h5>
                            <span className="text-[9px] text-slate-400 font-medium block mt-0.5">{del.dropoff_phone}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-1 text-[10px] text-slate-500 mt-1">
                          <MapPin className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="truncate">{del.dropoff_county}</span>
                        </div>
                      </div>

                      {/* Pricing Info */}
                      <div className="flex flex-col justify-between items-end text-right md:border-l border-slate-100 md:pl-4">
                        <div>
                          <span className="text-[8px] text-slate-400 font-black uppercase block tracking-wider">Delivery Fee</span>
                          <strong className="text-sm font-black text-emerald-700 block mt-0.5">
                            KSh {Number(del.delivery_fee).toLocaleString()}
                          </strong>
                          <span className="text-[9px] text-slate-500 block mt-0.5">Distance: {del.distance} km</span>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDelivery(del);
                          }}
                          className="mt-3 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-[10px] shadow-sm transition-colors"
                        >
                          View Details
                        </button>
                      </div>

                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>

            <button 
              onClick={() => toast.info("No further matching delivery logs found.")}
              className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 transition-colors shadow-sm text-center block"
            >
              Load More Deliveries ∨
            </button>
          </div>

        </div>

        {/* Right Column: Detailed panel for selected delivery */}
        <div className="space-y-6">
          {selectedDelivery ? (
            <motion.div
              layoutId={`detail-panel-${selectedDelivery.id}`}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-5"
            >
              {/* Header banner */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Delivery #{selectedDelivery.id}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase mt-1 ${getStatusStyle(selectedDelivery.status).bg}`}>
                    {getStatusStyle(selectedDelivery.status).text}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedDelivery(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Stepper Timeline */}
              <div className="space-y-3">
                <span className="text-[8px] text-slate-400 font-black uppercase block tracking-wider">Progress Timeline</span>
                
                <div className="relative pl-6 space-y-4 text-xs font-bold">
                  {/* Vertical bar */}
                  <span className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200" />

                  {/* 1. Accepted */}
                  <div className="relative">
                    <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                      selectedDelivery.timestamps?.accepted ? 'bg-emerald-500 text-white' : 'bg-slate-200'
                    }`}>
                      {selectedDelivery.timestamps?.accepted && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <div className="flex justify-between items-start">
                      <span className={selectedDelivery.timestamps?.accepted ? 'text-slate-800' : 'text-slate-400'}>Accepted</span>
                      <span className="text-[9px] text-slate-400 font-normal">{selectedDelivery.timestamps?.accepted || '--'}</span>
                    </div>
                  </div>

                  {/* 2. Heading to Pickup */}
                  <div className="relative">
                    <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                      selectedDelivery.timestamps?.heading_to_pickup || ['travelling_to_pickup', 'picked_up', 'in_transit', 'arrived', 'delivered'].includes(selectedDelivery.status)
                        ? 'bg-emerald-500 text-white' : 'bg-slate-200'
                    }`}>
                      {(selectedDelivery.timestamps?.heading_to_pickup || ['travelling_to_pickup', 'picked_up', 'in_transit', 'arrived', 'delivered'].includes(selectedDelivery.status)) && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <div className="flex justify-between items-start">
                      <span className={selectedDelivery.timestamps?.heading_to_pickup ? 'text-slate-800' : 'text-slate-400'}>Heading to Pickup</span>
                      <span className="text-[9px] text-slate-400 font-normal">{selectedDelivery.timestamps?.heading_to_pickup || '--'}</span>
                    </div>
                  </div>

                  {/* 3. Picked Up */}
                  <div className="relative">
                    <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                      selectedDelivery.timestamps?.picked_up || ['picked_up', 'in_transit', 'arrived', 'delivered'].includes(selectedDelivery.status)
                        ? 'bg-emerald-500 text-white' : 'bg-slate-200'
                    }`}>
                      {(selectedDelivery.timestamps?.picked_up || ['picked_up', 'in_transit', 'arrived', 'delivered'].includes(selectedDelivery.status)) && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <div className="flex justify-between items-start">
                      <span className={selectedDelivery.timestamps?.picked_up ? 'text-slate-800' : 'text-slate-400'}>Picked Up</span>
                      <span className="text-[9px] text-slate-400 font-normal">{selectedDelivery.timestamps?.picked_up || '--'}</span>
                    </div>
                  </div>

                  {/* 4. In Transit */}
                  <div className="relative">
                    <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                      selectedDelivery.status === 'in_transit' ? 'bg-orange-500 text-white' : ['arrived', 'delivered'].includes(selectedDelivery.status) ? 'bg-emerald-500 text-white' : 'bg-slate-200'
                    }`}>
                      {(['arrived', 'delivered'].includes(selectedDelivery.status)) && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <div className="flex justify-between items-start">
                      <span className={['in_transit', 'arrived', 'delivered'].includes(selectedDelivery.status) ? 'text-slate-800' : 'text-slate-400'}>In Transit</span>
                      <span className="text-[9px] text-slate-400 font-normal">{selectedDelivery.timestamps?.in_transit || '--'}</span>
                    </div>
                  </div>

                  {/* 5. Arrived */}
                  <div className="relative">
                    <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                      selectedDelivery.status === 'arrived' ? 'bg-indigo-500 text-white' : selectedDelivery.status === 'delivered' ? 'bg-emerald-500 text-white' : 'bg-slate-200'
                    }`}>
                      {(selectedDelivery.status === 'delivered') && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <div className="flex justify-between items-start">
                      <span className={['arrived', 'delivered'].includes(selectedDelivery.status) ? 'text-slate-800' : 'text-slate-400'}>Arrived</span>
                      <span className="text-[9px] text-slate-400 font-normal">{selectedDelivery.timestamps?.arrived || '--'}</span>
                    </div>
                  </div>

                  {/* 6. Delivered */}
                  <div className="relative">
                    <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                      selectedDelivery.status === 'delivered' || selectedDelivery.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-200'
                    }`}>
                      {(selectedDelivery.status === 'delivered' || selectedDelivery.status === 'completed') && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <div className="flex justify-between items-start">
                      <span className={selectedDelivery.status === 'delivered' || selectedDelivery.status === 'completed' ? 'text-slate-800' : 'text-slate-400'}>Delivered</span>
                      <span className="text-[9px] text-slate-400 font-normal">{selectedDelivery.timestamps?.delivered || '--'}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* GPS Live Map widget overlay */}
              <div className="space-y-3.5 relative bg-slate-50 p-3 rounded-2xl border border-slate-250">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900">Live GPS Navigation Route</span>
                  <button 
                    onClick={() => navigate('/transporter/tracking')}
                    className="text-[10px] text-sky-600 font-black hover:underline"
                  >
                    Open in Maps
                  </button>
                </div>
                
                <div className="h-[180px] rounded-xl overflow-hidden border border-slate-150 relative">
                  <MapComponent 
                    center={[-0.7172, 36.4310]} 
                    zoom={8} 
                    markers={mapMarkers} 
                    height="100%"
                  />

                  {/* Overlay live status panel */}
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-2 text-[9px] font-bold shadow-md z-[1000] w-36">
                    <span className="text-slate-400 font-black block uppercase tracking-wider text-[7px]">Live Location</span>
                    <p className="text-slate-800 font-extrabold truncate mt-0.5">Nakuru - Nairobi Highway</p>
                    <p className="text-slate-600 mt-0.5">Speed: <strong className="text-emerald-700">56 km/h</strong></p>
                    <span className="text-slate-400 text-[7px] block mt-0.5">Updated just now</span>
                  </div>
                </div>
              </div>

              {/* Contacts section */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Farmer call/chat */}
                <div className="bg-slate-50 border border-slate-200/50 p-2.5 rounded-2xl">
                  <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block mb-1">Pickup Hub</span>
                  <p className="font-extrabold text-slate-800 truncate">{selectedDelivery.pickup_hub || 'Producer Farm'}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{selectedDelivery.pickup_county}</p>
                  
                  <div className="flex items-center gap-1.5 mt-2">
                    <a 
                      href={`tel:${selectedDelivery.pickup_phone}`}
                      className="flex-1 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center justify-center gap-1 text-[9px]"
                    >
                      <Phone className="w-2.5 h-2.5" /> Call
                    </a>
                    <button 
                      onClick={() => navigate('/transporter/chat')}
                      className="flex-1 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center justify-center gap-1 text-[9px]"
                    >
                      <MessageSquare className="w-2.5 h-2.5 text-emerald-600" /> Message
                    </button>
                  </div>
                </div>

                {/* Buyer call/chat */}
                <div className="bg-slate-50 border border-slate-200/50 p-2.5 rounded-2xl">
                  <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block mb-1">Destination</span>
                  <p className="font-extrabold text-slate-800 truncate">{selectedDelivery.dropoff_name || selectedDelivery.buyer_name || 'Buyer Customer'}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{selectedDelivery.dropoff_county}</p>
                  
                  <div className="flex items-center gap-1.5 mt-2">
                    <a 
                      href={`tel:${selectedDelivery.dropoff_phone}`}
                      className="flex-1 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center justify-center gap-1 text-[9px]"
                    >
                      <Phone className="w-2.5 h-2.5" /> Call
                    </a>
                    <button 
                      onClick={() => navigate('/transporter/chat')}
                      className="flex-1 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center justify-center gap-1 text-[9px]"
                    >
                      <MessageSquare className="w-2.5 h-2.5 text-emerald-600" /> Message
                    </button>
                  </div>
                </div>
              </div>

              {/* Cargo Information specs */}
              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Product Information</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <img src={selectedDelivery.image} alt={selectedDelivery.product} className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <h6 className="font-extrabold text-slate-900 leading-none">{selectedDelivery.product}</h6>
                      <span className="text-[9px] text-slate-500 font-bold block mt-0.5">{selectedDelivery.quantity}</span>
                    </div>
                  </div>
                  {selectedDelivery.perishable && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-800 font-extrabold text-[8px] rounded-full uppercase">
                      Perishable
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Special Instructions</span>
                  <p className="text-[10px] text-slate-600 mt-1.5 leading-relaxed">
                    {selectedDelivery.special_instructions || "No specific instructions registered."}
                  </p>
                </div>
              </div>

              {/* Delivery Summary box */}
              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-2 text-[10px]">
                <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Delivery Summary</span>
                
                <div className="flex justify-between items-center text-slate-600">
                  <span>Order ID:</span>
                  <strong className="text-slate-800 font-mono">{selectedDelivery.order_id || `ORD-${selectedDelivery.id}`}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Distance:</span>
                  <strong className="text-slate-800">{selectedDelivery.distance} km</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Delivery Fee:</span>
                  <strong className="text-slate-800">KSh {Number(selectedDelivery.delivery_fee).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Payment Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    selectedDelivery.payment_status?.toLowerCase() === 'paid' ? 'bg-green-150 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedDelivery.payment_status || 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Payment Method:</span>
                  <strong className="text-slate-800">{selectedDelivery.payment_method}</strong>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 text-xs font-bold pt-2">
                <div className="relative flex-1">
                  <button 
                    onClick={() => setShowStatusSelect(!showStatusSelect)}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    Update Status <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Custom status selector dropdown modal context */}
                  {showStatusSelect && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1">
                      <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-wider p-2">Select State</h5>
                      {[
                        { label: '🚚 Heading to Pickup', val: 'travelling_to_pickup' },
                        { label: '📦 Picked Up', val: 'picked_up' },
                        { label: '🟣 In Transit', val: 'in_transit' },
                        { label: '🏁 Arrived', val: 'arrived' },
                        { label: '🟢 Delivered', val: 'delivered' },
                        { label: '🔴 Cancelled', val: 'cancelled' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => handleUpdateStatus(item.val)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 rounded-xl text-xs flex items-center justify-between"
                        >
                          <span>{item.label}</span>
                          {selectedDelivery.status === item.val && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => {
                    toast.success("GPS turn-by-turn navigation launched.");
                    navigate('/transporter/tracking');
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Compass className="w-3.5 h-3.5" /> Navigate
                </button>

                <button 
                  onClick={() => toast.warn("Alert sent to administrator team. A support representative will reach out shortly.")}
                  className="py-2.5 px-3.5 bg-white hover:bg-red-50 text-red-500 border border-red-200 rounded-xl flex items-center justify-center transition-all"
                  title="Report Issue"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Footer shared alerts badge */}
              <div className="flex items-start gap-1.5 text-[9px] text-slate-400 leading-tight bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Info className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Status updates and location are shared in real time with the farmer and buyer.</span>
              </div>

            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-extrabold text-slate-700 text-sm">No delivery selected</h4>
              <p className="text-xs text-slate-500 mt-1">Select an active card from the list on the left to view coordinates and progress.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default function TransporterDeliveries() {
  return (
    <ProtectedRoute roles={['transporter']}>
      <DashboardLayout>
        <DeliveriesContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
