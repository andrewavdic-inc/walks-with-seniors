import React, { useMemo } from 'react';
import { 
  Heart, CalendarDays, Clock, CheckCircle, 
  MapPin, Activity, Camera, ArrowRight, User 
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

export default function FamilyPortal({ currentUser, seniorProfile, walks = [] }) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const todayStr = now.toISOString().split('T')[0];

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
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER: PEACE OF MIND */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl shadow-lg p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10"><Heart size={180} fill="currentColor" /></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Welcome, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-rose-100 font-medium text-sm sm:text-base max-w-md mb-8">
            Stay connected with {seniorProfile.name.split(' ')[0]}'s activity. View their upcoming schedule and recent walk updates below.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Package Tracker */}
            <div className="bg-black/20 backdrop-blur-md rounded-xl p-5 border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-rose-200 uppercase tracking-widest">Monthly Package</span>
                <span className="text-sm font-black">{remainingWalks} Walks Left</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-2 mb-2 overflow-hidden">
                <div className="h-2 rounded-full bg-white transition-all duration-1000" style={{ width: `${percentUsed}%` }}></div>
              </div>
              <div className="text-[10px] text-rose-200 font-medium text-right">
                {usedWalks} of {packageTotal} walks scheduled/completed this month
              </div>
            </div>

            {/* Next Scheduled Walk */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 flex flex-col justify-center">
              <span className="text-xs font-bold text-rose-200 uppercase tracking-widest mb-1">Next Scheduled Walk</span>
              {nextUpcoming ? (
                <>
                  <div className="text-xl font-black text-white leading-tight">
                    {parseLocalSafe(nextUpcoming.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-sm text-rose-100 font-medium mt-1 flex items-center">
                    <Clock className="h-4 w-4 mr-1.5 opacity-80" /> {nextUpcoming.startTime} - {nextUpcoming.endTime}
                  </div>
                </>
              ) : (
                <div className="text-sm text-rose-100 italic font-medium mt-1">No upcoming walks scheduled.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: The Update Feed */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-black text-slate-800 flex items-center px-1">
            <Camera className="h-5 w-5 mr-2 text-teal-600" /> Recent Updates
          </h2>

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
                  {/* Image Section */}
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

                  {/* Content Section */}
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

        {/* RIGHT COLUMN: Senior Snapshot */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
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
                Need to update these details?
                <a href={`mailto:admin@walkswithseniors.ca`} className="text-teal-600 font-bold mt-1 hover:underline">
                  Contact Administration
                </a>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
