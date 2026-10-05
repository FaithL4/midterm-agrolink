import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout, { PageHeader } from '../../components/layout/DashboardLayout';
import { ProtectedRoute, useAuth } from '../../context/AuthContext';
import { useCart, formatKES } from '../../context/CartContext';
import api from '../../api/client';
import { KENYAN_COUNTIES } from '../../data/constants';
import PaymentModal from '../../components/common/PaymentModal';
import { toast } from 'react-toastify';

function CheckoutContent() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const farmerId = location.state?.farmerId || items[0]?.farmer;

  const [form, setForm] = useState({
    delivery_address: '',
    delivery_county: user?.county || 'Nairobi',
    notes: '',
    payment_method: 'mpesa',
    phone: user?.phone || '254712345678',
  });
  const [loading, setLoading] = useState(false);
  const [orderCreatedId, setOrderCreatedId] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    api.getWallet()
      .then(setWallet)
      .catch(() => null);
  }, []);

  const handleOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const order = await api.createOrder({
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity, farmer_id: farmerId })),
        delivery_address: form.delivery_address,
        delivery_county: form.delivery_county,
        notes: form.notes,
        payment_method: form.payment_method,
      });
      
      setOrderCreatedId(order.id);
      clearCart();
      
      if (form.payment_method === 'cod') {
        // Cash on delivery completes checkout immediately
        setPaymentResult({ transaction_id: 'CASH_ON_DELIVERY' });
      } else if (form.payment_method === 'wallet') {
        // Wallet payment completes immediately
        setPaymentResult({ transaction_id: `TXN-WLT-${order.id}` });
      } else {
        // Launches STK push or Card modal for real-time gateway simulation
        setIsPaymentOpen(true);
      }
    } catch (err) {
      toast.error(err.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (paymentResult) {
    return (
      <>
        <PageHeader title="Checkout Completed" />
        <div className="bg-white rounded-3xl border p-8 max-w-md mx-auto text-center space-y-4 shadow-md">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-green-700 font-bold">✓</span>
          </div>
          <h2 className="text-xl font-bold text-green-700">Payment Processed Successfully!</h2>
          <p className="text-slate-500 text-xs">
            Transaction Reference: <strong>{paymentResult.transaction_id}</strong>
          </p>
          <p className="text-xs text-slate-400">Order Reference ID: #{orderCreatedId}</p>
          <button onClick={() => navigate('/buyer/orders')} className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-white rounded-2xl text-xs transition-all shadow-md shadow-emerald-600/20">
            View My Orders
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Checkout Payment Portal" subtitle={`Total Order Value: ${formatKES(total + 500)} (Includes KES 500 Transport Fee)`} />
      
      <form onSubmit={handleOrder} className="max-w-lg bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm text-xs font-bold">
        <div>
          <label className="block text-slate-500 mb-1.5">Delivery Destination Address</label>
          <textarea 
            required 
            placeholder="Warehouse address, office, or apartment name..." 
            value={form.delivery_address} 
            onChange={(e) => setForm({ ...form, delivery_address: e.target.value })} 
            className="w-full px-4 py-2 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none" 
            rows={2} 
          />
        </div>

        <div>
          <label className="block text-slate-500 mb-1.5">County Location</label>
          <select 
            required 
            value={form.delivery_county} 
            onChange={(e) => setForm({ ...form, delivery_county: e.target.value })} 
            className="w-full px-4 py-2 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {KENYAN_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-slate-500 mb-1.5">Order Delivery Instructions (optional)</label>
          <textarea 
            placeholder="Delivery instructions for the transporter..." 
            value={form.notes} 
            onChange={(e) => setForm({ ...form, notes: e.target.value })} 
            className="w-full px-4 py-2 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none" 
            rows={2} 
          />
        </div>

        <div>
          <p className="text-slate-500 mb-2">Payment Method</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'mpesa', label: 'M-Pesa Pay' },
              { id: 'card', label: 'Visa / Mastercard' },
              { id: 'cod', label: 'Cash on Delivery' },
              { 
                id: 'wallet', 
                label: `AgroLink Wallet (${wallet ? formatKES(wallet.balance) : 'KES 0.00'})`,
                disabled: wallet ? parseFloat(wallet.balance) < (total + 500) : true
              }
            ].map((m) => (
              <label 
                key={m.id} 
                className={`flex items-center gap-2 cursor-pointer p-3 rounded-2xl border hover:bg-slate-100 transition-colors ${
                  m.disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  value={m.id} 
                  disabled={m.disabled}
                  checked={form.payment_method === m.id} 
                  onChange={() => setForm({ ...form, payment_method: m.id })} 
                />
                <span className="text-slate-800 text-[11px] font-black">{m.label}</span>
              </label>
            ))}
          </div>
        </div>


        {form.payment_method === 'mpesa' && (
          <div>
            <label className="block text-slate-500 mb-1.5">M-Pesa Mobile Number</label>
            <input 
              required 
              placeholder="e.g. 254712345678" 
              value={form.phone} 
              onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              className="w-full px-4 py-2 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none" 
            />
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
        >
          {loading ? 'Processing Checkout...' : 'Place Order & Proceed to Pay'}
        </button>
      </form>

      {/* Payment Modal for M-Pesa or Card (Visa/Mastercard) checkout */}
      {isPaymentOpen && (
        <PaymentModal
          isOpen={isPaymentOpen}
          amount={total + 500}
          orderId={`ORD-${orderCreatedId}`}
          onClose={() => {
            setIsPaymentOpen(false);
            navigate('/buyer/orders');
          }}
          onSuccess={(res) => {
            setIsPaymentOpen(false);
            setPaymentResult({ transaction_id: res.transaction_id || 'SUCCESS' });
          }}
        />
      )}
    </div>
  );
}

export default function Checkout() {
  return (
    <ProtectedRoute roles={['buyer']}>
      <DashboardLayout><CheckoutContent /></DashboardLayout>
    </ProtectedRoute>
  );
}
