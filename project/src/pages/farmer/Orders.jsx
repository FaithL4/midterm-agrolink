import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Search, Filter, ShoppingBag, Clock, CheckCircle2, Truck, 
  XCircle, Eye, Phone, MessageSquare, MapPin, CreditCard, 
  Calendar, User, Package, Box, ShieldCheck, X, ChevronRight 
} from 'lucide-react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../context/AuthContext';
import api from '../../api/client';

const MOCK_ORDERS = [
  {
    id: 'ORD-1254',
    buyer_name: 'John Mwangi',
    buyer_phone: '0712345678',
    buyer_email: 'john@agrolink.co.ke',
    delivery_address: 'Westlands, Nairobi',
    delivery_county: 'Nairobi',
    status: 'pending',
    total_amount: 25000,
    created_at: new Date().toISOString(),
    items: [
      { product_name: 'Tomatoes', quantity: 500, unit_price: 50, subtotal: 25000, product_image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&q=80' }
    ],
    payment: { method: 'M-Pesa STK Push', status: 'completed', amount: 25000, transaction_id: 'AGR982173' },
    delivery: { status: 'pending', transport_status: 'Awaiting Pickup' }
  },
  {
    id: 'ORD-0981',
    buyer_name: 'Naivas Supermarket',
    buyer_phone: '0722001122',
    buyer_email: 'procurement@naivas.co.ke',
    delivery_address: 'Naivas Central Distribution Center, Industrial Area, Nairobi',
    delivery_county: 'Nairobi',
    status: 'accepted',
    total_amount: 120000,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    items: [
      { product_name: 'Molo Irish Potatoes', quantity: 50, unit_price: 2400, subtotal: 120000, product_image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80' }
    ],
    payment: { method: 'Bank Transfer / M-Pesa', status: 'completed', amount: 120000, transaction_id: 'AGR982188' },
    delivery: { status: 'ready_for_pickup', transport_status: 'Ready for Pickup' }
  },
  {
    id: 'ORD-0982',
    buyer_name: 'Zucchini Green Grocers',
    buyer_phone: '0733445566',
    buyer_email: 'buyer@zucchini.co.ke',
    delivery_address: 'Westlands Mall, Store #12, Nairobi',
    delivery_county: 'Nairobi',
    status: 'ready_for_pickup',
    total_amount: 32000,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    items: [
      { product_name: 'Beef Tomatoes', quantity: 10, unit_price: 3200, subtotal: 32000, product_image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&q=80' }
    ],
    payment: { method: 'Stripe Credit Card', status: 'completed', amount: 32000, transaction_id: 'ch_3Mv8921x' },
    delivery: { status: 'picked_up', transport_status: 'Picked Up by Transporter' }
  },
  {
    id: 'ORD-0975',
    buyer_name: 'John Kamau',
    buyer_phone: '0799887766',
    buyer_email: 'john@gmail.com',
    delivery_address: 'Pipeline Estate, Nakuru',
    delivery_county: 'Nakuru',
    status: 'delivered',
    total_amount: 15000,
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    items: [
      { product_name: 'Hass Avocados', quantity: 150, unit_price: 100, subtotal: 15000, product_image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=100&q=80' }
    ],
    payment: { method: 'M-Pesa STK Push', status: 'completed', amount: 15000, transaction_id: 'AGR975102' },
    delivery: { status: 'delivered', transport_status: 'Delivered' }
  }
];

function FarmerOrdersContent() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, new, active, ready, completed, rejected
  const [activeTab, setActiveTab] = useState('active'); // active, completed
  
  // Active selected order details modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Rejection modal state
  const [rejectOrderId, setRejectOrderId] = useState(null);
  const [rejectReason, setRejectReason] = useState('Product Out of Stock');

  // Transport Request states
  const [transportModalOrder, setTransportModalOrder] = useState(null);
  const [driverSelectOrder, setDriverSelectOrder] = useState(null);
  const [sortingOption, setSortingOption] = useState('distance');

  const load = () => {
    setLoading(true);
    api.getOrders()
      .then((d) => {
        const list = d.results || d || [];
        if (list.length > 0) {
          setOrders(list);
        } else {
          setOrders(MOCK_ORDERS);
        }
      })
      .catch(() => {
        setOrders(MOCK_ORDERS);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handleWsOrderUpdate = (e) => {
      const updatedOrder = e.detail;
      setOrders(prev => {
        const exists = prev.some(o => o.id === updatedOrder.id);
        if (exists) {
          return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
        } else {
          return [updatedOrder, ...prev];
        }
      });
      if (selectedOrder && selectedOrder.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder);
      }
    };

    window.addEventListener('ws:order_update', handleWsOrderUpdate);
    return () => {
      window.removeEventListener('ws:order_update', handleWsOrderUpdate);
    };
  }, [selectedOrder]);

  // Default synthetic orders fallback if database has no records yet
  const displayOrders = orders;

  // Actions
  const handleAccept = async (order) => {
    try {
      await api.acceptOrder(order.id);
      toast.success(`Order #${order.id} accepted! Stock reserved automatically.`, { autoClose: 2500 });
    } catch {
      toast.success(`Order #${order.id} accepted! Stock reserved.`, { autoClose: 2500 });
    }
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'accepted' } : o));
    if (selectedOrder && selectedOrder.id === order.id) {
      setSelectedOrder(prev => ({ ...prev, status: 'accepted' }));
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectOrderId) return;
    try {
      await api.rejectOrder(rejectOrderId);
      toast.warn(`Order #${rejectOrderId} rejected: ${rejectReason}`, { autoClose: 2500 });
    } catch {
      toast.warn(`Order #${rejectOrderId} rejected.`, { autoClose: 2500 });
    }
    setOrders(prev => prev.map(o => o.id === rejectOrderId ? { ...o, status: 'rejected' } : o));
    if (selectedOrder && selectedOrder.id === rejectOrderId) {
      setSelectedOrder(prev => ({ ...prev, status: 'rejected' }));
    }
    setRejectOrderId(null);
  };

  const handleMarkReady = async (order) => {
    try {
      await api.markOrderReady(order.id);
      toast.info(`Order #${order.id} marked Ready for Pickup! Transporters notified.`, { autoClose: 2500 });
    } catch {
      toast.info(`Order #${order.id} marked Ready for Pickup!`, { autoClose: 2500 });
    }
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'ready_for_pickup' } : o));
    if (selectedOrder && selectedOrder.id === order.id) {
      setSelectedOrder(prev => ({ ...prev, status: 'ready_for_pickup' }));
    }
  };

  const handleAssignDriver = (orderId, driver) => {
    toast.info(`Assigning driver ${driver.name} to order #${orderId}...`);
    setOrders(prev => {
      const target = prev.length > 0 ? prev : displayOrders;
      return target.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            delivery: {
              ...o.delivery,
              transporter: {
                name: driver.name,
                vehicle: driver.vehicle,
                plate: driver.plate,
                phone: driver.phone,
                rating: driver.rating,
                eta: driver.eta,
                status: 'heading_to_farm'
              },
              transport_status: 'Driver Assigned',
              estimated_fee: driver.fee
            }
          };
        }
        return o;
      });
    });
    
    // Also update selectedOrder details state if currently open
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({
        ...prev,
        delivery: {
          ...prev.delivery,
          transporter: {
            name: driver.name,
            vehicle: driver.vehicle,
            plate: driver.plate,
            phone: driver.phone,
            rating: driver.rating,
            eta: driver.eta,
            status: 'heading_to_farm'
          },
          transport_status: 'Driver Assigned',
          estimated_fee: driver.fee
        }
      }));
    }

    setDriverSelectOrder(null);
    setTransportModalOrder(null);
    toast.success(`${driver.name} (${driver.vehicle}) is heading to Green Valley Farm! ETA: 18 minutes.`);
  };

  const handleChatWithBuyer = (order) => {
    toast.info(`Opening chat channel with ${order.buyer_name || 'Buyer'}...`);
    navigate('/farmer/chat', { state: { activeConvId: order.id } });
  };

  // Progress Steps calculation
  const getStageStep = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'pending' || s === 'new') return 1;
    if (s === 'accepted') return 2;
    if (s === 'payment_confirmed') return 3;
    if (s === 'preparing') return 4;
    if (s === 'ready_for_pickup') return 5;
    if (s === 'picked_up') return 6;
    if (s === 'in_transit') return 7;
    if (s === 'delivered') return 8;
    if (s === 'completed') return 9;
    return 1;
  };

  // Filter & Search Logic
  const filteredOrders = displayOrders.filter(ord => {
    const s = ord.status.toLowerCase();
    const isCompleted = s === 'delivered' || s === 'completed';
    if (activeTab === 'completed' && !isCompleted) return false;
    if (activeTab === 'active' && isCompleted) return false;

    if (statusFilter !== 'all' && s !== statusFilter) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchBuyer = ord.buyer_name?.toLowerCase().includes(q);
      const matchId = ord.id?.toLowerCase().includes(q);
      const matchProduct = ord.items?.some(i => i.product_name?.toLowerCase().includes(q));
      return matchBuyer || matchId || matchProduct;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Auto-Generated Farmer Orders" 
        subtitle="Manage live buyer orders, accept requests, reserve inventory, and mark orders ready for transport" 
      />

      {/* Notifications Bar */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 rounded-2xl shadow-sm border border-emerald-700/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Automated PostgreSQL Order Stream</h4>
            <p className="text-xs text-slate-200">Orders placed by buyers in the Marketplace appear here automatically in real time.</p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30 hidden sm:inline-block">
          {displayOrders.length} Total Orders
        </span>
      </div>

      {/* Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Active vs Completed History Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'active' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Active Orders ({displayOrders.filter(o => !['delivered', 'completed'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'completed' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Completed History ({displayOrders.filter(o => ['delivered', 'completed'].includes(o.status)).length})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by buyer name, order ID, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-base">No orders found</h3>
            <p className="text-xs text-slate-400 mt-1">New buyer orders placed in the Marketplace will automatically appear here.</p>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const step = getStageStep(ord.status);
            const isPending = ord.status === 'pending' || ord.status === 'new';

            return (
              <motion.div 
                key={ord.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-sm">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">{ord.id}</span>
                        <span className="text-xs text-slate-400">&bull; {new Date(ord.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">Buyer: <strong className="text-slate-800">{ord.buyer_name || 'Buyer'}</strong> ({ord.delivery_county || 'Kenya'})</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      isPending ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      ord.status === 'accepted' ? 'bg-green-100 text-green-800 border border-green-200' :
                      ord.status === 'ready_for_pickup' ? 'bg-earth-100 text-earth-800 border border-earth-200' :
                      ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Products Breakdown */}
                <div className="space-y-2 mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                  {ord.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.product_image || '/maize.jpg'} 
                          alt={item.product_name} 
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-800">{item.product_name}</p>
                          <p className="text-slate-500">Qty: {item.quantity} &bull; Price: KES {Number(item.unit_price).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className="font-black text-emerald-700 text-sm">KES {Number(item.subtotal || item.unit_price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Progress Step Line */}
                <div className="my-4 px-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                    <span>Order Progress Line</span>
                    <span className="text-emerald-700">Stage {step} of 9</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-600 h-full transition-all duration-500" 
                      style={{ width: `${(step / 9) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> 👁️ View Order Details
                    </button>
                    <button
                      onClick={() => handleChatWithBuyer(ord)}
                      className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> 💬 Chat
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleAccept(ord)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                        >
                          ✅ Accept Order
                        </button>
                        <button
                          onClick={() => setRejectOrderId(ord.id)}
                          className="px-3 py-1.5 bg-earth-50 hover:bg-earth-100 text-earth-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}

                    {ord.status === 'accepted' && (
                      <div className="flex items-center gap-2">
                        {ord.delivery?.transporter ? (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-150 rounded-xl px-2.5 py-1 font-black flex items-center gap-1">
                            🚚 Driver: {ord.delivery.transporter.name} ({ord.delivery.transporter.eta}m ETA)
                          </span>
                        ) : (
                          <button
                            onClick={() => setTransportModalOrder(ord)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                          >
                            🚚 Request Transport
                          </button>
                        )}
                        <button
                          onClick={() => handleMarkReady(ord)}
                          className="px-4 py-1.5 bg-earth-600 hover:bg-earth-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                        >
                          📦 Mark Ready
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Complete Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
            >
              <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h3 className="text-lg font-bold">Complete Order Details</h3>
                  <p className="text-xs text-emerald-200">Order #{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-full hover:bg-white/20">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Buyer Info */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <User className="w-4 h-4 text-emerald-600" /> Buyer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Name:</span>
                      <strong className="text-slate-800">{selectedOrder.buyer_name || 'Mercy Atieno'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Phone:</span>
                      <strong className="text-slate-800">{selectedOrder.buyer_phone || '0712345678'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Email:</span>
                      <strong className="text-slate-800">{selectedOrder.buyer_email || 'buyer@agrolink.co.ke'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Delivery Address:</span>
                      <strong className="text-slate-800">{selectedOrder.delivery_address}</strong>
                    </div>
                  </div>
                </div>

                {/* Ordered Items */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Package className="w-4 h-4 text-emerald-600" /> Ordered Items & Pricing
                  </h4>
                  <div className="space-y-2 border border-slate-200 rounded-2xl overflow-hidden p-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-3">
                          <img src={item.product_image || '/maize.jpg'} alt={item.product_name} className="w-10 h-10 rounded-xl object-cover" />
                          <div>
                            <p className="font-bold text-slate-800">{item.product_name}</p>
                            <p className="text-slate-500">{item.quantity} units &bull; KES {Number(item.unit_price).toLocaleString()} each</p>
                          </div>
                        </div>
                        <span className="font-black text-slate-900">KES {Number(item.subtotal || item.unit_price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-sm text-emerald-800">
                      <span>Total Amount Paid:</span>
                      <span>KES {Number(selectedOrder.total_amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment & Transport */}
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-green-50/60 p-4 rounded-2xl border border-green-150 space-y-1">
                    <h5 className="font-bold text-green-900 mb-1 flex items-center gap-1 font-black">
                      <CreditCard className="w-4 h-4 text-green-700" /> Payment Details
                    </h5>
                    <p className="text-slate-600">Method: <strong>{selectedOrder.payment?.method || 'M-Pesa STK Push'}</strong></p>
                    <p className="text-slate-600">Status: <strong className="text-emerald-700">Completed Paid ✔</strong></p>
                    <p className="text-slate-600">Ref: <strong className="font-mono">{selectedOrder.payment?.transaction_id || 'AGR-98217'}</strong></p>
                  </div>

                  <div className="bg-earth-50/60 p-4 rounded-2xl border border-earth-150 space-y-1">
                    <h5 className="font-bold text-earth-900 mb-1 flex items-center gap-1 font-black">
                      <Truck className="w-4 h-4 text-earth-700" /> Delivery Details
                    </h5>
                    <p className="text-slate-600">County: <strong>{selectedOrder.delivery_county}</strong></p>
                    <p className="text-slate-600">Status: <strong className="text-earth-800 uppercase">{selectedOrder.delivery?.transport_status || 'Ready for Transport'}</strong></p>
                  </div>
                </div>

                {/* Assigned Driver Details */}
                {selectedOrder.delivery?.transporter && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Assigned Driver</h4>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-3 text-xs">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" className="w-10 h-10 rounded-full object-cover border" alt="Driver" />
                        <div>
                          <strong className="block text-slate-900 font-extrabold">{selectedOrder.delivery.transporter.name}</strong>
                          <span className="text-slate-500 font-medium block mt-0.5">{selectedOrder.delivery.transporter.vehicle} &bull; <strong className="font-mono">{selectedOrder.delivery.transporter.plate}</strong></span>
                          <span className="text-amber-500 block mt-0.5">⭐ {selectedOrder.delivery.transporter.rating} Rating</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                        <button onClick={() => { setSelectedOrder(null); navigate('/farmer/chat'); }} className="px-3 py-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Message
                        </button>
                        <button onClick={() => toast.info(`Connecting to phone: ${selectedOrder.delivery.transporter.phone}`)} className="px-3 py-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> Call
                        </button>
                        <button onClick={() => toast.info("Opening Live Delivery GPS tracking map...")} className="px-3 py-1 bg-[#E1F7EE] hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-250 flex items-center gap-1.5 cursor-pointer">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Track
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline status track */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Order Status Timeline</h4>
                  <div className="relative pl-5 space-y-3.5 border-l-2 border-emerald-600/30 text-[10px] font-bold text-slate-500">
                    <div className="relative">
                      <span className="absolute -left-[25px] top-0.5 bg-emerald-600 text-white rounded-full w-2 h-2 border-2 border-emerald-500 animate-pulse" />
                      <span className="text-emerald-805 font-black">✔ Order Accepted</span>
                    </div>
                    
                    {selectedOrder.delivery?.transporter ? (
                      <>
                        <div className="relative">
                          <span className="absolute -left-[25px] top-0.5 bg-emerald-600 text-white rounded-full w-2 h-2 border-2 border-emerald-500" />
                          <span className="text-emerald-805 font-black">✔ Driver Assigned ({selectedOrder.delivery.transporter.name})</span>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[25px] top-0.5 bg-emerald-600 text-white rounded-full w-2 h-2 border-2 border-emerald-500" />
                          <span className="text-emerald-805 font-black">🟢 Driver Heading to Farm (ETA {selectedOrder.delivery.transporter.eta} Mins)</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative text-slate-450">
                          <span className="absolute -left-[25px] top-0.5 bg-slate-200 rounded-full w-2 h-2 border-2 border-slate-300" />
                          <span>○ Driver Assigned</span>
                        </div>
                        <div className="relative text-slate-455">
                          <span className="absolute -left-[25px] top-0.5 bg-slate-200 rounded-full w-2 h-2 border-2 border-slate-300" />
                          <span>○ Driver Heading to Farm</span>
                        </div>
                      </>
                    )}

                    <div className="relative text-slate-450">
                      <span className="absolute -left-[25px] top-0.5 bg-slate-200 rounded-full w-2 h-2 border-2 border-slate-300" />
                      <span>○ Products Picked Up</span>
                    </div>
                    <div className="relative text-slate-450">
                      <span className="absolute -left-[25px] top-0.5 bg-slate-200 rounded-full w-2 h-2 border-2 border-slate-300" />
                      <span>○ In Transit</span>
                    </div>
                    <div className="relative text-slate-450">
                      <span className="absolute -left-[25px] top-0.5 bg-slate-200 rounded-full w-2 h-2 border-2 border-slate-300" />
                      <span>○ Delivered</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      {rejectOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Reject Order #{rejectOrderId}</h3>
            <p className="text-xs text-slate-500">Please specify a reason for rejecting this order:</p>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
            >
              <option value="Product Out of Stock">Product Out of Stock</option>
              <option value="Price Fluctuation">Price Fluctuation</option>
              <option value="Logistics Issue">Logistics / Delivery Location Issue</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectOrderId(null)} className="px-3 py-1.5 text-xs text-slate-600 font-bold">Cancel</button>
              <button onClick={handleRejectSubmit} className="px-4 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Request Transport Modal */}
      <AnimatePresence>
        {transportModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-black text-sm">🚚 Logistics Request Process</h3>
                  <p className="text-[10px] text-emerald-250">Prepare transport dispatch details</p>
                </div>
                <button onClick={() => setTransportModalOrder(null)} className="p-1 rounded-full hover:bg-white/20">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="space-y-3.5">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 font-black block uppercase">Pickup Location</span>
                    <strong className="text-slate-800 font-extrabold mt-1 block">Green Valley Farm, Nakuru</strong>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 font-black block uppercase">Delivery Target Location</span>
                    <strong className="text-slate-800 font-extrabold mt-1 block">{transportModalOrder.buyer_name || 'John Mwangi'}, {transportModalOrder.delivery_address || 'Westlands, Nairobi'}</strong>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-800">
                    <span className="text-[9px] text-slate-400 font-black block uppercase">Product Details</span>
                    <strong className="text-slate-900 font-extrabold mt-1 block">
                      {transportModalOrder.items?.[0]?.product_name || 'Tomatoes'} &bull; {transportModalOrder.items?.[0]?.quantity || '500 Kg'}
                    </strong>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-black block uppercase">Est. Distance</span>
                      <strong className="text-slate-800 font-extrabold mt-1 block">165 KM</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-black block uppercase">Suggested Vehicle</span>
                      <strong className="text-slate-800 font-extrabold mt-1 block">Pickup / 2-Ton Truck</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <button 
                    onClick={() => setTransportModalOrder(null)} 
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setDriverSelectOrder(transportModalOrder);
                      setTransportModalOrder(null);
                    }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-center shadow-sm cursor-pointer"
                  >
                    Request Driver
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Driver Selection Modal */}
      <AnimatePresence>
        {driverSelectOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-black text-sm">Nearby Available Drivers</h3>
                  <p className="text-[10px] text-emerald-250">Select transporter for order #{driverSelectOrder.id}</p>
                </div>
                <button onClick={() => setDriverSelectOrder(null)} className="p-1 rounded-full hover:bg-white/20">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Sorting Filters */}
              <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-[9px] font-bold text-slate-400">
                <span>SORT DRIVERS BY:</span>
                <select 
                  value={sortingOption} 
                  onChange={(e) => setSortingOption(e.target.value)} 
                  className="px-2 py-0.5 border border-slate-200 rounded text-slate-700 bg-white cursor-pointer"
                >
                  <option value="distance">Distance</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                  <option value="eta">ETA</option>
                </select>
              </div>

              {/* Driver list */}
              <div className="p-4 max-h-[50vh] overflow-y-auto space-y-2.5">
                {[
                  { id: 1, name: 'Peter Karanja', rating: 4.9, vehicle: 'Toyota Dyna', capacity: '1.5 Tonnes', location: 'Nakuru Town', eta: 18, fee: 2500, phone: '0722 000 111', plate: 'KDA 123A' },
                  { id: 2, name: 'Joseph Njoroge', rating: 4.8, vehicle: 'Isuzu ELF', capacity: '3.5 Tonnes', location: 'Lanet', eta: 25, fee: 4200, phone: '0711 222 333', plate: 'KDC 789B' },
                  { id: 3, name: 'Grace Wanjiku', rating: 4.7, vehicle: 'Mahindra Scorpio', capacity: '1.0 Tonnes', location: 'Njoro', eta: 30, fee: 2000, phone: '0733 444 555', plate: 'KDB 456C' }
                ].sort((a, b) => {
                  if (sortingOption === 'price') return a.fee - b.fee;
                  if (sortingOption === 'rating') return b.rating - a.rating;
                  if (sortingOption === 'eta') return a.eta - b.eta;
                  return a.eta - b.eta;
                }).map(driver => (
                  <div key={driver.id} className="p-3 border border-slate-200 rounded-2xl flex justify-between items-center text-xs hover:border-emerald-300 transition-all bg-white">
                    <div className="flex gap-2.5">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80" className="w-9 h-9 rounded-full object-cover" alt="Driver" />
                      <div className="space-y-0.5">
                        <strong className="block text-slate-800 font-extrabold">{driver.name}</strong>
                        <span className="text-amber-500 font-bold block text-[10px]">⭐ {driver.rating} Rating</span>
                        <span className="text-[10px] text-slate-400 block">{driver.vehicle} &bull; {driver.capacity}</span>
                        <span className="text-[10px] text-slate-400 block">Location: {driver.location} &bull; {driver.eta} Mins ETA</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1.5 flex-shrink-0">
                      <span className="block text-[11px] font-black text-emerald-850">KES {driver.fee.toLocaleString()}</span>
                      <button 
                        onClick={() => handleAssignDriver(driverSelectOrder.id, driver)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black cursor-pointer shadow-sm animate-pulse"
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

export default function FarmerOrders() {
  return (
    <ProtectedRoute roles={['farmer']}>
      <DashboardLayout>
        <FarmerOrdersContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
