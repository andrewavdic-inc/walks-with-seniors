import React, { useMemo, useState, useEffect } from 'react';
import { 
  Heart, CalendarDays, Clock, CheckCircle, 
  MapPin, Activity, Camera, User, Store, 
  Calendar as CalendarIcon, Coffee, Flower,
  ShoppingBag, Sun, Gift, Car, Image as ImageIcon,
  Droplets, BookOpen, Umbrella, ChevronLeft, ChevronRight,
  X, Loader2, Settings, CreditCard, ExternalLink, Save
} from 'lucide-react';

// --- INLINE HELPERS ---
const parseLocalSafe = (dateStr) => {
  try {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d || isNaN(y) || isNaN(m) || isNaN(d)) return new Date();
    return new Date(y, m - 1, d);
  } catch (e) {
    return new Date();
  }
};

export default function FamilyPortal({ currentUser, seniorProfile, walks = [], runMutation }) {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'calendar', 'store', 'settings'
  const [monthOffset, setMonthOffset] = useState(0);

  // --- GIFT STORE MODAL STATE ---
  const [selectedGift, setSelectedGift] = useState(null);
  const [selectedWalkId, setSelectedWalkId] = useState('');
  const [isProcessingGift, setIsProcessingGift] = useState(false);

  // --- SETTINGS / EDIT PROFILE STATE ---
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    routePreferences: ''
  });

  // Sync profile data to form when it loads or updates
  useEffect(() => {
    if (seniorProfile) {
      setEditFormData({
        address: seniorProfile.address || '',
        emergencyContactName: seniorProfile.emergencyContactName || '',
        emergencyContactPhone: seniorProfile.emergencyContactPhone || '',
        routePreferences: seniorProfile.routePreferences || ''
      });
    }
  }, [seniorProfile]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const todayStr = now.toISOString().split('T')[0];

  // Calendar Display Variables
  const displayDate = new Date(currentYear, currentMonth + monthOffset, 1);
  const displayMonth = displayDate.getMonth();
  const displayYear = displayDate.getFullYear();

  // --- DATA DERIVATION ---
  const myWalks = useMemo(() => {
    if (!seniorProfile) return [];
    return walks.filter(w => w.seniorId === seniorProfile.id);
  }, [walks, seniorProfile]);

  const walksThisMonth = useMemo(() => {
    return myWalks.filter(w => {
      if (!w.date) return false;
      const d = parseLocalSafe(w.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && w.status !== 'cancelled';
    });
  }, [myWalks, currentMonth, currentYear]);

  const usedWalks = walksThisMonth.length;
  const packageTotal = seniorProfile?.monthlyWalksPackage || 0;
  const remainingWalks = Math.max(0, packageTotal - usedWalks);
  const percentUsed = packageTotal > 0 ? Math.min((usedWalks / packageTotal) * 100, 100) : 0;

  const completedFeed = useMemo(() => {
    return myWalks.filter(w => w.status === 'completed')
                  .sort((a, b) => parseLocalSafe(b.date) - parseLocalSafe(a.date));
  }, [myWalks]);

  const nextUpcoming = useMemo(() => {
    return myWalks.filter(w => w.status === 'scheduled' && w.date >= todayStr)
                  .sort((a, b) => parseLocalSafe(a.date) - parseLocalSafe(b.date))[0];
  }, [myWalks, todayStr]);

  // Fetches all upcoming scheduled walks for the dropdown menu
  const upcomingWalksList = useMemo(() => {
    return myWalks.filter(w => w.status === 'scheduled' && w.date >= todayStr)
                  .sort((a, b) => parseLocalSafe(a.date) - parseLocalSafe(b.date));
  }, [myWalks, todayStr]);

  // --- ADD-ON STORE DATA ---
  const storeItems = [
    { id: 1, name: "Coffee & Conversation", price: 15, icon: Coffee, desc: "A mid-walk stop at a local cafe for a warm drink.", link: "https://buy.stripe.com/test_placeholder1" },
    { id: 2, name: "Fresh Blooms", price: 25, icon: Flower, desc: "A seasonal flower bouquet delivered on the next walk.", link: "https://buy.stripe.com/test_placeholder2" },
    { id: 3, name: "Bakery Treat Stop", price: 10, icon: ShoppingBag, desc: "Treat them to a fresh pastry, muffin, or cookie.", link: "https://buy.stripe.com/test_placeholder3" },
    { id: 4, name: "Ice Cream Stroll", price: 10, icon: Sun, desc: "A summer favorite! Includes a stop for a scoop of ice cream.", link: "https://buy.stripe.com/test_placeholder4" },
    { id: 5, name: "Bird Feeding Kit", price: 8, icon: Activity, desc: "Safe, eco-friendly seeds to feed the birds by the canal.", link: "https://buy.stripe.com/test_placeholder5" },
    { id: 6, name: "Birthday Celebration", price: 40, icon: Gift, desc: "A balloon, gourmet cupcake, and 30 extra minutes.", link: "https://buy.stripe.com/test_placeholder6" },
    { id: 7, name: "Scenic Drive Extension", price: 45, icon: Car, desc: "Upgrade to a 90-minute scenic drive around Niagara.", link: "https://buy.stripe.com/test_placeholder7" },
    { id: 8, name: "Framed Memory", price: 30, icon: ImageIcon, desc: "A printed and framed (5x7) photo from a recent walk.", link: "https://buy.stripe.com/test_placeholder8" },
    { id: 9, name: "Premium Walking Socks", price: 20, icon: Heart, desc: "High-quality, cushioned socks to keep feet blister-free.", link: "https://buy.stripe.com/test_placeholder9" },
    { id: 10, name: "Thermal Hydration Flask", price: 25, icon: Droplets, desc: "An easy-to-open insulated water bottle.", link: "https://buy.stripe.com/test_placeholder10" },
    { id: 11, name: "The 'Rainy Day' Puzzle Book", price: 15, icon: BookOpen, desc: "Large-print crossword or Sudoku left after the walk.", link: "https://buy.stripe.com/test_placeholder11" },
    { id: 12, name: "Artisan Tea Collection", price: 20, icon: Coffee, desc: "A curated box of comforting, caffeine-free teas.", link: "https://buy.stripe.com/test_placeholder12" },
    { id: 13, name: "Seasonal Comfort Pack", price: 15, icon: Umbrella, desc: "Winter warmers or Summer cooling essentials.", link: "https://buy.stripe.com/test_placeholder13" }
  ];

  // --- HANDLERS ---
  const handleProceedToStripe = async () => {
    if (!selectedWalkId || !selectedGift) return;
    setIsProcessingGift(true);

    try {
      if (runMutation) {
        const orderId = `order_${Date.now()}`;
        const walkDetails = upcomingWalksList.find(w => w.id === selectedWalkId);

        await runMutation('ws_orders', orderId, 'set', {
          id: orderId,
          seniorId: seniorProfile.id,
          seniorName: seniorProfile.name,
          walkId: selectedWalkId,
          walkDate: walkDetails?.date || '',
          itemName: selectedGift.name,
          price: selectedGift.price,
          status: 'Pending Verification',
          createdAt: new Date().toISOString()
        });
      }
      
      window.location.href = selectedGift.link;
    } catch (error) {
      console.error("Order error:", error);
      setIsProcessingGift(false);
      alert("There was an issue preparing your order. Please try again.");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await runMutation('ws_seniors', seniorProfile.id, 'update', editFormData);
      // Optional: Add a subtle toast or visual confirmation here instead of an alert if preferred
    } catch (error) {
      console.error("Profile save error:", error);
      alert("There was an error updating your profile. Please try again.");
    }
    setIsSavingProfile(false);
  };

  // --- CALENDAR RENDER HELPERS ---
  const renderCalendarDays = () => {
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    const firstDay = new Date(displayYear, displayMonth, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-transparent"></div>);
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const walksOnDay = myWalks.filter(w => w.date === dateStr && w.status !== 'cancelled');
      
      const isToday = dateStr === todayStr;
      
      days.push(
        <div key={d} className={`min-h-[80px] p-2 border border-slate-100 rounded-lg flex flex-col ${isToday ? 'bg-teal-50 border-teal-200' : 'bg-white'}`}>
          <div className={`text-xs font-bold ${isToday ? 'text-teal-700' : 'text-slate-500'} mb-1`}>{d}</div>
          <div className="flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-hide">
            {walksOnDay.map(walk => (
              <div key={walk.id} className={`text-[10px] p-1.5 rounded leading-tight ${walk.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                <span className="font-bold block">{walk.startTime}</span>
                {walk.status === 'completed' ? 'Completed' : 'Scheduled'}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  if (!seniorProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <Heart className="h-16 w-16 text-slate-200 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Profile Not Found</h2>
        <p className="text-slate-500 mt-2">We couldn't locate the senior profile linked to this account. Please contact administration.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER: PEACE OF MIND */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl shadow-lg p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10"><Heart size={180} fill="currentColor" /></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Welcome, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-teal-100 font-medium text-sm sm:text-base max-w-md mb-8">
            Stay connected with {seniorProfile.name.split(' ')[0]}'s activity. View their upcoming schedule and recent walk updates below.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Package Tracker */}
            <div className="bg-black/20 backdrop-blur-md rounded-xl p-5 border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-teal-200 uppercase tracking-widest">Monthly Package</span>
                <span className="text-sm font-black">{remainingWalks} Walks Left</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-2 mb-2 overflow-hidden">
                <div className="h-2 rounded-full bg-white transition-all duration-1000" style={{ width: `${percentUsed}%` }}></div>
              </div>
              <div className="text-[10px] text-teal-100 font-medium text-right">
                {usedWalks} of {packageTotal} walks scheduled/completed this month
              </div>
            </div>

            {/* Next Scheduled Walk */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 flex flex-col justify-center">
              <span className="text-xs font-bold text-teal-200 uppercase tracking-widest mb-1">Next Scheduled Walk</span>
              {nextUpcoming ? (
                <>
                  <div className="text-xl font-black text-white leading-tight">
                    {parseLocalSafe(nextUpcoming.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-sm text-teal-100 font-medium mt-1 flex items-center">
                    <Clock className="h-4 w-4 mr-1.5 opacity-80" /> {nextUpcoming.startTime} - {nextUpcoming.endTime}
                  </div>
                </>
              ) : (
                <div className="text-sm text-teal-100 italic font-medium mt-1">No upcoming walks scheduled.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Tabbed Interface */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Tabs */}
          <div className="flex bg-slate-200 p-1 rounded-xl overflow-x-auto scrollbar-hide">
            <button onClick={() => setActiveTab('feed')} className={`flex-1 min-w-[100px] py-2 text-sm font-bold rounded-lg transition flex items-center justify-center ${activeTab === 'feed' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Camera className="h-4 w-4 mr-2" /> Feed
            </button>
            <button onClick={() => setActiveTab('calendar')} className={`flex-1 min-w-[100px] py-2 text-sm font-bold rounded-lg transition flex items-center justify-center ${activeTab === 'calendar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <CalendarIcon className="h-4 w-4 mr-2" /> Calendar
            </button>
            <button onClick={() => setActiveTab('store')} className={`flex-1 min-w-[100px] py-2 text-sm font-bold rounded-lg transition flex items-center justify-center ${activeTab === 'store' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Store className="h-4 w-4 mr-2" /> Add-Ons
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex-1 min-w-[100px] py-2 text-sm font-bold rounded-lg transition flex items-center justify-center ${activeTab === 'settings' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Settings className="h-4 w-4 mr-2" /> Settings
            </button>
          </div>

          {/* TAB 1: THE FEED */}
          {activeTab === 'feed' && (
            <div className="space-y-6 pt-4 animate-in fade-in">
              {completedFeed.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-10 text-center">
                  <Camera className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No walks have been completed yet.</p>
                  <p className="text-sm text-slate-400 mt-1">Check back soon for photo updates!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {completedFeed.map(walk => (
                    <div key={walk.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300">
                      {walk.photoUrl ? (
                        <div className="w-full h-64 sm:h-80 bg-slate-100 relative overflow-hidden">
                          <img src={walk.photoUrl} alt="Walk Update" className="w-full h-full object-cover" />
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center">
                            <CheckCircle className="h-4 w-4 text-emerald-500 mr-1.5" />
                            <span className="text-xs font-bold text-slate-700">Completed</span>
                          </div>
                        </div>
                      ) : (
                        <div className="px-5 pt-5 pb-2 flex justify-between items-center">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1.5" /> Walk Completed
                          </span>
                        </div>
                      )}
                      <div className="p-5 sm:p-6">
                        <div className="flex items-center text-sm text-slate-500 font-medium mb-3">
                          <CalendarDays className="h-4 w-4 mr-1.5 text-slate-400" />
                          {parseLocalSafe(walk.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                          <span className="mx-2">&bull;</span>
                          {walk.startTime}
                        </div>
                        <p className="text-slate-800 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                          "{walk.walkNotes || 'Walk completed successfully. Had a great time!'}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 pt-4 animate-in fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">
                  {displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex space-x-2">
                  <button onClick={() => setMonthOffset(m => m - 1)} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"><ChevronLeft className="h-4 w-4 text-slate-600"/></button>
                  <button onClick={() => setMonthOffset(0)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Today</button>
                  <button onClick={() => setMonthOffset(m => m + 1)} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"><ChevronRight className="h-4 w-4 text-slate-600"/></button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs font-bold text-slate-400 uppercase">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {renderCalendarDays()}
              </div>
              
              <div className="mt-6 flex items-center justify-center space-x-6 border-t border-slate-100 pt-4">
                <div className="flex items-center text-xs font-medium text-slate-600"><span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 mr-2"></span> Scheduled</div>
                <div className="flex items-center text-xs font-medium text-slate-600"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200 mr-2"></span> Completed</div>
              </div>
            </div>
          )}

          {/* TAB 3: GIFT STORE */}
          {activeTab === 'store' && (
            <div className="pt-4 animate-in fade-in">
              <h2 className="text-xl font-black text-slate-800 mb-2">Special Add-Ons & Gifting</h2>
              <p className="text-slate-500 mb-6 text-sm">Surprise them on their next scheduled walk! Select an item below to securely purchase it. Our walkers will receive the instructions instantly.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {storeItems.map(item => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col h-full">
                    <div className="flex items-start mb-3">
                      <div className="bg-teal-50 text-teal-600 p-3 rounded-xl mr-4 shrink-0">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 leading-tight">{item.name}</h3>
                        <div className="text-lg font-black text-teal-600 mt-1">${item.price}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-5 flex-1">{item.desc}</p>
                    
                    <button 
                      onClick={() => setSelectedGift(item)}
                      className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-sm transition mt-auto"
                    >
                      Gift This
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS & BILLING */}
          {activeTab === 'settings' && (
            <div className="space-y-6 pt-4 animate-in fade-in">
              
              {/* Billing & Invoices Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex items-center">
                    <div className="bg-teal-50 p-3 rounded-xl mr-4 shrink-0">
                      <CreditCard className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">Billing & Invoices</h3>
                      <p className="text-sm text-slate-500">Update payment methods and download past receipts.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4 text-sm text-slate-600">
                  You can manage your monthly subscription, view your entire payment history, and download PDF invoices for tax purposes directly through our secure Stripe portal.
                </div>
                {/* INSTRUCTION: Replace this placeholder link with your actual Stripe Customer Portal URL */}
                <a 
                  href="https://billing.stripe.com/p/login/test_YOUR_LINK_HERE" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition shadow-sm text-sm"
                >
                  Manage Billing in Stripe <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>

              {/* Profile Details Form */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
                  <User className="h-5 w-5 text-slate-400 mr-2" />
                  <h3 className="font-bold text-lg text-slate-800">Edit Profile Details</h3>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Pickup Address</label>
                    <input 
                      type="text" 
                      value={editFormData.address} 
                      onChange={e => setEditFormData({...editFormData, address: e.target.value})} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm bg-slate-50 focus:bg-white transition" 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Emergency Contact Name</label>
                      <input 
                        type="text" 
                        value={editFormData.emergencyContactName} 
                        onChange={e => setEditFormData({...editFormData, emergencyContactName: e.target.value})} 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm bg-slate-50 focus:bg-white transition" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Emergency Contact Phone</label>
                      <input 
                        type="text" 
                        value={editFormData.emergencyContactPhone} 
                        onChange={e => setEditFormData({...editFormData, emergencyContactPhone: e.target.value})} 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm bg-slate-50 focus:bg-white transition" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Route Preferences & Walker Notes</label>
                    <textarea 
                      value={editFormData.routePreferences} 
                      onChange={e => setEditFormData({...editFormData, routePreferences: e.target.value})} 
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm resize-none bg-slate-50 focus:bg-white transition" 
                      rows="3"
                      placeholder="e.g. Loves looking at gardens, prefers to avoid busy roads."
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isSavingProfile}
                      className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:bg-slate-300 transition shadow-sm text-sm"
                    >
                      {isSavingProfile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Senior Snapshot */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
              Profile Snapshot
            </h3>
            
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                <User className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-slate-800 leading-tight">{seniorProfile.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{seniorProfile.address}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Walking Pace</span>
                <div className="font-semibold text-slate-700 text-sm flex items-center">
                  <Activity className="h-4 w-4 mr-1.5 text-teal-600" /> {seniorProfile.pace || 'Moderate'}
                </div>
              </div>
              
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mobility Aid</span>
                <div className="font-semibold text-slate-700 text-sm bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  {seniorProfile.mobility || 'Independent'}
                </div>
              </div>

              {seniorProfile.routePreferences && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Preferences</span>
                  <div className="text-sm text-slate-600 italic">
                    "{seniorProfile.routePreferences}"
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 text-center flex flex-col items-center">
                Need to update mobility or pace?
                <a href={`mailto:admin@walkswithseniors.com`} className="text-teal-600 font-bold mt-1 hover:underline">
                  Contact Administration
                </a>
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* --- GIFT DATE SELECTION MODAL --- */}
      {selectedGift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Gift Delivery Details</h3>
              <button onClick={() => !isProcessingGift && setSelectedGift(null)} className="text-slate-400 hover:text-slate-600 transition"><X className="h-5 w-5"/></button>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-6 bg-teal-50 p-4 rounded-xl border border-teal-100">
                <div className="bg-white text-teal-600 p-2 rounded-lg mr-4 shadow-sm shrink-0">
                  <selectedGift.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 leading-tight">{selectedGift.name}</h4>
                  <div className="text-teal-700 font-bold text-sm">${selectedGift.price}</div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Which scheduled walk should we deliver this on?</label>
                {upcomingWalksList.length === 0 ? (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    There are no upcoming walks scheduled to deliver this gift. Please contact administration or wait until the next schedule is posted.
                  </div>
                ) : (
                  <select
                    value={selectedWalkId}
                    onChange={e => setSelectedWalkId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-white text-sm font-medium text-slate-700"
                    disabled={isProcessingGift}
                  >
                    <option value="" disabled>-- Select an Upcoming Walk --</option>
                    {upcomingWalksList.map(w => (
                      <option key={w.id} value={w.id}>
                        {parseLocalSafe(w.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} @ {w.startTime}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                onClick={handleProceedToStripe}
                disabled={!selectedWalkId || isProcessingGift}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-xl shadow-md transition flex items-center justify-center text-sm"
              >
                {isProcessingGift ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                {isProcessingGift ? 'Preparing Secure Checkout...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
