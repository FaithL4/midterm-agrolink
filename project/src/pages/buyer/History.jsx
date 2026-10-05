import React, { useState, useEffect } from 'react';
import { Calendar, ShoppingBag, ArrowRight, CheckCircle2, Download, Printer, Search, X } from 'lucide-react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../context/AuthContext';
import api from '../../api/client';
import { useCart, formatKES } from '../../context/CartContext';
import { toast } from 'react-toastify';

function HistoryContent() {
  const { addItem } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.request('/orders/');
        const ordersList = Array.isArray(res) ? res : (res.results || []);
        // Filter for completed or delivered orders
        const completed = ordersList.filter(o => o.status === 'completed' || o.status === 'delivered');
        setOrders(completed);
      } catch (err) {
        console.error("Failed to load purchase history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    
    order.items.forEach((item) => {
      // Re-map item from order to a product object shape
      const productShape = {
        id: item.product,
        name: item.product_name,
        price: parseFloat(item.price),
        unit: item.unit || 'Kg',
        image_url: item.image_url || '/placeholder-crop.jpg',
        farmer: order.farmer,
        county: order.county || 'Nakuru',
        quantity_available: 999 // assume in stock for reorder demo
      };
      addItem(productShape, item.quantity);
    });
    
    toast.success("🛒 Reordered items successfully added to your Cart!");
  };

  if (loading) return <LoadingSpinner />;

  // Filter based on search query (product name or order id)
  const filteredOrders = orders.filter((o) => {
    const matchesId = String(o.id).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProduct = o.items?.some(i => i.product_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesId || matchesProduct;
  });

  return (
    <>
      <PageHeader 
        title="Purchase History" 
        subtitle="Manage and print invoices of your past completed direct-trade transactions" 
      />

      {/* Search Bar */}
      <div className="bg-white rounded-3xl border border-gray-150 p-4 shadow-sm mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID or crop name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-medium bg-gray-50/50"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-bold text-gray-800">No Purchase History Found</h3>
          <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
            You don't have any completed or delivered orders matching your search.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-gray-600 font-extrabold">{order.id}</span>
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-150 rounded-full text-[9px] font-black uppercase flex items-center gap-1">
                    <CheckCircle2 size={10} /> Completed
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>

                <div className="space-y-1">
                  {order.items?.map((item, idx) => (
                    <p key={idx} className="text-xs font-extrabold text-gray-800">
                      {item.product_name} <span className="text-gray-400 font-medium">x {item.quantity} {item.unit || 'Kg'}</span>
                    </p>
                  ))}
                </div>

                <p className="text-[10px] text-gray-500 font-medium">
                  Total Paid: <span className="font-bold text-green-700">{formatKES(order.total_amount)}</span> · Farmer: <span className="font-bold text-gray-700">{order.farmer_name || 'Agro Farmer'}</span>
                </p>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => setInvoiceOrder(order)}
                  className="flex-1 md:flex-none px-4 py-2.5 border border-gray-150 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs uppercase flex items-center justify-center gap-2 transition-colors"
                >
                  <Printer size={14} />
                  Receipt
                </button>
                <button
                  onClick={() => handleReorder(order)}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow-sm text-xs uppercase flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingBag size={14} />
                  Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-150 p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setInvoiceOrder(null)}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center pb-4 border-b border-gray-150">
              <h2 className="text-lg font-black text-gray-900">AgroLink Invoice Recipient</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1.5 font-bold">Transaction Ledger Record</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400 font-bold">Order Details</p>
                <p className="font-extrabold text-gray-800 mt-1">Invoice #: {invoiceOrder.id}</p>
                <p className="font-medium text-gray-500">Date: {new Date(invoiceOrder.created_at).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 font-bold">Client</p>
                <p className="font-extrabold text-gray-850 mt-1">{invoiceOrder.buyer_name || 'Buyer Client'}</p>
                <p className="font-medium text-gray-550">Farmer: {invoiceOrder.farmer_name || 'Agro Farmer'}</p>
              </div>
            </div>

            {/* Table of Items */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100">
                    <th className="p-3 font-bold text-gray-600">Product</th>
                    <th className="p-3 font-bold text-gray-600 text-center">Qty</th>
                    <th className="p-3 font-bold text-gray-600 text-right">Price</th>
                    <th className="p-3 font-bold text-gray-600 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceOrder.items?.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 last:border-0 font-medium">
                      <td className="p-3 text-gray-800 font-bold">{item.product_name}</td>
                      <td className="p-3 text-center text-gray-600">{item.quantity} {item.unit || 'Kg'}</td>
                      <td className="p-3 text-right text-gray-600">{formatKES(item.price)}</td>
                      <td className="p-3 text-right text-gray-800 font-bold">{formatKES(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-150">
              <div>
                <p className="text-[10px] text-gray-400 font-extrabold uppercase">Payment Status</p>
                <p className="text-xs font-black text-green-700 mt-0.5">Paid via Digital Escrow</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-bold">Grand Total</p>
                <p className="text-lg font-black text-green-750">{formatKES(invoiceOrder.total_amount)}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 justify-end">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-6 py-2.5 border border-gray-150 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs uppercase flex items-center gap-2 transition-colors"
              >
                <Printer size={14} />
                Print Invoice
              </button>
              <button
                onClick={() => setInvoiceOrder(null)}
                className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-xs uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function History() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <HistoryContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
