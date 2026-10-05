import {
  TrendingUp,
  Store,
  Truck,
  MessageCircle,
  ClipboardList,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

const VALUES = [
  {
    icon: '💡',
    title: 'Innovation',
    desc: 'Using modern technology to improve agriculture.',
  },
  {
    icon: '🤝',
    title: 'Trust',
    desc: 'Building transparent and reliable relationships.',
  },
  {
    icon: '🌍',
    title: 'Sustainability',
    desc: 'Supporting environmentally responsible farming.',
  },
  {
    icon: '🏆',
    title: 'Excellence',
    desc: 'Delivering quality services and user experiences.',
  },
  {
    icon: '📈',
    title: 'Growth',
    desc: 'Helping farmers and businesses succeed.',
  },
  {
    icon: '👥',
    title: 'Community',
    desc: 'Connecting people to strengthen agricultural ecosystems.',
  },
];

const OFFERS = [
  {
    title: 'AI Crop Price Prediction',
    desc: 'Analyze historical data and season trends to estimate fair prices.',
    icon: TrendingUp,
  },
  {
    title: 'Smart Digital Marketplace',
    desc: 'Explore, filter, and buy fresh produce directly from local farms.',
    icon: Store,
  },
  {
    title: 'Delivery Coordination',
    desc: 'Coordinate with reliable transporters to manage farm-to-door logistics.',
    icon: Truck,
  },
  {
    title: 'Secure Farmer–Buyer Communication',
    desc: 'Real-time built-in chat system for negotiation and coordination.',
    icon: MessageCircle,
  },
  {
    title: 'Order Management',
    desc: 'Track orders seamlessly from checkout receipt to transit completion.',
    icon: ClipboardList,
  },
  {
    title: 'Real-Time Delivery Tracking',
    desc: 'Check GPS coordinates and delivery statuses in real time.',
    icon: MapPin,
  },
];

const TEAM_MEMBERS = [
  {
    name: 'Valentine Chesang',
    role: 'Lead Developer & Co-Founder',
    bio: 'Valentine leads software engineering at AgroLink, orchestrating the system architecture and crop intelligence modules.',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=300&fit=crop&q=80',
  },
  {
    name: 'Faith Lomuk',
    role: 'Product Manager & Co-Founder',
    bio: 'Faith directs product strategy and field operations, ensuring seamless logistics and community engagement across Kenyan counties.',
    image: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=300&h=300&fit=crop&q=80',
  },
];


export default function About() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 text-left">
      {/* HERO SECTION - NO BACKGROUND IMAGE */}
      <section className="bg-green-900 text-white py-16 px-4 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />
        <div className="max-w-7xl mx-auto text-left relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">About AgroLink</h1>
          <p className="text-green-100 mt-2 text-sm sm:text-base max-w-xl">
            Bridging the gap between Kenyan farms and digital commerce.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-24">
        
        {/* OUR STORY (Alternating section with image) */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-stretch">
          <div className="md:w-1/2 min-h-[300px] relative overflow-hidden bg-gray-50">
            <img
              src="/marketplace_advantage.jpg"
              alt="Local Market Vendor"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>
          <div className="md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-snug">Our Story</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-4 leading-relaxed font-medium">
              AgroLink was developed to address critical challenges in the agricultural sector. For years, local farmers faced limited market access, unfair pricing by middle players, a lack of reliable transportation, and communication barriers. We built AgroLink to resolve these issues, creating a direct, transparent pipeline that connects farmers, buyers, and transporters on one secure digital platform.
            </p>
          </div>
        </section>

        {/* MISSION & VISION (Side-by-side with images) */}
        <section className="grid md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="h-56 relative bg-gray-50 shrink-0">
              <img
                src="/farmer.jpg"
                alt="Kenyan Farmer Smiling"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>
            <div className="p-8 flex-grow">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Our Mission</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-3 leading-relaxed font-medium">
                To empower farmers and transform agricultural trade by providing a smart, secure, and technology-driven marketplace that connects farmers, buyers, and transporters.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="h-56 relative bg-gray-50 shrink-0">
              <img
                src="/irrigation.jpg"
                alt="Crop Irrigation Line"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>
            <div className="p-8 flex-grow">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Our Vision</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-3 leading-relaxed font-medium">
                To become Africa's leading digital agricultural marketplace that promotes sustainable farming, fair trade, and economic growth.
              </p>
            </div>
          </div>
        </section>

        {/* OUR CORE VALUES */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Our Core Values</h2>
            <p className="text-sm text-gray-500 mt-2">
              The fundamental principles that guide our day-to-day services and relationships.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {VALUES.map((val, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col items-start"
              >
                <span className="text-3xl select-none" role="img" aria-label={val.title}>
                  {val.icon}
                </span>
                <h3 className="font-extrabold text-gray-900 text-sm mt-4">{val.title}</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed font-medium">{val.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WHAT AGROLINK OFFERS */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">What AgroLink Offers</h2>
            <p className="text-sm text-gray-500 mt-2">
              Explore the key operations structured to simplify trade and logistics.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {OFFERS.map((off, index) => {
              const Icon = off.icon;
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="h-10 w-10 bg-green-50 text-green-700 rounded-xl flex items-center justify-center mb-4 border border-green-100/50">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-extrabold text-gray-900 text-sm leading-snug">{off.title}</h3>
                    <p className="text-xs text-gray-500 mt-3 leading-relaxed font-medium">{off.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-[10px] text-green-600 font-bold select-none">
                    <CheckCircle2 size={12} className="text-green-600" /> Core Feature
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* MEET THE TEAM */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Meet the Team</h2>
            <p className="text-sm text-gray-500 mt-2">
              The creative professionals designing, building, and operating the platform.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {TEAM_MEMBERS.map((member, index) => (

              <div
                key={index}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col h-full"
              >
                {/* Profile Photo */}
                <div className="h-52 relative bg-gray-50 shrink-0 select-none">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                </div>
                {/* Info Block */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">{member.name}</h3>
                    <p className="text-xs text-green-700 font-bold mt-1 uppercase tracking-wider">{member.role}</p>
                    <p className="text-xs text-gray-500 mt-3 leading-relaxed font-medium italic">
                      &ldquo;{member.bio}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
