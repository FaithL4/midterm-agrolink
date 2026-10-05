import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const FAQ_DATA = [
  {
    question: 'How do I create an account?',
    answer: 'Navigate to the Register page, select your role (Farmer, Buyer, or Transporter), fill in your personal/county information, and submit. You will immediately access your customized platform dashboard.',
  },
  {
    question: 'How can I sell my products?',
    answer: 'Once registered and logged in as a Farmer, go to your dashboard and use the "Upload Product" form. You can add image uploads, descriptions, stock quantities, listed prices, and harvest dates.',
  },
  {
    question: 'How do I place an order?',
    answer: 'As a Buyer, explore the Marketplace page. Use search and advanced category filters to find produce, add items to your cart, click the checkout option inside the cart drawer, and pay securely.',
  },
  {
    question: 'How do I request a transporter?',
    answer: 'During the checkout flow on the marketplace page, you can choose an available transporter based on their service rating and county coordinates. They will receive your order pickup details instantly.',
  },
  {
    question: 'How does AI price prediction work?',
    answer: 'Our Machine Learning models analyze historical market rates, county-specific demand, weather cycles, and seasons to suggest optimal pricing models, protecting farmers from middleman exploitation.',
  },
  {
    question: 'How can I reset my password?',
    answer: 'Click the "Forgot Password" link on the Login page to receive a recovery email, or update your security credentials under your Profile Settings dashboard.',
  },
];

const SOCIALS = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61592057093723',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
      </svg>
    ),
  },
  {
    name: 'Twitter (X)',
    url: 'https://x.com/agrolink',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/agrolink_smart?igsh=MTNzbWxydzdvdjk3Mg==',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/agrolink',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/c/agrolink',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.388.51a3.002 3.002 0 0 0-2.11 2.108C0 8.029 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.475 20.455 12 20.455 12 20.455s7.524 0 9.388-.51a3.002 3.002 0 0 0 2.11-2.108C24 15.972 24 12 24 12s0-3.971-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 text-left">
      {/* HERO SECTION - DEEP SLATE */}
      <section className="bg-slate-950 text-white py-16 px-4 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />
        <div className="max-w-7xl mx-auto text-left relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="text-slate-300 mt-2 text-sm sm:text-base max-w-xl font-medium">
            We&apos;d love to hear from you. Reach out with questions, feedback, or support requests.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-20">
        {/* TOP PANEL: INFO, SUPPORT & FORM */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: INFO & SUPPORT */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6">Support Channels</h2>
              
              {/* Customer Support Channels Cards */}
              <div className="grid gap-4">
                <div className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 bg-green-50 text-green-700 rounded-xl flex items-center justify-center shrink-0 border border-green-100/50">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm">💬 Live Chat</h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                      Talk to our support team online. Chat assistants are ready to guide you.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center shrink-0 border border-blue-100/50">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm">📧 Email Support</h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                      Send a ticket to <a href="mailto:support@agrolink.co.ke" className="text-green-700 hover:underline">support@agrolink.co.ke</a>. Receive response within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center shrink-0 border border-amber-100/50">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm">📞 Phone Support</h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                      Call our customer care team at <a href="tel:+254700123456" className="text-green-700 hover:underline">+254 700 123 456</a> during working hours (8AM - 5PM).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Address */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-xs">
              <div className="h-10 w-10 bg-green-50 text-green-700 rounded-xl flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Office Location</p>
                <p className="text-xs font-bold text-gray-900 mt-0.5">Westlands, Nairobi, Kenya</p>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTACT FORM */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6">Send Us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {sent && (
                <div className="p-4 bg-green-50 text-green-800 rounded-2xl border border-green-100 text-xs font-bold transition-all animate-fade-in">
                  Message sent! We&apos;ll get back to you soon.
                </div>
              )}
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Name</label>
                  <input
                    required
                    placeholder="E.g. Mary Wanjiku"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-medium bg-gray-50/30 focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="E.g. mary@gmail.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-medium bg-gray-50/30 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subject</label>
                <input
                  required
                  placeholder="How can we help you?"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-medium bg-gray-50/30 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-150 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-xs font-medium bg-gray-50/30 focus:bg-white transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow-lg shadow-green-100 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Send size={14} /> Send Message
              </button>
            </form>
          </div>
        </div>

        {/* GOOGLE MAPS LOCATION */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6">Our Office Location</h2>
          <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden shadow-xs border border-gray-100">
            <iframe
              title="AgroLink Office Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8523276686154!2d36.800041285226435!3d-1.2608778990803444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f173c3a116db5%3A0xad29ff85fa193297!2sWestlands%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1710000000000!5m2!1sen!2ske"
              className="w-full h-full border-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Frequently Asked Questions</h2>
            <p className="text-sm text-gray-500 mt-2">
              Browse common answers to get started quickly on AgroLink.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            {FAQ_DATA.map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <div key={i} className="border-b border-gray-150 last:border-b-0 pb-4 last:pb-0">
                  <button
                    type="button"
                    onClick={() => toggleFaq(i)}
                    className="w-full flex items-center justify-between text-left py-3 focus:outline-none group"
                  >
                    <span className="font-extrabold text-sm sm:text-base text-gray-900 group-hover:text-green-700 transition-colors">
                      {faq.question}
                    </span>
                    <span className="text-gray-400 shrink-0 ml-4">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      isOpen ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FOLLOW US */}
        <section className="text-center bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 shadow-xs max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Follow Our Journey</h2>
          <p className="text-sm text-gray-500 mt-2">
            Stay updated with features, tips, and customer stories on our social channels.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {SOCIALS.map((soc, i) => (
              <a
                key={i}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 w-12 bg-gray-50 hover:bg-green-50 text-gray-500 hover:text-green-700 rounded-2xl flex items-center justify-center border border-gray-100 hover:border-green-100 transition-all transform hover:-translate-y-1"
                title={soc.name}
              >
                {soc.icon}
              </a>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
