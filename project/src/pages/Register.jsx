import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KENYAN_COUNTIES } from '../data/constants';
import { Tractor, ShoppingBag, Truck, Eye, EyeOff, Check, ArrowLeft, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';


const ROLES = [
  { id: 'farmer', label: 'Farmer', desc: 'Sell your produce directly', icon: Tractor },
  { id: 'buyer', label: 'Buyer', desc: 'Purchase fresh organic crops', icon: ShoppingBag },
  { id: 'transporter', label: 'Transporter', desc: 'Deliver farm goods locally', icon: Truck },
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('farmer');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    county: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sentEmailVerification, setSentEmailVerification] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();


  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: 'bg-slate-200', textClass: 'text-slate-400' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score, text: 'Weak', color: 'bg-red-500', textClass: 'text-red-600' };
    if (score === 2) return { score, text: 'Medium', color: 'bg-amber-500', textClass: 'text-amber-600' };
    return { score, text: 'Strong', color: 'bg-emerald-600', textClass: 'text-emerald-600' };
  };

  const strength = getPasswordStrength(form.password);

  const handleVerifyOtp = async (e) => {

    e.preventDefault();
    if (otpCode.length < 6) {
      setVerificationError('Please enter a 6-digit code.');
      return;
    }
    setVerifying(true);
    setVerificationError('');
    try {
      await api.request('/auth/verify-email/', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, token: otpCode }),
      });
      setVerificationSuccess(true);
    } catch (err) {
      setVerificationError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleProceedToDetails = (e) => {

    e.preventDefault();
    if (!form.county) {
      setError('Please select your location county.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('You must agree to the Terms & Conditions to proceed.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const generatedUsername = form.username || form.email.split('@')[0];

    try {
      await register({
        ...form,
        username: generatedUsername,
        first_name: form.firstName,
        last_name: form.lastName,
        role,
      });
      toast.success("Registration successful! You can now sign in.");
      navigate('/login');
    } catch (err) {
      const msg = err.data ? Object.values(err.data).flat().join(', ') : err.message;
      setError(msg || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[650px] relative">
        
        {/* Verification Success Alert Overlay */}
        {sentEmailVerification && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center overflow-y-auto animate-in fade-in duration-200 space-y-4">
            {verificationSuccess ? (
              <div className="space-y-4 max-w-md flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-md">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-800">Account Activated!</h2>
                <p className="text-sm text-slate-500">
                  Congratulations! Your email address <span className="font-bold text-slate-700">{form.email}</span> has been verified successfully.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all text-xs uppercase"
                >
                  Proceed to Sign In
                </button>
              </div>
            ) : (
              <div className="space-y-5 max-w-md w-full text-left animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center space-y-2">
                  <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-md mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">Verify Your Account</h2>
                  <p className="text-xs text-slate-400 font-medium">
                    We sent a 6-digit activation code to <span className="font-bold text-slate-600">{form.email}</span>.
                  </p>
                </div>

                {verificationError && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                    <ShieldAlert size={16} className="text-red-600 shrink-0" />
                    <span>{verificationError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">6-Digit Verification Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      placeholder="e.g. 123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-center font-mono text-lg font-black tracking-widest focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={verifying}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all text-xs uppercase"
                  >
                    {verifying ? 'Verifying Code...' : 'Activate Account'}
                  </button>
                </form>
                
                <p className="text-center text-xs text-slate-400 font-semibold">
                  Didn't receive the code? Check your terminal console debug log.
                </p>
              </div>
            )}
          </div>
        )}


        {/* LEFT COLUMN: BRAND SHOWCASE */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

          {/* Logo / Link Back */}
          <Link to="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white font-extrabold text-sm transition-all group z-10">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Title and Features */}
          <div className="space-y-8 my-12 z-10 text-left">
            <div className="space-y-3">
              <span className="px-3 py-1 bg-emerald-700/50 text-emerald-250 text-xs font-semibold rounded-full border border-emerald-600/30 uppercase tracking-widest">Platform Registration</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
                Empower your harvest. Trade directly.
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 bg-emerald-700/60 rounded-full flex items-center justify-center shrink-0 text-emerald-350 text-xs font-bold">✓</div>
                <p className="text-sm text-emerald-100/90 font-medium">Create your customized dashboard (Farmer, Buyer, or Transporter).</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 bg-emerald-700/60 rounded-full flex items-center justify-center shrink-0 text-emerald-350 text-xs font-bold">✓</div>
                <p className="text-sm text-emerald-100/90 font-medium">Access integrated local weather data and farm predictions.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 bg-emerald-700/60 rounded-full flex items-center justify-center shrink-0 text-emerald-350 text-xs font-bold">✓</div>
                <p className="text-sm text-emerald-100/90 font-medium">Negotiate in real-time with direct buyer-farmer chat.</p>
              </div>
            </div>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 z-10 text-left">
            <div>
              <p className="text-2xl font-black text-white">100%</p>
              <p className="text-[10px] text-emerald-200/70 font-semibold uppercase tracking-wider">Secure Escrow</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">4.8 ★</p>
              <p className="text-[10px] text-emerald-200/70 font-semibold uppercase tracking-wider">Farmer Rating</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AUTH PANEL */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-slate-50/50">
          <div className="max-w-lg w-full mx-auto text-left space-y-6">
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <ShieldAlert size={16} className="text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: ROLE SELECT & COUNTY */}
            {step === 1 && (
              <form onSubmit={handleProceedToDetails} className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-2xl font-black text-slate-800">Create Account</h1>
                  <p className="text-xs text-slate-400 font-medium">Select your platform role and location county coordinates.</p>
                </div>

                {/* Role list selectors */}
                <div className="grid gap-3">
                  {ROLES.map(({ id, label, desc, icon: Icon }) => (
                    <label
                      key={id}
                      className={`flex items-center justify-between p-4 border border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all ${
                        role === id ? 'border-emerald-600 bg-emerald-50/30 shadow-sm' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="role"
                          value={id}
                          checked={role === id}
                          onChange={() => setRole(id)}
                          className="h-4 w-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                        />
                        <div className="h-10 w-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-slate-800">{label}</p>
                          <p className="text-xs text-slate-400 mt-0.5 font-medium">{desc}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* County selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select County</label>
                  <select
                    required
                    value={form.county}
                    onChange={(e) => setForm({ ...form, county: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-semibold text-slate-700"
                  >
                    <option value="">Choose your county coordinates</option>
                    {KENYAN_COUNTIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all text-xs uppercase tracking-wider"
                >
                  Continue Setup
                </button>

                <p className="text-center text-xs text-slate-500 font-medium">
                  Already have an account?{' '}
                  <Link to="/login" className="text-emerald-600 font-bold hover:underline">
                    Login Instead
                  </Link>
                </p>
              </form>
            )}

            {/* STEP 2: CREDENTIALS DETAILS FORM */}
            {step === 2 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1 mb-2"
                  >
                    ← Go Back
                  </button>
                  <h2 className="text-2xl font-black text-slate-800">Account Credentials</h2>
                  <p className="text-xs text-slate-400 font-medium">Fill in details for your {role} profile.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                    <input
                      required
                      placeholder="First name"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                    <input
                      required
                      placeholder="Last name"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="email@gmail.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    required
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <input
                        required
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 6 chars"
                        minLength={6}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    
                    {form.password && (
                      <div className="mt-2 space-y-1 bg-slate-100 p-2 rounded-xl border border-slate-200/50">
                        <div className="flex justify-between text-[9px] font-bold text-slate-500">
                          <span>Password Strength:</span>
                          <span className={strength.textClass}>{strength.text}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${(strength.score / 4) * 100}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <input
                        required
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer py-1 select-none">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-650 border-slate-350 focus:ring-emerald-550 mt-0.5"
                  />
                  <span className="text-xs text-slate-500 font-medium leading-normal select-none">
                    I agree to the Terms & Conditions
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all text-xs uppercase"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                <p className="text-center text-xs text-slate-500 font-medium">
                  Have an account?{' '}
                  <Link to="/login" className="text-emerald-600 font-bold hover:underline">
                    Login instead
                  </Link>
                </p>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
