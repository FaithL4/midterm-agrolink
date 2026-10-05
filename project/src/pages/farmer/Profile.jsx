import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  User, ShieldCheck, ShoppingBag, DollarSign, Star, FileText, 
  Upload, Save, CheckCircle, Navigation, MapPin, Loader2 
} from 'lucide-react';
import DashboardLayout, { LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute, useAuth } from '../../context/AuthContext';
import api from '../../api/client';

function FarmerProfileContent() {
  const { user, login } = useAuth();
  const profile = user?.profile || {};
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);

  // Verification Documents upload simulation
  const [farmCertDoc, setFarmCertDoc] = useState(null);
  const [farmCertUploading, setFarmCertUploading] = useState(false);
  
  const [permitDoc, setPermitDoc] = useState(null);
  const [permitUploading, setPermitUploading] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [farmLogoPreview, setFarmLogoPreview] = useState(profile?.farm_logo || null);
  const [farmLogoUploading, setFarmLogoUploading] = useState(false);

  // Forms State
  const [personalForm, setPersonalForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    county: user?.county || 'Nakuru',
    town: profile?.town || 'Naivasha'
  });

  const [farmForm, setFarmForm] = useState({
    farm_name: profile?.farm_name || 'Green Valley Farm',
    farm_description: profile?.farm_description || 'High-quality organic farming producing premium beef tomatoes and maize.',
    farm_gps: profile?.farm_gps || '-0.2842, 36.0673',
    farm_size: profile?.farm_size || '12 Acres',
    main_crops: profile?.main_crops || 'Tomatoes, Maize, Potatoes',
    farming_type: profile?.farming_type || 'Greenhouse & Organic'
  });

  const stats = {
    totalProducts: 24,
    ordersCompleted: 142,
    revenue: 456200,
    avgRating: 4.90
  };

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

  const handleDocUpload = (docType, file) => {
    if (!file) return;
    const fileDetails = { name: file.name, size: (file.size / (1024 * 1024)).toFixed(2) + ' MB' };
    
    if (docType === 'farm_cert') {
      setFarmCertUploading(true);
      setTimeout(() => {
        setFarmCertUploading(false);
        setFarmCertDoc(fileDetails);
        toast.success("Organic Farm Certificate uploaded successfully!");
      }, 1500);
    } else if (docType === 'permit') {
      setPermitUploading(true);
      setTimeout(() => {
        setPermitUploading(false);
        setPermitDoc(fileDetails);
        toast.success("County Business Permit uploaded successfully!");
      }, 1500);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    setTimeout(() => {
      setAvatarUploading(false);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      handleUpdate('avatar', { avatar: url });
    }, 1500);
  };

  const handleFarmLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFarmLogoUploading(true);
    setTimeout(() => {
      setFarmLogoUploading(false);
      const url = URL.createObjectURL(file);
      setFarmLogoPreview(url);
      handleUpdate('farm_logo', { profile: { farm_logo: url } });
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 antialiased">
      
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Card: Summary & Stats */}
        <div className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center shadow-sm relative overflow-hidden">
            
            {/* User Avatar */}
            <div className="relative w-24 h-24 mx-auto mb-4 group">
              <img 
                src={avatarPreview || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80"} 
                alt="Farmer Avatar" 
                className="w-full h-full object-cover rounded-full border-4 border-emerald-500 transition-opacity" 
              />
              {avatarUploading ? (
                <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white text-[9px] font-black animate-pulse">
                  Uploading...
                </div>
              ) : (
                <label className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[9px] font-black">
                  <Upload className="w-4 h-4 mb-0.5" /> Edit Photo
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              )}
            </div>

            <h2 className="text-lg font-black text-slate-900 flex items-center justify-center gap-1.5">
              {user?.first_name} {user?.last_name}
              <span className="inline-flex items-center text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                <ShieldCheck className="w-3 h-3 mr-0.5" /> Verified
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 capitalize">{farmForm.farm_name}</p>

            {/* Farm logo uploader */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="relative w-16 h-16 mx-auto mb-2 group">
                <img 
                  src={farmLogoPreview || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80"} 
                  alt="Farm logo" 
                  className="w-full h-full object-cover rounded-2xl border border-slate-200" 
                />
                {farmLogoUploading ? (
                  <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white text-[8px] animate-pulse">
                    ...
                  </div>
                ) : (
                  <label className="absolute inset-0 bg-black/50 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[8px] font-bold">
                    Logo
                    <input type="file" accept="image/*" onChange={handleFarmLogoChange} className="hidden" />
                  </label>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-bold block">Farm Brand Logo</span>
            </div>

            {/* Stats list widgets */}
            <div className="grid grid-cols-2 gap-2 mt-6 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="text-[9px] text-slate-400 font-bold block">Products</span>
                <span className="text-xs font-black text-slate-800 mt-0.5">{stats.totalProducts} items</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="text-[9px] text-slate-400 font-bold block">Sales Completed</span>
                <span className="text-xs font-black text-slate-800 mt-0.5">{stats.ordersCompleted} orders</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="text-[9px] text-slate-400 font-bold block">Revenue</span>
                <span className="text-xs font-black text-emerald-600 mt-0.5">KES {stats.revenue.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="text-[9px] text-slate-400 font-bold block">Avg Rating</span>
                <span className="text-xs font-black text-amber-500 mt-0.5 flex items-center justify-center gap-0.5">⭐ {stats.avgRating}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Panel: Settings content */}
        <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          
          {/* Tabs header */}
          <div className="flex border-b border-slate-100 pb-4 mb-6 gap-4 text-xs font-black">
            <button 
              onClick={() => setActiveTab('personal')}
              className={`pb-2 transition-all border-b-2 cursor-pointer ${
                activeTab === 'personal' ? 'border-emerald-600 text-emerald-800 font-black' : 'border-transparent text-slate-500'
              }`}
            >
              👤 Personal Coordinates
            </button>
            <button 
              onClick={() => setActiveTab('farm')}
              className={`pb-2 transition-all border-b-2 cursor-pointer ${
                activeTab === 'farm' ? 'border-emerald-600 text-emerald-800 font-black' : 'border-transparent text-slate-500'
              }`}
            >
              🌾 Farm Details
            </button>
            <button 
              onClick={() => setActiveTab('verification')}
              className={`pb-2 transition-all border-b-2 cursor-pointer ${
                activeTab === 'verification' ? 'border-emerald-600 text-emerald-800 font-black' : 'border-transparent text-slate-500'
              }`}
            >
              🛡 Documents Verification
            </button>
          </div>

          <AnimatePresence mode="wait">
            
            {/* Tab: Personal Info */}
            {activeTab === 'personal' && (
              <motion.div key="personal" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">First Name</label>
                    <input 
                      type="text" 
                      value={personalForm.first_name}
                      onChange={(e) => setPersonalForm(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Last Name</label>
                    <input 
                      type="text" 
                      value={personalForm.last_name}
                      onChange={(e) => setPersonalForm(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={personalForm.email}
                      onChange={(e) => setPersonalForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Phone Number</label>
                    <input 
                      type="text" 
                      value={personalForm.phone}
                      onChange={(e) => setPersonalForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">County Location</label>
                    <input 
                      type="text" 
                      value={personalForm.county}
                      onChange={(e) => setPersonalForm(prev => ({ ...prev, county: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Hub Town</label>
                    <input 
                      type="text" 
                      value={personalForm.town}
                      onChange={(e) => setPersonalForm(prev => ({ ...prev, town: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => handleUpdate('personal', personalForm)}
                    disabled={saving === 'personal'}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Personal Info
                  </button>
                </div>
              </motion.div>
            )}

            {/* Tab: Farm Details */}
            {activeTab === 'farm' && (
              <motion.div key="farm" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Farm Name</label>
                    <input 
                      type="text" 
                      value={farmForm.farm_name}
                      onChange={(e) => setFarmForm(prev => ({ ...prev, farm_name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Farm size (Acres)</label>
                    <input 
                      type="text" 
                      value={farmForm.farm_size}
                      onChange={(e) => setFarmForm(prev => ({ ...prev, farm_size: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">GPS Location (Latitude, Longitude)</label>
                    <input 
                      type="text" 
                      value={farmForm.farm_gps}
                      onChange={(e) => setFarmForm(prev => ({ ...prev, farm_gps: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Main Crops Cultivated</label>
                    <input 
                      type="text" 
                      value={farmForm.main_crops}
                      onChange={(e) => setFarmForm(prev => ({ ...prev, main_crops: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Farming Style</label>
                    <input 
                      type="text" 
                      value={farmForm.farming_type}
                      onChange={(e) => setFarmForm(prev => ({ ...prev, farming_type: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Farm Description</label>
                    <textarea 
                      value={farmForm.farm_description}
                      onChange={(e) => setFarmForm(prev => ({ ...prev, farm_description: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => handleUpdate('farm', { profile: farmForm })}
                    disabled={saving === 'farm'}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Farm Details
                  </button>
                </div>
              </motion.div>
            )}

            {/* Tab: Documents Verification */}
            {activeTab === 'verification' && (
              <motion.div key="verification" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Verification Certificates</h4>
                  <p className="text-xs text-slate-500">Provide official crop ownership or business permits to display verified buyer shields on listings.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  
                  {/* Organic Certificate */}
                  <label className="border border-dashed border-slate-200 p-5 rounded-3xl text-center hover:bg-slate-50 transition-all cursor-pointer block relative">
                    <input 
                      type="file" 
                      accept=".pdf,image/*" 
                      onChange={(e) => handleDocUpload('farm_cert', e.target.files[0])} 
                      className="hidden" 
                    />
                    {farmCertUploading ? (
                      <div className="space-y-1">
                        <Loader2 className="w-5 h-5 mx-auto text-emerald-600 animate-spin" />
                        <p className="text-[10px] text-slate-400 font-bold">Uploading Organic Certificate...</p>
                      </div>
                    ) : farmCertDoc ? (
                      <div className="space-y-1">
                        <CheckCircle className="w-6 h-6 mx-auto text-emerald-600 animate-bounce" />
                        <p className="text-xs font-black text-slate-800 truncate">{farmCertDoc.name}</p>
                        <p className="text-[9px] text-emerald-600 font-extrabold">Uploaded Successfully ({farmCertDoc.size})</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                        <p className="text-xs font-bold text-slate-700">Organic Farm Certificate</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Upload certified verification copy</p>
                      </>
                    )}
                  </label>

                  {/* Business permit */}
                  <label className="border border-dashed border-slate-200 p-5 rounded-3xl text-center hover:bg-slate-50 transition-all cursor-pointer block relative">
                    <input 
                      type="file" 
                      accept=".pdf,image/*" 
                      onChange={(e) => handleDocUpload('permit', e.target.files[0])} 
                      className="hidden" 
                    />
                    {permitUploading ? (
                      <div className="space-y-1">
                        <Loader2 className="w-5 h-5 mx-auto text-emerald-600 animate-spin" />
                        <p className="text-[10px] text-slate-400 font-bold">Uploading Business Permit...</p>
                      </div>
                    ) : permitDoc ? (
                      <div className="space-y-1">
                        <CheckCircle className="w-6 h-6 mx-auto text-emerald-600 animate-bounce" />
                        <p className="text-xs font-black text-slate-800 truncate">{permitDoc.name}</p>
                        <p className="text-[9px] text-emerald-600 font-extrabold">Uploaded Successfully ({permitDoc.size})</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                        <p className="text-xs font-bold text-slate-700">County Business Permit</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Standard single business permit</p>
                      </>
                    )}
                  </label>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

export default function FarmerProfile() {
  return (
    <ProtectedRoute roles={['farmer']}>
      <DashboardLayout>
        <FarmerProfileContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
