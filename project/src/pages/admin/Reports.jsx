import { useState, useEffect } from 'react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../context/AuthContext';
import api from '../../api/client';

function ReportsContent() {
  const [predictions, setPredictions] = useState([]);
  const [demand, setDemand] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getPredictions(), api.getDemand()])
      .then(([p, d]) => { setPredictions((p.results || p).slice(0, 10)); setDemand(d.results || d); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <PageHeader title="Reports & Analytics" subtitle="Market intelligence overview" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Price Predictions</h2>
          <div className="space-y-2">
            {predictions.map((p) => (
              <div key={p.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                <span>{p.crop} — {p.county}</span>
                <span className={Number(p.change_percent) > 0 ? 'text-green-600' : 'text-red-600'}>{p.change_percent}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Demand Intelligence</h2>
          <div className="space-y-2">
            {demand.map((d) => (
              <div key={d.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium text-sm">{d.county}: {d.crop}</span>
                  <span className="text-xs capitalize text-green-700">{d.demand_level.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{d.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminReports() {
  return (
    <ProtectedRoute roles={['admin']}>
      <DashboardLayout><ReportsContent /></DashboardLayout>
    </ProtectedRoute>
  );
}
