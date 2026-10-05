import {
  TrendingUp,
  Store,
  Truck,
  MessageCircle,
  CloudRain,
  CreditCard,
  ClipboardList,
  MapPin,
  ShieldCheck,
  Bell,
  CheckCircle2,
} from 'lucide-react';

const FEATURES_DATA = [
  {
    title: 'AI Crop Price Prediction',
    description: 'The AI module analyzes historical market trends and recommends competitive selling prices, helping farmers make informed pricing decisions and maximize profits.',
    icon: TrendingUp,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    highlights: [
      'AI-generated price recommendations',
      'Market trend analysis',
      'Better pricing decisions',
    ],
  },
  {
    title: 'Digital Marketplace',
    description: 'Farmers can list agricultural products while buyers browse, search, and purchase directly through the platform.',
    icon: Store,
    image: '/marketplace_advantage.jpg',
    highlights: [
      'Product listings',
      'Search and filtering',
      'Product categories',
      'Secure ordering',
    ],
  },
  {
    title: 'Smart Delivery Management',
    description: 'Transporters receive delivery requests, update delivery status, and ensure products reach buyers efficiently.',
    icon: Truck,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80',
    highlights: [
      'Delivery requests',
      'Route coordination',
      'Delivery status tracking',
    ],
  },
  {
    title: 'Secure Farmer–Buyer Chat',
    description: 'Built-in messaging enables farmers and buyers to communicate directly about product availability, pricing, and delivery arrangements.',
    icon: MessageCircle,
    image: '/feat_chat_mockup.jpg',
    highlights: [
      'Real-time messaging',
      'Price negotiation',
      'Order coordination',
    ],
  },
  {
    title: 'Weather Advisory',
    description: 'Get localized weather forecasts and farming recommendations for your county to optimize planning and harvesting.',
    icon: CloudRain,
    image: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80',
    highlights: [
      'Localized weather forecast',
      'County-specific agronomy tips',
      'Optimal planting guides',
    ],
  },
  {
    title: 'Order Management',
    description: 'The platform simplifies order placement, processing, and tracking from purchase to delivery.',
    icon: ClipboardList,
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80',
    highlights: [
      'Place orders',
      'Track order status',
      'Order history',
    ],
  },
  {
    title: 'Delivery Tracking',
    description: 'Users can monitor deliveries in real time and receive status updates throughout the delivery process.',
    icon: MapPin,
    image: '/feat_map_route.jpg',
    highlights: [
      'Live delivery status',
      'Estimated arrival time',
      'Route updates',
    ],
  },
  {
    title: 'Secure Payments',
    description: 'Pay via secure channels like M-Pesa or Cash on Delivery with full ledger tracking.',
    icon: CreditCard,
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
    highlights: [
      'M-Pesa integration',
      'Cash on delivery support',
      'Transaction ledger tracking',
    ],
  },
  {
    title: 'Secure Authentication',
    description: 'Role-based authentication protects user accounts and ensures secure access to system resources.',
    icon: ShieldCheck,
    image: '/feat_security.jpg',
    highlights: [
      'Secure login',
      'Registration',
      'Password encryption',
      'Role-based permissions',
    ],
  },
  {
    title: 'Notifications',
    description: 'Users receive notifications for important platform activities to stay updated at all times.',
    icon: Bell,
    image: '/feat_notifications.jpg',
    highlights: [
      'New orders',
      'Delivery updates',
      'Messages',
      'Account notifications',
    ],
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* HERO SECTION - WIDE GRAPHIC ASPECT CONTAINER */}
      <section className="relative w-full aspect-[21/9] sm:aspect-[2.2/1] md:aspect-[2.35/1] shadow-md overflow-hidden bg-gray-950">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/feat_hero_bg.jpg"
            alt="AgroLink Platform Features Tour"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </section>

      {/* ALTERNATING FEATURES TOUR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Explore the Platform</h2>
          <p className="text-sm text-gray-500 mt-2">
            Discover how AgroLink streamlines supply chain processes, enhances market pricing transparency, and drives profitability.
          </p>
        </div>

        {FEATURES_DATA.map((feat, index) => {
          const Icon = feat.icon;
          const isReversed = index % 2 === 1;

          return (
            <div
              key={feat.title}
              className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ${
                isReversed ? 'md:flex-row-reverse' : 'md:flex-row'
              } items-stretch transition-all duration-300 hover:shadow-md`}
            >
              {/* Feature Image Block */}
              <div className="md:w-1/2 min-h-[280px] sm:min-h-[350px] relative overflow-hidden bg-gray-50">
                <img
                  src={feat.image}
                  alt={feat.title}
                  className="absolute inset-0 w-full h-full object-cover object-center select-none"
                />
              </div>

              {/* Feature Content Block */}
              <div className="md:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col justify-center text-left">
                <div className="h-12 w-12 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center mb-6 border border-green-100 shadow-xs">
                  <Icon size={24} />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
                  {feat.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-gray-500 mt-4 leading-relaxed font-medium">
                  {feat.description}
                </p>

                {/* Highlights List */}
                <div className="mt-8 space-y-2.5">
                  {feat.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-center gap-2.5 text-xs text-gray-700 font-bold">
                      <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
