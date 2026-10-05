import { useState, useEffect } from 'react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../context/AuthContext';
import api from '../../api/client';

function UsersContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.getUsers().then((d) => setUsers(d.results || d)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const toggle = async (id) => { await api.toggleUserActive(id); load(); };

  return (
    <>
      <PageHeader title="User Management" subtitle="Manage platform users" />
      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">County</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{u.first_name} {u.last_name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4 capitalize">{u.role}</td>
                  <td className="p-4">{u.county}</td>
                  <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${u.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.is_active !== false ? 'Active' : 'Inactive'}</span></td>
                  <td className="p-4">
                    <button onClick={() => toggle(u.id)} className="text-sm text-blue-600 hover:underline">Toggle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function AdminUsers() {
  return (
    <ProtectedRoute roles={['admin']}>
      <DashboardLayout><UsersContent /></DashboardLayout>
    </ProtectedRoute>
  );
}
