import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

const ROLE_DASHBOARDS = {
  farmer: '/farmer/dashboard',
  buyer: '/buyer/dashboard',
  transporter: '/transporter/dashboard',
  admin: '/admin/dashboard',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!api.getToken()) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.me();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch {
      api.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    api.setTokens(data.access, data.refresh);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (formData) => {
    return await api.register(formData);
  };

  const logout = () => {
    api.clearTokens();
    setUser(null);
  };

  useEffect(() => {
    if (!user) return;
    
    const token = api.getToken();
    if (!token) return;

    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = '127.0.0.1:8000';
    const wsUrl = `${wsProto}//${host}/ws/updates/?token=${token}`;
    
    console.log(`Connecting to global updates WS: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log("Global update event received:", payload);
        
        // Dispatch to window so any component can listen to it
        const customEvent = new CustomEvent(`ws:${payload.event_type}`, { detail: payload.data });
        window.dispatchEvent(customEvent);

        // Show generic live Toast updates
        if (payload.event_type === 'order_update') {
          toast.info(`📦 Order ${payload.data.id} status updated to: ${payload.data.status.toUpperCase()}`);
        } else if (payload.event_type === 'wallet_update') {
          toast.success(`💳 Wallet balance updated! New Balance: KES ${Number(payload.data.balance).toLocaleString()}`);
        } else if (payload.event_type === 'delivery_update') {
          toast.info(`🚚 Delivery status: ${payload.data.status.replace('_', ' ').toUpperCase()}`);
        }
      } catch (err) {
        console.error("Error parsing global update message", err);
      }
    };

    ws.onclose = () => {
      console.log("Global updates WS closed.");
    };

    return () => {
      ws.close();
    };
  }, [user]);

  const dashboardPath = user ? ROLE_DASHBOARDS[user.role] || '/' : '/login';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, dashboardPath, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  if (roles && !roles.includes(user.role) && !user.is_superuser) {
    window.location.href = '/';
    return null;
  }
  return children;
}
