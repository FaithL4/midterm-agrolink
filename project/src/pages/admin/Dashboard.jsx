import { useState, useEffect } from 'react';
import { Users, Tractor, ShoppingBag, Package, DollarSign } from 'lucide-react';
import DashboardLayout, { PageHeader, StatCard, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../context/AuthContext';
import api from '../../api/client';
import { formatKES } from '../../context/CartContext';

function AdminDashboardContent() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and analytics" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Users" value={stats?.users_count || 0} icon={Users} />
        <StatCard label="Farmers" value={stats?.farmers_count || 0} icon={Tractor} color="green" />
        <StatCard label="Buyers" value={stats?.buyers_count || 0} icon={ShoppingBag} color="blue" />
        <StatCard label="Products" value={stats?.products_count || 0} icon={Package} color="amber" />
        <StatCard label="Orders" value={stats?.orders_count || 0} icon={ShoppingBag} color="purple" />
        <StatCard label="Revenue" value={formatKES(stats?.revenue || 0)} icon={DollarSign} color="green" />
      </div>
      {stats?.orders_by_status && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Orders by Status</h2>
          <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.orders_by_status.map((s) => (
              <div key={s.status} className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-2xl font-bold">{s.count}</p>
                <p className="text-xs text-gray-500 capitalize">{s.status.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute roles={['admin']}>
      <DashboardLayout><AdminDashboardContent /></DashboardLayout>
    </ProtectedRoute>
  );
}
