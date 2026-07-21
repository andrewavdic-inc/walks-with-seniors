import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Clock, Camera, CheckCircle, CloudSun, Heart, 
  Activity, Phone, Loader2, ChevronRight, Calendar as CalendarIcon, 
  MessageSquare, Coins, Trophy, Award, Car, Plus, FileText, ChevronLeft, Gift, User, Star
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

export default function WalkerPortal({ 
  currentUser, 
  walkers = [],
  walks = [], 
  seniors = [], 
  mileageLogs = [],
  settings = [], // <-- Added to pull your custom email templates
  flatRatePayout = 25,
  mileageRate = 0.68,
  runMutation, 
  handleFileUpload 
}) {
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, calendar, culture, earnings
  const [weather, setWeather] = useState({ temp: '--', condition: 'Fetching...', icon: '⛅' });
  
  // --- MODAL STATE ---
  const [selectedWalk, setSelectedWalk] = useState(null);
  const [walkNote, setWalkNote] = useState('');
  const [walkPhoto, setWalkPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedMileageWalk, setSelectedMileageWalk] = useState(null);
  const [mileageForm, setMileageForm] = useState({ distance: '', notes: '' });

  // --- CALENDAR STATE ---
  const [monthOffset, setMonthOffset] = useState(0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const todayStr = now.toISOString().split('T')[0];

  // Calendar Display Variables
  const displayDate = new Date(currentYear, currentMonth + monthOffset, 1);
  const displayMonth = displayDate.getMonth();
  const displayYear = displayDate.getFullYear();

  // --- DATA DERIVATION ---
  const myWalks = useMemo(() => walks.filter(w => w.walkerId === currentUser.id), [walks, currentUser.id]);
  const myWalksToday = useMemo(() => myWalks.filter(w => w.date === todayStr).sort((a, b) => String(a.startTime).localeCompare(String(b.startTime))), [myWalks, todayStr]);
  const myCompletedWalksTotal = myWalks.filter(w => w.status === 'completed').length;
  const myMileageLogs = useMemo(() => mileageLogs.filter(m => m.walkerId === currentUser.id), [mileageLogs, currentUser.id]);

  // Earnings Derivation (Current Month)
  const currentMonthWalks = myWalks.filter(w => {
    if (w.status !== 'completed' || !w.date) return false;
    const d = parseLocalSafe(w.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  
  const currentMonthMileage = myMileageLogs.filter(m => {
    if (!m.date) return false;
    const d = parseLocalSafe(m.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const walkEarnings = currentMonthWalks.length * flatRatePayout;
  const totalMileageThisMonth = currentMonthMileage.reduce((sum, log) => sum + (Number(log.distance) || 0), 0);
  const mileageEarnings = totalMileageThisMonth * mileageRate;
  const totalEarnings = walkEarnings + mileageEarnings;

  // Leaderboard Derivation
  const leaderboard = useMemo(() => {
    const counts = {};
    walks.filter(w => w.status === 'completed').forEach(w => {
      counts[w.walkerId] = (counts[w.walkerId] || 0) + 1;
    });
    return Object.keys(counts)
      .map(walkerId => ({
        walkerId,
        name: walkers.find(walkr => walkr.id === walkerId)?.name || 'Unknown',
        completed: counts[walkerId]
      }))
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 5); // Top 5
  }, [walks, walkers]);

  // --- WEATHER WIDGET ---
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`https://wttr.in/Port+Colborne,+ON?format=j1`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setWeather({ 
          temp: data.current_condition[0].temp_C, 
          condition: data.current_condition[0].weatherDesc[0].value, 
          icon: '🌤️' 
        });
      } catch(e) {
        setWeather({ temp: '--', condition: 'Weather Unavailable', icon: '☁️' });
      }
    };
    fetchWeather();
  }, []);

  // --- HANDLERS ---
  const handleCompleteWalk = async (e) => {
    e.preventDefault();
    if (!selectedWalk) return;
    
    setIsSubmitting(true);
    let uploadedUrl = '';
    
    if (walkPhoto) {
      uploadedUrl = await handleFileUpload(walkPhoto, 'walk_updates');
    }

    // 1. Mark the walk as completed
    await runMutation('ws_walks', selectedWalk.id, 'update', {
      status: 'completed',
      walkNotes: walkNote,
      photoUrl: uploadedUrl || ''
    });

    // 2. CHECK FOR MILESTONES (10, 50, 100)
    const previousCompletedCount = walks.filter(w => w.seniorId === selectedWalk.seniorId && w.status === 'completed').length;
    const newTotal = previousCompletedCount + 1; // Includes the walk we just completed

    if ([10, 50, 100].includes(newTotal)) {
      const senior = seniors.find(s => s.id === selectedWalk.seniorId);
      
      if (senior && senior.accountHolderEmail) {
        // Parse the dynamic template from settings
        const templateDoc = settings.find(s => s.id === 'email_templates') || {};
        let subject = templateDoc.milestoneSubject || "🎉 {{SeniorName}} just reached {{MilestoneCount}} walks!";
        let body = templateDoc.milestoneBody || "Hi {{FamilyName}},\n\nWe are so excited to share that {{SeniorName}} just completed their {{MilestoneCount}}th walk with us! \n\nConsistency is the key to maintaining mobility and a great mood, and we are so proud to be part of their routine.\n\nBe sure to check your Family Portal to see the latest photo update from today's milestone walk.\n\nWarmly,\nThe Team at Walks with Seniors";

        const tags = {
          '{{FamilyName}}': senior.accountHolderName?.split(' ')[0] || 'Family',
          '{{SeniorName}}': senior.name?.split(' ')[0] || 'Client',
          '{{MilestoneCount}}': newTotal.toString(),
          '{{EmailAddress}}': senior.accountHolderEmail
        };

        Object.keys(tags).forEach(tag => {
          subject = subject.replaceAll(tag, tags[tag]);
          body = body.replaceAll(tag, tags[tag]);
        });

        // Queue the celebratory email
        await runMutation('ws_emails', `email_${Date.now()}_milestone`, 'set', {
          to: senior.accountHolderEmail,
          message: { subject, text: body },
          status: 'queued',
          createdAt: new Date().toISOString()
        });
      }
    }

    setIsSubmitting(false);
    setSelectedWalk(null);
    setWalkNote('');
    setWalkPhoto(null);
  };

  const handleLogMileage = async (e) => {
    e.preventDefault();
    if (!selectedMileageWalk) return;
    setIsSubmitting(true);
    
    const senior = seniors.find(s => s.id === selectedMileageWalk.seniorId);
    const newId = `mileage_${Date.now()}`;
    
    await runMutation('ws_mileage', newId, 'set', {
      id: newId,
      walkerId: currentUser.id,
      walkId: selectedMileageWalk.id,
      seniorName: senior?.name || 'Unknown Senior',
      date: todayStr,
      distance: Number(mileageForm.distance),
      notes: mileageForm.notes
    });

    setIsSubmitting(false);
    setSelectedMileageWalk(null);
    setMileageForm({ distance: '', notes: '' });
  };

  // --- CALENDAR RENDERER ---
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
          <div className={`text-xs font-bold ${isToday ? 'text-teal-600' : 'text-slate-500'} mb-1`}>{d}</div>
          <div className="flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-hide">
            {walksOnDay.map(walk => (
              <div key={walk.id} className={`text-[10px] p-1.5 rounded leading-tight ${walk.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                <span className="font-bold block">{walk.startTime}</span>
                {seniors.find(s => s.id === walk.seniorId)?.name.split(' ')[0] || 'Walk'}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 animate-in fade-in duration-500">
      
      {/* HEADER & WEATHER */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-10"><CloudSun size={120} /></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-black tracking-tight mb-1">Hello, {currentUser.name.split(' ')[0]}!</h1>
          <p className="text-teal-100 text-sm font-medium mb-6">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          
          <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
            <div>
              <div className="text-xs font-bold text-teal-200 uppercase tracking-widest mb-1">Current Conditions</div>
              <div className="text-2xl font-black">{weather.temp}°C</div>
              <div className="text-sm font-medium text-teal-50">{weather.condition}</div>
            </div>
            <div className="text-5xl">{weather.icon}</div>
          </div>
        </div>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="flex bg-slate-200 p-1 rounded-xl overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveTab('dashboard')} className={`flex-1 min-w-[100px] py-2 text-sm font-bold rounded-lg transition flex items-center justify-center ${activeTab === 'dashboard' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <MapPin className="h-4 w-4 mr-2" /> Dashboard
        </button>
        <button onClick={() => setActiveTab('calendar')} className={`flex-1 min-w-[100px] py-2 text-sm font-bold rounded-lg transition flex items-center justify-center ${activeTab === 'calendar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <CalendarIcon className="h-4 w-4 mr-2" /> Schedule
        </button>
        <button onClick={() => setActiveTab('culture')} className={`flex-1 min-w-[100px] py-2 text-sm font-bold rounded-lg transition flex items-center justify-center ${activeTab === 'culture' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <MessageSquare className="h-4 w-4 mr-2" /> Culture
        </button>
        <button onClick={() => setActiveTab('earnings')} className={`flex-1 min-w-[100px] py-2 text-sm font-bold rounded-lg transition flex items-center justify-center ${activeTab === 'earnings' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <FileText className="h-4 w-4 mr-2" /> Paystubs
        </button>
      </div>

      {/* ========================================= */}
      {/* TAB 1: DASHBOARD (Itinerary & Active Routes) */}
      {/* ========================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in">
          {/* MILESTONES MINI-TRACKER */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-2.5 rounded-full text-amber-600">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lifetime Impact</div>
                <div className="font-black text-slate-800 text-lg leading-tight">{myCompletedWalksTotal} Walks Completed</div>
              </div>
            </div>
          </div>

          {/* TODAY's ITINERARY */}
          <div>
            <h2 className="text-lg font-black text-slate-800 mb-4 px-1 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-teal-600" /> Today's Routes
            </h2>
            
            <div className="space-y-4">
              {myWalksToday.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-10 text-center">
                  <p className="text-slate-500 font-medium">You have no walks assigned for today.</p>
                  <p className="text-sm text-slate-400 mt-1">Enjoy your day off!</p>
                </div>
              ) : (
                myWalksToday.map(walk => {
                  const senior = seniors.find(s => s.id === walk.seniorId);
                  const isCompleted = walk.status === 'completed';

                  // Calculate if this is the senior's chronological first walk
                  const seniorWalks = walks
                    .filter(w => w.seniorId === walk.seniorId && w.status !== 'cancelled')
                    .sort((a, b) => new Date(a.date) - new Date(b.date));
                  const isFirstWalk = seniorWalks.length > 0 && seniorWalks[0].id === walk.id;

                  return (
                    <div key={walk.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${isCompleted ? 'border-emerald-200' : 'border-slate-200'}`}>
                      {/* Walk Header */}
                      <div className={`px-5 py-3 border-b flex justify-between items-center ${isCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center text-sm font-bold text-slate-700">
                          <Clock className="h-4 w-4 mr-1.5 opacity-70" />
                          {walk.startTime} - {walk.endTime}
                        </div>
                        {isCompleted ? (
                          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Completed
                          </span>
                        ) : (
                          <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                            Scheduled
                          </span>
                        )}
                      </div>

                      {/* Senior Details */}
                      <div className="p-5">
                        <h3 className="text-xl font-black text-slate-800 mb-1">{senior?.name || 'Unknown Senior'}</h3>
                        <p className="text-sm text-slate-600 flex items-start mb-4">
                          <MapPin className="h-4 w-4 mr-1.5 mt-0.5 text-slate-400 shrink-0" />
                          <span>{senior?.address || 'No address provided'}</span>
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-5">
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pace</span>
                            <div className="font-semibold text-slate-700 text-sm flex items-center">
                              <Activity className="h-3.5 w-3.5 mr-1.5 text-teal-600" /> {senior?.pace || 'Moderate'}
                            </div>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mobility Aid</span>
                            <div className="font-semibold text-slate-700 text-sm">
                              {senior?.mobility || 'Independent'}
                            </div>
                          </div>
                          {senior?.routePreferences && (
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 col-span-2">
                              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">Route Notes</span>
                              <div className="font-medium text-blue-900 text-sm">"{senior.routePreferences}"</div>
                            </div>
                          )}
                        </div>

                        {/* MASSIVE ADD-ON ALERT */}
                        {walk.addOns && (
                          <div className={`mb-5 rounded-xl p-4 shadow-sm border-2 ${isCompleted ? 'bg-amber-50 border-amber-200 opacity-70' : 'bg-amber-100 border-amber-400'}`}>
                            <h4 className={`text-xs font-black uppercase tracking-widest flex items-center mb-1 ${isCompleted ? 'text-amber-700' : 'text-amber-800'}`}>
                              <Gift className={`h-5 w-5 mr-2 ${isCompleted ? 'text-amber-500' : 'text-amber-600 animate-bounce'}`} />
                              Special Add-On / Gift
                            </h4>
                            <p className={`font-black text-lg leading-tight ${isCompleted ? 'text-amber-800' : 'text-amber-900'}`}>{walk.addOns}</p>
                          </div>
                        )}

                        {/* FIRST WALK REMINDER */}
                        {!isCompleted && isFirstWalk && (
                          <div className="mb-5 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start shadow-sm">
                            <div className="bg-indigo-100 p-2 rounded-lg mr-3 shrink-0">
                              <Star className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-indigo-900 mb-0.5">First Walk Alert!</h4>
                              <p className="text-xs text-indigo-800 font-medium">This is {senior?.name?.split(' ')[0]}'s very first walk with us. Do not forget to bring a business card and their welcome merchandise.</p>
                            </div>
                          </div>
                        )}

                        {/* Action Area */}
                        <div className="space-y-3">
                          {isCompleted ? (
                            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center">
                              {walk.photoUrl ? (
                                <img src={walk.photoUrl} alt="Walk" className="h-16 w-16 rounded-lg object-cover mr-4 shadow-sm" />
                              ) : (
                                <div className="h-16 w-16 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-500 mr-4">
                                  <CheckCircle className="h-6 w-6" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Update Sent to Family</p>
                                <p className="text-sm font-medium text-emerald-900 line-clamp-2">"{walk.walkNotes || 'Walk completed successfully.'}"</p>
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setSelectedWalk(walk)}
                              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center text-base"
                            >
                              Complete Walk & Send Update <ChevronRight className="h-5 w-5 ml-1" />
                            </button>
                          )}
                          
                          {/* Dedicated Log Mileage Button for this specific walk */}
                          <button 
                            onClick={() => setSelectedMileageWalk(walk)}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl border border-slate-200 transition flex items-center justify-center text-sm shadow-sm"
                          >
                            <Car className="h-4 w-4 mr-2 text-slate-500" /> Log Mileage for this Visit
                          </button>
                        </div>

                      </div>
                      
                      {/* Emergency Contact Footer */}
                      {!isCompleted && senior?.emergencyContactPhone && (
                        <div className="bg-red-50 px-5 py-3 border-t border-red-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Emergency Contact</span>
                          <a href={`tel:${senior.emergencyContactPhone}`} className="text-sm font-bold text-red-600 flex items-center bg-white px-3 py-1.5 rounded-lg border border-red-200 shadow-sm">
                            <Phone className="h-3.5 w-3.5 mr-1.5" /> Call {senior.emergencyContactName?.split(' ')[0]}
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* TAB 2: CALENDAR SCHEDULE                  */}
      {/* ========================================= */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in">
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
            <div className="flex items-center text-xs font-medium text-slate-600"><span className="w-3 h-3 rounded bg-blue-100 mr-2"></span> Scheduled</div>
            <div className="flex items-center text-xs font-medium text-slate-600"><span className="w-3 h-3 rounded bg-emerald-100 mr-2"></span> Completed</div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* TAB 3: CULTURE & COMMUNICATION            */}
      {/* ========================================= */}
      {activeTab === 'culture' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DISTANCE LEADERBOARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-teal-900 px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center"><Trophy className="h-5 w-5 mr-2 text-teal-300"/> Leaderboard</h3>
                <span className="text-xs font-medium text-teal-200 uppercase tracking-widest">All Time</span>
              </div>
              <div className="p-0">
                {leaderboard.map((walker, index) => (
                  <div key={walker.walkerId} className={`flex items-center justify-between p-4 border-b border-slate-100 ${walker.walkerId === currentUser.id ? 'bg-teal-50' : ''}`}>
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black mr-4 ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-200 text-slate-500' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                        {index + 1}
                      </div>
                      <span className={`font-bold ${walker.walkerId === currentUser.id ? 'text-teal-800' : 'text-slate-700'}`}>
                        {walker.name} {walker.walkerId === currentUser.id && '(You)'}
                      </span>
                    </div>
                    <div className="font-black text-slate-800">{walker.completed} Walks</div>
                  </div>
                ))}
              </div>
            </div>

            {/* MILESTONE BADGES */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 flex items-center mb-6"><Award className="h-5 w-5 mr-2 text-rose-500"/> My Badges</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className={`flex flex-col items-center opacity-${myCompletedWalksTotal >= 1 ? '100' : '30 grayscale'}`}>
                  <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 shadow-sm border border-blue-200">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">First Walk</span>
                </div>
                <div className={`flex flex-col items-center opacity-${myCompletedWalksTotal >= 10 ? '100' : '30 grayscale'}`}>
                  <div className="h-16 w-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2 shadow-sm border border-purple-200">
                    <Heart className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">10 Walks</span>
                </div>
                <div className={`flex flex-col items-center opacity-${myCompletedWalksTotal >= 50 ? '100' : '30 grayscale'}`}>
                  <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-2 shadow-sm border border-amber-200">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">50 Walks</span>
                </div>
              </div>
              <p className="text-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100">Keep walking to unlock more achievements!</p>
            </div>
          </div>

          {/* COMMUNICATION HUB */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-lg">Secure Chat & Broadcasts</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">No new announcements from AHA Company today. Have a question? Reach out to your manager directly.</p>
            <a href="mailto:admin@walkswithseniors.com" className="mt-4 inline-flex bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl transition">Contact Dispatch</a>
          </div>

        </div>
      )}

      {/* ========================================= */}
      {/* TAB 4: EARNINGS & PAYSTUBS                  */}
      {/* ========================================= */}
      {activeTab === 'earnings' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Earnings Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Walk Earnings</div>
              <div className="text-2xl font-black text-slate-800">${walkEarnings.toFixed(2)}</div>
              <div className="text-xs text-slate-500 mt-1">{currentMonthWalks.length} walks @ ${flatRatePayout.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mileage Payout</div>
              <div className="text-2xl font-black text-slate-800">${mileageEarnings.toFixed(2)}</div>
              <div className="text-xs text-slate-500 mt-1">{totalMileageThisMonth} km @ ${mileageRate.toFixed(2)}/km</div>
            </div>
            <div className="bg-teal-700 rounded-2xl p-5 shadow-md text-white">
              <div className="text-xs font-bold text-teal-200 uppercase tracking-wider mb-1">Total Pay Period</div>
              <div className="text-3xl font-black">${totalEarnings.toFixed(2)}</div>
              <div className="text-xs text-teal-100 mt-1">For {now.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
            </div>
          </div>

          {/* Paystub Ledger */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center"><FileText className="h-5 w-5 mr-2 text-teal-600"/> Itemized Paystub</h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Date</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {/* Map Walks */}
                  {currentMonthWalks.map(w => (
                    <tr key={`walk-${w.id}`} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 text-slate-600">{w.date}</td>
                      <td className="p-4 font-medium text-slate-800">Walk completed ({w.startTime})</td>
                      <td className="p-4 text-right font-bold text-teal-700">+${flatRatePayout.toFixed(2)}</td>
                    </tr>
                  ))}
                  {/* Map Mileage - NOW INCLUDES SENIOR NAME */}
                  {currentMonthMileage.map(m => (
                    <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 text-slate-600">{m.date}</td>
                      <td className="p-4 font-medium text-slate-800">Mileage: {m.seniorName || 'General'} ({m.distance} km)</td>
                      <td className="p-4 text-right font-bold text-teal-700">+${(m.distance * mileageRate).toFixed(2)}</td>
                    </tr>
                  ))}
                  {(currentMonthWalks.length === 0 && currentMonthMileage.length === 0) && (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-slate-400 font-medium">No earnings logged for this period yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* --- COMPLETE WALK MODAL --- */}
      {selectedWalk && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">Log Completion</h3>
              <button onClick={() => !isSubmitting && setSelectedWalk(null)} className="text-slate-400 hover:text-slate-600 transition text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleCompleteWalk} className="p-6 space-y-6">
              <div className="bg-teal-50 border border-teal-100 text-teal-800 text-sm p-4 rounded-xl flex items-start">
                <Heart className="h-5 w-5 mr-3 shrink-0 text-teal-500 mt-0.5" />
                <p className="font-medium">Families love seeing updates! Snap a quick photo of {seniors.find(s => s.id === selectedWalk.seniorId)?.name.split(' ')[0]} enjoying their walk and leave a short note.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Upload Photo</label>
                <div 
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-2xl bg-slate-50 transition ${isSubmitting ? 'opacity-50' : 'cursor-pointer hover:bg-slate-100'}`}
                  onClick={() => !isSubmitting && document.getElementById('walk-photo-upload').click()}
                >
                  {walkPhoto ? (
                    <div className="text-center px-4">
                      <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <span className="text-sm font-bold text-emerald-700 block truncate">{walkPhoto.name}</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                      <span className="text-sm font-bold text-teal-600">Tap to take a photo</span>
                    </div>
                  )}
                  <input 
                    id="walk-photo-upload" 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                    onChange={(e) => setWalkPhoto(e.target.files[0])} 
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Note for Family</label>
                <textarea 
                  value={walkNote} 
                  onChange={(e) => setWalkNote(e.target.value)} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm resize-none" 
                  placeholder="e.g. We had a beautiful walk through the park today!" 
                  rows="3"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !walkNote.trim()} 
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-black py-4 rounded-xl shadow-lg transition flex items-center justify-center text-lg"
              >
                {isSubmitting ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Sending...</> : 'Send to Family Portal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- LOG MILEAGE MODAL --- */}
      {selectedMileageWalk && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-teal-50">
              <h3 className="text-xl font-black text-teal-900 flex items-center"><Car className="h-5 w-5 mr-2" /> Log Mileage</h3>
              <button onClick={() => !isSubmitting && setSelectedMileageWalk(null)} className="text-teal-700 hover:text-teal-900 transition text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleLogMileage} className="p-6 space-y-5">
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center mb-2 shadow-sm">
                <User className="h-5 w-5 text-slate-400 mr-3" />
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Visit</div>
                  <div className="font-bold text-slate-800">{seniors.find(s => s.id === selectedMileageWalk.seniorId)?.name || 'Unknown Senior'}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Distance Driven (km)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0"
                  required 
                  value={mileageForm.distance}
                  onChange={e => setMileageForm({...mileageForm, distance: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-slate-50 font-bold text-lg" 
                  placeholder="e.g. 12.5"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-slate-500 mt-2">Reimbursed at ${mileageRate.toFixed(2)} per kilometer.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Notes (Optional)</label>
                <input 
                  type="text" 
                  value={mileageForm.notes}
                  onChange={e => setMileageForm({...mileageForm, notes: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-slate-50 text-sm" 
                  placeholder="e.g. Drove to Arthur's house"
                  disabled={isSubmitting}
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting || !mileageForm.distance}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-black py-4 rounded-xl transition flex items-center justify-center shadow-sm"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit to Payroll'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
