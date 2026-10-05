import { useState, useEffect } from 'react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../context/AuthContext';
import api from '../../api/client';
import { formatKES } from '../../context/CartContext';
import { toast } from 'react-toastify';

function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [countyFilter, setCountyFilter] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    api.getProducts()
      .then((d) => {
        setProducts(d.results || d || []);
      })
      .catch((err) => {
        toast.error("Failed to fetch products: " + err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.approveProduct(id);
      toast.success("Product approved and is now live!");
      fetchProducts();
    } catch (err) {
      toast.error("Failed to approve product: " + err.message);
    }
  };

  const handleRejectClick = (product) => {
    setSelectedProduct(product);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.warn("Please provide a reason for rejection.");
      return;
    }
    setSubmitting(true);
    try {
      await api.rejectProduct(selectedProduct.id, rejectionReason);
      toast.error("Product rejected successfully.");
      setShowRejectModal(false);
      fetchProducts();
    } catch (err) {
      toast.error("Failed to reject product: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter products by tab and search
  const filteredProducts = products.filter((p) => {
    const statusMatch = p.approval_status === activeTab;
    const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.farmer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const countyMatch = countyFilter === '' || p.county.toLowerCase().includes(countyFilter.toLowerCase());
    return statusMatch && searchMatch && countyMatch;
  });

  return (
    <div className="space-y-6 font-sans">
      <PageHeader 
        title="Product Approvals" 
        subtitle="Review and moderate crop listings submitted by farmers before they go live on the public marketplace." 
      />

      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl border">
        {/* Tabs */}
        <div className="flex border-b md:border-none">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium text-sm transition-all border-b-2 -mb-[2px] md:mb-0 md:rounded-lg ${
              activeTab === 'pending'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50 md:bg-emerald-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Review ({products.filter(p => p.approval_status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 font-medium text-sm transition-all border-b-2 -mb-[2px] md:mb-0 md:rounded-lg ${
              activeTab === 'approved'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50 md:bg-emerald-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Approved ({products.filter(p => p.approval_status === 'approved').length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 font-medium text-sm transition-all border-b-2 -mb-[2px] md:mb-0 md:rounded-lg ${
              activeTab === 'rejected'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50 md:bg-emerald-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Rejected ({products.filter(p => p.approval_status === 'rejected').length})
          </button>
        </div>

        {/* Search & County Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Search crop or farmer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48 px-3 py-1.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
          <input
            type="text"
            placeholder="County..."
            value={countyFilter}
            onChange={(e) => setCountyFilter(e.target.value)}
            className="w-full sm:w-36 px-3 py-1.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border text-center text-gray-500">
          No crops found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-xl border hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Product Info */}
              <div className="flex items-start gap-4">
                <img
                  src={p.image_url || '/placeholder_crop.jpg'}
                  alt={p.name}
                  className="w-20 h-20 rounded-lg object-cover border bg-gray-50 flex-shrink-0"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=200&q=80'; }}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-slate-800">{p.name}</h3>
                    {p.is_featured && <span className="px-1.5 py-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 rounded">FEATURED</span>}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-1">{p.description || "No description provided."}</p>
                  
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 pt-1 text-xs text-gray-500">
                    <div>
                      <span className="font-medium text-gray-600">Farmer:</span> {p.farmer_name}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">County:</span> {p.county}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Qty Available:</span> {p.quantity_available} {p.unit}s
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Listing Price:</span> {formatKES(p.price)}/{p.unit}
                    </div>
                  </div>

                  {/* Rejection Reason Display */}
                  {p.approval_status === 'rejected' && p.rejection_reason && (
                    <div className="mt-2 text-xs bg-red-50 text-red-700 p-2 rounded-lg border border-red-100">
                      <span className="font-semibold">Rejection Reason:</span> {p.rejection_reason}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                {p.approval_status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(p.id)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
                    >
                      Approve Listing
                    </button>
                    <button
                      onClick={() => handleRejectClick(p)}
                      className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium active:scale-95 transition-all"
                    >
                      Reject
                    </button>
                  </>
                )}

                {p.approval_status === 'approved' && (
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">Approved</span>
                    <button
                      onClick={() => handleRejectClick(p)}
                      className="px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:underline"
                    >
                      Revoke Approval
                    </button>
                  </div>
                )}

                {p.approval_status === 'rejected' && (
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Rejected</span>
                    <button
                      onClick={() => handleApprove(p.id)}
                      className="px-2 py-1 text-xs text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      Approve Listing
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Reject Marketplace Listing</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please specify the reason for rejecting <span className="font-semibold">"{selectedProduct.name}"</span>. This feedback will be displayed to the farmer.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g., Low quality images, incorrect price per bag, missing mandatory description..."
                rows={4}
                className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 active:scale-95 transition-all shadow-sm"
                  disabled={submitting}
                >
                  {submitting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProducts() {
  return (
    <ProtectedRoute roles={['admin']}>
      <DashboardLayout><ProductsContent /></DashboardLayout>
    </ProtectedRoute>
  );
}
