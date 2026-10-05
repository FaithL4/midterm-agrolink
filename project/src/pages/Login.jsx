import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle2, ShieldAlert, Lock, User as UserIcon, HelpCircle } from 'lucide-react';
import api from '../api/client';
import { toast } from 'react-toastify';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Forgot password flow states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);


  const { login, dashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!username) {
      setError('Email address is required.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      setLoginSuccess(true);
      setTimeout(() => {
        navigate(dashboardPath);
      }, 2000);
    } catch (err) {
      if (err.message && (err.message.toLowerCase().includes('verify') || err.message.toLowerCase().includes('exist'))) {
        setError(err.message);
      } else {
        setError('Incorrect email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Email address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.forgotPassword(resetEmail);
      setResetSent(true);
    } catch (err) {
      setError(err.message || 'Failed to request reset OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.request('/auth/reset-password/', {
        method: 'POST',
        body: JSON.stringify({ email: resetEmail, token: otpCode, password: newPassword }),
      });
      setResetSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Code may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px] relative">
        
        {/* LOGIN SUCCESS OVERLAY */}
        {loginSuccess && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in duration-200">
            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-md">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Login Successful!</h2>
            <p className="text-sm text-slate-500 max-w-sm">
              Welcome back to AgroLink. Syncing your dashboard details...
            </p>
            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full animate-pulse w-1/2"></div>
            </div>
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
              <span className="px-3 py-1 bg-emerald-700/50 text-emerald-250 text-xs font-semibold rounded-full border border-emerald-600/30 uppercase tracking-widest">Platform Sign In</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
                Connect directly with fresh organic produce.
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 bg-emerald-700/60 rounded-full flex items-center justify-center shrink-0 text-emerald-350 text-xs font-bold">✓</div>
                <p className="text-sm text-emerald-100/90 font-medium">Direct farmer-to-buyer trade channels with 0% middleman fees.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 bg-emerald-700/60 rounded-full flex items-center justify-center shrink-0 text-emerald-350 text-xs font-bold">✓</div>
                <p className="text-sm text-emerald-100/90 font-medium">Real-time agricultural weather forecasts and planting advisories.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 bg-emerald-700/60 rounded-full flex items-center justify-center shrink-0 text-emerald-350 text-xs font-bold">✓</div>
                <p className="text-sm text-emerald-100/90 font-medium">AI-driven recommended market pricing to optimize crop revenue.</p>
              </div>
            </div>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 z-10 text-left">
            <div>
              <p className="text-2xl font-black text-white">5,000+</p>
              <p className="text-[10px] text-emerald-200/70 font-semibold uppercase tracking-wider">Farmers Joined</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">0%</p>
              <p className="text-[10px] text-emerald-200/70 font-semibold uppercase tracking-wider">Broker Commission</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AUTH PANEL */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-slate-50/50">
          
          {/* FORGOT PASSWORD WORKFLOW */}
          {showForgotPassword ? (
            <div className="space-y-6 max-w-md w-full mx-auto text-left">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSent(false);
                    setResetSuccess(false);
                    setResetEmail('');
                    setOtpCode('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setError('');
                  }}
                  className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1 mb-4"
                >
                  <ArrowLeft size={12} /> Back to Sign In
                </button>
                <h1 className="text-2xl font-extrabold text-slate-800">Reset Your Password</h1>
                <p className="text-xs text-slate-400 font-medium">
                  {resetSent ? "Enter the reset code sent to your email to configure your new password." : "Enter your email credentials to request a secure password reset code."}
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl flex items-center gap-2 text-xs font-semibold">
                  <ShieldAlert size={16} className="text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {resetSuccess ? (
                <div className="p-6 bg-emerald-50/60 border border-emerald-100 rounded-2xl text-center space-y-4 animate-in fade-in duration-250">
                  <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-slate-800 text-base">Password Updated!</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Your AgroLink password has been changed successfully.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetSent(false);
                        setResetSuccess(false);
                        setResetEmail('');
                        setOtpCode('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setError('');
                      }}
                      className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-xs uppercase"
                    >
                      Sign In Now
                    </button>
                  </div>
                </div>
              ) : resetSent ? (
                <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in duration-250">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">6-Digit Reset Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      placeholder="e.g. 123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-center font-mono text-base font-black tracking-widest focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-350 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all text-xs uppercase tracking-wider"
                  >
                    {loading ? 'Updating Password...' : 'Reset Password'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g. buyer1@gmail.com"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all text-xs uppercase tracking-wider"
                  >
                    {loading ? 'Requesting code...' : 'Send Reset Code'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* STANDARD SIGN IN VIEW */
            <div className="max-w-md w-full mx-auto text-left space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome Back 👋</h1>
                <p className="text-xs text-slate-400 font-medium">Sign in to access your direct-trade dashboard.</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert size={16} className="text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. farmer1@gmail.com"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Options row */}
                <div className="flex justify-between items-center py-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-500 font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                    />
                    Remember Me
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-emerald-600 font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all text-xs uppercase tracking-wider mt-2"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-xs text-slate-500 font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="text-emerald-600 font-bold hover:underline">
                  Register Now
                </Link>
              </p>

              {/* Demo accounts hint */}
              <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200/50 text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <HelpCircle size={12} className="text-slate-400" />
                  <span className="font-bold text-slate-700">Quick Demo Accounts (Password: agrolink123)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono mt-1 text-slate-600">
                  <div className="bg-white p-1 rounded text-center border border-slate-200/50">farmer1@gmail.com</div>
                  <div className="bg-white p-1 rounded text-center border border-slate-200/50">buyer1@gmail.com</div>
                  <div className="bg-white p-1 rounded text-center border border-slate-200/50">transporter1@gmail.com</div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
