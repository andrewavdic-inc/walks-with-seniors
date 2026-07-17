import React, { useState, useEffect } from 'react';
import { 
  MapPin, Clock, Camera, CheckCircle, CloudSun, Heart, 
  Activity, Phone, Loader2, Image as ImageIcon, ChevronRight 
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
  walks = [], 
  seniors = [], 
  runMutation, 
  handleFileUpload 
}) {
  const [weather, setWeather] = useState({ temp: '--', condition: 'Fetching...', icon: '⛅' });
  const [selectedWalk, setSelectedWalk] = useState(null); // Used to open the Complete Modal
  const [walkNote, setWalkNote] = useState('');
  const [walkPhoto, setWalkPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // --- DATA DERIVATION ---
  const myWalksToday = walks.filter(w => w.walkerId === currentUser.id && w.date === todayStr)
                            .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
  
  const myCompletedWalksTotal = walks.filter(w => w.walkerId === currentUser.id && w.status === 'completed').length;

  // --- WEATHER WIDGET (Kept from AdminDesk) ---
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

    await runMutation('ws_walks', selectedWalk.id, 'update', {
      status: 'completed',
      walkNotes: walkNote,
      photoUrl: uploadedUrl || ''
    });

    setIsSubmitting(false);
    setSelectedWalk(null);
    setWalkNote('');
    setWalkPhoto(null);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
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

                    {/* Care Notes Grid */}
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

                    {/* Action Area */}
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
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <span className="text-sm font-bold text-emerald-700">{walkPhoto.name}</span>
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
    </div>
  );
}
