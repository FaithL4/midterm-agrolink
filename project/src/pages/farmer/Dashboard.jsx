import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  FaWheatAwn, FaBoxOpen, FaCoins, FaTruckMoving, FaStar, 
  FaUsers, FaLightbulb, FaPenToSquare as FaEdit, FaBell, FaComments, FaCircleCheck as FaCheckCircle, 
  FaArrowRight, FaChartLine, FaChartBar, FaCircle, FaLeaf, FaShieldHalved 
} from 'react-icons/fa6';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import { useAuth, ProtectedRoute } from '../../context/AuthContext';
import api from '../../api/client';
import DashboardLayout from '../../components/layout/DashboardLayout';

function FarmerDashboardContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Analytics state
  const [timeframe, setTimeframe] = useState('weekly'); // daily, weekly, monthly, yearly
  const [chartType, setChartType] = useState('line'); // line, bar

  // Tips state
  const [tipIndex, setTipIndex] = useState(0);
  const tips = [
    "Harvest vegetables early in the morning to preserve moisture and peak freshness.",
    "Use drip irrigation during dry spells to reduce water consumption by 40%.",
    "Apply organic compost 2 weeks prior to planting for optimal soil nutrient absorption.",
    "Rotate grain crops with legumes every season to naturally restore soil nitrogen."
  ];

  const defaultStats = {
    revenue: 245000,
    pending_orders: 8,
    products_count: 45,
    deliveries_in_progress: 5,
    avg_rating: 4.8,
    total_buyers: 126,
  };

  const [myProducts, setMyProducts] = useState([]);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    Promise.all([
      api.getDashboardStats().catch(() => null),
      api.getOrders().catch(() => null),
      api.getMyProducts().catch(() => null),
      api.getWallet().catch(() => null)
    ])
      .then(([s, o, p, w]) => {
        if (s) setStats(s);
        if (o) setOrders(o?.results || o || []);
        if (p) setMyProducts(p?.results || p || []);
        if (w) setWallet(w);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleWsOrder = (e) => {
      const updatedOrder = e.detail;
      setOrders(prev => {
        const exists = prev.some(o => o.id === updatedOrder.id);
        if (exists) {
          return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
        } else {
          return [updatedOrder, ...prev];
        }
      });
      // Increment pending orders if a new order arrives
      if (updatedOrder.status === 'pending') {
        setStats(prev => {
          if (!prev) return prev;
          return { ...prev, pending_orders: (prev.pending_orders || 0) + 1 };
        });
      }
    };

    const handleWsWallet = (e) => {
      const updatedWallet = e.detail;
      setWallet(updatedWallet);
      setStats(prev => {
        if (!prev) return prev;
        return { ...prev, revenue: Number(updatedWallet.balance) };
      });
    };

    window.addEventListener('ws:order_update', handleWsOrder);
    window.addEventListener('ws:wallet_update', handleWsWallet);
    return () => {
      window.removeEventListener('ws:order_update', handleWsOrder);
      window.removeEventListener('ws:wallet_update', handleWsWallet);
    };
  }, []);


  const activeStats = stats ? {
    revenue: stats.revenue || defaultStats.revenue,
    pending_orders: stats.pending_orders !== undefined ? stats.pending_orders : defaultStats.pending_orders,
    products_count: stats.products_count !== undefined ? stats.products_count : defaultStats.products_count,
    deliveries_in_progress: stats.deliveries_in_progress || defaultStats.deliveries_in_progress,
    avg_rating: stats.avg_rating || defaultStats.avg_rating,
    total_buyers: stats.total_buyers || defaultStats.total_buyers,
  } : defaultStats;

  // Chart datasets by timeframe
  const chartDatasets = {
    daily: [
      { name: 'Mon', Sales: 12000, Forecast: 14000 },
      { name: 'Tue', Sales: 18000, Forecast: 19500 },
      { name: 'Wed', Sales: 15000, Forecast: 16000 },
      { name: 'Thu', Sales: 24000, Forecast: 22000 },
      { name: 'Fri', Sales: 32000, Forecast: 35000 },
      { name: 'Sat', Sales: 28000, Forecast: 30000 },
      { name: 'Sun', Sales: 22000, Forecast: 25000 },
    ],
    weekly: [
      { name: 'Week 1', Sales: 45000, Forecast: 48000 },
      { name: 'Week 2', Sales: 52000, Forecast: 55000 },
      { name: 'Week 3', Sales: 68000, Forecast: 70000 },
      { name: 'Week 4', Sales: 80000, Forecast: 85000 },
    ],
    monthly: [
      { name: 'Jan', Sales: 180000, Forecast: 190000 },
      { name: 'Feb', Sales: 210000, Forecast: 220000 },
      { name: 'Mar', Sales: 245000, Forecast: 260000 },
      { name: 'Apr', Sales: 195000, Forecast: 210000 },
      { name: 'May', Sales: 290000, Forecast: 310000 },
      { name: 'Jun', Sales: 340000, Forecast: 360000 },
    ],
    yearly: [
      { name: '2023', Sales: 1850000, Forecast: 1900000 },
      { name: '2024', Sales: 2400000, Forecast: 2550000 },
      { name: '2025', Sales: 2940000, Forecast: 3100000 },
      { name: '2026', Sales: 3500000, Forecast: 3800000 },
    ]
  };

  const inventoryProducts = [
    { id: 1, name: 'Beef Tomatoes', category: 'Vegetables', stock: '250 Kg', isLow: false, icon: '🍅' },
    { id: 2, name: 'Dry White Maize', category: 'Grains', stock: '500 Bags', isLow: false, icon: '🌽' },
    { id: 3, name: 'Molo Irish Potatoes', category: 'Tubers', stock: '15 Bags', isLow: true, icon: '🥔' },
    { id: 4, name: 'Hass Avocados', category: 'Fruits', stock: '40 Kg', isLow: true, icon: '🥑' },
  ];

  const recentOrders = [
    { id: 'ORD-8921', buyer: 'Alice Wambui', item: 'Tomatoes', qty: '50 Kg', price: 'KES 16,000', status: 'Pending' },
    { id: 'ORD-8922', buyer: 'Naivas Supermarket', item: 'White Maize', qty: '100 Bags', price: 'KES 450,000', status: 'Completed' },
    { id: 'ORD-8923', buyer: 'Peter Njuguna', item: 'Irish Potatoes', qty: '30 Bags', price: 'KES 54,000', status: 'In Transit' },
    { id: 'ORD-8924', buyer: 'Zucchini Grocers', item: 'Avocados', qty: '80 Kg', price: 'KES 6,400', status: 'Completed' },
    { id: 'ORD-8925', buyer: 'Mary Atieno', item: 'Red Onions', qty: '40 Kg', price: 'KES 3,600', status: 'Processing' },
  ];

  const recentMessages = [
    { id: 1, sender: 'Alice Wambui', time: '10 mins ago', message: 'Hello! Can you deliver the 50Kg tomatoes by 2 PM tomorrow?' },
    { id: 2, sender: 'Naivas Procurement', time: '1 hour ago', message: 'Payment of KES 450,000 for Maize Order #ORD-8922 processed.' },
    { id: 3, sender: 'Transporter Mwangi', time: '3 hours ago', message: 'Truck loaded and en route to Nakuru depot.' },
  ];

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % tips.length);
    toast.info('Loaded fresh agronomic tip!', { autoClose: 1500 });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      
      {/* 1. AgroLink Logo & Personalized Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-700/30 mb-8 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <FaWheatAwn className="w-96 h-96 text-emerald-400" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-emerald-400/30 flex items-center justify-center">
              <img src="/logo.png" alt="AgroLink" className="h-10 sm:h-12 w-auto object-contain block" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-wider text-emerald-400 uppercase">AgroLink</span>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30">
                  Verified Farmer
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black mt-1">
                Welcome back, <span className="text-emerald-300">{user?.first_name || 'Farmer'}</span> to AgroLink! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Your intelligent agricultural command center for produce listings, buyer orders, and price forecasting.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/farmer/products" 
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-sm shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all"
            >
              + Add Produce
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 2. Beautiful Colorful Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        
        {/* Total Products */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-5 rounded-3xl shadow-lg shadow-green-600/15 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-green-100">Products</span>
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <FaWheatAwn className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black">{activeStats.products_count}</h3>
            <Link to="/farmer/products" className="text-xs font-semibold text-green-100 hover:text-white flex items-center gap-1 mt-2">
              View &rarr;
            </Link>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-gradient-to-br from-earth-500 to-earth-700 text-white p-5 rounded-3xl shadow-lg shadow-earth-500/15 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-earth-100">Pending Orders</span>
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <FaBoxOpen className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black">{activeStats.pending_orders}</h3>
            <Link to="/farmer/orders" className="text-xs font-semibold text-earth-100 hover:text-white flex items-center gap-1 mt-2">
              Process &rarr;
            </Link>
          </div>
        </div>

        {/* Wallet Balance / Earnings */}
        <Link 
          to="/farmer/wallet"
          className="bg-gradient-to-br from-green-500 to-green-700 text-white p-5 rounded-3xl shadow-lg shadow-green-500/15 flex flex-col justify-between hover:scale-[1.02] hover:shadow-xl transition-all duration-300 text-left no-underline cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-green-100">Wallet Balance</span>
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <FaCoins className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg sm:text-xl font-black truncate">
              {wallet ? "KES " + Number(wallet.balance).toLocaleString() : `KES ${(activeStats.revenue / 1000).toFixed(0)}k`}
            </h3>
            <span className="text-[10px] font-bold text-green-200 mt-2 block hover:underline">Manage Wallet &rarr;</span>
          </div>
        </Link>


        {/* Deliveries */}
        <div className="bg-gradient-to-br from-earth-500 to-amber-600 text-white p-5 rounded-3xl shadow-lg shadow-earth-500/15 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-earth-100">Deliveries</span>
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <FaTruckMoving className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black">{activeStats.deliveries_in_progress}</h3>
            <Link to="/farmer/deliveries" className="text-xs font-semibold text-earth-100 hover:text-white flex items-center gap-1 mt-2">
              Track &rarr;
            </Link>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-gradient-to-br from-green-650 to-emerald-700 text-white p-5 rounded-3xl shadow-lg shadow-green-600/15 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-green-100">Rating</span>
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <FaStar className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black">{activeStats.avg_rating} / 5</h3>
            <span className="text-xs font-semibold text-green-100 mt-2 block">Top Rated Farmer</span>
          </div>
        </div>

        {/* Buyers */}
        <div className="bg-gradient-to-br from-earth-600 to-earth-700 text-white p-5 rounded-3xl shadow-lg shadow-earth-600/15 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-earth-100">Buyers</span>
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <FaUsers className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black">{activeStats.total_buyers}</h3>
            <span className="text-xs font-semibold text-earth-100 mt-2 block">Active Connections</span>
          </div>
        </div>

      </div>

      {/* 3. Sales Analytics Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8" data-aos="fade-up">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FaChartLine className="text-emerald-600" /> Sales Analytics & ML Forecast
            </h2>
            <p className="text-xs text-slate-500">Track historical revenue alongside Scikit-Learn price trends</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Timeframe Filter */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-bold">
              {['daily', 'weekly', 'monthly', 'yearly'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                    timeframe === tf ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Chart Type Toggle */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-bold">
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded-xl flex items-center gap-1 transition-all ${
                  chartType === 'line' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                <FaChartLine /> Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded-xl flex items-center gap-1 transition-all ${
                  chartType === 'bar' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                <FaChartBar /> Bar
              </button>
            </div>
          </div>
        </div>

        {/* Chart Rendering */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <AreaChart data={chartDatasets[timeframe]}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <RechartsTooltip />
                <Legend />
                <Area type="monotone" dataKey="Sales" name="Actual Sales (KES)" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="Forecast" name="ML Projected Demand" stroke="#d97706" fillOpacity={1} fill="url(#colorForecast)" />
              </AreaChart>
            ) : (
              <BarChart data={chartDatasets[timeframe]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="Sales" name="Actual Sales (KES)" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Forecast" name="ML Projected Demand" fill="#d97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: 4. Inventory Overview & 5. Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* 4. Inventory Overview */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between" data-aos="fade-up">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FaWheatAwn className="text-emerald-600" /> Inventory Overview
              </h3>
              <Link to="/farmer/products" className="text-xs font-bold text-emerald-700 hover:underline">
                Manage All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(myProducts.length > 0 ? myProducts.slice(0, 4).map(p => {
                const qty = Number(p.quantity_available || 0);
                const isOut = qty === 0;
                const isLow = qty >= 1 && qty <= 20;
                const statusBadge = isOut ? 'Out of Stock 🔴' : isLow ? 'Low Stock 🟡' : 'Available 🟢';
                const cardStyle = isOut 
                  ? 'bg-red-50/80 border-red-200 text-red-900' 
                  : isLow 
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
                  : 'bg-slate-50 border-slate-200 text-slate-800';
                const badgeStyle = isOut
                  ? 'bg-red-600 text-white'
                  : isLow
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-100 text-emerald-800';
                
                return {
                  id: p.id,
                  name: p.name,
                  stock: `${qty} ${p.unit}`,
                  statusBadge,
                  cardStyle,
                  badgeStyle,
                  icon: p.name.toLowerCase().includes('tomato') ? '🍅' : p.name.toLowerCase().includes('maize') ? '🌽' : p.name.toLowerCase().includes('potato') ? '🥔' : '🥑'
                };
              }) : inventoryProducts.map(p => ({
                id: p.id,
                name: p.name,
                stock: p.stock,
                statusBadge: p.isLow ? 'Low Stock 🟡' : 'Available 🟢',
                cardStyle: p.isLow ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-800',
                badgeStyle: p.isLow ? 'bg-amber-500 text-white' : 'bg-emerald-100 text-emerald-800',
                icon: p.icon
              }))).map((p) => (
                <div 
                  key={p.id} 
                  className={`p-4 rounded-2xl border transition-all ${p.cardStyle}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{p.icon}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${p.badgeStyle}`}>
                      <FaCircle className="w-2 h-2" /> {p.statusBadge}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm">{p.name}</h4>
                  <p className="text-xs text-slate-500">Stock: <strong className="font-black">{p.stock}</strong></p>
                  
                  <Link 
                    to="/farmer/products"
                    className="mt-3 w-full py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1 shadow-sm block text-center"
                  >
                    <FaEdit /> Edit Stock
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Recent Orders (Latest 5) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between" data-aos="fade-up">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FaBoxOpen className="text-amber-600" /> Recent Orders
              </h3>
              <span className="text-xs text-slate-400 font-medium">Latest 5 Transactions</span>
            </div>

            <div className="space-y-3">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between hover:bg-slate-100/80 transition-all">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs text-slate-900 font-bold">{ord.buyer}</strong>
                      <span className="text-xs text-slate-400">&bull; {ord.id}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {ord.item} ({ord.qty}) &bull; <span className="text-emerald-700 font-bold">{ord.price}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-lg ${
                      ord.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      ord.status === 'In Transit' ? 'bg-earth-100 text-earth-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.status}
                    </span>
                    <button 
                      onClick={() => toast.info(`Viewing Order details for ${ord.id}`)}
                      className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Link 
              to="/farmer/orders" 
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              View All Orders <FaArrowRight />
            </Link>
          </div>
        </div>

      </div>

      {/* Grid: 6. Delivery Tracker & 7. Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* 6. Delivery Tracker */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200" data-aos="fade-up">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FaTruckMoving className="text-indigo-600" /> Delivery Progress Tracker
          </h3>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-3">
              <span>Order #ORD-8923 (Irish Potatoes - 30 Bags)</span>
              <span className="text-emerald-700">75% Complete</span>
            </div>

            {/* Step Progress Line */}
            <div className="relative flex items-center justify-between my-6 px-4">
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1.5 bg-slate-200 z-0"></div>
              <div className="absolute left-6 w-3/4 top-1/2 -translate-y-1/2 h-1.5 bg-emerald-500 z-0"></div>

              {/* Step 1: Pickup */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                  ✓
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">Pickup</span>
              </div>

              {/* Step 2: Transport */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                  ✓
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">Transport</span>
              </div>

              {/* Step 3: In Transit */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-md ring-4 ring-emerald-100 animate-pulse">
                  ✓
                </div>
                <span className="text-xs font-bold text-emerald-800 mt-2">In Transit</span>
              </div>

              {/* Step 4: Delivered */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <span className="text-xs font-bold text-slate-400 mt-2">Delivered</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center mt-2">
              Driver Mwangi is currently 14 km away from Nakuru Wholesale Hub.
            </p>
          </div>
        </div>

        {/* 7. Recent Messages */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between" data-aos="fade-up">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FaComments className="text-green-600" /> Recent Messages
              </h3>
              <Link to="/farmer/chat" className="text-xs font-bold text-green-700 hover:underline">
                Open Chat →
              </Link>
            </div>

            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="p-3 bg-green-50/40 rounded-2xl border border-green-100/60 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {msg.sender[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{msg.sender}</h4>
                      <span className="text-xs text-slate-400">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Grid: 8. Notifications, 9. Farming Tips & 10. Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* 8. Notification Cards */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200" data-aos="fade-up">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FaBell className="text-amber-500" /> Live Notifications
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold text-lg">🟢</span>
              <div>
                <h4 className="text-xs font-bold text-emerald-900">New Order Received</h4>
                <p className="text-xs text-emerald-700 mt-0.5">Alice Wambui placed an order for 50 Kg Tomatoes.</p>
              </div>
            </div>

            <div className="p-3 bg-earth-50 rounded-2xl border border-earth-200 flex items-start gap-2.5">
              <span className="text-earth-600 font-bold text-lg">🟠</span>
              <div>
                <h4 className="text-xs font-bold text-earth-900">Payment Received</h4>
                <p className="text-xs text-earth-700 mt-0.5">KES 450,000 received via M-Pesa for Order #ORD-8922.</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5">
              <span className="text-amber-600 font-bold text-lg">🟠</span>
              <div>
                <h4 className="text-xs font-bold text-amber-900">Product Running Low</h4>
                <p className="text-xs text-amber-700 mt-0.5">Molo Irish Potatoes inventory is down to 15 bags.</p>
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-2xl border border-green-200 flex items-start gap-2.5">
              <span className="text-green-600 font-bold text-lg">🟢</span>
              <div>
                <h4 className="text-xs font-bold text-green-900">AI Price Updated</h4>
                <p className="text-xs text-green-700 mt-0.5">Scikit-Learn ML updated Maize forecast (+4.5%).</p>
              </div>
            </div>
          </div>
        </div>

        {/* 9. Farming Tip of the Day */}
        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-6 rounded-3xl shadow-lg border border-emerald-700/30 flex flex-col justify-between" data-aos="fade-up">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                <FaLightbulb /> 🌱 Tip of the Day
              </span>
              <button 
                onClick={nextTip}
                className="text-xs font-semibold text-emerald-300 hover:text-white underline"
              >
                Next Tip &rarr;
              </button>
            </div>

            <blockquote className="text-sm italic font-medium text-emerald-100 leading-relaxed my-4">
              "{tips[tipIndex]}"
            </blockquote>
          </div>

          <div className="pt-4 border-t border-emerald-700/50 flex items-center justify-between text-xs text-emerald-300">
            <span>Agronomic Advisory Engine</span>
            <span>Tip {tipIndex + 1} of {tips.length}</span>
          </div>
        </div>

        {/* 10. Performance Summary */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between" data-aos="fade-up">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FaShieldHalved className="text-emerald-600" /> Performance Summary
            </h3>

            {/* Goal Progress Bar */}
            <div className="mb-5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700">Monthly Sales Goal</span>
                <span className="text-emerald-700">75% Achieved</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-green-600 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block font-mono">
                ████████████░░░░ (KES 245,000 / 300,000)
              </span>
            </div>

            {/* Performance Key Values */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-500">Best Selling Product:</span>
                <strong className="text-slate-900 font-bold">Dry White Maize</strong>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-500">Most Ordered Crop:</span>
                <strong className="text-slate-900 font-bold">Irish Potatoes</strong>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-500">Monthly Revenue:</span>
                <strong className="text-emerald-700 font-bold">KES 245,000</strong>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-500">Orders Completed:</span>
                <strong className="text-earth-700 font-bold">42 Orders</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function FarmerDashboard() {
  return (
    <ProtectedRoute roles={['farmer']}>
      <DashboardLayout>
        <FarmerDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
