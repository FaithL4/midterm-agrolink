import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartJSTooltip,
  Legend as ChartJSLegend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartJSTooltip,
  ChartJSLegend,
  Filler
);

export function PriceTrendChart({ data, title = "Price Trend & Scikit-Learn AI Forecast (KES)" }) {
  const chartData = data || [
    { name: 'Week 1', actual: 4200, predicted: 4300 },
    { name: 'Week 2', actual: 4350, predicted: 4420 },
    { name: 'Week 3', actual: 4500, predicted: 4550 },
    { name: 'Week 4', actual: 4480, predicted: 4610 },
    { name: 'Week 5 (ML)', predicted: 4700 },
    { name: 'Week 6 (ML)', predicted: 4850 },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
        {title}
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <RechartsTooltip />
            <Legend />
            <Area type="monotone" dataKey="actual" name="Historical Price" stroke="#10b981" fillOpacity={1} fill="url(#colorActual)" />
            <Area type="monotone" dataKey="predicted" name="ML Predicted Price" stroke="#6366f1" fillOpacity={1} fill="url(#colorPredicted)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SalesBarChart({ data, title = "Monthly Volume & Earnings" }) {
  const chartData = data || [
    { month: 'Jan', Sales: 120, Earnings: 48000 },
    { month: 'Feb', Sales: 190, Earnings: 76000 },
    { month: 'Mar', Sales: 240, Earnings: 96000 },
    { month: 'Apr', Sales: 310, Earnings: 124000 },
    { month: 'May', Sales: 280, Earnings: 112000 },
    { month: 'Jun', Sales: 390, Earnings: 156000 },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="Sales" name="Bags Sold" fill="#059669" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Earnings" name="Earnings (KES)" fill="#0284c7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ChartJSLineChart({ title = "Market Demand & Volume Index (Chart.js)" }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    }
  };

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const chartData = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Buyer Orders Demand',
        data: [65, 78, 90, 81, 95, 110, 125],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.3
      },
      {
        fill: true,
        label: 'Transporter Logistics Supply',
        data: [40, 55, 60, 72, 80, 88, 102],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        tension: 0.3
      }
    ]
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>
      <div className="h-64 w-full">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
}
