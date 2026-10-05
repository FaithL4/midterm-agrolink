import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Truck, Search, Clock, CheckCircle2, XCircle, Eye, Phone, MessageSquare, 
  MapPin, CreditCard, Calendar, User, Package, Box, Sliders, ChevronDown, ChevronRight, X 
} from 'lucide-react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../context/AuthContext';
import api from '../../api/client';

function TransportRequestsContent() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, assigned, completed
  
  // Driver search selector modal states
  const [driverSelectDeliveryId, setDriverSelectDeliveryId] = useState(null);
  const [sortingOption, setSortingOption] = useState('distance'); // distance, price, rating, eta

  const mockDrivers = [
    { id: 1, name: 'Peter Karanja', rating: 4.9, vehicle: 'Toyota Dyna', capacity: '1.5 Tonnes', location: 'Nakuru Town', eta: 18, fee: 2500, phone: '0722 123 456', plate: 'KDA 123A' },
    { id: 2, name: 'Joseph Njoroge', rating: 4.8, vehicle: 'Isuzu ELF', capacity: '3.5 Tonnes', location: 'Lanet', eta: 25, fee: 4200, phone: '0711 987 654', plate: 'KDC 789B' },
    { id: 3, name: 'Grace Wanjiku', rating: 4.7, vehicle: 'Mahindra Scorpio', capacity: '1.0 Tonnes', location: 'Njoro', eta: 30, fee: 2000, phone: '0733 555 444', plate: 'KDB 456C' }
  ];

  const load = () => {
    setLoading(true);
    // API request to fetch deliveries associated with farmer orders
    api.request('/deliveries/')
      .then((d) => {
        const results = d.results || d || [];
        setDeliveries(results);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // Default mock deliveries if database is empty
  const displayDeliveries = deliveries.length > 0 ? deliveries : [
    {
      id: 'DEL-00245',
      order: { id: 'ORD-0980', product: 'Dry White Maize', quantity: '10 Bags', amount: 25000 },
      pickup_location: 'Green Valley Farm, Nakuru',
      delivery_location: 'Mercy Atieno, Westlands, Nairobi',
      estimated_distance: 165,
      suggested_vehicle: 'Pickup / 2-Ton Truck',
      status: 'pending', // pending, assigned, completed
      transporter: null,
      estimated_fee: 2500
    },
    {
      id: 'DEL-00242',
      order: { id: 'ORD-0981', product: 'Molo Irish Potatoes', quantity: '50 Bags', amount: 120000 },
      pickup_location: 'Green Valley Farm, Nakuru',
      delivery_location: 'Naivas Supermarket, Industrial Area, Nairobi',
      estimated_distance: 168,
      suggested_vehicle: 'Lorry / Flatbed',
      status: 'assigned',
      transporter: {
        name: 'Peter Karanja',
        vehicle: 'Toyota Dyna',
        plate: 'KDA 123A',
        phone: '0722 123 456',
        rating: 4.9,
        eta: 18,
        status: 'heading_to_farm' // heading_to_farm, picked_up, in_transit
      },
      estimated_fee: 4500
    },
    {
      id: 'DEL-00230',
      order: { id: 'ORD-0975', product: 'Hass Avocados', quantity: '150 items', amount: 15000 },
      pickup_location: 'Green Valley Farm, Nakuru',
      delivery_location: 'John Kamau, Pipeline Estate, Nakuru',
      estimated_distance: 12,
      suggested_vehicle: 'Motorcycle / Pickup',
      status: 'completed',
      transporter: {
        name: 'Peter Karanja',
        vehicle: 'Toyota Dyna',
        plate: 'KDA 123A',
        phone: '0722 123 456',
        rating: 4.9,
        eta: 0,
        status: 'delivered'
      },
      estimated_fee: 1000
    }
  ];

  const handleSelectDriver = (deliveryId, driver) => {
    toast.info(`Assigning ${driver.name} to delivery ${deliveryId}...`);
    // Optimistic state update or API trigger
    setDeliveries(prev => {
      const target = prev.length > 0 ? prev : displayDeliveries;
      return target.map(del => {
        if (del.id === deliveryId) {
          return {
            ...del,
            status: 'assigned',
            transporter: {
              name: driver.name,
              vehicle: driver.vehicle,
              plate: driver.plate,
              phone: driver.phone,
              rating: driver.rating,
              eta: driver.eta,
              status: 'heading_to_farm'
            },
            estimated_fee: driver.fee
          };
        }
        return del;
      });
    });
    setDriverSelectDeliveryId(null);
    toast.success(`Transporter ${driver.name} successfully assigned! Driver is heading to your farm.`);
  };

  const getSortedDrivers = () => {
    return [...mockDrivers].sort((a, b) => {
      if (sortingOption === 'price') return a.fee - b.fee;
      if (sortingOption === 'rating') return b.rating - a.rating;
      if (sortingOption === 'eta') return a.eta - b.eta;
      return a.eta - b.eta; // Default ETA/Distance sorting
    });
  };

  const pendingRequests = displayDeliveries.filter(d => d.status === 'pending');
  const assignedDeliveries = displayDeliveries.filter(d => d.status === 'assigned');
  const completedHistory = displayDeliveries.filter(d => d.status === 'completed' || d.status === 'delivered');

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 font-sans text-slate-800 antialiased">
      <PageHeader 
        title="🚚 Transport Requests" 
        subtitle="Manage farm logistics, invite nearby transporters, and track live deliveries" 
      />

      {/* Tabs headers */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-black pb-0.5">
        {[
          { id: 'pending', label: `Pending Requests (${pendingRequests.length})` },
          { id: 'assigned', label: `Assigned Deliveries (${assignedDeliveries.length})` },
          { id: 'completed', label: `Completed History (${completedHistory.length})` }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`pb-2.5 transition-all border-b-2 cursor-pointer ${
              activeTab === t.id ? 'border-emerald-600 text-emerald-800 font-extrabold' : 'border-transparent text-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* Pending Requests tab */}
        {activeTab === 'pending' && (
          <motion.div key="pending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
                <Truck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">No pending transport requests</h4>
                <p className="text-xs text-slate-400 mt-1">Accept pending orders under the Orders page to request logistics.</p>
              </div>
            ) : (
              pendingRequests.map(req => (
                <div key={req.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{req.id}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Awaiting Driver</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-800">Product: <strong className="text-slate-900 font-extrabold">{req.order.product} ({req.order.quantity})</strong></p>
                      <p className="text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Pickup: {req.pickup_location}</p>
                      <p className="text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Delivery: {req.delivery_location}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setDriverSelectDeliveryId(req.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    Find Driver
                  </button>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Assigned Deliveries tab */}
        {activeTab === 'assigned' && (
          <motion.div key="assigned" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {assignedDeliveries.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
                <User className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">No active assigned deliveries</h4>
                <p className="text-xs text-slate-400 mt-1">Assign nearby transporters to pending requests to coordinate cargo pickup.</p>
              </div>
            ) : (
              assignedDeliveries.map(del => (
                <div key={del.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  
                  {/* Title Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{del.id}</span>
                        <span className="text-[9px] bg-sky-100 text-sky-850 px-2 py-0.5 rounded-full font-black uppercase">
                          {del.transporter?.status?.replace('_', ' ') || 'Assigned'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Cargo: <strong className="text-slate-800">{del.order.product} ({del.order.quantity})</strong></p>
                    </div>
                    <span className="text-xs font-black text-emerald-800">Delivery Fee: KES {del.estimated_fee.toLocaleString()}</span>
                  </div>

                  {/* Driver summary card */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Assigned Transporter</h4>
                      <div className="flex items-center gap-3">
                        <img 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" 
                          alt={del.transporter.name} 
                          className="w-12 h-12 rounded-full object-cover border border-slate-250"
                        />
                        <div className="text-xs">
                          <strong className="block text-slate-900 font-extrabold">{del.transporter.name}</strong>
                          <span className="text-slate-500 font-medium block mt-0.5">{del.transporter.vehicle} &bull; <span className="font-mono">{del.transporter.plate}</span></span>
                          <span className="text-amber-500 block mt-0.5">⭐ {del.transporter.rating} Rating</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-100">
                        <div>
                          <span>Driver Phone:</span>
                          <strong className="block text-slate-850 mt-0.5">{del.transporter.phone}</strong>
                        </div>
                        <div>
                          <span>Estimated Arrival:</span>
                          <strong className="block text-emerald-700 mt-0.5">{del.transporter.eta} Minutes</strong>
                        </div>
                      </div>
                    </div>

                    {/* Timeline progress */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cargo Progress Track</h4>
                      
                      <div className="relative pl-5 space-y-3.5 border-l-2 border-emerald-600/30 text-[10px] font-bold text-slate-500">
                        <div className="relative">
                          <span className="absolute -left-[25px] top-0.5 bg-emerald-600 text-white rounded-full w-2 h-2 border-2 border-emerald-500" />
                          <span className="text-emerald-800 font-extrabold">Order Accepted ✔</span>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[25px] top-0.5 bg-emerald-600 text-white rounded-full w-2 h-2 border-2 border-emerald-500" />
                          <span className="text-emerald-800 font-extrabold">Driver Assigned ✔</span>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[25px] top-0.5 bg-emerald-600 text-white rounded-full w-2 h-2 border-2 border-emerald-500" />
                          <span className="text-emerald-800 font-extrabold">Driver Heading to Farm 🟢</span>
                        </div>
                        <div className="relative text-slate-400">
                          <span className="absolute -left-[25px] top-0.5 bg-slate-200 rounded-full w-2 h-2 border-2 border-slate-300" />
                          <span>Products Picked Up</span>
                        </div>
                        <div className="relative text-slate-400">
                          <span className="absolute -left-[25px] top-0.5 bg-slate-200 rounded-full w-2 h-2 border-2 border-slate-300" />
                          <span>In Transit</span>
                        </div>
                        <div className="relative text-slate-400">
                          <span className="absolute -left-[25px] top-0.5 bg-slate-200 rounded-full w-2 h-2 border-2 border-slate-300" />
                          <span>Delivered</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-4 border-t border-slate-100 flex gap-2">
                    <button 
                      onClick={() => navigate('/farmer/chat')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Message Driver
                    </button>
                    <button 
                      onClick={() => toast.info(`Connecting dialer to ${del.transporter.phone}...`)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Driver
                    </button>
                    <button 
                      onClick={() => toast.info("Opening Live Delivery Navigation tracking Map...")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm ml-auto"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Track Driver Live
                    </button>
                  </div>

                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Completed deliveries history */}
        {activeTab === 'completed' && (
          <motion.div key="completed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {completedHistory.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
                <CheckCircle2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">No completed transport history</h4>
              </div>
            ) : (
              completedHistory.map(del => (
                <div key={del.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-800">{del.id}</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black uppercase">Delivered</span>
                      <span className="text-slate-400 font-bold">28 July</span>
                    </div>
                    <p className="font-bold text-slate-750">Cargo: <strong className="text-slate-900">{del.order.product} ({del.order.quantity})</strong></p>
                    <p className="text-slate-500 font-medium">Assigned Transporter: <strong>{del.transporter?.name || 'Peter Karanja'}</strong></p>
                  </div>
                  <span className="text-xs font-black text-slate-400">Fee Paid: KES {del.estimated_fee.toLocaleString()}</span>
                </div>
              ))
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* Driver allocation search modal */}
      <AnimatePresence>
        {driverSelectDeliveryId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
            >
              
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-black text-sm">Nearby Available Drivers</h3>
                  <p className="text-[10px] text-emerald-200">Select transporter for request {driverSelectDeliveryId}</p>
                </div>
                <button onClick={() => setDriverSelectDeliveryId(null)} className="p-1 rounded-full hover:bg-white/20">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filters */}
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-2 text-[10px] font-bold">
                <span className="text-slate-400 uppercase">Sort Transporters By:</span>
                <select 
                  value={sortingOption} 
                  onChange={(e) => setSortingOption(e.target.value)} 
                  className="px-2.5 py-1 border border-slate-200 rounded-lg text-slate-700 bg-white cursor-pointer focus:outline-none"
                >
                  <option value="distance">Nearest Distance</option>
                  <option value="price">Lowest Transport Price</option>
                  <option value="rating">Highest Rating Stars</option>
                  <option value="eta">Quickest Arrival ETA</option>
                </select>
              </div>

              {/* Drivers Scroll */}
              <div className="p-4 overflow-y-auto max-h-[50vh] space-y-3">
                {getSortedDrivers().map(driver => (
                  <div key={driver.id} className="p-4 border border-slate-200 rounded-2xl bg-white hover:border-emerald-300 transition-all flex justify-between items-center gap-4">
                    <div className="flex gap-3">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" 
                        alt={driver.name} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                      />
                      <div className="text-[11px] space-y-1">
                        <strong className="block text-slate-800 font-extrabold">{driver.name}</strong>
                        <span className="text-amber-500 font-bold block">⭐ {driver.rating} Rating</span>
                        <span className="text-slate-400 block font-medium">Vehicle: {driver.vehicle} &bull; {driver.capacity}</span>
                        <span className="text-slate-450 block font-medium">Hub Base: {driver.location} &bull; ETA: <strong className="text-slate-850 font-black">{driver.eta} Mins</strong></span>
                      </div>
                    </div>

                    <div className="text-right space-y-2 flex-shrink-0">
                      <span className="block text-xs font-black text-emerald-800">KES {driver.fee.toLocaleString()}</span>
                      <button 
                        onClick={() => handleSelectDriver(driverSelectDeliveryId, driver)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black cursor-pointer shadow-sm block w-full text-center"
                      >
                        Select Driver
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function TransportRequests() {
  return (
    <ProtectedRoute roles={['farmer']}>
      <DashboardLayout>
        <TransportRequestsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
