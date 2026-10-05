import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import PublicLayout from './components/layout/PublicLayout';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import 'aos/dist/aos.css';
import 'react-toastify/dist/ReactToastify.css';

import AOS from 'aos';
import { ToastContainer } from 'react-toastify';

// Public pages
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';

// Farmer
import FarmerDashboard from './pages/farmer/Dashboard';
import MyProducts from './pages/farmer/MyProducts';
import FarmerOrders from './pages/farmer/Orders';
import Predictions from './pages/farmer/Predictions';
import Advisory from './pages/farmer/Advisory';
import FarmerChat from './pages/farmer/Chat';
import FarmerDeliveries from './pages/farmer/Deliveries';
import FarmerProfile from './pages/farmer/Profile';
import FarmerSettings from './pages/farmer/Settings';
import TransportRequests from './pages/farmer/TransportRequests';

// Buyer
import BuyerDashboard from './pages/buyer/Dashboard';
import Cart from './pages/buyer/Cart';
import Checkout from './pages/buyer/Checkout';
import BuyerOrders from './pages/buyer/Orders';
import BuyerChat from './pages/buyer/Chat';
import BuyerProfile from './pages/buyer/Profile';
import Wishlist from './pages/buyer/Wishlist';
import BuyerTracking from './pages/buyer/Tracking';
import Payments from './pages/buyer/Payments';
import Reviews from './pages/buyer/Reviews';
import History from './pages/buyer/History';
import Notifications from './pages/buyer/Notifications';

// Transporter
import TransporterDashboard from './pages/transporter/Dashboard';
import TransporterDeliveries from './pages/transporter/Deliveries';
import Tracking from './pages/transporter/Tracking';
import TransporterProfile from './pages/transporter/Profile';
import TransporterChat from './pages/transporter/Chat';
import TransporterRequests from './pages/transporter/Requests';
import Ratings from './pages/transporter/Ratings';
import Reports from './pages/transporter/Reports';
import Settings from './pages/transporter/Settings';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminProducts from './pages/admin/Products';
import AdminReports from './pages/admin/Reports';

// Shared / Escrow Wallet
import Wallet from './pages/shared/Wallet';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/features" element={<Features />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Farmer routes */}
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/farmer/products" element={<MyProducts />} />
            <Route path="/farmer/orders" element={<FarmerOrders />} />
            <Route path="/farmer/predictions" element={<Predictions />} />
            <Route path="/farmer/advisory" element={<Advisory />} />
            <Route path="/farmer/chat" element={<FarmerChat />} />
            <Route path="/farmer/deliveries" element={<FarmerDeliveries />} />
            <Route path="/farmer/profile" element={<FarmerProfile />} />
            <Route path="/farmer/settings" element={<FarmerSettings />} />
            <Route path="/farmer/transport-requests" element={<TransportRequests />} />
            <Route path="/farmer/wallet" element={<Wallet />} />

            {/* Buyer routes */}
            <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
            <Route path="/buyer/cart" element={<Cart />} />
            <Route path="/buyer/checkout" element={<Checkout />} />
            <Route path="/buyer/orders" element={<BuyerOrders />} />
            <Route path="/buyer/chat" element={<BuyerChat />} />
            <Route path="/buyer/profile" element={<BuyerProfile />} />
            <Route path="/buyer/wallet" element={<Wallet />} />
            <Route path="/buyer/wishlist" element={<Wishlist />} />
            <Route path="/buyer/tracking" element={<BuyerTracking />} />
            <Route path="/buyer/payments" element={<Payments />} />
            <Route path="/buyer/reviews" element={<Reviews />} />
            <Route path="/buyer/history" element={<History />} />
            <Route path="/buyer/notifications" element={<Notifications />} />


            {/* Transporter routes */}
            <Route path="/transporter/dashboard" element={<TransporterDashboard />} />
            <Route path="/transporter/requests" element={<TransporterRequests />} />
            <Route path="/transporter/deliveries" element={<TransporterDeliveries />} />
            <Route path="/transporter/tracking" element={<Tracking />} />
            <Route path="/transporter/profile" element={<TransporterProfile />} />
            <Route path="/transporter/chat" element={<TransporterChat />} />
            <Route path="/transporter/ratings" element={<Ratings />} />
            <Route path="/transporter/reports" element={<Reports />} />
            <Route path="/transporter/settings" element={<Settings />} />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
