import { useState, useEffect } from 'react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../context/AuthContext';
import api from '../../api/client';

function DeliveriesContent() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDeliveries().then((d) => setDeliveries(d.results || d || [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleWsDeliveryUpdate = (e) => {
      const updatedDel = e.detail;
      setDeliveries((prev) => {
        const exists = prev.some((d) => d.id === updatedDel.id);
        if (exists) {
          return prev.map((d) => (d.id === updatedDel.id ? updatedDel : d));
        } else {
          return [updatedDel, ...prev];
        }
      });
    };

    window.addEventListener('ws:delivery_update', handleWsDeliveryUpdate);
    return () => {
      window.removeEventListener('ws:delivery_update', handleWsDeliveryUpdate);
    };
  }, []);

  return (
    <>
      <PageHeader title="Delivery Requests" subtitle="Track deliveries for your orders" />
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {deliveries.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">Delivery #{d.id} — Order #{d.order}</p>
                  <p className="text-sm text-gray-500">{d.pickup_county} → {d.dropoff_county}</p>
                  <p className="text-sm text-gray-500">Transporter: {d.transporter_name || 'Awaiting assignment'}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">{d.status.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
          {deliveries.length === 0 && <p className="text-center text-gray-500 py-12">No delivery requests yet.</p>}
        </div>
      )}
    </>
  );
}

export default function FarmerDeliveries() {
  return (
    <ProtectedRoute roles={['farmer']}>
      <DashboardLayout><DeliveriesContent /></DashboardLayout>
    </ProtectedRoute>
  );
}
