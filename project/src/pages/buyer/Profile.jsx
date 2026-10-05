import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Settings, ShieldCheck, MapPin, CreditCard, Lock, Bell, Moon, Languages, LogOut, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';
import DashboardLayout, { PageHeader } from '../../components/layout/DashboardLayout';
import { ProtectedRoute, useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { toast } from 'react-toastify';

function ProfileContent() {
  const { user, logout, loadUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active sub-tab based on URL hash
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (location.hash === '#settings') {
      setActiveTab('settings');
    } else {
      setActiveTab('profile');
    }
  }, [location.hash]);

  // Profile Form States
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [county, setCounty] = useState(user?.county || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Address Book States
  const [addresses, setAddresses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('delivery_addresses')) || [
        "Lavington, Nairobi (Default)",
        "Nakuru Town, Near Westside Mall"
      ];
    } catch {
      return [];
    }
  });
  const [newAddress, setNewAddress] = useState('');

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // General Settings States
  const [notifyOrderStatus, setNotifyOrderStatus] = useState(true);
  const [notifySecurity, setNotifySecurity] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    localStorage.setItem('delivery_addresses', JSON.stringify(addresses));
  }, [addresses]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.request('/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          county: county,
          avatar: avatar
        })
      });
      await loadUser(); // Reload context
      toast.success("✅ Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    setAddresses([...addresses, newAddress.trim()]);
    setNewAddress('');
    toast.success("🏠 Address added successfully!");
  };

  const handleRemoveAddress = (index) => {
    setAddresses(addresses.filter((_, i) => i !== index));
    toast.info("Address removed.");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setChangingPassword(true);
    try {
      await api.request('/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      toast.success("🔒 Password changed successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const doubleConfirm = window.confirm("⚠️ DANGER: Are you absolutely sure you want to permanently delete your account? This will wipe your digital wallet balance and is irreversible.");
    if (!doubleConfirm) return;
    
    try {
      await api.request('/auth/me/', {
        method: 'DELETE'
      });
      toast.success("👋 Your account has been deleted successfully.");
      logout();
      navigate('/login');
    } catch (err) {
      toast.error(err.message || "Failed to delete account.");
    }
  };

  return (
    <>
      <PageHeader 
        title="Account Settings" 
        subtitle="Manage your personal account profile information, delivery addresses, and preferences" 
      />

      {/* Tab Selectors */}
      <div className="flex border-b border-gray-150 mb-6 gap-6">
        <button
          onClick={() => { setActiveTab('profile'); navigate('/buyer/profile'); }}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'profile' ? 'border-green-700 text-green-700 font-black' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <User size={16} />
          My Profile
        </button>
        
        <button
          onClick={() => { setActiveTab('settings'); navigate('/buyer/profile#settings'); }}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'settings' ? 'border-green-700 text-green-700 font-black' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Settings size={16} />
          Preferences & Settings
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 text-left">
        {activeTab === 'profile' ? (
          <>
            {/* Left Column: Personal Information Form */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <img 
                  src={avatar || user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80"}
                  alt="Profile Avatar"
                  className="w-18 h-18 rounded-3xl object-cover border-2 border-green-100 shrink-0"
                />
                <div className="space-y-1 overflow-hidden">
                  <h3 className="font-extrabold text-gray-900 text-base">{firstName} {lastName || 'Karanja'}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-full text-[9px] font-bold uppercase">
                      Account: {user?.role?.toUpperCase() || 'BUYER'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[9px] font-bold uppercase flex items-center gap-1">
                      <CheckCircle size={10} /> Verified
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-semibold bg-gray-50/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-semibold bg-gray-50/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-semibold bg-gray-50/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-semibold bg-gray-50/20"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profile Picture URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-semibold bg-gray-50/20"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Default County Location</label>
                  <input
                    type="text"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-semibold bg-gray-50/20"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-gray-250 text-white font-bold rounded-xl shadow-md text-xs uppercase flex items-center gap-2"
                  >
                    {savingProfile ? <RefreshCw size={12} className="animate-spin" /> : null}
                    Save changes
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Address Book & Payment Cards */}
            <div className="lg:col-span-4 space-y-6">
              {/* Address Book */}
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <MapPin className="text-green-700" size={18} />
                  Delivery Address Book
                </h3>
                
                <div className="space-y-2">
                  {addresses.map((addr, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-medium">
                      <span className="truncate pr-2">{addr}</span>
                      <button 
                        onClick={() => handleRemoveAddress(idx)}
                        className="text-red-500 hover:text-red-700 font-bold shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddAddress} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="New delivery address..."
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-150 rounded-xl outline-none focus:ring-2 focus:ring-green-600 text-xs font-semibold bg-gray-50/10"
                  />
                  <button 
                    type="submit"
                    className="px-3 py-2 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-xs"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Saved Payment Methods */}
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <CreditCard className="text-green-700" size={18} />
                  Saved Payment Cards
                </h3>
                <div className="space-y-3">
                  <div className="border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
                    <div className="text-2xl">💳</div>
                    <div>
                      <p className="text-xs font-extrabold text-gray-800">Visa ending in 4242</p>
                      <p className="text-[9px] text-gray-400 font-bold">Expires 12/28</p>
                    </div>
                  </div>
                  <div className="border border-green-100 bg-green-50/20 rounded-2xl p-4 flex items-center gap-3">
                    <div className="text-2xl">📱</div>
                    <div>
                      <p className="text-xs font-extrabold text-green-800">Safaricom M-Pesa</p>
                      <p className="text-[9px] text-green-600 font-bold">Linked: +254 7xx xxx789</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Preferences & Settings */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-6">
              <div className="space-y-6">
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <Lock className="text-green-700" size={18} />
                  Change Password
                </h3>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-semibold bg-gray-50/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-semibold bg-gray-50/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-semibold bg-gray-50/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="px-6 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-gray-250 text-white font-bold rounded-xl shadow-md text-xs uppercase"
                  >
                    {changingPassword ? 'Updating...' : 'Change Password'}
                  </button>
                </form>
              </div>

              {/* Danger Zone: Delete Account */}
              <div className="pt-6 border-t border-red-100 space-y-4">
                <h3 className="font-extrabold text-sm text-red-650 flex items-center gap-2">
                  <Trash2 size={18} />
                  Danger Zone
                </h3>
                <p className="text-xs text-gray-550 max-w-md leading-relaxed">
                  Permanently delete your AgroLink account. All pending orders will be cancelled and this profile will be permanently removed.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase shadow-sm"
                >
                  Delete Account
                </button>
              </div>
            </div>

            {/* Right Sidebar Preferences */}
            <div className="lg:col-span-4 space-y-6">
              {/* Notification Preferences */}
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <Bell className="text-green-700" size={18} />
                  Notification Prefs
                </h3>
                <div className="space-y-3 text-xs font-semibold text-gray-700">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifyOrderStatus}
                      onChange={(e) => setNotifyOrderStatus(e.target.checked)}
                      className="rounded text-green-600 focus:ring-green-500 w-4 h-4 border-gray-300"
                    />
                    <span>Order Status Email Alerts</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifySecurity}
                      onChange={(e) => setNotifySecurity(e.target.checked)}
                      className="rounded text-green-600 focus:ring-green-500 w-4 h-4 border-gray-300"
                    />
                    <span>Security Log Alerts</span>
                  </label>
                </div>
              </div>

              {/* Theme & Language & Logout */}
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <Languages className="text-green-700" size={18} />
                  App Preferences
                </h3>
                
                <div className="space-y-4 text-xs font-bold text-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Moon size={16} /> Dark Mode
                    </span>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-11 h-6 rounded-full transition-all duration-300 flex items-center p-0.5 border ${
                        darkMode ? 'bg-green-700 border-green-700 justify-end' : 'bg-gray-100 border-gray-200 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-400">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-150 rounded-xl outline-none focus:ring-2 focus:ring-green-600 text-xs font-semibold bg-white"
                    >
                      <option value="en">English (UK)</option>
                      <option value="sw">Kiswahili</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={logout}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-650 font-black rounded-xl text-xs uppercase flex items-center justify-center gap-2 transition-colors"
                    >
                      <LogOut size={14} />
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default function BuyerProfile() {
  return (
    <ProtectedRoute roles={['buyer']}>
      <DashboardLayout>
        <ProfileContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
