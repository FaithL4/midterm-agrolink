import { Link } from 'react-router-dom';
import {
  UserPlus,
  Settings,
  UploadCloud,
  TrendingUp,
  Search,
  ShoppingCart,
  MessageSquare,
  CheckCircle2,
  Truck,
  MapPin,
  CheckSquare,
  Star,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

const STEPS_DATA = [
  {
    step: 1,
    title: 'Register Your Account',
    desc: 'Create an AgroLink account as a Farmer, Buyer, or Transporter and securely log in to access your personalized dashboard.',
    icon: UserPlus,
  },
  {
    step: 2,
    title: 'Set Up Your Profile',
    desc: 'Add your personal information, location, contact details, and profile picture to build trust within the AgroLink community.',
    icon: Settings,
  },
  {
    step: 3,
    title: 'Upload Agricultural Products',
    desc: 'Farmers upload crops or livestock with images, descriptions, quantities, prices, and availability.',
    icon: UploadCloud,
  },
  {
    step: 4,
    title: 'Receive AI Price Suggestions',
    desc: 'The AI system analyzes market trends and recommends competitive prices to help farmers maximize profits.',
    icon: TrendingUp,
  },
  {
    step: 5,
    title: 'Explore the Marketplace',
    desc: 'Buyers browse products, compare prices, search by category or location, and view product details.',
    icon: Search,
  },
  {
    step: 6,
    title: 'Order Fresh Produce',
    desc: 'Buyers place orders securely through the AgroLink marketplace.',
    icon: ShoppingCart,
  },
  {
    step: 7,
    title: 'Communicate Securely 💬',
    desc: 'Buyers and farmers communicate through the built-in messaging system to discuss product availability, negotiate prices, and coordinate delivery.',
    icon: MessageSquare,
  },
  {
    step: 8,
    title: 'Farmer Confirms Order',
    desc: 'The farmer confirms order details, accepts the assignment, and prepares the fresh harvest for transporter pickup.',
    icon: CheckCircle2,
  },
  {
    step: 9,
    title: 'Arrange Delivery',
    desc: 'Transporters receive delivery requests, accept assignments, and prepare products for transportation.',
    icon: Truck,
  },
  {
    step: 10,
    title: 'Monitor Delivery Progress',
    desc: 'Both farmers and buyers can track deliveries in real time and receive delivery status updates.',
    icon: MapPin,
  },
  {
    step: 11,
    title: 'Successful Delivery ✅',
    desc: 'The buyer receives the products, confirms delivery, and the order is marked as completed.',
    icon: CheckSquare,
  },
  {
    step: 12,
    title: 'Share Your Experience ⭐',
    desc: 'Buyers can rate products and leave reviews to help other users make informed purchasing decisions.',
    icon: Star,
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* HERO SECTION WITH IMAGE ON RIGHT */}
      <section className="bg-gradient-to-r from-green-800 to-green-950 text-white py-12 sm:py-16 px-4 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none select-none" />
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-8 items-center relative z-10 text-left">
          {/* Left Column: Description */}
          <div className="md:col-span-7 space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">How AgroLink Works</h1>
            <p className="text-green-100 text-sm sm:text-base max-w-xl leading-relaxed font-medium">
              A comprehensive, transparent guide to buying, selling, and coordinating delivery on our platform.
            </p>
          </div>
          
          {/* Right Column: Supply Chain Graphic Card */}
          <div className="md:col-span-5 aspect-[16/10] sm:aspect-[2.1/1] md:aspect-auto md:h-64 rounded-2xl overflow-hidden shadow-xl border border-green-700/30 bg-green-900/10">
            <img
              src="/how_it_works_bg.jpg"
              alt="AgroLink Supply Chain Process"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* TIMELINE STEPS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-left">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Your Step-by-Step Guide</h2>
          <p className="text-sm text-gray-500 mt-2">
            Follow these transparent phases to transact and grow within the AgroLink ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {STEPS_DATA.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                {/* Number Badge */}
                <div className="absolute -top-3 -right-3 h-8 w-8 bg-green-50 text-green-700 border border-green-100 font-extrabold text-xs rounded-full flex items-center justify-center shadow-xs">
                  {step.step}
                </div>

                <div>
                  {/* Icon Block */}
                  <div className="h-10 w-10 bg-green-50 text-green-700 rounded-xl flex items-center justify-center mb-4 border border-green-100/50 group-hover:scale-105 transition-transform">
                    <Icon size={20} />
                  </div>

                  <h3 className="font-extrabold text-gray-900 text-sm leading-snug group-hover:text-green-700 transition-colors">
                    {step.title}
                  </h3>
                  
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>

                {step.step < 12 && (
                  <div className="mt-4 flex items-center gap-1 text-[10px] text-green-700 font-bold hover:underline select-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    Next Step <ChevronRight size={10} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Call to Action Section */}
        <div className="mt-16 bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 text-center shadow-sm max-w-4xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900">Ready to simplify your agricultural trade?</h3>
          <p className="text-sm text-gray-500 mt-3 max-w-lg mx-auto">
            Join thousands of Kenyan farmers, buyers, and transporters transacting securely on AgroLink.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/register"
              className="px-8 py-3.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow-lg shadow-green-100 flex items-center gap-2"
            >
              Get Started Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
