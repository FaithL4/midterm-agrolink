import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, Package, ShoppingCart, FileText, MessageSquare, 
  LineChart, Cloud, Lightbulb, Wallet, Settings, HelpCircle, 
  LogOut, Menu, X, Leaf, Star, MapPin, Inbox, Heart, CreditCard, Bell, History, User, Truck
} from 'lucide-react';
import { useState } from 'react';

const NAV = {
  farmer: [
    { to: '/farmer/dashboard', label: 'Dashboard', icon: Home },
    { to: '/farmer/products', label: 'My Products', icon: Package },
    { to: '/marketplace', label: 'Marketplace', icon: ShoppingCart },
    { to: '/farmer/orders', label: 'Orders', icon: FileText },
    { to: '/farmer/transport-requests', label: 'Transport Requests', icon: Truck, badge: 'New' },
    { to: '/farmer/chat', label: 'Messages', icon: MessageSquare, badge: '3' },
    { to: '/farmer/predictions', label: 'Price Trends', icon: LineChart },
    { to: '/farmer/advisory', label: 'Weather', icon: Cloud },
    { to: '/farmer/advisory', label: 'Farm Insights', icon: Lightbulb },
    { to: '/farmer/wallet', label: 'Wallet', icon: Wallet },
    { to: '/farmer/profile', label: 'Profile', icon: User, badge: 'New' },
    { to: '/farmer/settings', label: 'Settings', icon: Settings, badge: 'New' },
  ],
  buyer: [
    { to: '/buyer/dashboard', label: 'Dashboard', icon: Home },
    { to: '/marketplace', label: 'Marketplace', icon: ShoppingCart },
    { to: '/buyer/wishlist', label: 'Wishlist', icon: Heart },
    { to: '/buyer/cart', label: 'Shopping Cart', icon: Package },
    { to: '/buyer/orders', label: 'My Orders', icon: FileText },
    { to: '/buyer/tracking', label: 'Delivery Tracking', icon: MapPin },
    { to: '/buyer/payments', label: 'Payments', icon: CreditCard },
    { to: '/buyer/wallet', label: 'Digital Wallet', icon: Wallet },
    { to: '/buyer/chat', label: 'Messages', icon: MessageSquare },
    { to: '/buyer/reviews', label: 'Reviews & Ratings', icon: Star },
    { to: '/buyer/history', label: 'Purchase History', icon: History },
    { to: '/buyer/notifications', label: 'Notifications', icon: Bell },
    { to: '/buyer/profile', label: 'Profile', icon: Settings },
    { to: '/buyer/profile#settings', label: 'Settings', icon: Settings },
  ],
  transporter: [
    { to: '/transporter/dashboard', label: 'Dashboard', icon: Home },
    { to: '/transporter/requests', label: 'Delivery Requests', icon: Inbox, badge: '6' },
    { to: '/transporter/deliveries', label: 'My Deliveries', icon: Package },
    { to: '/transporter/tracking', label: 'Live Tracking', icon: MapPin },
    { to: '/transporter/chat', label: 'Messages', icon: MessageSquare },
    { to: '/transporter/ratings', label: 'Ratings & Reviews', icon: Star },
    { to: '/transporter/reports', label: 'Reports & Analytics', icon: FileText },
    { to: '/transporter/profile', label: 'Profile Details', icon: User },
    { to: '/transporter/settings', label: 'Settings & Schedule', icon: Settings },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { to: '/admin/users', label: 'Users', icon: Package },
    { to: '/admin/products', label: 'Products', icon: ShoppingCart },
    { to: '/admin/reports', label: 'Reports', icon: FileText },
  ],
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const links = NAV[user?.role] || [];
  const isTransporter = user?.role === 'transporter';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform lg:translate-x-0 lg:static flex flex-col ${
        isTransporter 
          ? 'bg-[#0B1A13] text-white border-r border-[#132A20]' 
          : 'bg-white border-r border-gray-200 text-gray-800'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo Section */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isTransporter ? 'border-[#132A20]' : 'border-gray-150'
        }`}>
          <Link to="/" className="flex flex-col">
            <img src="/logo.png" alt="AgroLink" className="h-10 w-auto object-contain block filter brightness-110" />
            {isTransporter && <span className="text-[9px] text-emerald-400 font-black uppercase tracking-wider mt-1">Transporter Dashboard</span>}
          </Link>
          <button className={`lg:hidden ${isTransporter ? 'text-slate-400' : 'text-gray-500'}`} onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User Profile Card Section (Skip for transporter to align with designs) */}
        {!isTransporter && (
          <div className="p-6 border-b border-gray-150 flex flex-col items-center text-center">
            <div className="relative">
              <img
                src={user?.avatar || (user?.role === 'farmer' ? '/farmer.jpg' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80')}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-green-100 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <h3 className="font-bold text-gray-900 mt-3 text-sm leading-tight">{user?.first_name} {user?.last_name || 'Karanja'}</h3>
            <p className="text-[10px] font-bold text-green-700 mt-1.5 flex items-center justify-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              <span className="h-1 w-1 rounded-full bg-green-600"></span>
              {user?.role === 'farmer' ? 'Verified Farmer' : `Verified ${user?.role}`}
            </p>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              onClick={(e) => {
                if (l.to.startsWith('#')) {
                  e.preventDefault();
                  alert(`${l.label} dashboard integration coming soon!`);
                } else {
                  setSidebarOpen(false);
                }
              }}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isTransporter
                    ? isActive && !l.to.startsWith('#')
                      ? 'bg-[#132A20] text-emerald-400 border-l-4 border-emerald-500 font-extrabold shadow-sm'
                      : 'text-slate-300 hover:bg-[#132A20]/50 hover:text-white'
                    : isActive && !l.to.startsWith('#')
                      ? 'bg-green-50 text-green-800'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                {l.icon && <l.icon size={16} className={isTransporter ? 'text-current' : l.to.startsWith('#') ? 'text-gray-400' : 'text-current'} />}
                <span>{l.label}</span>
              </div>
              {l.badge && (
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                  isTransporter
                    ? 'bg-red-600 text-white font-extrabold shadow-sm'
                    : 'bg-green-600 text-white'
                }`}>
                  {l.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Vehicle Spec & Availability Footer for Transporters */}
        {isTransporter && (
          <div className="p-4 border-t border-[#132A20] space-y-4">
            
            {/* Vehicle Box */}
            <div className="bg-[#132A20] border border-emerald-900/40 rounded-2xl p-3 flex items-center gap-3">
              <div className="p-2 bg-emerald-900/50 rounded-xl text-emerald-400">
                <Package size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-black text-slate-100 truncate">
                  {user?.transporter_profile?.vehicle_brand || 'Toyota Hilux'}
                </h4>
                <p className="text-[9px] text-emerald-400 font-mono mt-0.5">
                  {user?.transporter_profile?.vehicle_plate || 'KDA 123A'}
                </p>
                <p className="text-[8px] text-slate-400 mt-0.5">
                  {user?.transporter_profile?.vehicle_capacity ? `${user?.transporter_profile?.vehicle_capacity} capacity` : '1.5 Ton Capacity'}
                </p>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center justify-between bg-[#132A20] border border-emerald-900/40 rounded-2xl px-4 py-2.5">
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Availability</span>
                <span className="text-xs font-bold text-slate-200">Online</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

          </div>
        )}

        {/* Log Out Button at the Bottom */}
        <div className={`p-4 border-t ${
          isTransporter ? 'border-[#132A20]' : 'border-gray-150'
        }`}>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full ${
              isTransporter 
                ? 'text-red-400 hover:bg-red-950/20 hover:text-red-300' 
                : 'text-red-600 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-150 px-6 py-4 flex items-center justify-between lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-900">
            <Menu size={24} />
          </button>
          <span className="font-extrabold text-sm text-green-800 uppercase tracking-wider">{user?.role} Portal</span>
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
            <img src={user?.avatar || '/farmer.jpg'} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color = 'green' }) {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        {Icon && <Icon size={28} className="opacity-60" />}
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
    </div>
  );
}

export function ProductCard({ product, onAdd, showAdd }) {
  const price = typeof product.price === 'string' ? product.price : `KES ${Number(product.price).toLocaleString()}`;
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] overflow-hidden">
        <img src={product.image_url || product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
          {product.is_featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Featured</span>}
        </div>
        <p className="text-green-700 font-bold mt-1">{price}<span className="text-gray-400 font-normal text-sm">/{product.unit}</span></p>
        <p className="text-sm text-gray-500 mt-1">{product.farmer_name || product.farmer} · {product.county}</p>
        {showAdd && onAdd && (
          <button onClick={() => onAdd(product)} className="mt-3 w-full py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800">
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
