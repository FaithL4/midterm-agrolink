import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Send, Paperclip, Smile, Search, Truck, Eye, MessageSquare, 
  Check, CheckCheck, MoreVertical, User, ArrowLeft, Phone, 
  Video, MapPin, Camera, Image, Mic, Sliders, Bell, Star, ChevronDown, 
  RefreshCw, Plus, X, Trash2, Copy, CornerUpLeft, Play, Pause, ShieldCheck, FileText, Download, PhoneCall, AlertTriangle, Clock, Leaf
} from 'lucide-react';
import { LoadingSpinner } from '../../components/layout/DashboardLayout';
import { ProtectedRoute, useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const MOCK_CONVERSATIONS = [
  {
    id: 'ORD-1254',
    name: 'Tomatoes (500 Kg)',
    buyer_name: 'John Mwangi',
    farmer_name: 'Green Valley Farm',
    transporter_name: 'Peter Karanja',
    role: 'transporter',
    online: true,
    unread: 1,
    timestamp: '10:14 AM',
    status: 'active',
    lastMessage: 'Peter (Driver) is arriving in 18 minutes.',
    messages: [
      { id: 101, sender: 'John Mwangi', sender_role: 'buyer', content: 'Hello, is the tomato harvest ready for order #1254?', time: '09:00 AM', read: true },
      { id: 102, sender: 'farmer', sender_role: 'farmer', content: 'Yes! We harvested 500 Kg of premium greenhouse tomatoes this morning.', time: '09:05 AM', read: true },
      { id: 103, sender: 'John Mwangi', sender_role: 'buyer', content: 'Great, I have processed the payment through M-Pesa escrow.', time: '09:10 AM', read: true },
      { id: 104, sender: 'system', sender_role: 'system', content: 'Payment Confirmed: KES 25,000 held in Escrow.', time: '09:12 AM', read: true },
      { id: 105, sender: 'system', sender_role: 'system', content: 'Farmer requested transport. Peter Karanja accepted.', time: '09:30 AM', read: true },
      { id: 106, sender: 'Peter Karanja', sender_role: 'transporter', content: 'Hello everyone! I have loaded my Toyota Dyna (KDA 123A) and I am heading to your Nakuru farm now.', time: '09:35 AM', read: true },
      { id: 107, sender: 'farmer', sender_role: 'farmer', content: 'Excellent, we are ready for you here.', time: '09:40 AM', read: true },
      { id: 108, sender: 'Peter Karanja', sender_role: 'transporter', content: 'Hi John, I\'ve arrived at the farm.', time: '10:10 AM', read: true },
      { id: 109, sender: 'John Mwangi', sender_role: 'buyer', content: 'Great! Let me bring the tomatoes out.', time: '10:11 AM', read: true },
      { id: 110, sender: 'Peter Karanja', sender_role: 'transporter', content: 'Okay, I\'m ready.', time: '10:12 AM', read: true }
    ],
    order: { 
      order_id: 'ORD-1254', 
      product: 'Tomatoes', 
      quantity: '500 Kg', 
      status: 'In Transit',
      pickup_location: 'Green Valley Farm, Nakuru',
      delivery_location: 'Westlands, Nairobi',
      product_image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&q=80',
      eta: '18 mins',
      delivery_fee: 2500
    },
    shared_files: [
      { id: 1, name: 'Escrow-Receipt-1254.pdf', size: '142 KB', type: 'document', url: '#' },
      { id: 2, name: 'Tomatoes-Crops-BatchA.jpg', size: '1.2 MB', type: 'image', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80' },
      { id: 3, name: 'Logistics-Invoice.pdf', size: '89 KB', type: 'document', url: '#' }
    ]
  },
  {
    id: 'ORD-1208',
    name: 'Onions (300 Kg)',
    buyer_name: 'Grace Wanjiku',
    farmer_name: 'Nyeri Farms Co.',
    transporter_name: 'Francis Njoroge',
    role: 'transporter',
    online: false,
    unread: 0,
    timestamp: 'Yesterday',
    status: 'completed',
    lastMessage: 'Grace Wanjiku confirmed receipt of onions.',
    messages: [
      { id: 201, sender: 'Grace Wanjiku', sender_role: 'buyer', content: 'Are the red onions ready for dispatch?', time: '10:00 AM', read: true },
      { id: 202, sender: 'farmer', sender_role: 'farmer', content: 'Yes, all 300 Kg are bagged and ready.', time: '10:15 AM', read: true },
      { id: 203, sender: 'system', sender_role: 'system', content: 'Delivery completed.', time: '04:00 PM', read: true }
    ],
    order: {
      order_id: 'ORD-1208',
      product: 'Red Onions',
      quantity: '300 Kg',
      status: 'Delivered',
      pickup_location: 'Nyeri Town, Nyeri',
      delivery_location: 'Kasarani, Nairobi',
      product_image: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=200&q=80',
      eta: 'Completed',
      delivery_fee: 1800
    },
    shared_files: []
  },
  {
    id: 'ORD-1187',
    name: 'Potatoes (1 Ton)',
    buyer_name: 'Peter Karanja',
    farmer_name: 'Molo Highland Growers',
    transporter_name: 'Simon Mwangi',
    role: 'transporter',
    online: false,
    unread: 0,
    timestamp: '2 days ago',
    status: 'completed',
    lastMessage: 'Delivery of 1 Ton Potatoes is complete.',
    messages: [
      { id: 301, sender: 'farmer', sender_role: 'farmer', content: 'Potatoes are sorted and ready.', time: '08:00 AM', read: true }
    ],
    order: {
      order_id: 'ORD-1187',
      product: 'Irish Potatoes',
      quantity: '1 Ton',
      status: 'Delivered',
      pickup_location: 'Molo, Nakuru',
      delivery_location: 'Eastleigh, Nairobi',
      product_image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&q=80',
      eta: 'Completed',
      delivery_fee: 5000
    },
    shared_files: []
  },
  {
    id: 'ORD-1165',
    name: 'Cabbages (250 Kg)',
    buyer_name: 'Joseph Kamau',
    farmer_name: 'Kinangop Fresh',
    transporter_name: 'Alex Kiprop',
    role: 'transporter',
    online: false,
    unread: 0,
    timestamp: '3 days ago',
    status: 'archived',
    lastMessage: 'Cabbages delivered and chat archived.',
    messages: [
      { id: 401, sender: 'farmer', sender_role: 'farmer', content: 'Harvesting cabbages now.', time: '09:00 AM', read: true }
    ],
    order: {
      order_id: 'ORD-1165',
      product: 'Cabbages',
      quantity: '250 Kg',
      status: 'Archived',
      pickup_location: 'Kinangop, Nyandarua',
      delivery_location: 'Gikomba Market, Nairobi',
      product_image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=200&q=80',
      eta: 'Archived',
      delivery_fee: 1500
    },
    shared_files: []
  },
  {
    id: 'ORD-1152',
    name: 'Carrots (200 Kg)',
    buyer_name: 'Mary Atieno',
    farmer_name: 'Limuru Organic Farm',
    transporter_name: 'David Ochieng',
    role: 'transporter',
    online: false,
    unread: 0,
    timestamp: '5 days ago',
    status: 'archived',
    lastMessage: 'Trip completed. Escrow released.',
    messages: [
      { id: 501, sender: 'farmer', sender_role: 'farmer', content: 'Carrots are ready.', time: '11:00 AM', read: true }
    ],
    order: {
      order_id: 'ORD-1152',
      product: 'Carrots',
      quantity: '200 Kg',
      status: 'Archived',
      pickup_location: 'Limuru, Kiambu',
      delivery_location: 'Mombasa Road, Nairobi',
      product_image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&q=80',
      eta: 'Archived',
      delivery_fee: 1200
    },
    shared_files: []
  }
];

const formatRole = (role) => {
  if (!role) return '';
  if (role.toLowerCase() === 'transporter') return 'Driver';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

function TransporterChatContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State variables
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Conversations Filters
  const [filterTab, setFilterTab] = useState('all'); // all, active, completed, archived
  const [searchQuery, setSearchQuery] = useState('');
  
  // High-Fidelity Messages Features
  const [callingType, setCallingType] = useState(null); // voice, video, or null
  const [emojiPanelOpen, setEmojiPanelOpen] = useState(false);
  const [messageSearchOpen, setMessageSearchOpen] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [lightboxImageUrl, setLightboxImageUrl] = useState(null);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);

  const bottomRef = useRef(null);
  const wsRef = useRef(null);

  const getChatAvatar = (conv) => {
    if (!conv) return '';
    if (conv.id === 'ORD-1254') return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'; // John Mwangi (Buyer)
    if (conv.id === 'ORD-1208') return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80';
    if (conv.id === 'ORD-1187') return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80';
    return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80";
  };

  useEffect(() => {
    const targetId = location.state?.activeConvId;
    api.getConversations()
      .then((d) => {
        const convs = d.results || d || [];
        if (convs.length > 0) {
          const combined = [...MOCK_CONVERSATIONS];
          convs.forEach(c => {
            if (!combined.some(x => String(x.id) === String(c.id))) {
              combined.push(c);
            }
          });
          setConversations(combined);
          const found = combined.find(c => String(c.id) === String(targetId)) || combined[0];
          setActiveConv(found);
          setMessages(found?.messages || found?.content || []);
        } else {
          setConversations(MOCK_CONVERSATIONS);
          const found = MOCK_CONVERSATIONS.find(c => String(c.id) === String(targetId)) || MOCK_CONVERSATIONS[0];
          setActiveConv(found);
          setMessages(found?.messages || []);
        }
      })
      .catch(() => {
        setConversations(MOCK_CONVERSATIONS);
        const found = MOCK_CONVERSATIONS.find(c => String(c.id) === String(targetId)) || MOCK_CONVERSATIONS[0];
        setActiveConv(found);
        setMessages(found?.messages || []);
      })
      .finally(() => setLoading(false));
  }, [location.state]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WebSocket Chat Connection
  useEffect(() => {
    if (!activeConv || String(activeConv.id).startsWith('ORD-')) return;

    const token = localStorage.getItem('access_token');
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProto}//127.0.0.1:8000/ws/chat/${activeConv.id}/?token=${token}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const msgId = data.id || data.message?.id || Date.now();
        const msgSender = data.sender_role || data.message?.sender_role || data.sender || data.message?.sender || 'system';
        const msgContent = data.text || data.content || data.message?.content || data.message?.message || '';
        const msgTime = data.time || data.message?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const msgType = data.message_type || data.message?.message_type || 'text';
        const senderName = data.sender_username || data.message?.sender_name || data.sender_name || 'System';

        const normalizedMsg = {
          id: msgId,
          sender: msgSender,
          sender_role: msgSender,
          sender_name: senderName,
          content: msgContent,
          message: msgContent,
          time: msgTime,
          isLocation: msgType === 'location',
          isPhoto: msgType === 'image',
          isDocument: msgType === 'file',
          text: msgContent
        };

        setMessages(prev => {
          if (prev.find(m => String(m.id) === String(normalizedMsg.id))) return prev;
          return [...prev, normalizedMsg];
        });
      } catch (err) {
        console.error("Error processing real-time message:", err);
      }
    };

    return () => {
      wsRef.current?.close();
    };
  }, [activeConv]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;
    if (activeConv.status === 'archived' || activeConv.status === 'completed') {
      toast.error("This chat room is read-only.");
      return;
    }

    const currentInput = inputMessage;
    setInputMessage('');

    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ message: currentInput }));
      } else {
        try {
          const res = await api.request(`/conversations/${activeConv.id}/send_message/`, {
            method: 'POST',
            body: JSON.stringify({ content: currentInput }),
          });
          setMessages(prev => [...prev, res]);
        } catch (apiErr) {
          const localMsg = {
            id: Date.now(),
            sender: user?.first_name || 'Peter Karanja',
            sender_role: 'transporter',
            content: currentInput,
            message: currentInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            created_at: new Date().toISOString(),
            read: false
          };
          setMessages(prev => [...prev, localMsg]);
        }
      }
    } catch (err) {
      toast.error("Failed to send message.");
    }
  };


  const handleSendSuggestion = (text) => {
    setInputMessage(text);
    setTimeout(() => {
      const submitBtn = document.getElementById('chat-submit-btn');
      if (submitBtn) submitBtn.click();
    }, 100);
  };

  const handleShareLocation = () => {
    if (activeConv.status === 'archived') return;
    const text = "Transporter shared coordinates";
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: text, message_type: 'location' }));
    } else {
      const newLocationMsg = {
        id: Date.now(),
        sender: user?.first_name || 'Peter Karanja',
        sender_role: 'transporter',
        isLocation: true,
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      };
      setMessages(prev => [...prev, newLocationMsg]);
    }
    toast.success("Coordinates shared successfully!");
  };

  const handleSendPhoto = () => {
    if (activeConv.status === 'archived') return;
    const imgUrl = "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80";
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: imgUrl, message_type: 'image' }));
    } else {
      const newMsg = {
        id: Date.now(),
        sender: user?.first_name || 'Peter Karanja',
        sender_role: 'transporter',
        isPhoto: true,
        text: imgUrl,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      };
      setMessages(prev => [...prev, newMsg]);
    }
    toast.success("Photo attachment shared!");
  };

  const handleSendInvoice = () => {
    if (activeConv.status === 'archived') return;
    const docName = "Transporter-Trip-Sheet.pdf";
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: docName, message_type: 'file', attachment_url: '#' }));
    } else {
      const newMsg = {
        id: Date.now(),
        sender: user?.first_name || 'Peter Karanja',
        sender_role: 'transporter',
        isDocument: true,
        text: docName,
        fileSize: "142 KB",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      };
      setMessages(prev => [...prev, newMsg]);
    }
    toast.success("Trip Sheet document shared!");
  };

  const injectEmoji = (emoji) => {
    setInputMessage(prev => prev + emoji);
    setEmojiPanelOpen(false);
  };

  const handleReopenChat = () => {
    setReopenModalOpen(true);
  };

  const confirmReopen = () => {
    setReopenModalOpen(false);
    setConversations(prev => prev.map(c => {
      if (c.id === activeConv.id) {
        return { ...c, status: 'active' };
      }
      return c;
    }));
    setActiveConv(prev => ({ ...prev, status: 'active' }));
    toast.success("This chat room has been successfully reopened for the next 7 days.");
  };

  const filteredConvs = conversations.filter((conv) => {
    const tabMatches = 
      filterTab === 'all' ||
      (filterTab === 'active' && conv.status === 'active') ||
      (filterTab === 'completed' && conv.status === 'completed') ||
      (filterTab === 'archived' && conv.status === 'archived');

    const nameMatches = 
      !searchQuery || 
      (conv.name || `${conv.buyer_name || conv.farmer_name || ''}`).toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.id.toLowerCase().includes(searchQuery.toLowerCase());

    return tabMatches && nameMatches;
  });

  const activeRooms = filteredConvs.filter(c => c.status === 'active');
  const otherRooms = filteredConvs.filter(c => c.status !== 'active');

  const displayedMessages = messageSearchQuery
    ? messages.filter(m => (m.message || m.content || m.text || '').toLowerCase().includes(messageSearchQuery.toLowerCase()))
    : messages;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-screen h-screen bg-[#F8F9FA] flex p-4 gap-4 font-sans text-slate-800 antialiased relative overflow-hidden">
      
      {/* Lightbox full image preview overlay */}
      {lightboxImageUrl && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => setLightboxImageUrl(null)} 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={lightboxImageUrl} alt="Full preview" className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl" />
        </div>
      )}

      {/* Call Dialog */}
      {callingType && (
        <div className="fixed inset-0 bg-[#075E54]/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
          <div className="text-center space-y-6">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" 
              className="w-24 h-24 rounded-full border-4 border-emerald-400 mx-auto object-cover" 
              alt="Calling Avatar"
            />
            <div>
              <h2 className="text-lg font-black">{activeConv?.farmer_name}</h2>
              <p className="text-xs text-slate-355 mt-1 uppercase tracking-widest animate-pulse">
                {callingType === 'video' ? 'Video Calling...' : 'Voice Calling...'}
              </p>
            </div>
            <button 
              onClick={() => setCallingType(null)} 
              className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg cursor-pointer mx-auto"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Reopen Support Modal */}
      {reopenModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-black text-slate-900 text-sm">Reopen Closed Chat?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will reopen the three-way conversation between you, the farmer, and the transporter for support for up to 7 days.
            </p>
            <div className="flex gap-2 text-xs font-bold pt-2">
              <button 
                onClick={() => setReopenModalOpen(false)} 
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmReopen} 
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
              >
                Reopen Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Conversations List Side-panel */}
      <div className="w-[350px] bg-white border border-slate-200/80 rounded-3xl flex flex-col overflow-hidden shadow-sm h-full flex-shrink-0">
        
        {/* Logo Section */}
        <div className="p-4 pb-2 flex-shrink-0 flex items-center">
          <img src="/logo.png" alt="AgroLink Logo" className="h-10 w-auto object-contain cursor-pointer" onClick={() => navigate('/')} />
        </div>


        <div className="p-4 pt-2 border-b border-slate-100 space-y-3 flex-shrink-0">
          {/* Search Box */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order rooms..." 
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B761]/20 text-xs bg-slate-50/50 text-slate-800 placeholder-slate-400 font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <button className="p-2.5 border border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-500 transition-colors flex items-center justify-center cursor-pointer">
              <Sliders className="w-4 h-4" />
            </button>
          </div>

          {/* Conversation Filters */}
          <div className="flex items-center gap-1 text-[11px] font-bold">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'completed', label: 'Completed' },
              { id: 'archived', label: 'Archived' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`flex-1 py-1.5 rounded-xl border transition-all cursor-pointer text-center font-bold ${
                  filterTab === tab.id 
                    ? 'bg-[#007A48] text-white border-[#007A48] font-extrabold shadow-sm' 
                    : 'bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          
          {filterTab === 'all' ? (
            <>
              {activeRooms.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-[#007A48] tracking-wider uppercase px-2 mb-2">Active Rooms</h4>
                  <div className="space-y-2">
                    {activeRooms.map((conv) => {
                      const isActive = activeConv?.id === conv.id;
                      return (
                        <button
                          key={conv.id}
                          onClick={() => {
                            setActiveConv(conv);
                            setMessages(conv.messages || []);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border text-left ${
                            isActive 
                              ? 'bg-[#EAF7EE] border-[#00B761]/25 font-extrabold shadow-sm' 
                              : 'bg-white hover:bg-slate-50 border-slate-100'
                          }`}
                        >
                          <img 
                            src={getChatAvatar(conv)} 
                            alt={conv.name} 
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-100 flex-shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black text-slate-900 truncate">{conv.id} &bull; {conv.name || conv.order?.product}</p>
                              <span className="text-[9px] text-slate-400 font-medium">{conv.timestamp}</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">{conv.buyer_name || conv.farmer_name}</p>
                            <p className="text-[11px] truncate text-slate-400 mt-1 font-medium">{conv.lastMessage}</p>
                          </div>
                          <span className="w-2.5 h-2.5 bg-[#00B761] rounded-full flex-shrink-0 self-center" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {otherRooms.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-2 mt-4 mb-2">Other Rooms</h4>
                  <div className="space-y-2">
                    {otherRooms.map((conv) => {
                      const isActive = activeConv?.id === conv.id;
                      const isCompleted = conv.status === 'completed';
                      return (
                        <button
                          key={conv.id}
                          onClick={() => {
                            setActiveConv(conv);
                            setMessages(conv.messages || []);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border text-left ${
                            isActive 
                              ? 'bg-[#EAF7EE] border-[#00B761]/25 font-extrabold shadow-sm' 
                              : 'bg-white hover:bg-slate-50 border-slate-105'
                          }`}
                        >
                          <img 
                            src={getChatAvatar(conv)} 
                            alt={conv.name} 
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-100 flex-shrink-0 grayscale-[20%]" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black text-slate-900 truncate">{conv.id} &bull; {conv.name || conv.order?.product}</p>
                              <span className="text-[9px] text-slate-400 font-medium">{conv.timestamp}</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">{conv.buyer_name || conv.farmer_name}</p>
                            <span className={`inline-block text-[10px] font-bold mt-1.5 ${isCompleted ? 'text-[#007A48]' : 'text-slate-400'}`}>
                              {isCompleted ? 'Completed' : 'Archived'}
                            </span>
                          </div>
                          <span className="w-2 h-2 bg-slate-355 rounded-full flex-shrink-0 self-center" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              {filteredConvs.map((conv) => {
                const isActive = activeConv?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConv(conv);
                      setMessages(conv.messages || []);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border text-left ${
                      isActive 
                        ? 'bg-[#EAF7EE] border-[#00B761]/25 font-extrabold shadow-sm' 
                        : 'bg-white hover:bg-slate-50 border-slate-100'
                    }`}
                  >
                    <img 
                      src={getChatAvatar(conv)} 
                      alt={conv.name} 
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-100 flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-slate-900 truncate">{conv.id} &bull; {conv.name || conv.order?.product}</p>
                        <span className="text-[9px] text-slate-400 font-medium">{conv.timestamp}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">{conv.buyer_name || conv.farmer_name}</p>
                      <p className="text-[11px] truncate text-slate-400 mt-1 font-medium">{conv.lastMessage}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {filteredConvs.length === 0 && (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-200 mx-auto" />
              <p className="text-[11px] font-bold">No chats found in this category</p>
            </div>
          )}
        </div>

        {/* Create room footer */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <button 
            onClick={() => toast.info("Creating a new transaction room requires selecting an active order.")}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#007A48] rounded-xl text-xs font-bold text-[#007A48] hover:bg-emerald-50/50 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Order Room</span>
          </button>
        </div>
      </div>

      {/* 2. Right Active Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Transparent Header */}
        <div className="flex items-center justify-between px-2 py-1.5 flex-shrink-0">
          <button 
            onClick={() => navigate('/transporter/dashboard')} 
            className="flex items-center gap-1.5 text-[#007A48] hover:text-[#006838] font-bold text-sm transition-colors cursor-pointer bg-transparent border-0"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to orders</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Bell Icon */}
            <div className="relative p-2 rounded-2xl hover:bg-slate-200/50 cursor-pointer transition-colors text-slate-650 flex items-center justify-center">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#00B761] rounded-full border border-white" />
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-2.5 pl-2">
              <img 
                src={user?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80"} 
                alt="User Profile" 
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <div className="text-left leading-none">
                <p className="font-extrabold text-slate-800 text-xs">{user?.first_name || 'Peter'} {user?.last_name || 'Karanja'}</p>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5 capitalize">{user?.role || 'Transporter'}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {activeConv ? (
          <>
            {/* Pinned Order Card */}
            {activeConv.order && (
              <div className="bg-white border border-slate-200/60 rounded-3xl p-4 flex items-center justify-between shadow-sm flex-shrink-0 mt-1">
                <div className="flex items-center flex-1 min-w-0">
                  <img 
                    src={activeConv.order.product_image || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&q=80"} 
                    alt={activeConv.order.product} 
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 pl-4 min-w-0 text-left">
                    <h3 className="font-extrabold text-slate-800 text-lg leading-tight">
                      Order: {activeConv.order.product} ({activeConv.order.quantity})
                    </h3>
                    <p className="text-[10px] text-slate-450 font-extrabold uppercase mt-1 tracking-wider">
                      BUYER: <span className="text-[#007A48]">{activeConv.buyer_name || 'JOHN MWANGI'}</span> 
                      <span className="mx-2 text-slate-300">|</span> 
                      DRIVER: <span className="text-[#007A48]">{activeConv.transporter_name || 'PETER KARANJA'}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-xs font-bold text-slate-600">
                      <div className="flex items-center gap-1 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-pink-500 fill-pink-500/10 flex-shrink-0" />
                        <span className="truncate text-slate-500 font-medium">Pickup: <strong className="text-slate-700 font-bold">{activeConv.order.pickup_location}</strong></span>
                      </div>
                      <span className="text-slate-400 font-normal hidden sm:inline">&rarr;</span>
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-slate-500 font-medium">Delivery: <strong className="text-slate-700 font-bold">{activeConv.order.delivery_location}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0 pl-4 border-l border-slate-100 ml-4">
                  <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-[#007A48] rounded-full text-[10px] font-extrabold border border-emerald-100 uppercase tracking-wider">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{activeConv.order.status}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>ETA: {activeConv.order.eta}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Pills */}
            <div className="flex items-center gap-3 py-3 overflow-x-auto no-scrollbar flex-shrink-0 mt-1">
              <button 
                onClick={() => handleSendSuggestion("Products harvested 🌾")}
                className="flex items-center gap-1.5 py-2 px-3 bg-white hover:bg-emerald-50/40 border border-slate-200/80 rounded-2xl font-bold text-xs text-[#007A48] transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Leaf className="w-3.5 h-3.5 text-[#007A48] fill-[#007A48]/10" />
                <span>Products harvested</span>
              </button>
              <button 
                onClick={() => handleSendSuggestion("Ready for pickup 📦")}
                className="flex items-center gap-1.5 py-2 px-3 bg-white hover:bg-amber-50/40 border border-slate-200/80 rounded-2xl font-bold text-xs text-[#78350F] transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Paperclip className="w-3.5 h-3.5 text-[#78350F]" />
                <span>Ready for pickup</span>
              </button>
              <button 
                onClick={() => handleSendSuggestion("Driver arrived 👤")}
                className="flex items-center gap-1.5 py-2 px-3 bg-white hover:bg-sky-50/40 border border-slate-200/80 rounded-2xl font-bold text-xs text-[#1E3A8A] transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Driver arrived</span>
              </button>
              <button 
                onClick={() => handleSendSuggestion("Payment received ✔")}
                className="flex items-center gap-1.5 py-2 px-3 bg-white hover:bg-emerald-50/40 border border-slate-200/80 rounded-2xl font-bold text-xs text-[#007A48] transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Check className="w-3.5 h-3.5 text-[#007A48]" />
                <span>Payment received</span>
              </button>
            </div>

            {/* Date Divider */}
            <div className="relative flex items-center justify-center my-1.5 flex-shrink-0">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200/60"></div>
              </div>
              <div className="relative bg-[#F8F9FA] px-4">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Today</span>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 min-h-0">
              {displayedMessages.map((msg) => {
                const isMe = msg.sender === 'transporter' || msg.sender === 'Peter Karanja' || msg.sender === user?.first_name || msg.sender_role === 'transporter';
                const isSystem = msg.sender_role === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="mx-auto max-w-xs text-center py-1">
                      <span className="inline-block bg-[#E1F3FC] border border-sky-100 text-sky-850 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wide shadow-sm">
                        📢 {msg.content || msg.message}
                      </span>
                    </div>
                  );
                }

                if (isMe) {
                  return (
                    <div key={msg.id} className="flex justify-end w-full">
                      <div className="flex flex-col items-end max-w-[70%]">
                        <span className="text-[10px] font-extrabold text-[#007A48] px-1 uppercase tracking-wide">
                          {user?.first_name || 'Peter Karanja'} (You)
                        </span>
                        <div className="bg-[#EAF7EE] border border-[#00B761]/10 rounded-2xl rounded-tr-none px-4 py-2.5 mt-1 shadow-sm text-left">
                          
                          {msg.isLocation && (
                            <div className="rounded-xl overflow-hidden mb-1.5 border border-slate-200/50 max-w-[240px]">
                              <div className="bg-emerald-55 p-2 text-xs flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-600" />
                                <strong className="text-emerald-800">{msg.text || 'Location shared'}</strong>
                              </div>
                              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=300&q=80" alt="Map Grid" className="w-full h-24 object-cover" />
                            </div>
                          )}

                          {msg.isPhoto && (
                            <div 
                              className="rounded-xl overflow-hidden mb-1.5 border cursor-zoom-in max-w-[240px]"
                              onClick={() => setLightboxImageUrl(msg.text)}
                            >
                              <img src={msg.text} alt="Photo" className="w-full object-cover" />
                            </div>
                          )}

                          {msg.isDocument && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2 mb-1.5 text-xs">
                              <Paperclip className="w-4 h-4 text-[#007A48]" />
                              <div>
                                <p className="font-extrabold truncate text-slate-800 text-[11px]">{msg.text}</p>
                                <span className="text-[9px] text-slate-400 block">{msg.fileSize || '142 KB'}</span>
                              </div>
                            </div>
                          )}

                          {msg.content && <p className="text-xs text-slate-800 leading-relaxed break-words font-medium">{msg.content}</p>}

                          <div className="flex items-center justify-end gap-1 mt-1.5 text-[8.5px] text-slate-400 font-bold uppercase">
                            <span>{msg.time}</span>
                            <CheckCheck className="w-3.5 h-3.5 text-[#007A48]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Inbound message
                return (
                  <div key={msg.id} className="flex justify-start w-full">
                    <div className="flex items-start gap-2.5 max-w-[70%]">
                      <img 
                        src={getChatAvatar(activeConv)} 
                        alt={msg.sender} 
                        className="w-8 h-8 rounded-full object-cover mt-0.5 border border-slate-100 flex-shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-extrabold text-[#007A48] px-1 uppercase tracking-wide">
                          {msg.sender} ({formatRole(msg.sender_role) || 'Participant'})
                        </span>
                        <div className="bg-white border border-slate-200/50 rounded-2xl rounded-tl-none px-4 py-2.5 mt-1 shadow-sm text-left">
                          
                          {msg.isLocation && (
                            <div className="rounded-xl overflow-hidden mb-1.5 border border-slate-200/50 max-w-[240px]">
                              <div className="bg-emerald-55 p-2 text-xs flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-600" />
                                <strong className="text-emerald-800">{msg.text || 'Location shared'}</strong>
                              </div>
                              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=300&q=80" alt="Map Grid" className="w-full h-24 object-cover" />
                            </div>
                          )}

                          {msg.isPhoto && (
                            <div 
                              className="rounded-xl overflow-hidden mb-1.5 border cursor-zoom-in max-w-[240px]"
                              onClick={() => setLightboxImageUrl(msg.text)}
                            >
                              <img src={msg.text} alt="Photo" className="w-full object-cover" />
                            </div>
                          )}

                          {msg.isDocument && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2 mb-1.5 text-xs">
                              <Paperclip className="w-4 h-4 text-[#007A48]" />
                              <div>
                                <p className="font-extrabold truncate text-slate-800 text-[11px]">{msg.text}</p>
                                <span className="text-[9px] text-slate-400 block">{msg.fileSize || '142 KB'}</span>
                              </div>
                            </div>
                          )}

                          {msg.content && <p className="text-xs text-slate-800 leading-relaxed break-words font-medium">{msg.content}</p>}

                          <span className="block text-[8.5px] text-slate-400 font-bold text-right mt-1.5 uppercase">{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input Composer area */}
            <div className="space-y-3 flex-shrink-0">
              {(activeConv.status === 'archived' || activeConv.status === 'completed') ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-amber-850">
                  <span>🔒 This conversation is archived following delivery completion. Reopen support chat?</span>
                  <button 
                    onClick={handleReopenChat}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow cursor-pointer transition-colors border-0"
                  >
                    Reopen Chat (7 Days Support)
                  </button>
                </div>
              ) : (
                <div className="relative">
                  
                  {/* Emoji Picker panel */}
                  {emojiPanelOpen && (
                    <div className="absolute bottom-16 right-4 bg-white border border-slate-200 p-2.5 rounded-2xl shadow-xl z-20 flex gap-2 text-base">
                      {['😊', '👍', '🌾', '🍅', '🚛', '📍', '💵'].map(emo => (
                        <button key={emo} onClick={() => injectEmoji(emo)} className="hover:scale-125 transition-transform p-1 cursor-pointer bg-transparent border-0">{emo}</button>
                      ))}
                    </div>
                  )}

                  <div className="bg-white border border-slate-200/85 rounded-2xl p-2 flex items-center gap-2 shadow-sm">
                    <input 
                      type="text" 
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
                      placeholder="Type a message..."
                      className="flex-1 pl-3 pr-2 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent border-0"
                    />
                    <button type="button" onClick={() => setEmojiPanelOpen(!emojiPanelOpen)} className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={handleSendPhoto} className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button 
                      type="button" 
                      onClick={handleSendMessage}
                      id="chat-submit-btn"
                      className="p-2.5 bg-[#007A48] hover:bg-[#006838] text-white rounded-xl shadow-sm cursor-pointer transition-colors flex items-center justify-center border-0"
                    >
                      <Send className="w-4.5 h-4.5 fill-current" />
                    </button>
                  </div>

                  {/* Quick actions buttons row */}
                  <div className="flex items-center justify-between gap-3 mt-2">
                    <button onClick={handleShareLocation} className="flex-grow py-2 px-3 bg-white hover:bg-pink-50/50 border border-slate-200/60 rounded-xl flex items-center justify-center gap-1.5 font-bold text-[10px] text-pink-600 transition-colors shadow-sm cursor-pointer border-0">
                      <MapPin className="w-3.5 h-3.5 text-pink-500 fill-pink-500/10" />
                      <span>Share Location</span>
                    </button>
                    <button onClick={handleSendPhoto} className="flex-grow py-2 px-3 bg-white hover:bg-sky-50/50 border border-slate-200/60 rounded-xl flex items-center justify-center gap-1.5 font-bold text-[10px] text-sky-600 transition-colors shadow-sm cursor-pointer border-0">
                      <Image className="w-3.5 h-3.5 text-sky-500" />
                      <span>Send Photo</span>
                    </button>
                    <button onClick={handleSendInvoice} className="flex-grow py-2 px-3 bg-white hover:bg-indigo-50/50 border border-slate-200/60 rounded-xl flex items-center justify-center gap-1.5 font-bold text-[10px] text-indigo-650 transition-colors shadow-sm cursor-pointer border-0">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Send Trip Sheet</span>
                    </button>
                    <button onClick={() => navigate('/transporter/deliveries')} className="flex-grow py-2 px-3 bg-white hover:bg-amber-50/50 border border-slate-200/60 rounded-xl flex items-center justify-center gap-1.5 font-bold text-[10px] text-amber-600 transition-colors shadow-sm cursor-pointer border-0">
                      <Truck className="w-3.5 h-3.5 text-amber-500" />
                      <span>View Delivery</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-3xl p-8 mt-1">
            <MessageSquare className="w-12 h-12 mb-3 text-slate-200" />
            <p className="text-xs font-bold">Select an active transaction room to start chatting</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default function TransporterChat() {
  return (
    <ProtectedRoute roles={['transporter']}>
      <TransporterChatContent />
    </ProtectedRoute>
  );
}
