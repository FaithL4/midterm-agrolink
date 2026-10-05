import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  ShoppingCart, Package, DollarSign, CreditCard, Truck, ShieldCheck, 
  Heart, Star, Clock, Sparkles, ArrowRight, Eye, RefreshCw, FileText, 
  Calendar, MapPin, Tag, CheckCircle2, ChevronRight, Download, Printer, X 
} from 'lucide-react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute, useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import PaymentModal from '../../components/common/PaymentModal';

function BuyerDashboardContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState({ id: 'ORD-0980', amount: 25000 });
  const [invoiceModalOrder, setInvoiceModalOrder] = useState(null);

  // Stats
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  // Wishlist & Cart local helpers
  const [wishlist, setWishlist] = useState(['1', '3']);

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
      toast.info("Item removed from Wishlist");
    } else {
      setWishlist([...wishlist, id]);
      toast.success("❤️ Added to Wishlist!");
    }
  };

  const defaultOrders = [
    {
      id: 'ORD-0980',
      farmer_name: 'John Kamau (Nakuru)',
      product_name: 'Dry White Maize',
      quantity: '10 Bags',
      amount: 25000,
      status: 'accepted',
      created_at: new Date().toISOString(),
      items: [{ name: 'Dry White Maize', qty: '10 Bags', unit: 2500, total: 25000 }]
    },
    {
      id: 'ORD-0981',
      farmer_name: 'Mary Wanjiku (Molo)',
      product_name: 'Molo Irish Potatoes',
      quantity: '50 Bags',
      amount: 120000,
      status: 'in_transit',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      items: [{ name: 'Molo Irish Potatoes', qty: '50 Bags', unit: 2400, total: 120000 }]
    },
    {
      id: 'ORD-0975',
      farmer_name: 'Peter Mwangi (Nyeri)',
      product_name: 'Beef Tomatoes',
      quantity: '10 Crates',
      amount: 32000,
      status: 'delivered',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      items: [{ name: 'Beef Tomatoes', qty: '10 Crates', unit: 3200, total: 32000 }]
    }
  ];

  // AI Recommended Produce
  const aiRecommendations = [
    {
      id: 'rec-1',
      name: 'Organic Hass Avocados',
      farmer: 'Koech Agro (Murang\'a)',
      price: 'KES 100 / Kg',
      discount: '15% Off',
      rating: 4.9,
      image: '/avocados.jpg',
      badge: '🤖 AI Match for Nairobi'
    },
    {
      id: 'rec-2',
      name: 'Clean Red Beans (Legumes)',
      farmer: 'Subukia Co-op (Nakuru)',
      price: 'KES 140 / Kg',
      discount: '10% Off',
      rating: 4.8,
      image: '/beans.jpg',
      badge: '🌱 Seasonal Peak'
    },
    {
      id: 'rec-3',
      name: 'Grade A Beef Tomatoes',
      farmer: 'Naivasha Greenhouses',
      price: 'KES 120 / Kg',
      discount: 'Hot Deal',
      rating: 5.0,
      image: '/tomatoes.jpg',
      badge: '🔥 80% Buying Rate'
    }
  ];

  // Nearby Farmers
  const nearbyFarmers = [
    { name: 'John Kamau Farm', county: 'Subukia, Nakuru', distance: '14 Km', time: '35 mins delivery', crop: 'Maize & Potatoes' },
    { name: 'Naivasha Agri Co-op', county: 'Naivasha, Nakuru', distance: '48 Km', time: '1 hr 15 mins', crop: 'Tomatoes & Vegetables' },
    { name: 'Kieni Organic Farm', county: 'Kieni East, Nyeri', distance: '85 Km', time: '2 hrs 10 mins', crop: 'Avocados & Fruits' }
  ];

  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    Promise.all([
      api.getOrders().catch(() => null),
      api.getProducts().catch(() => null),
      api.getWallet().catch(() => null)
    ])
      .then(([o, p, w]) => {
        if (o) setOrders(o?.results || o || []);
        if (p) setProducts(p?.results || p || []);
        if (w) setWallet(w);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeOrdersList = orders.length > 0 ? orders : defaultOrders;

  const handleRepeatOrder = (order) => {
    toast.success(`🔄 Reordered ${order.product_name || 'produce'}! Items added to checkout.`, { autoClose: 2500 });
    setSelectedOrder({ id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`, amount: order.amount || 15000 });
    setIsPaymentOpen(true);
  };

  const getStatusBadge = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'pending') return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200">🟡 Pending</span>;
    if (s === 'accepted') return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200">🟢 Accepted</span>;
    if (s === 'in_transit') return <span className="px-3 py-1 bg-earth-100 text-earth-800 rounded-full text-xs font-bold border border-earth-200">🟠 In Transit</span>;
    if (s === 'delivered') return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">🟢 Delivered</span>;
    return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">{status}</span>;
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* 1. Welcome Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Welcome Back, {user?.first_name || 'Mercy'} {user?.last_name || 'Atieno'}! 🌾
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            <span>&bull; Delivery Address: <strong className="text-slate-800 font-medium">{user?.county || 'Kilimani, Nairobi'}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/marketplace"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <ShoppingCart className="w-4 h-4" /> Browse Marketplace
          </Link>
        </div>
      </div>


      {/* 2. 5 Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Cart Items */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-4 rounded-3xl shadow-sm">
          <div className="p-2 bg-white/20 rounded-xl w-fit mb-2">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-100">Cart Items</span>
          <h3 className="text-xl font-black mt-0.5">4 Items</h3>
          <p className="text-[11px] text-green-200 mt-1">Ready for Checkout</p>
        </div>

        {/* Active Orders */}
        <div className="bg-gradient-to-br from-earth-500 to-earth-700 text-white p-4 rounded-3xl shadow-sm">
          <div className="p-2 bg-white/20 rounded-xl w-fit mb-2">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-earth-100">Active Orders</span>
          <h3 className="text-xl font-black mt-0.5">2 Orders</h3>
          <p className="text-[11px] text-earth-200 mt-1">Processing by Farmers</p>
        </div>

        {/* Deliveries in Progress */}
        <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-4 rounded-3xl shadow-sm">
          <div className="p-2 bg-white/20 rounded-xl w-fit mb-2">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-100">In Transit</span>
          <h3 className="text-xl font-black mt-0.5">1 Delivery</h3>
          <p className="text-[11px] text-green-200 mt-1">ETA: 45 minutes</p>
        </div>

        {/* Wishlist Items */}
        <div className="bg-gradient-to-br from-earth-600 to-amber-700 text-white p-4 rounded-3xl shadow-sm">
          <div className="p-2 bg-white/20 rounded-xl w-fit mb-2">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-earth-100">Wishlist</span>
          <h3 className="text-xl font-black mt-0.5">{wishlist.length} Saved</h3>
          <p className="text-[11px] text-earth-200 mt-1">Saved Produce</p>
        </div>

        {/* Digital Wallet Card */}
        <Link 
          to="/buyer/wallet"
          className="bg-gradient-to-br from-green-600 to-emerald-800 text-white p-4 rounded-3xl shadow-sm col-span-2 md:col-span-1 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 text-left no-underline cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="p-2 bg-white/20 rounded-xl w-fit mb-2">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-100">My Wallet</span>
            <h3 className="text-sm font-black mt-0.5 truncate">
              {wallet ? "KES " + Number(wallet.balance).toLocaleString() : 'KES 0.00'}
            </h3>
          </div>
          <p className="text-[10px] font-bold text-green-200 mt-1 block hover:underline">Manage Wallet &rarr;</p>
        </Link>


      </div>

      {/* 3. Quick Actions Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Quick Actions Console</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <button onClick={() => navigate('/marketplace')} className="px-4 py-2 bg-green-50 text-green-800 border border-green-200 hover:bg-green-100 rounded-xl transition-all">
            🛒 Browse Marketplace
          </button>
          <button onClick={() => navigate('/buyer/cart')} className="px-4 py-2 bg-earth-50 text-earth-800 border border-earth-200 hover:bg-earth-100 rounded-xl transition-all">
            📦 View Cart (4)
          </button>
          <button onClick={() => navigate('/buyer/tracking')} className="px-4 py-2 bg-green-50 text-green-800 border border-green-200 hover:bg-green-100 rounded-xl transition-all">
            🚚 Track Orders
          </button>
          <button onClick={() => navigate('/buyer/wishlist')} className="px-4 py-2 bg-earth-50 text-earth-800 border border-earth-200 hover:bg-earth-100 rounded-xl transition-all">
            ❤️ View Wishlist ({wishlist.length})
          </button>
          <button onClick={() => navigate('/buyer/chat')} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all">
            💬 Contact Farmers
          </button>
        </div>
      </div>

      {/* 4. 🤖 AI Smart Recommendations Section */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">🤖 AI Smart Recommendations</h3>
              <p className="text-xs text-emerald-200">Personalized crops based on your purchases & Nairobi seasonal demand</p>
            </div>
          </div>
          <Link to="/marketplace" className="text-xs font-bold text-emerald-300 hover:underline flex items-center gap-1">
            Explore All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiRecommendations.map((rec) => (
            <div key={rec.id} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white flex flex-col justify-between space-y-3">
              <div>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold rounded-full border border-emerald-400/30">
                  {rec.badge}
                </span>
                <img src={rec.image} alt={rec.name} className="w-full h-32 object-cover rounded-xl mt-2 border border-white/10" />
                <h4 className="font-bold text-sm text-white mt-2">{rec.name}</h4>
                <p className="text-xs text-emerald-200 font-medium">{rec.farmer}</p>
              </div>

              <div className="flex items-center justify-between border-t border-white/15 pt-2 text-xs">
                <span className="font-black text-amber-300">{rec.price}</span>
                <button
                  onClick={() => toast.success(`Added ${rec.name} to Cart!`)}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all text-xs"
                >
                  + Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Recent Orders & Quick Actions Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" /> Recent Purchases & Status
            </h3>
            <p className="text-xs text-slate-400">Track order progress, pay invoices, or repeat purchases with 1 click</p>
          </div>
          <Link to="/buyer/orders" className="text-xs font-bold text-emerald-700 hover:underline">View All Orders</Link>
        </div>

        <div className="space-y-3">
          {activeOrdersList.map((ord) => (
            <div key={ord.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 font-mono text-sm">{ord.id}</span>
                  {getStatusBadge(ord.status)}
                </div>
                <p className="font-bold text-slate-800">{ord.product_name || 'Produce Order'}</p>
                <p className="text-slate-500">Farmer: <strong>{ord.farmer_name || 'Subukia Producer'}</strong> &bull; Qty: {ord.quantity || '10 Bags'}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="font-black text-emerald-800 text-sm">KES {Number(ord.amount || 25000).toLocaleString()}</span>
                
                <button
                  onClick={() => setInvoiceModalOrder(ord)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1 transition-all"
                >
                  <FileText className="w-3.5 h-3.5" /> PDF Invoice
                </button>

                <button
                  onClick={() => handleRepeatOrder(ord)}
                  className="px-3 py-1.5 bg-earth-50 hover:bg-earth-100 text-earth-800 border border-earth-200 font-bold rounded-xl flex items-center gap-1 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> 🔄 Reorder
                </button>

                <button
                  onClick={() => {
                    setSelectedOrder({ id: ord.id, amount: ord.amount || 25000 });
                    setIsPaymentOpen(true);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  Pay Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. 📍 Nearby Farmers Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> 📍 Nearby Producer Farms (Nairobi Proximity)
            </h3>
            <p className="text-xs text-slate-400">Direct farm pickup points with fastest delivery speed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nearbyFarmers.map((f, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-900 text-sm">{f.name}</h4>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">{f.distance}</span>
              </div>
              <p className="text-slate-500">{f.county}</p>
              <p className="text-slate-600">Main Produce: <strong>{f.crop}</strong></p>
              <p className="text-emerald-700 font-bold">⏱️ Est. Speed: {f.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal Integration */}
      {isPaymentOpen && (
        <PaymentModal
          orderId={selectedOrder.id}
          totalAmount={selectedOrder.amount}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={() => {
            setIsPaymentOpen(false);
            toast.success("Payment confirmed! Farmer notified for dispatch.", { autoClose: 3000 });
          }}
        />
      )}

      {/* Digital PDF Invoice Modal */}
      {invoiceModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">AgroLink Official Digital Invoice</h3>
                <p className="text-xs text-slate-500 font-mono">Invoice #{invoiceModalOrder.id}</p>
              </div>
              <button onClick={() => setInvoiceModalOrder(null)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-2 border border-slate-200 font-mono">
              <div className="flex justify-between text-slate-600"><span>Date:</span> <strong>{new Date().toLocaleDateString()}</strong></div>
              <div className="flex justify-between text-slate-600"><span>Buyer:</span> <strong>Mercy Atieno (Kilimani, Nairobi)</strong></div>
              <div className="flex justify-between text-slate-600"><span>Producer:</span> <strong>{invoiceModalOrder.farmer_name}</strong></div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>{invoiceModalOrder.product_name}</span>
                <span>KES {Number(invoiceModalOrder.amount).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 text-xs font-bold pt-2">
              <button onClick={() => toast.info("Printing invoice...")} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1">
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button onClick={() => toast.success("PDF Invoice downloaded to your device!")} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1 shadow-sm">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function BuyerDashboard() {
  return (
    <ProtectedRoute roles={['buyer']}>
      <DashboardLayout>
        <BuyerDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
