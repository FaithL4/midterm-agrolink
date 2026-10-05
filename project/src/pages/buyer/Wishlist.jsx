import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, Info, TrendingDown, Star } from 'lucide-react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../context/AuthContext';
import { useCart, formatKES } from '../../context/CartContext';
import api from '../../api/client';
import { toast } from 'react-toastify';

function WishlistContent() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wishlist')) || [];
    } catch {
      return [];
    }
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        setLoading(true);
        // Fetch all products
        const allProducts = await api.request('/products/');
        const productsList = Array.isArray(allProducts) ? allProducts : (allProducts.results || []);
        // Filter by wishlist ids
        const filtered = productsList.filter(p => wishlistIds.includes(String(p.id)) || wishlistIds.includes(Number(p.id)));
        setProducts(filtered);
      } catch (err) {
        console.error("Failed to load wishlist products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistProducts();
  }, [wishlistIds]);

  const handleRemove = (productId) => {
    const updated = wishlistIds.filter(id => String(id) !== String(productId));
    setWishlistIds(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    toast.info("Item removed from Wishlist");
  };

  const handleMoveToCart = (product) => {
    addItem(product, 1);
    handleRemove(product.id);
    toast.success("🛒 Moved to Cart!");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <PageHeader 
        title="My Wishlist" 
        subtitle="Save products to buy later or monitor for price drops" 
      />

      {products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center max-w-lg mx-auto mt-8 shadow-sm">
          <div className="text-4xl mb-4">❤️</div>
          <h3 className="text-lg font-bold text-gray-800">Your Wishlist is Empty</h3>
          <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
            Browse our fresh marketplace catalog and save products you'd like to watch or purchase later.
          </p>
          <button 
            onClick={() => navigate('/marketplace')}
            className="mt-6 px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow-lg transition-all text-xs uppercase"
          >
            Go to Marketplace
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src={product.image_url || '/placeholder-crop.jpg'} 
                  alt={product.name} 
                  className="w-full h-48 object-cover"
                />
                {parseFloat(product.quantity_available) <= 10 && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    Low Stock: {product.quantity_available} {product.unit} left
                  </span>
                )}
                {parseFloat(product.quantity_available) === 0 && (
                  <span className="absolute top-3 left-3 bg-gray-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-sm text-gray-900">{product.name}</h3>
                    <button 
                      onClick={() => handleRemove(product.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-gray-500 mt-1 font-medium">
                    Farmer: <span className="font-bold text-gray-700">{product.farmer_name || 'Agro Farmer'}</span> · {product.county || 'Nakuru'}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold">(5.0)</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">Market Price</p>
                      <p className="font-black text-green-700 text-base">{formatKES(product.price)} / {product.unit}</p>
                    </div>
                    
                    <div className="bg-green-50 px-2 py-1 rounded-lg border border-green-100 flex items-center gap-1 text-[10px] text-green-700 font-bold">
                      <TrendingDown size={12} />
                      <span>Stable price</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={parseFloat(product.quantity_available) === 0}
                    className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={14} />
                    Move to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function Wishlist() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <WishlistContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
