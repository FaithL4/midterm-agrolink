import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import DashboardLayout, { PageHeader } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../context/AuthContext';
import { useCart, formatKES } from '../../context/CartContext';

function CartContent() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Shopping Cart" />
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link to="/marketplace" className="text-green-700 font-medium hover:underline">Browse Marketplace</Link>
        </div>
      </>
    );
  }

  const farmerId = items[0]?.farmer;

  return (
    <>
      <PageHeader title="Shopping Cart" subtitle={`${items.length} item(s)`} />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border p-4 flex gap-4">
              <img src={item.image_url} alt={item.name} className="h-20 w-20 object-cover rounded-lg" />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">{item.county} · {formatKES(item.price)}/{item.unit}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 border rounded"><Minus size={14} /></button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 border rounded"><Plus size={14} /></button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatKES(item.price * item.quantity)}</p>
                <button onClick={() => removeItem(item.id)} className="mt-2 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border p-6 h-fit">
          <h3 className="font-semibold mb-4">Order Summary</h3>
          <div className="flex justify-between mb-2"><span>Subtotal</span><span>{formatKES(total)}</span></div>
          <div className="flex justify-between mb-4 text-sm text-gray-500"><span>Delivery (est.)</span><span>{formatKES(500)}</span></div>
          <div className="flex justify-between font-bold text-lg border-t pt-4 mb-4">
            <span>Total</span><span className="text-green-700">{formatKES(total + 500)}</span>
          </div>
          <Link
            to="/buyer/checkout"
            state={{ farmerId }}
            className="block w-full py-3 bg-green-700 text-white text-center font-semibold rounded-lg hover:bg-green-800"
          >
            Proceed to Checkout
          </Link>
          <button onClick={clearCart} className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-red-600">Clear Cart</button>
        </div>
      </div>
    </>
  );
}

export default function Cart() {
  return (
    <ProtectedRoute roles={['buyer']}>
      <DashboardLayout><CartContent /></DashboardLayout>
    </ProtectedRoute>
  );
}
