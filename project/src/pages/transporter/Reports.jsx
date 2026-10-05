import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  BarChart2, FileText, Calendar, Download, RefreshCw, 
  TrendingUp, Truck, DollarSign, Star, Navigation, Clock, Inbox, ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute, useAuth } from '../../context/AuthContext';
import api from '../../api/client';

function ReportsContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('month'); // today, week, month, last_month, custom
  const [exportLoading, setExportLoading] = useState(false);

  // Default mock data
  const stats = {
    totalDeliveries: 430,
    completed: 428,
    active: 2,
    cancelled: 2,
    totalEarnings: 456200,
    todayEarnings: 14000,
    weeklyEarnings: 68400,
    monthlyEarnings: 245000,
    onTimeRate: '98.2%',
    avgDuration: '2.4 hrs',
    avgRating: '4.90',
    acceptanceRate: '95.4%',
    totalKm: 14250,
    avgDistance: '43 Km',
    longestDistance: '320 Km',
    shortestDistance: '5 Km'
  };

  // Recharts mock datasets
  const deliveryTrends = [
    { name: 'Mon', Deliveries: 3, Distance: 120 },
    { name: 'Tue', Deliveries: 4, Distance: 180 },
    { name: 'Wed', Deliveries: 5, Distance: 210 },
    { name: 'Thu', Deliveries: 4, Distance: 160 },
    { name: 'Fri', Deliveries: 6, Distance: 280 },
    { name: 'Sat', Deliveries: 5, Distance: 240 },
    { name: 'Sun', Deliveries: 3, Distance: 110 }
  ];

  const earningsTrends = [
    { name: 'Mon', Income: 18000 },
    { name: 'Tue', Income: 24000 },
    { name: 'Wed', Income: 32000 },
    { name: 'Thu', Income: 28000 },
    { name: 'Fri', Income: 42500 },
    { name: 'Sat', Income: 38000 },
    { name: 'Sun', Income: 22000 }
  ];

  const feedbackInsights = {
    positive: 322,
    negative: 6,
    compliments: ['Always on time', 'Professional cargo tying', 'Excellent communication', 'Fresh tomato handling'],
    improvements: ['Highway weighbridge delays', 'Slightly slow rain navigation']
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleExport = (format) => {
    setExportLoading(format);
    toast.info(`Preparing ${format.toUpperCase()} report generation...`);
    
    setTimeout(() => {
      setExportLoading(false);
      // Simulate file download
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(stats, null, 2)], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `AgroLink_Transporter_Report_${dateFilter}_2026.${format}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast.success(`Export successful! AgroLink_Transporter_Report_${dateFilter}_2026.${format} downloaded.`);
    }, 2000);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 font-sans text-slate-800 antialiased">
      
      {/* Upper Options Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-500">Generate Report For:</span>
          
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold text-slate-700 bg-slate-50"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleExport('pdf')}
            disabled={exportLoading}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button 
            onClick={() => handleExport('xlsx')}
            disabled={exportLoading}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Excel
          </button>
          <button 
            onClick={() => handleExport('csv')}
            disabled={exportLoading}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Quick Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
        
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Deliveries</span>
          <p className="text-xl font-black text-slate-900 mt-1">{stats.totalDeliveries}</p>
          <span className="text-[8px] text-emerald-600 mt-1 font-bold">100% complete</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Earnings</span>
          <p className="text-xl font-black text-slate-900 mt-1">KES {stats.totalEarnings.toLocaleString()}</p>
          <span className="text-[8px] text-emerald-600 mt-1 font-bold">+12% vs last month</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Average Rating</span>
          <p className="text-xl font-black text-amber-500 mt-1 flex items-center justify-center gap-1">
            ⭐ {stats.avgRating}
          </p>
          <span className="text-[8px] text-slate-400 mt-1 font-bold">Excellent Service</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Distance Traveled</span>
          <p className="text-xl font-black text-slate-900 mt-1">{stats.totalKm.toLocaleString()} Km</p>
          <span className="text-[8px] text-slate-400 mt-1 font-bold">Total trip meters</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Average Trip Time</span>
          <p className="text-xl font-black text-slate-900 mt-1">{stats.avgDuration}</p>
          <span className="text-[8px] text-emerald-600 mt-1 font-bold">On-time transit</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active Deliveries</span>
          <p className="text-xl font-black text-emerald-600 mt-1">{stats.active}</p>
          <span className="text-[8px] text-slate-400 mt-1 font-bold">Live routing now</span>
        </div>

      </div>

      {/* Grid: Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Earnings Trends Area Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Earnings Analytics (KES)
            </h3>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              KES {stats.monthlyEarnings.toLocaleString()} This Month
            </span>
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="Income" stroke="#059669" fill="#e2f5ee" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deliveries Trends Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600" /> Delivery Trends (Trips)
            </h3>
            <span className="text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
              On-time rate {stats.onTimeRate}
            </span>
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliveryTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="Deliveries" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Analytics Breakdowns (Distance, Performance, Feedback) */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Performance & Acceptances */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase">Performance Indicators</h3>
          
          <div className="space-y-4 pt-1 text-[11px] font-bold text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Acceptance Rate:</span>
              <strong className="text-slate-900">{stats.acceptanceRate}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">On-Time delivery:</span>
              <strong className="text-emerald-600">{stats.onTimeRate}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Cancelled Trips:</span>
              <strong className="text-red-500">{stats.cancelled}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Completed Deliveries:</span>
              <strong className="text-slate-900">{stats.completed}</strong>
            </div>
          </div>
        </div>

        {/* Distance Analytics */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase">Distance Analytics</h3>
          
          <div className="space-y-4 pt-1 text-[11px] font-bold text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Total kilometers:</span>
              <strong className="text-slate-900">{stats.totalKm.toLocaleString()} Km</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Average distance:</span>
              <strong className="text-slate-900">{stats.avgDistance}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Longest trip:</span>
              <strong className="text-slate-900">{stats.longestDistance}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Shortest trip:</span>
              <strong className="text-slate-900">{stats.shortestDistance}</strong>
            </div>
          </div>
        </div>

        {/* Customer Feedback Insights */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase">Customer Feedback Trends</h3>
          
          <div className="space-y-3 pt-1 text-[11px] font-bold">
            <div className="flex gap-2 mb-2">
              <span className="flex-1 bg-emerald-50 border border-emerald-100 rounded-xl p-2 text-center text-emerald-800">
                <span className="block text-[8px] text-emerald-600 font-medium">Positive</span>
                <strong className="text-sm font-black">{feedbackInsights.positive}</strong>
              </span>
              <span className="flex-1 bg-red-50 border border-red-100 rounded-xl p-2 text-center text-red-800">
                <span className="block text-[8px] text-red-600 font-medium">Negative</span>
                <strong className="text-sm font-black">{feedbackInsights.negative}</strong>
              </span>
            </div>
            
            <div>
              <span className="text-slate-400 font-medium block text-[9px] uppercase mb-1">Common Compliments</span>
              <div className="flex flex-wrap gap-1">
                {feedbackInsights.compliments.map(c => (
                  <span key={c} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[9px] rounded-md font-bold">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function Reports() {
  return (
    <ProtectedRoute roles={['transporter']}>
      <DashboardLayout>
        <ReportsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
