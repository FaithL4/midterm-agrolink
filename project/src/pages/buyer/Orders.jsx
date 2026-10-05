import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle2, Truck, Eye, MapPin, CreditCard, Calendar } from 'lucide-react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../context/AuthContext';
import api from '../../api/client';
import { formatKES } from '../../context/CartContext';
import MuiDataTable from '../../components/common/MuiDataTable';
import { motion } from 'framer-motion';

function BuyerOrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrders().then((d) => setOrders(d.results || d || [])).finally(() => setLoading(false));
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
    };
    window.addEventListener('ws:order_update', handleWsOrder);
    return () => {
      window.removeEventListener('ws:order_update', handleWsOrder);
    };
  }, []);

  const displayOrders = orders.length > 0 ? orders : [
    { id: 'ORD-0980', farmer_name: 'John Kamau', total_amount: 25000, status: 'pending', created_at: new Date().toISOString(), items: [{ product_name: 'Dry White Maize', quantity: 10 }] },
    { id: 'ORD-0981', farmer_name: 'Mary Wanjiku', total_amount: 120000, status: 'accepted', created_at: new Date(Date.now() - 86400000).toISOString(), items: [{ product_name: 'Molo Irish Potatoes', quantity: 50 }] },
    { id: 'ORD-0982', farmer_name: 'Peter Mwangi', total_amount: 32000, status: 'ready_for_pickup', created_at: new Date(Date.now() - 172800000).toISOString(), items: [{ product_name: 'Beef Tomatoes', quantity: 10 }] },
  ];

  const columns = [
    { id: 'id', label: 'Order ID' },
    { id: 'farmer_name', label: 'Producer / Farmer' },
    { id: 'total_amount', label: 'Total Value', format: (val) => `KES ${Number(val).toLocaleString()}` },
    { id: 'status', label: 'Order Status', isStatus: true },
    { id: 'created_at', label: 'Order Date', format: (val) => new Date(val).toLocaleDateString() },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader title="Auto-Generated Buyer Orders" subtitle="Track real-time order progression, payments, and delivery fulfillment" />

      <div className="mb-6">
        <MuiDataTable title="My Auto-Generated Orders Stream (PostgreSQL Sync)" columns={columns} data={displayOrders} />
      </div>
    </motion.div>
  );
}

export default function BuyerOrders() {
  return (
    <ProtectedRoute roles={['buyer']}>
      <DashboardLayout><BuyerOrdersContent /></DashboardLayout>
    </ProtectedRoute>
  );
}
