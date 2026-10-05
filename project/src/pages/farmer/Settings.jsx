import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Settings, User, Clock, Bell, Shield, Eye, Globe, 
  HelpCircle, LogOut, CheckCircle, Save, Lock, Smartphone, RefreshCw 
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ProtectedRoute, useAuth } from '../../context/AuthContext';
import api from '../../api/client';

function SettingsContent() {
  const { user, login } = useAuth();
  const profile = user?.profile || {};
  const [activeTab, setActiveTab] = useState('account');
  const [saving, setSaving] = useState(false);

  // Forms State
  const [accountForm, setAccountForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: profile?.address || 'Njoro Farms, Nakuru County'
  });

  const [paymentForm, setPaymentForm] = useState({
    mpesa_number: profile?.mpesa_number || user?.phone || '',
    bank_account: profile?.bank_account || 'KCB-90812739021',
    payout_method: profile?.payout_method || 'mpesa' // mpesa, bank
  });

  const [notificationsForm, setNotificationsForm] = useState({
    orders: true,
    transport: true,
    messages: true,
    payments: true,
    reviews: true,
    promotional: false,
    email: true,
    sms: true,
    push: true
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    enable2FA: false
  });

  const [privacyForm, setPrivacyForm] = useState({
    profileVisible: true,
    farmVisible: true,
    shareLocation: true
  });

  const [language, setLanguage] = useState('en'); // en, sw
  const [darkMode, setDarkMode] = useState(false);

  const handleUpdate = async (section, data) => {
    setSaving(section);
    try {
      const updatedUser = await api.request('/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      login(updatedUser);
      toast.success(`${section.toUpperCase()} settings saved successfully!`);
    } catch (err) {
      toast.error(`Failed to save ${section} settings.`);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    setSaving('security');
    setTimeout(() => {
      setSaving(false);
      setSecurityForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      toast.success("Security credentials updated!");
    }, 1500);
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you absolutely sure you want to permanently delete your Farmer Account? All history, listings and analytics will be lost.")) {
      toast.info("Processing deletion request...");
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 antialiased">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Tabs Sidebar */}
        <div className="w-full lg:w-1/4 bg-white rounded-3xl border border-slate-200 p-3.5 shadow-sm space-y-1 self-start">
          {[
            { id: 'account', label: 'Account Profile', icon: User },
            { id: 'payment', label: 'Payout Methods', icon: Shield },
            { id: 'notifications', label: 'Notification alerts', icon: Bell },
            { id: 'security', label: 'Security & 2FA', icon: Lock },
            { id: 'privacy', label: 'Privacy Control', icon: Eye },
            { id: 'language', label: 'Language & Theme', icon: Globe },
            { id: 'support', label: 'Help & Support', icon: HelpCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <AnimatePresence mode="wait">
            
            {/* Account Settings */}
            {activeTab === 'account' && (
              <motion.div key="account" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">👤 Account Settings</h3>
                  <p className="text-xs text-slate-500 mt-1">Manage basic personal profile coordinates.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">First Name</label>
                    <input 
                      type="text" 
                      value={accountForm.first_name}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Last Name</label>
                    <input 
                      type="text" 
                      value={accountForm.last_name}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Phone Number</label>
                    <input 
                      type="text" 
                      value={accountForm.phone}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={accountForm.email}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Office / Home Address</label>
                    <input 
                      type="text" 
                      value={accountForm.address}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs" 
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => handleUpdate('account', accountForm)}
                    disabled={saving === 'account'}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" /> {saving === 'account' ? 'Saving...' : 'Save Personal Details'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <motion.div key="payment" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">💰 Payout & Wallet Configurations</h3>
                  <p className="text-xs text-slate-500 mt-1">Configure target M-Pesa phone numbers or bank accounts for cash payouts.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Preferred Payout Method</label>
                    <select 
                      value={paymentForm.payout_method}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, payout_method: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs bg-white"
                    >
                      <option value="mpesa">M-Pesa Mobile Money</option>
                      <option value="bank">Direct Bank Transfer</option>
                    </select>
                  </div>
                  
                  {paymentForm.payout_method === 'mpesa' ? (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">M-Pesa Payout Number</label>
                      <input 
                        type="text" 
                        value={paymentForm.mpesa_number}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, mpesa_number: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs" 
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Bank Account Number Details</label>
                      <input 
                        type="text" 
                        value={paymentForm.bank_account}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, bank_account: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs" 
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => handleUpdate('payment', { profile: paymentForm })}
                    disabled={saving === 'payment'}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Payout Settings
                  </button>
                </div>
              </motion.div>
            )}

            {/* Notification settings */}
            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">🔔 Notification preferences</h3>
                  <p className="text-xs text-slate-500 mt-1">Configure active channels for notification triggers.</p>
                </div>

                <div className="space-y-3.5 pt-1">
                  {[
                    { key: 'orders', label: 'New Order requests', desc: 'Receive instant notifications when buyers place checkout requests.' },
                    { key: 'transport', label: 'Transport Accepted', desc: 'Get alerts when transporters accept your shipping invitations.' },
                    { key: 'messages', label: 'Client Messages', desc: 'Notify when buyers or transporters send chat messages.' },
                    { key: 'payments', label: 'Payment confirmations', desc: 'Alert when customer payments are confirmed in escrow.' },
                    { key: 'reviews', label: 'Customer Reviews', desc: 'Notify when buyers post crop quality ratings.' },
                    { key: 'push', label: 'System Push notifications', desc: 'Show instant browser desktop alerts.' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div>
                        <strong className="block text-xs font-bold text-slate-800">{item.label}</strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-normal">{item.desc}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notificationsForm[item.key]}
                          onChange={(e) => setNotificationsForm(prev => ({ ...prev, [item.key]: e.target.checked }))}
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => handleUpdate('notifications', notificationsForm)}
                    disabled={saving === 'notifications'}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Notification alerts
                  </button>
                </div>
              </motion.div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">🔒 Security & Credentials</h3>
                  <p className="text-xs text-slate-500 mt-1">Change password or toggle Two-Factor Authentication.</p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Current Password</label>
                    <input 
                      type="password" 
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">New Password</label>
                    <input 
                      type="password" 
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-100 rounded-2xl mt-4">
                    <div>
                      <strong className="block text-xs font-bold text-slate-800">Two-Factor Authentication (2FA)</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Secure logins using a carrier text verification code.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={securityForm.enable2FA}
                        onChange={(e) => setSecurityForm(prev => ({ ...prev, enable2FA: e.target.checked }))}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button 
                      type="submit"
                      disabled={saving === 'security'}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" /> {saving === 'security' ? 'Saving...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Privacy settings */}
            {activeTab === 'privacy' && (
              <motion.div key="privacy" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">🛡 Privacy Settings</h3>
                  <p className="text-xs text-slate-500 mt-1">Configure profile visibility limits and location sharing permissions.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div>
                      <strong className="block text-xs font-bold text-slate-800">Profile & Contact visibility</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Let logged-in buyers search your contact parameters.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={privacyForm.profileVisible}
                        onChange={(e) => setPrivacyForm(prev => ({ ...prev, profileVisible: e.target.checked }))}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div>
                      <strong className="block text-xs font-bold text-slate-800">Farm Visibility</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Show farm crops catalog to public guests in marketplace.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={privacyForm.farmVisible}
                        onChange={(e) => setPrivacyForm(prev => ({ ...prev, farmVisible: e.target.checked }))}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-3">
                    <button 
                      onClick={() => toast.success("Preparing database records download link...")} 
                      className="text-xs font-bold text-emerald-600 hover:underline block"
                    >
                      Download My Personal Records Data Archive (JSON)
                    </button>
                    
                    <button 
                      onClick={handleDeleteAccount}
                      className="text-xs font-bold text-red-650 hover:underline block pt-2"
                    >
                      Delete Farmer Account Permanently
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Language & Theme settings */}
            {activeTab === 'language' && (
              <motion.div key="language" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">🌐 Language & Appearance</h3>
                  <p className="text-xs text-slate-500 mt-1">Configure language settings and interface styling preferences.</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Preferred Portal Language</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLanguage('en')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          language === 'en' ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setLanguage('sw')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          language === 'sw' ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        Kiswahili
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Appearance Style</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDarkMode(false)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          !darkMode ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        ☀️ Light Theme
                      </button>
                      <button
                        onClick={() => setDarkMode(true)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          darkMode ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        🌙 Dark Theme
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => handleUpdate('language', { language, darkMode })}
                    disabled={saving === 'language'}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Language & Theme
                  </button>
                </div>
              </motion.div>
            )}

            {/* Help & Support */}
            {activeTab === 'support' && (
              <motion.div key="support" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">🙋 Help & Support Center</h3>
                  <p className="text-xs text-slate-500 mt-1">Read guidelines or contact AgroLink Support.</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-2 text-xs">
                    <strong className="block text-slate-800 text-[11px] font-black">Frequently Asked Questions:</strong>
                    <div className="space-y-2 font-bold text-slate-600">
                      <p className="text-slate-900 font-extrabold">&bull; How do I request transport?</p>
                      <p className="font-normal pl-3">Go to your Orders page. Accept the pending order. Once accepted, the "Request Transport" button becomes active. Click it to find nearby transporters.</p>
                      <p className="text-slate-900 font-extrabold">&bull; When do I get paid?</p>
                      <p className="font-normal pl-3">Payment details are updated on checkout. Funds are kept in escrow and deposited directly into your Wallet immediately upon buyer verification of cargo delivery.</p>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-2xl space-y-3.5">
                    <strong className="block text-[11px] font-black text-slate-900 uppercase">Contact Support Agent</strong>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        placeholder="Subject header..." 
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                      />
                      <textarea 
                        placeholder="Explain the issues you are encountering..." 
                        rows="3" 
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                      />
                      <button 
                        type="button" 
                        onClick={() => toast.success("Support ticket created. An agent will contact you soon.")} 
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-sm"
                      >
                        Submit Ticket
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

export default function FarmerSettings() {
  return (
    <ProtectedRoute roles={['farmer']}>
      <DashboardLayout>
        <SettingsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
