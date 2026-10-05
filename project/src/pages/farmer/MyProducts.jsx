import { useState, useEffect, useRef } from 'react';
import { 
  Plus, Pencil, Trash2, Search, Filter, SlidersHorizontal, Eye, 
  TrendingUp, CheckCircle, AlertTriangle, XCircle, HelpCircle, 
  ChevronLeft, ChevronRight, Upload, X, Save, RefreshCw, BarChart2 
} from 'lucide-react';
import DashboardLayout, { PageHeader, LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../context/AuthContext';
import api from '../../api/client';
import { KENYAN_COUNTIES } from '../../data/constants';

function MyProductsContent() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, price_asc, price_desc, harvest_date
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Product Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Product Form State
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    quantity_available: '',
    unit: 'Kg',
    harvest_date: '',
    expiry_date: '',
    county: '',
    sub_county: '',
    town_village: '',
    status: 'Available',
    images: [] // Array of { name, url }
  });

  // AI Price Prediction States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);

  // Image Upload Refs
  const fileInputRef = useRef(null);

  const load = () => {
    setLoading(true);
    api.getMyProducts()
      .then((data) => {
        setProducts(data?.results || data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.getCategories()
      .then((d) => setCategories(d.results || d))
      .catch(() => {});
    load();
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      category: '',
      description: '',
      price: '',
      quantity_available: '',
      unit: 'Kg',
      harvest_date: '',
      expiry_date: '',
      county: '',
      sub_county: '',
      town_village: '',
      status: 'Available',
      images: []
    });
    setAiPrediction(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (p) => {
    // Locate category ID or name
    const cat = p.category_id || p.category || '';
    
    setForm({
      name: p.name || '',
      category: cat,
      description: p.description || '',
      price: p.price || '',
      quantity_available: p.quantity_available || '',
      unit: p.unit || 'Kg',
      harvest_date: p.harvest_date || '',
      expiry_date: p.expiry_date || '',
      county: p.county || '',
      sub_county: p.sub_county || '',
      town_village: p.town_village || '',
      status: p.quantity_available === 0 ? 'Out of Stock' : (p.status || 'Available'),
      images: p.image_url ? [{ name: 'Current Image', url: p.image_url }] : []
    });
    setEditId(p.id);
    setAiPrediction(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this listing?')) {
      try {
        await api.deleteProduct(id);
        load();
      } catch (err) {
        alert('Failed to delete product.');
      }
    }
  };

  // Image Upload Handling
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    addImages(files);
  };

  const addImages = (files) => {
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      if (!isValidType) {
        alert(`${file.name} has an invalid format. Supported formats: JPG, JPEG, PNG, WEBP.`);
      }
      return isValidType;
    });

    if (form.images.length + validFiles.length > 5) {
      alert('You can only upload up to 5 images per product.');
      return;
    }

    const newImages = validFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      file: file // Store the raw file object
    }));

    setForm(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const handleRemoveImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  const getProductImage = (name, catId) => {
    const lower = name.toLowerCase();
    if (lower.includes('tomato')) return 'http://localhost:5173/tomatoes.jpg';
    if (lower.includes('maize') || lower.includes('corn')) return 'http://localhost:5173/maize.jpg';
    if (lower.includes('bean')) return 'http://localhost:5173/beans.jpg';
    if (lower.includes('avocado')) return 'http://localhost:5173/avocados.jpg';
    
    const cat = categories.find(c => c.id === parseInt(catId));
    const catName = cat ? cat.name.toLowerCase() : '';
    if (catName.includes('fruit')) return 'http://localhost:5173/cat_fruits.jpg';
    if (catName.includes('grain') || catName.includes('cereal')) return 'http://localhost:5173/cat_grains.jpg';
    if (catName.includes('vegetable')) return 'http://localhost:5173/cat_vegetables.jpg';
    if (catName.includes('livestock')) return 'http://localhost:5173/cat_livestock.jpg';
    if (catName.includes('seed')) return 'http://localhost:5173/cat_seeds.jpg';
    return 'http://localhost:5173/avocados.jpg';
  };

  // Save Product Submit (Publish or Draft)
  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    if (!form.category) {
      alert('Please select a product category.');
      return;
    }

    const formUnit = form.unit.toLowerCase();
    const validUnits = ['kg', 'bag', 'litre', 'head', 'crate'];
    const backendUnit = validUnits.includes(formUnit) ? formUnit : 'kg';

    let productImageUrl = '';
    if (form.images && form.images.length > 0) {
      const firstImage = form.images[0];
      if (firstImage.file) {
        try {
          const uploadRes = await api.uploadFile(firstImage.file);
          productImageUrl = uploadRes.image_url;
        } catch (uploadErr) {
          alert('Failed to upload image. Please try again.');
          return;
        }
      } else {
        productImageUrl = firstImage.url;
      }
    } else {
      productImageUrl = getProductImage(form.name, form.category);
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      unit: backendUnit,
      quantity_available: parseFloat(form.quantity_available),
      county: form.county,
      category: parseInt(form.category) || null,
      image_url: productImageUrl,
      is_active: !isDraft
    };

    try {
      if (editId) {
        await api.updateProduct(editId, payload);
      } else {
        await api.createProduct(payload);
      }
      resetForm();
      load();
    } catch (err) {
      const msg = err.data ? Object.values(err.data).flat().join(', ') : err.message;
      alert('Failed to publish product: ' + (msg || 'Validation error'));
    }
  };


  const handleResetForm = () => {
    setForm({
      name: '',
      category: '',
      description: '',
      price: '',
      quantity_available: '',
      unit: 'Kg',
      harvest_date: '',
      expiry_date: '',
      county: '',
      sub_county: '',
      town_village: '',
      status: 'Available',
      images: []
    });
  };

  // Stock update shortcuts
  const handleUpdateStock = async (p, amount) => {
    const nextVal = Math.max(0, parseFloat(p.quantity_available || 0) + amount);
    const nextStatus = nextVal === 0 ? 'Out of Stock' : (p.status || 'Available');
    try {
      await api.updateProduct(p.id, { 
        quantity_available: nextVal,
        status: nextStatus
      });
      load();
    } catch {
      alert('Failed to update stock quantity.');
    }
  };

  const handleMarkOutOfStock = async (p) => {
    try {
      await api.updateProduct(p.id, { 
        quantity_available: 0,
        status: 'Out of Stock'
      });
      load();
    } catch {
      alert('Failed to update product availability.');
    }
  };

  // Product Stats
  const totalCount = products.length;
  const availableCount = products.filter(p => Number(p.quantity_available) > 20).length;
  const lowStockCount = products.filter(p => Number(p.quantity_available) >= 1 && Number(p.quantity_available) <= 20).length;
  const soldCount = products.filter(p => Number(p.quantity_available) === 0).length;

  // Filter & Search Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory ? (p.category?.toString() === filterCategory || p.category_name === filterCategory) : true;
    
    let matchesStock = true;
    const qty = Number(p.quantity_available || 0);
    if (filterStock === 'available') {
      matchesStock = qty > 20;
    } else if (filterStock === 'low') {
      matchesStock = qty >= 1 && qty <= 20;
    } else if (filterStock === 'outofstock') {
      matchesStock = qty === 0;
    } else if (filterStock === 'draft') {
      matchesStock = p.status === 'Draft';
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'newest') return b.id - a.id;
    if (sortBy === 'price_asc') return parseFloat(a.price) - parseFloat(b.price);
    if (sortBy === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
    if (sortBy === 'harvest_date') return new Date(b.harvest_date || 0) - new Date(a.harvest_date || 0);
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (p) => {
    const qty = Number(p.quantity_available || 0);
    
    // 1. Stock / Draft Status
    let stockBadge = null;
    if (p.status === 'Draft' || !p.is_active) {
      stockBadge = (
        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-[10px] font-bold">
          Draft
        </span>
      );
    } else if (qty === 0 || p.status === 'Out of Stock') {
      stockBadge = (
        <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded-full text-[10px] font-bold flex items-center gap-1">
          <XCircle size={10} /> Out of Stock
        </span>
      );
    } else if (qty <= 20) {
      stockBadge = (
        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-bold flex items-center gap-1 animate-pulse">
          <AlertTriangle size={10} /> Low Stock
        </span>
      );
    } else {
      stockBadge = (
        <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-full text-[10px] font-bold flex items-center gap-1">
          <CheckCircle size={10} /> Available
        </span>
      );
    }

    // 2. Approval Status Badge
    let approvalBadge = null;
    if (p.status !== 'Draft' && p.is_active) {
      const approval = p.approval_status || 'pending';
      if (approval === 'pending') {
        approvalBadge = (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold flex items-center gap-1" title="Pending admin review. Your listing will go live once approved.">
            <HelpCircle size={10} /> Pending Review
          </span>
        );
      } else if (approval === 'rejected') {
        approvalBadge = (
          <span 
            className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-200 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-help"
            title={`Rejected: ${p.rejection_reason || 'No reason specified'}. Click edit to modify and resubmit.`}
          >
            <XCircle size={10} /> Rejected ℹ️
          </span>
        );
      } else {
        approvalBadge = (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold flex items-center gap-1">
            <CheckCircle size={10} /> Live on Market
          </span>
        );
      }
    }

    return (
      <div className="flex flex-col gap-1.5 items-start">
        {stockBadge}
        {approvalBadge}
      </div>
    );
  };


  return (
    <>
      <PageHeader
        title="My Products"
        subtitle="Manage and list your agricultural produce"
        action={
          !showForm && (
            <button 
              onClick={() => setShowForm(true)} 
              className="flex items-center gap-2 px-5 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl shadow-lg shadow-green-100 transition-all font-black text-xs uppercase tracking-wider"
            >
              <Plus size={16} strokeWidth={3} /> Add Product
            </button>
          )
        }
      />

      {/* 6. Product Statistics Summary Cards */}
      {!showForm && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Listings</p>
              <h4 className="text-xl font-black text-gray-900 mt-1">{totalCount}</h4>
            </div>
            <div className="h-10 w-10 bg-gray-50 border rounded-xl flex items-center justify-center text-gray-600">
              <SlidersHorizontal size={18} />
            </div>
          </div>

          <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Available Products</p>
              <h4 className="text-xl font-black text-green-700 mt-1">{availableCount}</h4>
            </div>
            <div className="h-10 w-10 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center text-green-700">
              <CheckCircle size={18} />
            </div>
          </div>

          <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Low Stock Products</p>
              <h4 className="text-xl font-black text-amber-700 mt-1">{lowStockCount}</h4>
            </div>
            <div className="h-10 w-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-700">
              <AlertTriangle size={18} />
            </div>
          </div>

          <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sold / Out of Stock</p>
              <h4 className="text-xl font-black text-red-700 mt-1">{soldCount}</h4>
            </div>
            <div className="h-10 w-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-700">
              <XCircle size={18} />
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT FORM */}
      {showForm ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-black text-gray-900">{editId ? 'Edit Product Listing' : 'Publish New Product'}</h2>
              <p className="text-xs text-gray-400 font-bold mt-0.5">Fill out listing details and predict recommended market prices using AgroLink AI.</p>
            </div>
            <button 
              onClick={resetForm} 
              className="p-2 hover:bg-gray-50 border border-gray-150 rounded-xl transition-all text-gray-500 hover:text-gray-800"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={(e) => handleSubmit(e, false)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Hand Form Controls */}
            <div className="space-y-4">
              
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Name</label>
                <input 
                  required 
                  type="text"
                  placeholder="e.g. Tomatoes, Maize, Avocados" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-medium" 
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Category</label>
                <select 
                  required 
                  value={form.category} 
                  onChange={(e) => setForm({ ...form, category: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-bold text-gray-600"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  {categories.length === 0 && (
                    <>
                      <option value="Cereals">Cereals</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Tubers">Tubers</option>
                      <option value="Livestock">Livestock</option>
                      <option value="Seeds">Seeds</option>
                      <option value="Dairy Products">Dairy Products</option>
                      <option value="Poultry">Poultry</option>
                    </>
                  )}
                </select>
              </div>

              {/* Grid: Price and Quantity */}
              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price (KSh per unit)</label>
                  <input 
                    required 
                    type="number" 
                    placeholder="e.g. 120" 
                    value={form.price} 
                    onChange={(e) => setForm({ ...form, price: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-medium" 
                  />
                </div>
                {/* Unit */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unit</label>
                  <select 
                    value={form.unit} 
                    onChange={(e) => setForm({ ...form, unit: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-bold text-gray-600"
                  >
                    {['Kg', 'Bag', 'Sack', 'Crate', 'Piece', 'Ton'].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quantity Available</label>
                <input 
                  required 
                  type="number" 
                  placeholder="e.g. 200" 
                  value={form.quantity_available} 
                  onChange={(e) => setForm({ ...form, quantity_available: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-medium" 
                />
              </div>

              {/* Grid: Harvest & Expiry Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Harvest Date</label>
                  <input 
                    required 
                    type="date" 
                    value={form.harvest_date} 
                    onChange={(e) => setForm({ ...form, harvest_date: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-bold text-gray-600" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expiry Date (Optional)</label>
                  <input 
                    type="date" 
                    value={form.expiry_date} 
                    onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-bold text-gray-600" 
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Description</label>
                <textarea 
                  required 
                  placeholder="Describe quality, variety, farming methods, etc." 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-medium" 
                  rows={3} 
                />
              </div>
            </div>

            {/* Right Hand Form Controls */}
            <div className="space-y-4">
              
              {/* Drag & Drop Image Uploader */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Upload Product Images (Max 5)</label>
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-green-600 rounded-2xl p-6 text-center cursor-pointer hover:bg-green-50/10 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="text-gray-400" size={24} />
                  <p className="text-xs font-bold text-gray-600">Drag & Drop or click to Browse Files</p>
                  <p className="text-[9px] font-medium text-gray-400">Accepted formats: JPG, JPEG, PNG, WEBP</p>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageSelect} 
                    className="hidden" 
                  />
                </div>

                {/* Image Preview Grid */}
                {form.images.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Farm Location (County / Sub-county / Town) */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-150">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Farm Location</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">County</label>
                    <select 
                      required 
                      value={form.county} 
                      onChange={(e) => setForm({ ...form, county: e.target.value })} 
                      className="w-full px-3 py-2 border border-gray-150 rounded-xl outline-none text-xs font-bold text-gray-600 bg-white"
                    >
                      <option value="">County</option>
                      {KENYAN_COUNTIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Sub-county</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Gilgil" 
                      value={form.sub_county} 
                      onChange={(e) => setForm({ ...form, sub_county: e.target.value })} 
                      className="w-full px-3 py-2 border border-gray-150 rounded-xl outline-none text-xs font-medium bg-white" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Town / Village</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Miti Mingi" 
                    value={form.town_village} 
                    onChange={(e) => setForm({ ...form, town_village: e.target.value })} 
                    className="w-full px-3 py-2 border border-gray-150 rounded-xl outline-none text-xs font-medium bg-white" 
                  />
                </div>
              </div>

              {/* Availability Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Availability Status</label>
                <select 
                  value={form.status} 
                  onChange={(e) => setForm({ ...form, status: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-bold text-gray-600"
                >
                  <option value="Available">Available</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Coming Soon">Coming Soon</option>
                </select>
              </div>
            </div>

            {/* Form actions (Publish / Draft / Cancel) */}
            <div className="md:col-span-2 flex flex-wrap gap-2 pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                className="px-6 py-3.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-green-55/20 transition-all flex items-center gap-1.5"
              >
                <CheckCircle size={14} /> Publish Product
              </button>
              <button 
                type="button" 
                onClick={(e) => handleSubmit(e, true)}
                className="px-6 py-3.5 bg-gray-100 hover:bg-gray-250 text-gray-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <Save size={14} /> Save Draft
              </button>
              <button 
                type="button" 
                onClick={handleResetForm}
                className="px-6 py-3.5 bg-white hover:bg-gray-50 border border-gray-150 text-gray-500 font-bold rounded-xl text-xs uppercase tracking-wider transition-all ml-auto"
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* VIEW ALL PRODUCTS LISTINGS */
        <div className="space-y-4">
          
          {/* Filters, Search, and Sort controls */}
          <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search products by name..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-150 rounded-xl outline-none text-xs font-medium focus:ring-2 focus:ring-green-600 focus:bg-white" 
              />
            </div>
            
            {/* Filters selectors */}
            <div className="flex flex-wrap gap-2">
              {/* Category Filter */}
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)} 
                className="px-3 py-2.5 border border-gray-150 rounded-xl text-xs font-bold text-gray-600"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              
              {/* Availability Filter */}
              <select 
                value={filterStock} 
                onChange={(e) => setFilterStock(e.target.value)} 
                className="px-3 py-2.5 border border-gray-150 rounded-xl text-xs font-bold text-gray-600"
              >
                <option value="">All Stock Statuses</option>
                <option value="available">Available (&gt;10)</option>
                <option value="low">Low Stock (1-10)</option>
                <option value="outofstock">Out of Stock</option>
                <option value="draft">Drafts</option>
              </select>

              {/* Sort By Filter */}
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="px-3 py-2.5 border border-gray-150 rounded-xl text-xs font-bold text-gray-600"
              >
                <option value="newest">Recently Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="harvest_date">Harvest Date</option>
              </select>
            </div>
          </div>

          {/* Product Grid / Table */}
          {loading ? <LoadingSpinner /> : (
            <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="p-4">Product Details</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock Quantity</th>
                      <th className="p-4">Harvest Date</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((p) => {
                      const formattedDate = p.harvest_date ? new Date(p.harvest_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A';
                      
                      return (
                        <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-all">
                          {/* Image & Name */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={p.image_url || p.image || '/avocados.jpg'} 
                                alt={p.name} 
                                className="w-10 h-10 rounded-xl object-cover border border-gray-150 shadow-sm" 
                              />
                              <div>
                                <p className="font-extrabold text-gray-900 text-xs">{p.name}</p>
                                <p className="text-[9px] text-gray-400 font-bold mt-0.5 font-mono">ID: #PR{p.id}</p>
                              </div>
                            </div>
                          </td>
                          {/* Category */}
                          <td className="p-4 text-gray-600 font-bold">{p.category_name || 'produce'}</td>
                          {/* Price */}
                          <td className="p-4 font-black text-gray-800">
                            KSh {Number(p.price).toLocaleString()} <span className="text-gray-400 font-medium font-sans">/ {p.unit}</span>
                          </td>
                          {/* Quantity and Inline Adjust controls */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleUpdateStock(p, -10)} 
                                className="px-1.5 py-0.5 bg-gray-50 border border-gray-200 text-gray-500 rounded font-bold hover:bg-gray-100"
                              >
                                -10
                              </button>
                              <span className="font-black text-gray-800 min-w-[30px] text-center">
                                {p.quantity_available} {p.unit}
                              </span>
                              <button 
                                onClick={() => handleUpdateStock(p, 10)} 
                                className="px-1.5 py-0.5 bg-gray-50 border border-gray-200 text-gray-500 rounded font-bold hover:bg-gray-100"
                              >
                                +10
                              </button>
                            </div>
                          </td>
                          {/* Harvest Date */}
                          <td className="p-4 text-gray-500 font-semibold">{formattedDate}</td>
                          {/* Location */}
                          <td className="p-4 text-gray-500 font-bold">{p.county || 'Kenya'}</td>
                          {/* Status */}
                          <td className="p-4">{getStatusBadge(p)}</td>
                          {/* Actions Row */}
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* View Details */}
                              <button 
                                onClick={() => setSelectedProduct(p)} 
                                className="p-2 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                              {/* Edit Listing */}
                              <button 
                                onClick={() => handleEdit(p)} 
                                className="p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all"
                                title="Edit Product"
                              >
                                <Pencil size={14} />
                              </button>
                              {/* Mark out of stock */}
                              {p.quantity_available > 0 && (
                                <button 
                                  onClick={() => handleMarkOutOfStock(p)}
                                  className="p-2 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-all"
                                  title="Mark Out of Stock"
                                >
                                  <XCircle size={14} />
                                </button>
                              )}
                              {/* Delete Listing */}
                              <button 
                                onClick={() => handleDelete(p.id)} 
                                className="p-2 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                                title="Delete Product"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Empty placeholder */}
              {paginatedProducts.length === 0 && (
                <div className="text-center py-12 space-y-2">
                  <p className="text-gray-400 font-bold text-sm">No matching product listings found.</p>
                  <p className="text-[10px] text-gray-400">Try adjusting your filters or list a new product crop.</p>
                </div>
              )}

              {/* 7. Pagination Controls */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100 text-xs font-bold">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 hover:border-gray-300 rounded-xl disabled:opacity-50 text-gray-500 bg-white shadow-sm transition-all"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pg = idx + 1;
                      return (
                        <button 
                          key={pg}
                          onClick={() => setCurrentPage(pg)}
                          className={`px-3 py-1.5 rounded-lg border transition-all ${
                            currentPage === pg 
                              ? 'bg-green-700 text-white border-green-700 shadow-sm shadow-green-600/10' 
                              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {pg}
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 hover:border-gray-300 rounded-xl disabled:opacity-50 text-gray-500 bg-white shadow-sm transition-all"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PRODUCT DETAILS VIEW MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative animate-fade-in text-left">
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-4 right-4 p-2 hover:bg-gray-50 border border-gray-150 rounded-xl text-gray-500 hover:text-gray-800"
            >
              <X size={14} />
            </button>

            {/* Product Image Cover */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-150 shadow-sm">
              <img 
                src={selectedProduct.image_url || selectedProduct.image || '/avocados.jpg'} 
                alt={selectedProduct.name} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-3 right-3">
                {getStatusBadge(selectedProduct)}
              </div>
            </div>

            {/* Header info */}
            <div>
              <span className="text-[10px] font-black text-green-700 bg-green-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                {selectedProduct.category_name || 'Produce'}
              </span>
              <h3 className="text-xl font-black text-gray-900 mt-2">{selectedProduct.name}</h3>
              <p className="text-base font-black text-green-700 mt-1">
                KSh {Number(selectedProduct.price).toLocaleString()} <span className="text-xs text-gray-400 font-bold font-sans">/ {selectedProduct.unit}</span>
              </p>
            </div>

            {/* Detailed Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold bg-gray-50 p-4 rounded-2xl border border-gray-150">
              <div>
                <p className="text-[9px] text-gray-400 uppercase">Stock Quantity</p>
                <p className="text-gray-800 mt-0.5">{selectedProduct.quantity_available} {selectedProduct.unit}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase">Farm Location</p>
                <p className="text-gray-800 mt-0.5">{selectedProduct.county || 'Kenya'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase">Harvest Date</p>
                <p className="text-gray-800 mt-0.5">
                  {selectedProduct.harvest_date ? new Date(selectedProduct.harvest_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase">Perishable</p>
                <p className="text-gray-800 mt-0.5">{selectedProduct.expiry_date ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                {selectedProduct.description || 'No description provided for this listing.'}
              </p>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-150 text-gray-700 font-bold rounded-xl text-xs uppercase"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function MyProducts() {
  return (
    <ProtectedRoute roles={['farmer']}>
      <DashboardLayout><MyProductsContent /></DashboardLayout>
    </ProtectedRoute>
  );
}
