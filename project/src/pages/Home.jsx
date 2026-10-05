import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWheatAwn, faTruckFast, faHandshake, faBrain } from '@fortawesome/free-solid-svg-icons';
import { FaTractor, FaStore, FaTruckMoving, FaRobot } from 'react-icons/fa';
import {
  ArrowRight,
  Leaf,
  TrendingUp,
  Users,
  Truck,
  Star,
  CloudRain,
  ShoppingCart,
  MessageSquare,
  Play,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  X,
} from 'lucide-react';
import api from '../api/client';


const formatKES = (val) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(val);

// High-quality local featured products
const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: 'Dry White Maize',
    price: 4500,
    unit: 'bag',
    county: 'Nakuru',
    image_url: '/maize.jpg', // Local maize image
    category_name: 'Grains',
    farmer_name: 'James Kamau',
  },
  {
    id: 2,
    name: 'Irish Molo Potatoes',
    price: 1800,
    unit: 'bag',
    county: 'Nakuru',
    image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80',
    category_name: 'Tubers',
    farmer_name: 'Mary Wanjiku',
  },
  {
    id: 3,
    name: 'Beef Tomatoes',
    price: 3200,
    unit: 'crate',
    county: 'Kirinyaga',
    image_url: '/tomatoes.jpg', // Local tomatoes image
    category_name: 'Vegetables',
    farmer_name: 'Peter Mwangi',
  },
  {
    id: 4,
    name: 'Hass Avocados',
    price: 80,
    unit: 'kg',
    county: 'Meru',
    image_url: '/avocados.jpg', // Local avocados image
    category_name: 'Fruits',
    farmer_name: 'Alice Koech',
  },
  {
    id: 5,
    name: 'Red Bulb Onions',
    price: 90,
    unit: 'kg',
    county: 'Kajiado',
    image_url: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&q=80',
    category_name: 'Vegetables',
    farmer_name: 'Wilson Kiprop',
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    api.getFeaturedProducts()
      .then((data) => {
        if (data && data.length > 0) {
          // Map local images for maize, tomatoes, and avocados to ensure they display correctly
          const mapped = data.map((p) => {
            const name = p.name.toLowerCase();
            if (name.includes('maize') || name.includes('corn')) {
              return { ...p, image_url: '/maize.jpg' };
            }
            if (name.includes('tomato')) {
              return { ...p, image_url: '/tomatoes.jpg' };
            }
            if (name.includes('avocado')) {
              return { ...p, image_url: '/avocados.jpg' };
            }
            return p;
          });
          setFeatured(mapped.slice(0, 5));
        } else {
          setFeatured(SAMPLE_PRODUCTS);
        }
      })
      .catch(() => setFeatured(SAMPLE_PRODUCTS))
      .finally(() => setLoading(false));
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="bg-white">
      {/* 1. HERO SECTION WITH IMAGE BACKGROUND */}
      <section className="relative min-h-[85vh] flex items-center bg-gray-950 text-white overflow-hidden py-24 sm:py-32">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img
            src="/farmer.jpg"
            alt="Kenyan Farmer holding vegetable basket background"
            className="w-full h-full object-cover object-center scale-105 select-none"
          />
          {/* Deep dark gradient mask for high legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent sm:from-black/80 sm:via-black/50 lg:from-black/75 lg:via-black/45" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full">
          <div className="max-w-2xl text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-950/80 text-green-300 border border-green-800/40 backdrop-blur-sm mb-6">
              <Leaf size={12} className="text-green-400 fill-green-400/20" /> Smart Farmer Marketplace
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-white">
              Empowering <span className="text-green-400">Farmers</span>.<br />
              Connecting <span className="text-green-400">Markets</span>.<br />
              Growing <span className="text-green-400">Prosperity</span>.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-gray-200 leading-relaxed max-w-xl">
              AgroLink is your all-in-one platform to buy, sell, predict prices, get weather-based advice, and connect with trusted partners in agriculture.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/marketplace"
                className="px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-900/30 hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                Explore Marketplace <ArrowRight size={18} />
              </Link>
              <button
                type="button"
                onClick={() => setIsVideoOpen(true)}
                className="px-6 py-3.5 border-2 border-white/80 hover:border-white bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl backdrop-blur-sm transition-all flex items-center gap-2"
              >
                <Play size={16} className="fill-white text-white" /> Watch Video
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OVERLAPPING SUCCESS STATISTICS BAR */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-white rounded-2xl border border-green-100/50 shadow-xl p-6 lg:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 divide-y lg:divide-y-0 lg:divide-x divide-green-50">
          <div className="flex items-center gap-4 py-2 lg:py-0 lg:px-4">
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center text-green-700 shrink-0">
              <Users size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none">10,000+</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Active Farmers</p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-2 lg:py-0 lg:px-6">
            <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 shrink-0">
              <ShoppingCart size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none">5,000+</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Buyers Connected</p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-2 lg:py-0 lg:px-6">
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 shrink-0">
              <Leaf size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none">100+</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Crops & Livestock</p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-2 lg:py-0 lg:px-6">
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 leading-tight">Fast & Reliable</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Delivery Network</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. EVERYTHING YOU NEED IN ONE PLACE SECTION (IMAGES ABOVE DESCRIPTIONS) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Everything You Need in One Place
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Highlights the main advantages of using the AgroLink platform.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-16">
            {[
              {
                title: 'Marketplace',
                desc: 'Buy and sell quality crops and livestock directly.',
                icon: ShoppingCart,
                img: '/marketplace_advantage.jpg', // Local produce market image
              },
              {
                title: 'Price Prediction',
                desc: 'Get AI-powered price predictions and market insights.',
                icon: TrendingUp,
                img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
              },
              {
                title: 'Weather Advice',
                desc: 'Receive real-time weather updates and smart farming advice.',
                icon: CloudRain,
                img: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&q=80',
              },
              {
                title: 'Direct Chat',
                desc: 'Chat directly with buyers, farmers, and partners.',
                icon: MessageSquare,
                img: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=600&q=80',
              },
              {
                title: 'Delivery Coordination',
                desc: 'Efficient delivery solutions from farm to market.',
                icon: Truck,
                img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 interactive-card flex flex-col h-full text-left"
                >
                  {/* Card Image (Placed Above) */}
                  <div className="h-40 overflow-hidden relative bg-gray-50">
                    <img
                      src={f.img}
                      alt={f.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-grow justify-between">
                    <div>
                      <div className="h-9 w-9 bg-green-50 text-green-700 rounded-lg flex items-center justify-center mb-3 shrink-0">
                        <Icon size={18} />
                      </div>
                      <h3 className="font-bold text-base text-gray-900 mb-1">{f.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-0.5 text-green-700 text-xs font-bold hover:text-green-800 transition-colors">
                      Learn more <ArrowRight size={12} className="ml-1" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS PREVIEW (WITH GIVEN IMAGES) */}
      <section className="py-20 bg-green-50/50 border-y border-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div className="text-left">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Featured Products
              </h2>
              <p className="text-gray-500 mt-2">
                Recently listed produce direct from verified local farms
              </p>
            </div>
            <Link
              to="/marketplace"
              className="text-green-700 font-semibold hover:underline flex items-center gap-1 shrink-0 transition-colors hover:text-green-800"
            >
              Explore all products <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-80 bg-white rounded-2xl border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {featured.map((p) => (
                <div
                  key={p.id}
                  className="group bg-white rounded-2xl border border-slate-100 overflow-hidden interactive-card flex flex-col h-full"
                >
                  <div className="aspect-square overflow-hidden bg-gray-50 relative">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-green-700 text-white text-[10px] uppercase tracking-wider font-extrabold rounded-full">
                      {p.category_name || 'Produce'}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-grow text-left">
                    <p className="text-xs text-gray-400 font-medium mb-1">
                      {p.county} County
                    </p>
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-green-700 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-green-700 font-black text-base mt-1">
                      {formatKES(p.price)}
                      <span className="text-xs text-gray-400 font-normal">/{p.unit}</span>
                    </p>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50 text-xs text-gray-500">
                      <div className="h-6 w-6 rounded-full bg-green-50 flex items-center justify-center font-bold text-green-700 text-[10px] shrink-0">
                        {p.farmer_name ? p.farmer_name.split(' ').map(n => n[0]).join('') : 'F'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-gray-700 truncate">
                          {p.farmer_name || 'Farmer'}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">Verified Seller</p>
                      </div>
                    </div>

                    <Link
                      to="/marketplace"
                      className="w-full mt-4 py-2 bg-green-50 hover:bg-green-700 hover:text-white text-green-700 font-semibold rounded-lg text-xs transition-all text-center block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. OUR SERVICES SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Services</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Introducing the major features and smart services offered by AgroLink.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Digital Marketplace',
                desc: 'A direct portal connecting buyers, transporters, and farmers without middle-men. Browse listings, negotiate, and transact securely.',
                icon: ShoppingCart,
              },
              {
                title: 'AI Price Prediction',
                desc: 'Analyze current crops and county pricing trends. Get projections for the next 1-8 weeks to optimize your buying and selling schedules.',
                icon: TrendingUp,
              },
              {
                title: 'Weather Advisories',
                desc: 'Receive local county weather forecasts and real-time smart farming advisories tailored to crop types and atmospheric conditions.',
                icon: CloudRain,
              },
              {
                title: 'Delivery Coordination',
                desc: 'We automatically dispatch transporter jobs upon order verification. Features integrated tracking from farm pickup to buyer dropoff.',
                icon: Truck,
              },
              {
                title: 'Secure Messaging',
                desc: 'Built-in real-time discussion boards for farmers and buyers to coordinate order details, request photos, and negotiate terms.',
                icon: MessageSquare,
              },
              {
                title: 'Reliability Ratings',
                desc: 'Account verification, order success tracking, and buyer reviews build trust scores for farmers to ensure high quality.',
                icon: ShieldCheck,
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-green-100 shadow-sm hover:shadow-md transition-all text-left group"
                >
                  <div className="h-12 w-12 bg-green-50 text-green-700 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-700 group-hover:text-white transition-colors duration-300">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. SUCCESS STATISTICS SECTION */}
      <section className="py-20 bg-green-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Our Platform Milestones</h2>
          <p className="mt-4 text-green-100 text-base max-w-lg mx-auto">
            Delivering trust, efficiency, and intelligence to agricultural supply chains in Kenya.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 mt-16">
            {[
              { label: 'Registered Farmers', value: '2,500+' },
              { label: 'Products Listed', value: '15,000+' },
              { label: 'Successful Orders', value: '50,000+' },
              { label: 'Deliveries Completed', value: '48,000+' },
            ].map((stat, i) => (
              <div key={i} className="p-4">
                <p className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-green-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            What Our Users Say
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto mb-16">
            Hear from verified farmers, buyers, and transporters using AgroLink.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: 'AgroLink helped me sell my maize directly to buyers at a better price. I no longer rely on brokers who underpay me.',
                name: 'John K.',
                role: 'Maize Farmer, Nakuru',
                img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
              },
              {
                text: 'As a restaurant owner, sourcing fresh vegetables used to be stressful. Now I buy directly, track my delivery, and pay via M-Pesa.',
                name: 'Sarah M.',
                role: 'Restaurant Owner, Nairobi',
                img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
              },
              {
                text: 'The coordinated dispatching gives me steady delivery jobs. I pick up straight from farms and deliver locally around Molo.',
                name: 'David O.',
                role: 'Transporter, Eldoret',
                img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex gap-1 text-amber-500 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} className="fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic text-sm leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-50">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="h-10 w-10 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. LATEST AGRICULTURAL NEWS & TIPS (WITH GIVEN IMAGES) */}
      <section className="py-20 bg-green-50/50 border-t border-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Farming Insights & Tips
            </h2>
            <p className="text-gray-500 mt-2">
              Stay ahead with news, agronomy tips, and market trends
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                category: 'Planting Tips',
                title: 'Best Planting Practices for the Rainy Season',
                desc: 'Learn soil preparation techniques, fertilizer timing, and proper spacing to maximize maize yields during long rains.',
                img: '/farmer.jpg', // Local farmer/planting image
                date: 'July 15, 2026',
              },
              {
                category: 'Market Trends',
                title: 'Seasonal Crop Price Cycles in Kenya',
                desc: 'Understand historical price drops during harvest seasons and learn how storage can help you sell at peak prices.',
                img: '/maize.jpg', // Local maize image
                date: 'July 12, 2026',
              },
              {
                category: 'Soil Management',
                title: 'Smart Water & Irrigation Management',
                desc: 'Drip irrigation techniques and organic mulching processes to sustain potato crops during dry season dry windows.',
                img: '/irrigation.jpg', // Local irrigation image
                date: 'July 10, 2026',
              },
            ].map((n, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 interactive-card flex flex-col text-left h-full"
              >
                <div className="h-48 overflow-hidden">
                  <img src={n.img} alt={n.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-green-700 font-semibold mb-3">
                      <span>{n.category}</span>
                      <span className="text-gray-400 font-normal">{n.date}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2 leading-snug">
                      {n.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {n.desc}
                    </p>
                  </div>
                  <Link
                    to="/features"
                    className="mt-6 text-sm font-semibold text-green-700 hover:text-green-800 flex items-center gap-1 w-fit"
                  >
                    Read article <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-gray-500">
              Clear answers to the most common questions about the AgroLink marketplace.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How do I register on AgroLink?',
                a: "To get started, click the 'Sign Up' button in the navigation bar. You will select your role: Farmer (to list and sell produce), Buyer (to purchase products), or Transporter (to find delivery jobs), and enter your basic contact details including your county location.",
              },
              {
                q: 'How do buyers place and pay for orders?',
                a: 'Buyers can search the Marketplace, filter by category or county, and add products to their shopping cart. During checkout, you can specify your delivery address and choose between Cash on Delivery or simulated M-Pesa payment.',
              },
              {
                q: 'How are deliveries arranged and tracked?',
                a: "Once a buyer places an order, the system creates a delivery record. A registered transporter accepts the delivery job, handles the pickup from the farm, and completes the dropoff. Both buyers and farmers can view real-time shipping status (e.g. 'In Transit', 'Delivered') from their dashboards.",
              },
              {
                q: 'Is AgroLink free to use?',
                a: 'Yes, registration, browsing, and product listings are completely free. Transporters pay a nominal platform fee per delivery job, which is included in the estimated delivery fee presented to buyers during checkout.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-gray-100 rounded-xl overflow-hidden shadow-sm transition-colors duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 text-left font-bold text-gray-800 hover:text-green-700 bg-gray-50/50 hover:bg-gray-50 flex items-center justify-between"
                >
                  <span className="pr-4">{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp size={18} className="text-green-700 shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400 shrink-0" />
                  )}
                </button>
                {activeFaq === idx && (
                  <div className="px-6 py-5 bg-white border-t border-gray-50 text-left text-sm text-gray-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CALL-TO-ACTION (CTA) SECTION */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-800 to-green-950" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />
          <div className="relative py-16 px-8 sm:px-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Ready to Transform Your Farming Experience?
            </h2>
            <p className="mt-6 text-green-100 text-sm sm:text-base leading-relaxed">
              Join thousands of Kenyan farmers, buyers, and transporters on the smart agricultural marketplace. Predict market prices, coordinate deliveries, and transact securely.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-3.5 bg-white text-green-800 font-bold rounded-xl hover:bg-green-50 shadow-md transition-all transform hover:-translate-y-0.5"
              >
                Register Now
              </Link>
              <Link
                to="/marketplace"
                className="px-8 py-3.5 border-2 border-white/40 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
              >
                Explore Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO MODAL WINDOW */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video border border-gray-800">
            {/* Close Button */}
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black text-white hover:text-red-500 rounded-full transition-colors"
              aria-label="Close video"
            >
              <X size={20} />
            </button>

            {/* Video Player */}
            <video
              className="w-full h-full object-cover"
              controls
              autoPlay
              src="https://assets.mixkit.co/videos/preview/mixkit-organic-vegetables-in-a-basket-41901-large.mp4"
            />
          </div>
        </div>
      )}
    </div>
  );
}
