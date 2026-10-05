import { useState, useEffect } from 'react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { 
  CreditCard, ArrowUpRight, ArrowDownRight, RefreshCw, 
  DollarSign, Landmark, PhoneCall, Receipt, ShieldCheck 
} from 'lucide-react';
import api from '../../api/client';
import { formatKES } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function WalletDashboard() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mpesa');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bankName, setBankName] = useState('KCB Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchWalletData = async () => {
    try {
      const wData = await api.getWallet();
      setWallet(wData);
      const txData = await api.getWalletTransactions();
      setTransactions(txData);
    } catch (err) {
      toast.error("Failed to load wallet metrics: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.warn("Please enter a valid deposit amount.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.depositFunds(amount, method, method === 'mpesa' ? phone : '');
      toast.success(res.message || "Funds deposited successfully!");
      setShowDeposit(false);
      setAmount('');
      setWallet(res.wallet);
      // Refresh transactions
      const txData = await api.getWalletTransactions();
      setTransactions(txData);
    } catch (err) {
      toast.error("Deposit failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.warn("Please enter a valid withdrawal amount.");
      return;
    }
    if (parseFloat(amount) > parseFloat(wallet?.balance || 0)) {
      toast.error("Insufficient balance in your digital wallet.");
      return;
    }
    setSubmitting(true);
    const target = method === 'mpesa' ? phone : `${bankName} - A/C ${accountNumber}`;
    try {
      const res = await api.withdrawFunds(amount, method, target);
      toast.success(res.message || "Withdrawal completed successfully!");
      setShowWithdraw(false);
      setAmount('');
      setAccountNumber('');
      setWallet(res.wallet);
      // Refresh transactions
      const txData = await api.getWalletTransactions();
      setTransactions(txData);
    } catch (err) {
      toast.error("Withdrawal failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans text-slate-800 text-left">
        <PageHeader 
          title="Digital Wallet" 
          subtitle="Manage your direct-trade cash balance, execute deposits, withdrawals, and view transaction records."
          action={
            <button 
              onClick={fetchWalletData} 
              className="p-3 bg-white hover:bg-slate-50 border rounded-xl text-slate-500 hover:text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
              title="Refresh Wallet Balance"
            >
              <RefreshCw size={14} /> Refresh Balance
            </button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: DIGITAL CARD & QUICK ACTIONS */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* GLOWING DIGITAL CARD */}
            <div className="relative aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-850 to-teal-900 text-white p-6 shadow-xl flex flex-col justify-between overflow-hidden border border-emerald-800/40">
              {/* Background ambient flows */}
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Card Top */}
              <div className="flex items-start justify-between z-10">
                <div className="space-y-1">
                  <p className="text-[10px] text-emerald-250 font-bold uppercase tracking-widest">AgroLink Pay</p>
                  <p className="text-[9px] text-slate-400 font-medium">DIGITAL TRADE ESCROW</p>
                </div>
                <div className="h-9 w-9 bg-emerald-700/30 rounded-xl flex items-center justify-center border border-emerald-600/20 text-emerald-350">
                  <CreditCard size={18} />
                </div>
              </div>

              {/* Card Middle (Balance) */}
              <div className="z-10 text-left my-2">
                <p className="text-[10px] text-emerald-200/60 font-semibold uppercase tracking-wider">Available Balance</p>
                <h3 className="text-3xl font-black tracking-tight mt-0.5">
                  {formatKES(wallet?.balance || 0)}
                </h3>
              </div>

              {/* Card Bottom */}
              <div className="flex justify-between items-end z-10 border-t border-white/5 pt-4">
                <div className="text-left">
                  <p className="text-[9px] text-emerald-200/50 font-semibold uppercase">Account Owner</p>
                  <p className="text-xs font-bold tracking-wide mt-0.5 truncate max-w-[150px]">{wallet?.full_name || user?.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-emerald-200/50 font-semibold uppercase">Account Role</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-350 mt-0.5">{user?.role}</p>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS BUTTONS */}
            <div className="bg-white rounded-2xl border p-4 shadow-sm grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowDeposit(true)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg active:scale-98 transition-all text-xs uppercase flex items-center justify-center gap-1.5"
              >
                <ArrowUpRight size={14} /> Deposit
              </button>
              <button 
                onClick={() => setShowWithdraw(true)}
                className="w-full py-3.5 border border-slate-200 hover:border-emerald-500/20 bg-slate-50 hover:bg-emerald-50/20 text-slate-700 hover:text-emerald-700 font-bold rounded-xl active:scale-98 transition-all text-xs uppercase flex items-center justify-center gap-1.5"
              >
                <ArrowDownRight size={14} /> Withdraw
              </button>
            </div>

            {/* SECURITY ASSURANCE BANNER */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
              <div className="h-8 w-8 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-slate-800">Secure Closed-Loop Escrow</h4>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Funds inside your AgroLink wallet are protected. Buyer payments are held until order receipt confirmation.
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT: TRANSACTIONS LIST */}
          <div className="lg:col-span-8 bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800">Recent Transactions</h3>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">{transactions.length} Records</span>
            </div>

            {transactions.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <div className="h-12 w-12 bg-slate-50 text-slate-350 border border-slate-100 rounded-2xl flex items-center justify-center">
                  <Receipt size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-600 text-sm">No transactions yet</p>
                  <p className="text-xs text-slate-450 mt-0.5">Deposits, withdrawals, and order earnings will appear here.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Transaction Details</th>
                      <th className="p-4">Reference</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const isCredit = ['deposit', 'payment_received', 'refund'].includes(tx.transaction_type);
                      return (
                        <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${
                                isCredit 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                  : 'bg-red-50 text-red-600 border-red-150'
                              }`}>
                                {isCredit ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 capitalize">{tx.transaction_type.replace('_', ' ')}</p>
                                <p className="text-[10px] text-slate-450 leading-relaxed font-medium mt-0.5">{tx.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-500">{tx.reference || '—'}</td>
                          <td className="p-4 text-slate-500 font-medium">{tx.created_at_formatted}</td>
                          <td className={`p-4 text-right font-black text-sm ${isCredit ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {isCredit ? '+' : '-'} {formatKES(tx.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* DEPOSIT MODAL */}
        {showDeposit && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border animate-in fade-in zoom-in-95 duration-150 text-left">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Deposit Funds</h3>
              <p className="text-xs text-slate-400 mb-4">Simulate adding money to your direct-trade digital wallet account.</p>
              
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                {/* Method selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMethod('mpesa')}
                      className={`py-3 border rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all ${
                        method === 'mpesa' 
                          ? 'border-emerald-600 bg-emerald-50/30 text-emerald-700 shadow-sm' 
                          : 'bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <PhoneCall size={14} /> M-Pesa STK
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod('card')}
                      className={`py-3 border rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all ${
                        method === 'card' 
                          ? 'border-emerald-600 bg-emerald-50/30 text-emerald-700 shadow-sm' 
                          : 'bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard size={14} /> Visa/Card
                    </button>
                  </div>
                </div>

                {/* Conditional Phone Input for M-Pesa */}
                {method === 'mpesa' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">M-Pesa Phone Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium focus:border-emerald-500"
                    />
                  </div>
                )}

                {/* Amount input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount (KES)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      required
                      min={10}
                      placeholder="e.g. 5000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowDeposit(false); setAmount(''); }}
                    className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
                    disabled={submitting}
                  >
                    {submitting ? "Processing..." : "Confirm Deposit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* WITHDRAWAL MODAL */}
        {showWithdraw && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border animate-in fade-in zoom-in-95 duration-150 text-left">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Withdraw Funds</h3>
              <p className="text-xs text-slate-400 mb-4">Simulate moving money out of your AgroLink wallet to bank/mobile cash.</p>
              
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                {/* Method selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Withdraw Destination</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMethod('mpesa')}
                      className={`py-3 border rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all ${
                        method === 'mpesa' 
                          ? 'border-emerald-600 bg-emerald-50/30 text-emerald-700 shadow-sm' 
                          : 'bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <PhoneCall size={14} /> M-Pesa Mobile
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod('bank')}
                      className={`py-3 border rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all ${
                        method === 'bank' 
                          ? 'border-emerald-600 bg-emerald-50/30 text-emerald-700 shadow-sm' 
                          : 'bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Landmark size={14} /> Bank Account
                    </button>
                  </div>
                </div>

                {/* Conditional Fields */}
                {method === 'mpesa' ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">M-Pesa Mobile Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium focus:border-emerald-500"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Bank</label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-semibold text-slate-700"
                      >
                        {['KCB Bank', 'Equity Bank', 'Co-operative Bank', 'Absa Bank', 'NCBA Bank'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Number</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 1102930491"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* Amount input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount (KES)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      required
                      min={10}
                      placeholder="e.g. 2000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-medium focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowWithdraw(false); setAmount(''); }}
                    className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
                    disabled={submitting}
                  >
                    {submitting ? "Processing..." : "Confirm Withdrawal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
