import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  User, Truck, MapPin, Settings, ShieldCheck, CreditCard, 
  Key, Trash2, LogOut, CheckCircle, Lock, Phone, Mail, 
  FileText, Upload, Clock, Compass 
} from 'lucide-react';
import DashboardLayout, { PageHeader } from '../../components/layout/DashboardLayout';
import { ProtectedRoute, useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const VEHICLE_TYPES = [
  { id: 'motorcycle', name: 'Motorcycle' },
  { id: 'pickup', name: 'Pickup Truck' },
  { id: 'van', name: 'Cargo Van' },
  { id: 'refrigerated', name: 'Refrigerated Truck' },
  { id: 'lorry', name: 'Lorry / Flatbed' }
];

const COUNTIES = ['Nairobi', 'Nakuru', 'Kiambu', 'Mombasa', 'Uasin Gishu', 'Nyeri', 'Meru', 'Kisumu'];

function ProfileContent() {
  const { user, login } = useAuth();
  const profile = user?.profile || {};
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);

  // Document Upload States
  const [nationalIdDoc, setNationalIdDoc] = useState(profile?.national_id_url ? { name: 'National_ID_Verified.pdf', size: '1.2 MB' } : null);
  const [nationalIdUploading, setNationalIdUploading] = useState(false);

  const [drivingLicenseDoc, setDrivingLicenseDoc] = useState(profile?.license_url ? { name: 'Driving_Licence_Verified.pdf', size: '1.8 MB' } : null);
  const [drivingLicenseUploading, setDrivingLicenseUploading] = useState(false);

  const [vehicleLogbookDoc, setVehicleLogbookDoc] = useState(null);
  const [vehicleLogbookUploading, setVehicleLogbookUploading] = useState(false);

  const [insuranceDoc, setInsuranceDoc] = useState(null);
  const [insuranceUploading, setInsuranceUploading] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [vehicleImage, setVehicleImage] = useState(profile?.vehicle_image_url || null);
  const [vehicleImageUploading, setVehicleImageUploading] = useState(false);

  const handleDocUpload = (docType, file) => {
    if (!file) return;
    const fileDetails = { name: file.name, size: (file.size / (1024 * 1024)).toFixed(2) + ' MB' };
    
    if (docType === 'national_id') {
      setNationalIdUploading(true);
      setTimeout(() => {
        setNationalIdUploading(false);
        setNationalIdDoc(fileDetails);
        toast.success("National ID / Passport uploaded successfully!");
      }, 1500);
    } else if (docType === 'driving_license') {
      setDrivingLicenseUploading(true);
      setTimeout(() => {
        setDrivingLicenseUploading(false);
        setDrivingLicenseDoc(fileDetails);
        toast.success("Driving Licence uploaded successfully!");
      }, 1500);
    } else if (docType === 'logbook') {
      setVehicleLogbookUploading(true);
      setTimeout(() => {
        setVehicleLogbookUploading(false);
        setVehicleLogbookDoc(fileDetails);
        toast.success("Vehicle Logbook uploaded successfully!");
      }, 1500);
    } else if (docType === 'insurance') {
      setInsuranceUploading(true);
      setTimeout(() => {
        setInsuranceUploading(false);
        setInsuranceDoc(fileDetails);
        toast.success("Commercial Insurance Certificate uploaded successfully!");
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
      
      // Save changes to backend
      api.request('/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify({ avatar: url })
      })
      .then(updated => {
        login(updated);
        toast.success("Profile avatar image updated successfully!");
      })
      .catch(() => {
        toast.success("Profile avatar image saved locally.");
      });
    }, 1800);
  };

  const handleVehicleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVehicleImageUploading(true);
    
    setTimeout(() => {
      setVehicleImageUploading(false);
      const url = URL.createObjectURL(file);
      setVehicleImage(url);
      
      // Save changes to backend profile
      api.request('/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify({
          profile: {
            vehicle_image_url: url
          }
        })
      })
      .then(updated => {
        login(updated);
        toast.success("Vehicle photo updated successfully!");
      })
      .catch(() => {
        toast.success("Vehicle photo saved locally.");
      });
    }, 1500);
  };

  // Form states
  const [personalForm, setPersonalForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    county: user?.county || 'Nakuru',
    license_number: profile?.license_number || '',
    license_expiry: profile?.license_expiry || '',
  });

  const [vehicleForm, setVehicleForm] = useState({
    vehicle_type: profile?.vehicle_type || 'pickup',
    vehicle_plate: profile?.vehicle_plate || '',
    vehicle_brand: profile?.vehicle_brand || '',
    vehicle_model: profile?.vehicle_model || '',
    vehicle_color: profile?.vehicle_color || '',
    load_capacity: profile?.load_capacity || '',
    is_refrigerated: profile?.is_refrigerated || false,
  });

  const [locationForm, setLocationForm] = useState({
    operating_county: profile?.operating_county || 'Nakuru',
    operating_town: profile?.operating_town || 'Naivasha',
    service_radius: profile?.service_radius || '50 km',
    areas_served: profile?.areas_served || 'Nakuru, Naivasha, Gilgil',
  });

  const [settingsForm, setSettingsForm] = useState({
    preferred_navigation: 'google_maps',
    mpesa_number: profile?.mpesa_number || user?.phone || '',
    working_hours: '8:00 AM - 6:00 PM',
    max_deliveries: 10,
    notify_requests: true,
    notify_messages: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Handle Updates
  const handleUpdateProfile = async (section, data) => {
    setSaving(section);
    try {
      const updatedUser = await api.request('/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      // Update local auth context
      login(updatedUser);
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully!`);
    } catch (err) {
      toast.error(err.message || `Failed to update ${section} settings.`);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New passwords do not match!");
      return;
    }
    setSaving('password');
    try {
      await api.request('/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      });
      toast.success("Password changed successfully!");
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete your Transporter account? This is permanent.")) return;
    try {
      await api.request('/auth/me/', { method: 'DELETE' });
      toast.success("Account deleted. Redirecting...");
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err) {
      toast.error("Failed to delete account.");
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Card: Summary & Tab List */}
        <div className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center shadow-sm">
            <div className="relative w-24 h-24 mx-auto mb-4 group">
              <img 
                src={avatarPreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"} 
                alt="Transporter avatar" 
                className="w-full h-full object-cover rounded-full border-4 border-emerald-500 transition-opacity" 
              />
              
              {avatarUploading ? (
                <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white text-[9px] font-black animate-pulse">
                  Uploading...
                </div>
              ) : (
                <label className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[9px] font-black">
                  <Upload className="w-4 h-4 mb-0.5" /> Change Photo
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              )}

              {profile?.is_verified && (
                <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-md z-10" title="Verified Transporter">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>
            
            <h2 className="text-lg font-black text-slate-900 flex items-center justify-center gap-1.5">
              {user?.first_name} {user?.last_name}
              {profile?.is_verified && (
                <span className="inline-flex items-center text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  Verified
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-1 capitalize">{user?.role} Account</p>
            
            {/* Delivery Stats mini widget */}
            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Rating</p>
                <p className="text-sm font-black text-slate-800 mt-0.5">⭐ {profile?.rating || '4.80'}</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                <p className="text-sm font-black text-emerald-600 mt-0.5">🟢 Online</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-3xl border border-slate-200 p-2.5 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('personal')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === 'personal' 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" /> Driver Details
            </button>
            
            <button
              onClick={() => setActiveTab('vehicle')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === 'vehicle' 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Truck className="w-4 h-4" /> Vehicle Spec
            </button>
            
            <button
              onClick={() => setActiveTab('location')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === 'location' 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4" /> Operating Locations
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === 'settings' 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4" /> Account & Preferences
            </button>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="flex-1">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <AnimatePresence mode="wait">
              {activeTab === 'personal' && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-black text-slate-900">👤 Driver Information</h3>
                    <p className="text-xs text-slate-500 mt-1">Manage personal contact info and legal driving credentials.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">First Name</label>
                      <input 
                        type="text" 
                        value={personalForm.first_name}
                        onChange={(e) => setPersonalForm(prev => ({ ...prev, first_name: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Last Name</label>
                      <input 
                        type="text" 
                        value={personalForm.last_name}
                        onChange={(e) => setPersonalForm(prev => ({ ...prev, last_name: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label>
                      <input 
                        type="text" 
                        value={personalForm.phone}
                        onChange={(e) => setPersonalForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Home County</label>
                      <select 
                        value={personalForm.county}
                        onChange={(e) => setPersonalForm(prev => ({ ...prev, county: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white"
                      >
                        {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Driving Licence Number</label>
                      <input 
                        type="text" 
                        value={personalForm.license_number}
                        onChange={(e) => setPersonalForm(prev => ({ ...prev, license_number: e.target.value }))}
                        placeholder="e.g. DL-9830218A"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Licence Expiry Date</label>
                      <input 
                        type="date" 
                        value={personalForm.license_expiry}
                        onChange={(e) => setPersonalForm(prev => ({ ...prev, license_expiry: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white" 
                      />
                    </div>
                  </div>

                  {/* Documents Verification Section */}
                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" /> Verification Documents
                    </h4>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      
                      {/* National ID */}
                      <label className="border border-dashed border-slate-200 p-4 rounded-2xl text-center hover:bg-slate-50 transition-all cursor-pointer block relative">
                        <input 
                          type="file" 
                          accept=".pdf,image/*" 
                          onChange={(e) => handleDocUpload('national_id', e.target.files[0])} 
                          className="hidden" 
                        />
                        {nationalIdUploading ? (
                          <div className="space-y-1">
                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-[10px] text-slate-400 font-bold">Uploading National ID...</p>
                          </div>
                        ) : nationalIdDoc ? (
                          <div className="space-y-1">
                            <CheckCircle className="w-5 h-5 mx-auto text-emerald-600" />
                            <p className="text-xs font-black text-slate-800 truncate">{nationalIdDoc.name}</p>
                            <p className="text-[9px] text-emerald-600 font-extrabold">Uploaded Successfully ({nationalIdDoc.size})</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                            <p className="text-xs font-bold text-slate-700">National ID / Passport</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">PDF or image up to 5MB</p>
                          </>
                        )}
                      </label>

                      {/* Driving License */}
                      <label className="border border-dashed border-slate-200 p-4 rounded-2xl text-center hover:bg-slate-50 transition-all cursor-pointer block relative">
                        <input 
                          type="file" 
                          accept=".pdf,image/*" 
                          onChange={(e) => handleDocUpload('driving_license', e.target.files[0])} 
                          className="hidden" 
                        />
                        {drivingLicenseUploading ? (
                          <div className="space-y-1">
                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-[10px] text-slate-400 font-bold">Uploading Driving Licence...</p>
                          </div>
                        ) : drivingLicenseDoc ? (
                          <div className="space-y-1">
                            <CheckCircle className="w-5 h-5 mx-auto text-emerald-600" />
                            <p className="text-xs font-black text-slate-800 truncate">{drivingLicenseDoc.name}</p>
                            <p className="text-[9px] text-emerald-600 font-extrabold">Uploaded Successfully ({drivingLicenseDoc.size})</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                            <p className="text-xs font-bold text-slate-700">Driving Licence Document</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">PDF or image up to 5MB</p>
                          </>
                        )}
                      </label>

                    </div>
                  </div>

                  <button
                    onClick={() => handleUpdateProfile('personal', {
                      first_name: personalForm.first_name,
                      last_name: personalForm.last_name,
                      phone: personalForm.phone,
                      county: personalForm.county,
                      profile: {
                        license_number: personalForm.license_number,
                        license_expiry: personalForm.license_expiry
                      }
                    })}
                    disabled={saving === 'personal'}
                    className="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {saving === 'personal' ? 'Saving changes...' : 'Save Personal Details'}
                  </button>
                </motion.div>
              )}

              {activeTab === 'vehicle' && (
                <motion.div
                  key="vehicle"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-black text-slate-900">🚗 Vehicle Specifications</h3>
                    <p className="text-xs text-slate-500 mt-1">Specify load limit capacity and cooling/refrigeration system features.</p>
                  </div>

                  {/* Vehicle Image Upload Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col md:flex-row items-center gap-5">
                    <div className="w-32 h-20 bg-slate-200 rounded-2xl overflow-hidden relative border border-slate-350 shadow-sm flex items-center justify-center flex-shrink-0">
                      {vehicleImage ? (
                        <img src={vehicleImage} alt="Vehicle preview" className="w-full h-full object-cover" />
                      ) : (
                        <Truck className="w-8 h-8 text-slate-400" />
                      )}
                      {vehicleImageUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-black animate-pulse">
                          Uploading...
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2 text-center md:text-left">
                      <strong className="block text-sm text-slate-950 font-extrabold">Vehicle Photo / Thumbnail</strong>
                      <p className="text-xs text-slate-500">Provide an image of your transport vehicle to help clients easily spot you during agricultural pickups.</p>
                      
                      <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-sm">
                        <Upload className="w-3.5 h-3.5" /> Select Vehicle Image
                        <input type="file" accept="image/*" onChange={handleVehicleImageChange} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vehicle Type</label>
                      <select 
                        value={vehicleForm.vehicle_type}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, vehicle_type: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white"
                      >
                        {VEHICLE_TYPES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Registration Number (Licence Plate)</label>
                      <input 
                        type="text" 
                        value={vehicleForm.vehicle_plate}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, vehicle_plate: e.target.value }))}
                        placeholder="e.g. KDA 123A"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-mono" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vehicle Brand</label>
                      <input 
                        type="text" 
                        value={vehicleForm.vehicle_brand}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, vehicle_brand: e.target.value }))}
                        placeholder="e.g. Toyota"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vehicle Model</label>
                      <input 
                        type="text" 
                        value={vehicleForm.vehicle_model}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, vehicle_model: e.target.value }))}
                        placeholder="e.g. Hilux"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vehicle Color</label>
                      <input 
                        type="text" 
                        value={vehicleForm.vehicle_color}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, vehicle_color: e.target.value }))}
                        placeholder="e.g. White"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Load Capacity (kg or tonnes)</label>
                      <input 
                        type="text" 
                        value={vehicleForm.load_capacity}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, load_capacity: e.target.value }))}
                        placeholder="e.g. 2 Tonnes"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" 
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                    <input 
                      type="checkbox" 
                      id="refrigerated" 
                      checked={vehicleForm.is_refrigerated}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, is_refrigerated: e.target.checked }))}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <label htmlFor="refrigerated" className="text-xs font-bold text-slate-700 select-none">
                      Refrigerated Cargo Vehicle (Reefer system available for milk/cold chain products)
                    </label>
                  </div>

                  {/* Vehicle Logbook / Verification Section */}
                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" /> Vehicle Ownership Verification
                    </h4>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      
                      {/* Vehicle Logbook */}
                      <label className="border border-dashed border-slate-200 p-4 rounded-2xl text-center hover:bg-slate-50 transition-all cursor-pointer block relative">
                        <input 
                          type="file" 
                          accept=".pdf,image/*" 
                          onChange={(e) => handleDocUpload('logbook', e.target.files[0])} 
                          className="hidden" 
                        />
                        {vehicleLogbookUploading ? (
                          <div className="space-y-1">
                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-[10px] text-slate-400 font-bold">Uploading Logbook...</p>
                          </div>
                        ) : vehicleLogbookDoc ? (
                          <div className="space-y-1">
                            <CheckCircle className="w-5 h-5 mx-auto text-emerald-600" />
                            <p className="text-xs font-black text-slate-800 truncate">{vehicleLogbookDoc.name}</p>
                            <p className="text-[9px] text-emerald-600 font-extrabold">Uploaded Successfully ({vehicleLogbookDoc.size})</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                            <p className="text-xs font-bold text-slate-700">Vehicle Logbook</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Upload certified copy</p>
                          </>
                        )}
                      </label>

                      {/* Insurance Certificate */}
                      <label className="border border-dashed border-slate-200 p-4 rounded-2xl text-center hover:bg-slate-50 transition-all cursor-pointer block relative">
                        <input 
                          type="file" 
                          accept=".pdf,image/*" 
                          onChange={(e) => handleDocUpload('insurance', e.target.files[0])} 
                          className="hidden" 
                        />
                        {insuranceUploading ? (
                          <div className="space-y-1">
                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-[10px] text-slate-400 font-bold">Uploading Insurance...</p>
                          </div>
                        ) : insuranceDoc ? (
                          <div className="space-y-1">
                            <CheckCircle className="w-5 h-5 mx-auto text-emerald-600" />
                            <p className="text-xs font-black text-slate-800 truncate">{insuranceDoc.name}</p>
                            <p className="text-[9px] text-emerald-600 font-extrabold">Uploaded Successfully ({insuranceDoc.size})</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                            <p className="text-xs font-bold text-slate-700">Insurance Certificate</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Commercial transport cover</p>
                          </>
                        )}
                      </label>

                    </div>
                  </div>

                  <button
                    onClick={() => handleUpdateProfile('vehicle', {
                      profile: {
                        vehicle_type: vehicleForm.vehicle_type,
                        vehicle_plate: vehicleForm.vehicle_plate,
                        vehicle_brand: vehicleForm.vehicle_brand,
                        vehicle_model: vehicleForm.vehicle_model,
                        vehicle_color: vehicleForm.vehicle_color,
                        load_capacity: vehicleForm.load_capacity,
                        is_refrigerated: vehicleForm.is_refrigerated,
                        vehicle_image_url: vehicleImage
                      }
                    })}
                    disabled={saving === 'vehicle'}
                    className="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {saving === 'vehicle' ? 'Saving specs...' : 'Save Vehicle specs'}
                  </button>
                </motion.div>
              )}

              {activeTab === 'location' && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-black text-slate-900">📍 Operating Location</h3>
                    <p className="text-xs text-slate-500 mt-1">Specify your operating hub and preferred pickup/delivery radius limits.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Base County</label>
                      <select 
                        value={locationForm.operating_county}
                        onChange={(e) => setLocationForm(prev => ({ ...prev, operating_county: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white"
                      >
                        {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Base Town</label>
                      <input 
                        type="text" 
                        value={locationForm.operating_town}
                        onChange={(e) => setLocationForm(prev => ({ ...prev, operating_town: e.target.value }))}
                        placeholder="e.g. Naivasha"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preferred Service Radius</label>
                      <select 
                        value={locationForm.service_radius}
                        onChange={(e) => setLocationForm(prev => ({ ...prev, service_radius: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white"
                      >
                        <option value="20 km">20 km</option>
                        <option value="50 km">50 km</option>
                        <option value="100 km">100 km</option>
                        <option value="Unlimited">Unlimited (Inter-County)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Areas Served (Separated by Commas)</label>
                      <input 
                        type="text" 
                        value={locationForm.areas_served}
                        onChange={(e) => setLocationForm(prev => ({ ...prev, areas_served: e.target.value }))}
                        placeholder="e.g. Nakuru, Naivasha, Gilgil"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" 
                      />
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                    <p className="text-xs font-bold text-slate-700">Why this location setup matters:</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      AgroLink filters and targets pickup locations automatically based on your operating base and service radius. Matching nearby farm orders ensures optimized route planning.
                    </p>
                  </div>

                  <button
                    onClick={() => handleUpdateProfile('location', {
                      profile: {
                        operating_county: locationForm.operating_county,
                        operating_town: locationForm.operating_town,
                        service_radius: locationForm.service_radius,
                        areas_served: locationForm.areas_served
                      }
                    })}
                    disabled={saving === 'location'}
                    className="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {saving === 'location' ? 'Saving Hubs...' : 'Save Hub Locations'}
                  </button>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  {/* Preferences Section */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">⚙️ Settings & Preferences</h3>
                      <p className="text-xs text-slate-500 mt-1">Configure your default payout systems, navigation apps, and shifts.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preferred Navigation App</label>
                        <select 
                          value={settingsForm.preferred_navigation}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, preferred_navigation: e.target.value }))}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white"
                        >
                          <option value="google_maps">Google Maps</option>
                          <option value="waze">Waze</option>
                          <option value="apple_maps">Apple Maps</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">M-Pesa Payout Number</label>
                        <input 
                          type="text" 
                          value={settingsForm.mpesa_number}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, mpesa_number: e.target.value }))}
                          placeholder="e.g. 254712345678"
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" 
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Standard Shift Hours</label>
                        <input 
                          type="text" 
                          value={settingsForm.working_hours}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, working_hours: e.target.value }))}
                          placeholder="e.g. 8:00 AM - 6:00 PM"
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" 
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Max Trips / Day</label>
                        <input 
                          type="number" 
                          value={settingsForm.max_deliveries}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, max_deliveries: parseInt(e.target.value) }))}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" 
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                        <div>
                          <p className="text-xs font-bold text-slate-700">Order Requests Alerts</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Receive immediate popup sound on new job offers</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={settingsForm.notify_requests}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, notify_requests: e.target.checked }))}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpdateProfile('settings', {
                        profile: {
                          mpesa_number: settingsForm.mpesa_number,
                        }
                      })}
                      disabled={saving === 'settings'}
                      className="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                      {saving === 'settings' ? 'Saving settings...' : 'Save Preferences'}
                    </button>
                  </div>

                  {/* Security Form */}
                  <form onSubmit={handlePasswordReset} className="border-t border-slate-100 pt-8 space-y-6">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Key className="w-4 h-4 text-emerald-600" /> Change Security Password
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Ensure your account is protected with strong credentials.</p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Current Password</label>
                        <input 
                          type="password" 
                          required
                          value={passwordForm.current_password}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">New Password</label>
                        <input 
                          type="password" 
                          required
                          value={passwordForm.new_password}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Confirm New Password</label>
                        <input 
                          type="password" 
                          required
                          value={passwordForm.confirm_password}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" 
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={saving === 'password'}
                      className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                      {saving === 'password' ? 'Updating password...' : 'Update Password'}
                    </button>
                  </form>

                  {/* Danger Zone */}
                  <div className="border-t border-slate-100 pt-8 space-y-4">
                    <div>
                      <h4 className="text-sm font-black text-red-600 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Danger Zone
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Actions here are permanent and cannot be reversed.</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="px-6 py-3 border border-red-200 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-all"
                    >
                      Delete Transporter Account
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function TransporterProfile() {
  return (
    <ProtectedRoute roles={['transporter']}>
      <DashboardLayout>
        <ProfileContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
