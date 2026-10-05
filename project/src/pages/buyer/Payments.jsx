import React, { useState, useEffect } from 'react';
import { CreditCard, Download, ShieldCheck, HelpCircle, CheckCircle, RefreshCw, Truck } from 'lucide-react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../context/AuthContext';
import api from '../../api/client';
import { formatKES } from '../../context/CartContext';
import { toast } from 'react-toastify';

function PaymentsContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [deliveries, setDeliveries] = useState([]);

  const fetchOrdersAndDeliveries = async () => {
    try {
      setLoading(true);
      const [ordersRes, deliveriesRes] = await Promise.all([
        api.request('/orders/'),
        api.request('/deliveries/')
      ]);
      
      const ordersList = Array.isArray(ordersRes) ? ordersRes : (ordersRes.results || []);
      const deliveriesList = Array.isArray(deliveriesRes) ? deliveriesRes : (deliveriesRes.results || []);
      
      setOrders(ordersList);
      setDeliveries(deliveriesList);
    } catch (err) {
      console.error("Failed to load payments data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndDeliveries();
  }, []);

  useEffect(() => {
    const handleWsOrderUpdate = (e) => {
      const updatedOrder = e.detail;
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    };

    const handleWsDeliveryUpdate = (e) => {
      const updatedDelivery = e.detail;
      setDeliveries(prev => prev.map(d => d.id === updatedDelivery.id ? updatedDelivery : d));
    };

    window.addEventListener('ws:order_update', handleWsOrderUpdate);
    window.addEventListener('ws:delivery_update', handleWsDeliveryUpdate);
    return () => {
      window.removeEventListener('ws:order_update', handleWsOrderUpdate);
      window.removeEventListener('ws:delivery_update', handleWsDeliveryUpdate);
    };
  }, []);

  const handleSimulatePayment = async (orderId, method) => {
    setProcessingId(orderId);
    try {
      const endpoint = method === 'mpesa' 
        ? `/orders/${orderId}/simulate_mpesa_callback/` 
        : `/orders/${orderId}/simulate_flutterwave_callback/`;
        
      const res = await api.request(endpoint, {
        method: 'POST',
      });
      
      toast.success(`💳 Payment Successful: ${res.transaction_id}`);
      fetchOrdersAndDeliveries();
    } catch (err) {
      toast.error(err.message || "Simulated payment transaction failed.");
    } finally {
      setProcessingId(null);
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'payment_confirmed':
        return <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-150 rounded-full text-[10px] font-bold">Paid</span>;
      case 'pending':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-150 rounded-full text-[10px] font-bold">Pending Payment</span>;
      case 'failed':
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-150 rounded-full text-[10px] font-bold">Failed</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-50 text-gray-500 border border-gray-150 rounded-full text-[10px] font-bold">{status}</span>;
    }
  };

  if (loading) return <LoadingSpinner />;

  // Filter orders that have payment records or need payment
  const billingOrders = orders.filter(o => o.status !== 'cancelled');

  return (
    <>
      <PageHeader 
        title="Payments Portal" 
        subtitle="Manage checkouts, M-Pesa STK confirmations, and view invoices" 
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payments History List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-green-700" />
              Transactions & Billing Logs
            </h3>

            {billingOrders.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No transactions available yet.</p>
            ) : (
              <div className="space-y-4">
                {billingOrders.map((order) => (
                  <div key={order.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-250 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-gray-600 font-bold">{order.id}</span>
                        {getPaymentStatusBadge(order.payment?.status || (order.status === 'payment_confirmed' ? 'completed' : 'pending'))}
                      </div>
                      
                      <p className="text-xs font-bold text-gray-800 mt-2">
                        {order.items?.[0]?.product_name || 'Agro Produce'} {order.items?.length > 1 ? `(+${order.items.length - 1} more)` : ''}
                      </p>
                      
                      <p className="text-[10px] text-gray-500 font-medium mt-1">
                        Amount: <span className="font-bold text-green-700">{formatKES(order.total_amount)}</span> · Date: {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      
                      {order.payment?.transaction_id && (
                        <p className="text-[9px] text-gray-450 font-mono mt-1">
                          Ref: {order.payment.transaction_id} · Method: {order.payment.method?.toUpperCase()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      {(!order.payment || order.payment.status === 'pending') && order.status === 'pending' && (
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => handleSimulatePayment(order.id, 'mpesa')}
                            disabled={processingId === order.id}
                            className="flex-1 sm:flex-none px-3 py-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-250 text-white font-bold rounded-xl text-[10px] uppercase flex items-center justify-center gap-1.5 transition-colors"
                          >
                            {processingId === order.id ? <RefreshCw size={11} className="animate-spin" /> : 'M-Pesa Pay'}
                          </button>
                          <button
                            onClick={() => handleSimulatePayment(order.id, 'flutterwave')}
                            disabled={processingId === order.id}
                            className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-250 text-white font-bold rounded-xl text-[10px] uppercase flex items-center justify-center gap-1.5 transition-colors"
                          >
                            {processingId === order.id ? <RefreshCw size={11} className="animate-spin" /> : 'Card/Flw'}
                          </button>
                        </div>
                      )}

                      {(order.payment?.status === 'completed' || order.status === 'payment_confirmed' || order.status === 'delivered') && (
                        <button
                          onClick={() => {
                            toast.success("Receipt downloaded successfully!");
                          }}
                          className="w-full sm:w-auto px-4 py-2 border border-gray-150 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-[10px] uppercase flex items-center justify-center gap-2 transition-colors"
                        >
                          <Download size={12} />
                          Invoice
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Transporter Payouts */}
            <h3 className="font-extrabold text-sm text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <Truck size={18} className="text-green-700" />
              Transporter Delivery Payouts
            </h3>

            {deliveries.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No transporter delivery payouts tracked yet.</p>
            ) : (
              <div className="space-y-4">
                {deliveries.map((delivery) => (
                  <div key={delivery.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-250 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-gray-600 font-bold">DEL-{delivery.id}</span>
                        {delivery.status === 'delivered' ? (
                          <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-150 rounded-full text-[10px] font-bold">Released to Driver</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-150 rounded-full text-[10px] font-bold">Held in Escrow</span>
                        )}
                      </div>
                      
                      <p className="text-xs font-bold text-gray-800 mt-2">
                        Transport route: {delivery.pickup_county} to {delivery.dropoff_county}
                      </p>
                      
                      <p className="text-[10px] text-gray-500 font-medium mt-1">
                        Driver: <span className="font-bold text-gray-700">{delivery.transporter_name || "Joseph Njoroge"}</span> · Fee: <span className="font-bold text-green-700">{formatKES(delivery.estimated_fee)}</span>
                      </p>
                    </div>

                    {delivery.status === 'delivered' && (
                      <span className="text-[10px] text-green-700 font-extrabold uppercase bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 flex items-center gap-1">
                        ✓ Disbursed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Security & Verification Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-700" />
              Escrow Protection
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
              AgroLink operates an escrow wallet security system. When you pay for an order:
            </p>
            <div className="space-y-2 pt-2 text-[10px] font-medium text-gray-600">
              <div className="flex gap-2">
                <span className="text-green-700 font-bold">1.</span>
                <span>Funds are safely held in our escrow reserve ledger.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-green-700 font-bold">2.</span>
                <span>The farmer is alerted to pick and ship the fresh produce.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-green-700 font-bold">3.</span>
                <span>Only when you confirm delivery or 48 hours pass without complaint are the funds released to the farmer.</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <HelpCircle size={18} className="text-green-700" />
              Supported Gateways
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="border border-green-100 bg-green-50/50 p-3 rounded-2xl">
                <p className="font-black text-xs text-green-800">Safaricom</p>
                <p className="text-[8px] uppercase tracking-wider text-gray-400 font-bold mt-1">M-Pesa STK Push</p>
              </div>
              <div className="border border-blue-100 bg-blue-50/50 p-3 rounded-2xl">
                <p className="font-black text-xs text-blue-800">Flutterwave</p>
                <p className="text-[8px] uppercase tracking-wider text-gray-400 font-bold mt-1">Visa / MasterCard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Payments() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PaymentsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
