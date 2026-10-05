import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Plus, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../context/AuthContext';
import api from '../../api/client';
import { toast } from 'react-toastify';

function ReviewsContent() {
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedOrder, setSelectedOrder] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch orders to find reviewable ones (completed or delivered)
      const fetchedOrders = await api.request('/orders/');
      const ordersList = Array.isArray(fetchedOrders) ? fetchedOrders : (fetchedOrders.results || []);
      setOrders(ordersList.filter(o => o.status === 'delivered' || o.status === 'completed'));
      
      // Fetch all reviews in the system
      const fetchedReviews = await api.request('/reviews/');
      const reviewsList = Array.isArray(fetchedReviews) ? fetchedReviews : (fetchedReviews.results || []);
      setReviews(reviewsList);
    } catch (err) {
      console.error("Failed to load reviews data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedOrder) {
      toast.error("Please select an order to review.");
      return;
    }

    const orderObj = orders.find(o => String(o.id) === String(selectedOrder));
    if (!orderObj) return;

    setSubmitting(true);
    try {
      await api.request('/reviews/', {
        method: 'POST',
        body: JSON.stringify({
          order: orderObj.id,
          farmer: orderObj.farmer,
          rating: rating,
          comment: comment,
        }),
      });
      toast.success("⭐ Review submitted successfully!");
      setComment('');
      setSelectedOrder('');
      setRating(5);
      fetchData(); // reload
    } catch (err) {
      toast.error(err.message || "Failed to submit review. You may have already reviewed this order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Filter orders that haven't been reviewed yet (simple check)
  const unreviewedOrders = orders.filter(
    o => !reviews.some(r => String(r.order) === String(o.id))
  );

  return (
    <>
      <PageHeader 
        title="Reviews & Ratings" 
        subtitle="Share your feedback on fresh crops and rate your farmer transaction experience" 
      />

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Reviews Form and Active List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Submit a Review Form */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-green-700" />
              Write a Farmer Review
            </h3>

            {unreviewedOrders.length === 0 ? (
              <p className="text-xs text-gray-450 py-4 bg-slate-50 rounded-2xl text-center border border-dashed border-gray-200">
                No new unreviewed orders. Complete a delivery transaction to write a review!
              </p>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Completed Purchase</label>
                  <select
                    value={selectedOrder}
                    onChange={(e) => setSelectedOrder(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-semibold"
                  >
                    <option value="">-- Select Order --</option>
                    {unreviewedOrders.map((o) => (
                      <option key={o.id} value={o.id}>
                        Order {o.id} · {o.items?.[0]?.product_name || 'Produce'} · {new Date(o.created_at).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Star Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-2xl outline-none focus:outline-none transition-transform active:scale-95"
                      >
                        <Star 
                          size={24}
                          className={star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Review Comments</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your crop quality, packaging, freshness, and delivery satisfaction..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-gray-250 text-white font-bold rounded-xl shadow-md text-xs uppercase"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>

          {/* Recent Reviews given in system */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-green-700" />
              Recent Platform Feedback
            </h3>

            {reviews.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No review logs currently recorded.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="border border-gray-100 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-gray-800">
                        {rev.reviewer_name || 'Anonymous Buyer'}
                      </p>
                      
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={11} 
                            fill={i < rev.rating ? "currentColor" : "none"}
                            className={i < rev.rating ? "text-amber-400" : "text-gray-250"}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-650 leading-relaxed font-medium">
                      "{rev.comment}"
                    </p>

                    <p className="text-[9px] text-gray-400 font-medium">
                      Order ID: <span className="font-mono">{rev.order}</span> · Date: {new Date(rev.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Guidelines */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-700" />
              Community Guidelines
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
              We value honest, transparent, and constructive feedback to help build trust within our farming ecosystem:
            </p>
            <div className="space-y-3 pt-2 text-[10px] font-medium text-gray-600">
              <div className="flex gap-2">
                <span className="text-green-700">✓</span>
                <span>Describe the size, moisture level, and appearance of the produce.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-green-700">✓</span>
                <span>Rate farmer responsiveness and packaging coordinates.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-green-700">✓</span>
                <span>Keep comments polite, clean, and professional.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Reviews() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ReviewsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
