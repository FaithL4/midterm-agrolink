import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldAlert, RefreshCw } from 'lucide-react';
import api from '../api/client';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided in link URL.');
        return;
      }
      
      try {
        await api.request('/auth/verify-email/', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Failed to verify account token or token has expired.');
      }
    };
    
    performVerification();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-green-50/50 text-left font-bold text-xs">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-150 shadow-xl p-8 text-center space-y-5">
        {status === 'processing' && (
          <div className="space-y-4">
            <RefreshCw className="mx-auto h-12 w-12 text-green-700 animate-spin" />
            <h2 className="text-lg font-black text-gray-900">Verifying Account</h2>
            <p className="text-xs text-gray-500 font-medium">Please wait while we activate your AgroLink account...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4">
            <div className="text-4xl text-green-700 mb-2">✅</div>
            <h2 className="text-xl font-black text-gray-900">Email Verified</h2>
            <p className="text-xs text-gray-700 font-bold">Congratulations!</p>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto font-medium">
              Your email has been verified successfully.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              You can now sign in to AgroLink.
            </p>
            
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow-lg transition-all text-xs uppercase"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto h-16 w-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center">
              <ShieldAlert className="h-10 w-10 text-red-700" />
            </div>
            <h2 className="text-xl font-black text-red-750">Verification Failed</h2>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">{message}</p>
            <button 
              onClick={() => navigate('/register')}
              className="w-full py-3 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transition-all text-xs uppercase"
            >
              Back to Registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
