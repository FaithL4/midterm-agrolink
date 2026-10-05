import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import api from '../api/client';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // Requirements checklist
  const reqChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  const metCount = Object.values(reqChecks).filter(Boolean).length;
  const filledSquares = '■'.repeat(metCount * 2);
  const emptySquares = '□'.repeat(10 - (metCount * 2));
  const strengthString = filledSquares + emptySquares;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token || !email) {
      setError('Invalid or broken password reset link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Check if all 5 requirements are met
    const allRequirementsMet = Object.values(reqChecks).every(Boolean);
    if (!allRequirementsMet) {
      setError('Your password is too weak. Please choose a stronger password.');
      return;
    }

    setLoading(true);
    try {
      await api.request('/auth/reset-password/', {
        method: 'POST',
        body: JSON.stringify({ email, token, password }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-green-50/50 text-left font-bold text-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-150 shadow-xl p-8 space-y-6">
        
        {success ? (
          <div className="space-y-4 py-4 text-center">
            <div className="text-4xl text-green-700 mb-2">✅</div>
            <h2 className="text-xl font-black text-gray-900">Password Updated</h2>
            <p className="text-xs text-gray-500 max-w-xs mx-auto font-medium">
              Your password has been changed successfully.
            </p>
            <p className="text-xs text-gray-500 font-medium">
              You can now sign in using your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow-lg transition-all text-xs uppercase"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-black text-gray-900 flex items-center justify-center gap-2">
                <span>🔒</span> Reset Password
              </h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1.5 font-medium">
                Create a new password for your account.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl flex items-center gap-2">
                <ShieldAlert size={14} className="text-red-700 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none font-medium bg-gray-50/30 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none font-medium bg-gray-50/30 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Strength */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider">
                  <span className="text-gray-400 font-bold">Password Strength</span>
                  <span className="font-mono text-green-700 font-black">{strengthString}</span>
                </div>

                <div className="pt-2 border-t border-gray-150 space-y-1.5 text-[10px] font-medium text-gray-500">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold mb-1">Requirements</p>
                  <div className="flex items-center gap-1.5">
                    <span className={reqChecks.length ? 'text-green-700' : 'text-gray-300'}>{reqChecks.length ? '✔' : '○'}</span>
                    <span className={reqChecks.length ? 'text-gray-700 font-bold' : ''}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={reqChecks.uppercase ? 'text-green-700' : 'text-gray-300'}>{reqChecks.uppercase ? '✔' : '○'}</span>
                    <span className={reqChecks.uppercase ? 'text-gray-700 font-bold' : ''}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={reqChecks.lowercase ? 'text-green-700' : 'text-gray-300'}>{reqChecks.lowercase ? '✔' : '○'}</span>
                    <span className={reqChecks.lowercase ? 'text-gray-700 font-bold' : ''}>One lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={reqChecks.number ? 'text-green-700' : 'text-gray-300'}>{reqChecks.number ? '✔' : '○'}</span>
                    <span className={reqChecks.number ? 'text-gray-700 font-bold' : ''}>One number</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={reqChecks.special ? 'text-green-700' : 'text-gray-300'}>{reqChecks.special ? '✔' : '○'}</span>
                    <span className={reqChecks.special ? 'text-gray-700 font-bold' : ''}>One special character</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow-lg transition-all text-xs uppercase"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
