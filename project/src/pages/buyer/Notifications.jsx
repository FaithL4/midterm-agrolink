import React, { useState } from 'react';
import { Bell, Shield, DollarSign, Package, Check, Trash2, Heart } from 'lucide-react';
import DashboardLayout, { PageHeader } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../context/AuthContext';
import { toast } from 'react-toastify';

function NotificationsContent() {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'Order ORD-0980 Accepted',
      message: 'Farmer John Kamau has accepted your maize order and started packing.',
      time: '15 mins ago',
      read: false,
      icon: Package,
      color: 'text-green-700 bg-green-50 border-green-100',
    },
    {
      id: 2,
      type: 'payment',
      title: 'Escrow Payment Successful',
      message: 'Payment of KES 25,000 for maize is held securely in escrow.',
      time: '30 mins ago',
      read: false,
      icon: DollarSign,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    },
    {
      id: 3,
      type: 'general',
      title: 'Hass Avocados Back in Stock',
      message: 'Farmer Koech Agro has replenished Hass Avocados in Murang\'a.',
      time: '2 hours ago',
      read: true,
      icon: Heart,
      color: 'text-rose-700 bg-rose-50 border-rose-100',
    },
    {
      id: 4,
      type: 'security',
      title: 'Password Changed Successfully',
      message: 'Your AgroLink password was recently updated. Contact support if this wasn\'t you.',
      time: '1 day ago',
      read: true,
      icon: Shield,
      color: 'text-blue-700 bg-blue-50 border-blue-100',
    },
  ]);

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast.success("Notification marked as read");
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast.info("Notification deleted");
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const getUnreadCount = () => notifications.filter(n => !n.read).length;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <PageHeader 
          title="Notification Alerts" 
          subtitle="Stay updated on order progress, payment statuses, and price drops" 
        />
        {getUnreadCount() > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 border border-gray-150 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs uppercase flex items-center gap-2 transition-colors"
          >
            <Check size={14} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left Filters Sidebar */}
        <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm h-fit space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Filter Alerts</p>
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'order', label: 'Orders' },
            { id: 'payment', label: 'Payments' },
            { id: 'security', label: 'Security & General' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${filter === cat.id ? 'bg-green-50 text-green-700 border-l-4 border-green-700 font-black' : 'text-gray-655 hover:bg-slate-50'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="lg:col-span-3 space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center shadow-sm">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-lg font-bold text-gray-800">All Caught Up!</h3>
              <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
                No alerts available in this category.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notif) => {
                const IconComponent = notif.icon;
                return (
                  <div 
                    key={notif.id} 
                    className={`bg-white rounded-3xl border p-5 shadow-sm flex gap-4 transition-all hover:shadow-md ${notif.read ? 'border-gray-150 opacity-75' : 'border-green-200 bg-green-50/10'}`}
                  >
                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 border ${notif.color}`}>
                      <IconComponent size={18} />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                          {notif.title}
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-ping" />
                          )}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-bold shrink-0">{notif.time}</span>
                      </div>
                      
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">
                        {notif.message}
                      </p>

                      <div className="pt-2 flex gap-3">
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="text-[10px] text-green-750 font-extrabold hover:underline"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="text-[10px] text-gray-400 hover:text-red-500 font-extrabold flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Notifications() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <NotificationsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
