import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Star, MessageSquare, Filter, Search, ArrowRight, CornerDownRight, 
  Award, ShieldCheck, Heart, Clock, CheckCircle, AlertCircle, RefreshCw 
} from 'lucide-react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute, useAuth } from '../../context/AuthContext';
import api from '../../api/client';

function RatingsContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStars, setSelectedStars] = useState('all'); // all, 5, 4, 3, positive, negative
  const [sortBy, setSortBy] = useState('recent'); // recent, oldest
  const [replyInputs, setReplyInputs] = useState({});

  // Performance metrics
  const performance = {
    onTimeRate: '98.2%',
    successTrips: 326,
    cancelledTrips: 2,
    customerSatisfaction: '99.1%',
    responseTime: '< 5 mins'
  };

  // Badges state
  const badges = [
    { id: 1, title: '🏆 Top Rated Driver', desc: 'Maintained 4.8+ rating over 100 trips', earned: true },
    { id: 2, title: '⭐ Excellent Service', desc: 'Received 50 consecutive 5-star reviews', earned: true },
    { id: 3, title: '🚚 Fast Delivery', desc: 'On-time delivery rate above 98%', earned: true },
    { id: 4, title: '🥇 Trusted Transporter', desc: 'Fully verified cargo handling credentials', earned: true }
  ];

  // Rating breakdowns
  const breakdown = {
    average: 4.9,
    total: 328,
    monthCount: 34,
    todayCount: 2,
    stars: [
      { level: 5, count: 250 },
      { level: 4, count: 50 },
      { level: 3, count: 20 },
      { level: 2, count: 5 },
      { level: 1, count: 3 }
    ]
  };

  // Sample customer reviews data
  const [reviews, setReviews] = useState([
    {
      id: 101,
      customerName: 'John Mwangi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      stars: 5,
      deliveryId: 'DEL-8801',
      orderId: 'ORD-0980',
      date: '2 hours ago',
      text: 'Delivered dry white maize on time. Very professional cargo handling and smooth communications. Highly recommended driver!',
      pickup: 'Nakuru, Lanet',
      destination: 'Nairobi Depot',
      product: 'Dry White Maize',
      reply: null
    },
    {
      id: 102,
      customerName: 'Grace Wanjiku',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
      stars: 5,
      deliveryId: 'DEL-8799',
      orderId: 'ORD-0975',
      date: 'Yesterday',
      text: 'Superb transport service! Carried tomatoes safely without any bruising or damages. Fast travel speed along the highway.',
      pickup: 'Molo Agricultural Hub',
      destination: 'Karen Retailer Store',
      product: 'Avocados / Tomatoes',
      reply: 'Thank you for your feedback! Looking forward to serving you again.'
    },
    {
      id: 103,
      customerName: 'Peter Koech',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      stars: 4,
      deliveryId: 'DEL-8750',
      orderId: 'ORD-0910',
      date: '4 days ago',
      text: 'Good communication and reliable truck. Arrived slightly late due to highway weighbridge traffic but kept me informed throughout.',
      pickup: 'Eldoret Sector 4',
      destination: 'Nakuru Town Depot',
      product: 'Hass Avocados',
      reply: null
    },
    {
      id: 104,
      customerName: 'Mary Atieno',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      stars: 3,
      deliveryId: 'DEL-8690',
      orderId: 'ORD-0870',
      date: '1 week ago',
      text: 'Average service. Cargo was delivered safely, but coordination took longer than estimated.',
      pickup: 'Subukia Farm',
      destination: 'Industrial Area Depot',
      product: 'Dry White Maize',
      reply: null
    }
  ]);

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handlePostReply = (reviewId) => {
    const replyText = replyInputs[reviewId]?.trim();
    if (!replyText) return;

    setReviews(prev => prev.map(rev => {
      if (rev.id === reviewId) {
        return { ...rev, reply: replyText };
      }
      return rev;
    }));

    setReplyInputs(prev => ({ ...prev, [reviewId]: '' }));
    toast.success("Reply posted successfully!");
  };

  // Filter logic
  const filteredReviews = reviews.filter(rev => {
    // Rating filter
    if (selectedStars !== 'all') {
      if (selectedStars === '5') {
        if (rev.stars !== 5) return false;
      } else if (selectedStars === '4') {
        if (rev.stars !== 4) return false;
      } else if (selectedStars === '3') {
        if (rev.stars !== 3) return false;
      } else if (selectedStars === 'positive') {
        if (rev.stars < 4) return false;
      } else if (selectedStars === 'negative') {
        if (rev.stars >= 4) return false;
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = rev.customerName.toLowerCase().includes(q);
      const matchId = rev.deliveryId.toLowerCase().includes(q) || rev.orderId.toLowerCase().includes(q);
      const matchText = rev.text.toLowerCase().includes(q) || rev.product.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchText) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'recent') return 1; // Sort orders in simulation
    return -1;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 font-sans text-slate-800 antialiased">
      
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        
        {/* Rating Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Average Rating</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-900">{breakdown.average}</span>
              <span className="text-slate-400 text-xs font-semibold">/ 5.0</span>
            </div>
            <div className="flex gap-0.5 text-amber-500 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4.5 h-4.5 fill-current" />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-4">Based on {breakdown.total} verified reviews</p>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm md:col-span-2 space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Rating Breakdown</span>
          
          <div className="space-y-1.5 pt-1">
            {breakdown.stars.map((s) => {
              const pct = (s.count / breakdown.total) * 100;
              return (
                <div key={s.level} className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                  <div className="flex items-center gap-1 w-12">
                    <span>{s.level}</span>
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className="h-full bg-emerald-500 rounded-full" />
                  </div>
                  <span className="w-8 text-right text-slate-400">{s.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Counter Card */}
        <div className="bg-[#0B1A13] text-white p-5 rounded-3xl border border-emerald-950 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Reviews</span>
            <p className="text-3xl font-black mt-2 text-slate-100">{breakdown.total}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-bold border-t border-emerald-900/40 pt-3">
            <div>
              <span className="text-slate-400 block font-medium">This Month</span>
              <strong className="text-emerald-400 text-xs">{breakdown.monthCount}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Today</span>
              <strong className="text-emerald-400 text-xs">{breakdown.todayCount}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Badges & Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Achievements Badges */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm md:col-span-1">
          <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" /> Driver Achievements
          </h3>

          <div className="space-y-3 pt-1">
            {badges.map((b) => (
              <div key={b.id} className="flex gap-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-black text-slate-800">{b.title}</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">{b.desc}</p>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 self-center" />
              </div>
            ))}
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm md:col-span-2">
          <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase">Performance Indicators</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase">On-Time rate</span>
              <p className="text-lg font-black text-emerald-600 mt-1">{performance.onTimeRate}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Success Deliveries</span>
              <p className="text-lg font-black text-slate-800 mt-1">{performance.successTrips}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Cancelled trips</span>
              <p className="text-lg font-black text-red-500 mt-1">{performance.cancelledTrips}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Satisfaction</span>
              <p className="text-lg font-black text-emerald-600 mt-1">{performance.customerSatisfaction}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Response time</span>
              <p className="text-lg font-black text-slate-800 mt-1">{performance.responseTime}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Customer Reviews Search & Filters View */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Search bar & Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
            <button 
              onClick={() => setSelectedStars('all')}
              className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                selectedStars === 'all' ? 'bg-[#E1F7EE] text-emerald-800 border-emerald-300 font-extrabold' : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              All Reviews
            </button>
            <button 
              onClick={() => setSelectedStars('5')}
              className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                selectedStars === '5' ? 'bg-[#E1F7EE] text-emerald-800 border-emerald-300 font-extrabold' : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              5 Stars
            </button>
            <button 
              onClick={() => setSelectedStars('4')}
              className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                selectedStars === '4' ? 'bg-[#E1F7EE] text-emerald-800 border-emerald-300 font-extrabold' : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              4 Stars
            </button>
            <button 
              onClick={() => setSelectedStars('positive')}
              className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                selectedStars === 'positive' ? 'bg-[#E1F7EE] text-emerald-800 border-emerald-300 font-extrabold' : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              Positive
            </button>
            <button 
              onClick={() => setSelectedStars('negative')}
              className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                selectedStars === 'negative' ? 'bg-[#FDF2F2] text-red-800 border-red-200 font-extrabold' : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              Negative
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews..." 
                className="pl-8 pr-4 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-[11px] w-48"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-[11px]"
            >
              <option value="recent">Recent</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((rev) => (
              <div key={rev.id} className="border-b border-slate-100 last:border-none pb-6 last:pb-0 space-y-3">
                
                {/* Upper info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={rev.avatar} alt={rev.customerName} className="w-9 h-9 rounded-full object-cover border border-slate-100" />
                    <div>
                      <h4 className="text-xs font-black text-slate-800 leading-tight">{rev.customerName}</h4>
                      <div className="flex gap-0.5 text-amber-500 mt-1">
                        {[...Array(rev.stars)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                </div>

                {/* Body review text */}
                <p className="text-xs text-slate-650 leading-relaxed pl-12">{rev.text}</p>

                {/* Cargo mapping details */}
                <div className="bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-[10px] text-slate-500 font-bold ml-12 flex flex-wrap gap-x-6 gap-y-1.5">
                  <div>
                    <span className="text-slate-400 font-medium">Delivery:</span> #{rev.deliveryId}
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Order:</span> #{rev.orderId}
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Product:</span> {rev.product}
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Route:</span> {rev.pickup} → {rev.destination}
                  </div>
                </div>

                {/* Professional Reply View or Form */}
                <div className="ml-12">
                  {rev.reply ? (
                    <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-3.5 flex items-start gap-2.5">
                      <CornerDownRight className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block text-[10px] text-emerald-800">Your Response:</strong>
                        <p className="text-xs text-slate-650 mt-1 leading-normal italic">"{rev.reply}"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 max-w-lg">
                      <input 
                        type="text" 
                        placeholder="Write a professional reply to feedback..." 
                        value={replyInputs[rev.id] || ''}
                        onChange={(e) => setReplyInputs(prev => ({ ...prev, [rev.id]: e.target.value }))}
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs"
                      />
                      <button 
                        onClick={() => handlePostReply(rev.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-sm"
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))
          ) : (
            <div className="text-center text-slate-400 py-10">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-bold">No reviews found matching filters</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default function Ratings() {
  return (
    <ProtectedRoute roles={['transporter']}>
      <DashboardLayout>
        <RatingsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
