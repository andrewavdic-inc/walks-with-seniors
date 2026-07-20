import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, Trash2, Heart, User, CheckCircle, MapPin, Gift } from 'lucide-react';

// --- INLINE HELPERS ---
const parseLocalSafe = (dateStr) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d || isNaN(y) || isNaN(m) || isNaN(d)) return new Date();
  return new Date(y, m - 1, d);
};

// --- SUB-COMPONENTS ---

function AddWalkModal({ isOpen, onClose, selectedDate, walkers, seniors, runMutation }) {
  const [walkerId, setWalkerId] = useState('');
  const [seniorId, setSeniorId] = useState('');
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [addOns, setAddOns] = useState(''); // <-- NEW STATE FOR GIFTS

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walkerId || !seniorId) return alert("Please select both a Walker and a Senior.");

    const newId = `walk_${Date.now()}`;
    await runMutation('ws_walks', newId, 'set', {
      id: newId,
      walkerId,
      seniorId,
      date,
      startTime,
      endTime,
      status: 'scheduled', // 'scheduled', 'completed', 'cancelled'
      walkNotes: '',
      photoUrl: '',
      addOns: addOns.trim() // <-- SAVES TO DB
    });
    
    onClose();
    setAddOns('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-teal-700 text-white">
          <h3 className="text-lg font-bold">Schedule a Walk</h3>
          <button onClick={onClose} className="text-teal-200 hover:text-white transition text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Senior</label>
            <select value={seniorId} onChange={(e) => setSeniorId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 text-sm font-semibold text-slate-700" required>
              <option value="" disabled>-- Choose a Senior --</option>
              {seniors.filter(s => s.isActive).map(s => <option key={s.id} value={s.id}>{s.name} ({s.address})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assign Walker</label>
            <select value={walkerId} onChange={(e) => setWalkerId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 text-sm" required>
              <option value="" disabled>-- Choose a Walker --</option>
              {walkers.filter(w => w.isActive && w.id !== 'admin1').map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 text-sm" required />
            </div>
          </div>
          
          {/* NEW FIELD: Add-Ons */}
          <div className="border-t border-slate-100 pt-4 mt-2">
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
              <Gift className="h-4 w-4 mr-1.5 text-amber-500" /> Add-Ons / Gifts (Optional)
            </label>
            <input 
              type="text" 
              value={addOns} 
              onChange={(e) => setAddOns(e.target.value)} 
              placeholder="e.g. Bring Fresh Blooms" 
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 text-sm bg-amber-50 placeholder-amber-700/50 text-amber-900 font-medium" 
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-teal-600 rounded-md hover:bg-teal-700 transition shadow-sm flex items-center">
              <Plus className="h-4 w-4 mr-1"/> Dispatch Walk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---

export default function DispatchDashboard({ walks, walkers, seniors, runMutation }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [isDayAgendaOpen, setIsDayAgendaOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handleDayClick = (day) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDateStr(formattedDate);
    setIsDayAgendaOpen(true);
  };

  const getWalkerName = (id) => walkers.find(w => w.id === id)?.name || 'Unknown';
  const getSenior = (id) => seniors.find(s => s.id === id);

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <CalendarIcon className="h-6 w-6 mr-2 text-teal-600" /> Dispatch Center
          </h2>
          <p className="text-sm text-slate-500">Manage schedules and assign walks.</p>
        </div>
        <button 
          onClick={() => { setSelectedDateStr(todayStr); setIsScheduleModalOpen(true); }}
          className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition shadow-sm text-sm"
        >
          <Plus className="h-5 w-5 mr-1" /> Schedule Walk
        </button>
      </div>

      {/* CALENDAR VIEW */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">{monthNames[month]} {year}</h3>
          <div className="flex space-x-2">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1.5 rounded hover:bg-slate-200 transition"><ChevronLeft className="h-5 w-5 text-slate-600" /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-semibold border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition">Today</button>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1.5 rounded hover:bg-slate-200 transition"><ChevronRight className="h-5 w-5 text-slate-600" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px">
          {blanksArray.map(blank => (<div key={`blank-${blank}`} className="bg-white min-h-[120px] opacity-50 p-2"></div>))}
          {daysArray.map(day => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const dayWalks = walks.filter(w => w.date === dateStr).sort((a,b) => String(a.startTime).localeCompare(String(b.startTime)));
            
            return (
              <div 
                key={day} 
                onClick={() => handleDayClick(day)} 
                className={`bg-white min-h-[120px] p-2 hover:bg-teal-50 transition cursor-pointer relative group ${isToday ? 'border-2 border-teal-500 z-10 shadow-inner' : ''}`}
              >
                <div className="flex justify-between items-start mb-1 gap-1">
                  <span className={`font-medium text-sm px-1.5 py-0.5 -ml-1.5 rounded group-hover:text-teal-700 ${isToday ? 'text-teal-700 font-bold' : 'text-slate-600'}`}>{day}</span>
                  {isToday && <span className="text-[9px] font-bold bg-teal-500 text-white px-1.5 py-0.5 rounded shadow-sm">TODAY</span>}
                </div>

                <div className="space-y-1 mt-1">
                  {dayWalks.slice(0, 4).map(walk => {
                    const isCompleted = walk.status === 'completed';
                    return (
                      <div key={walk.id} className={`text-[10px] p-1.5 rounded relative border shadow-sm ${isCompleted ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                        <div className="font-semibold truncate flex items-center justify-between">
                          <div className="flex items-center truncate">
                            {isCompleted ? <CheckCircle className="h-2.5 w-2.5 mr-1 shrink-0" /> : <Clock className="h-2.5 w-2.5 mr-1 shrink-0" />}
                            <span className="truncate">{getSenior(walk.seniorId)?.name.split(' ')[0] || 'Unknown'}</span>
                          </div>
                          {/* Shows a tiny gift icon if addOns exist */}
                          {walk.addOns && <Gift className="h-3 w-3 text-amber-500 shrink-0 ml-1" />}
                        </div>
                        <div className="truncate opacity-80 mt-0.5">{getWalkerName(walk.walkerId).split(' ')[0]}</div>
                      </div>
                    )
                  })}
                  {dayWalks.length > 4 && (
                    <div className="text-[10px] font-bold text-slate-500 text-center bg-slate-100 rounded py-0.5">+{dayWalks.length - 4} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DAILY AGENDA MODAL */}
      {isDayAgendaOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-800 text-white flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold flex items-center"><CalendarIcon className="h-5 w-5 mr-2 text-teal-400"/> Dispatch Agenda: {parseLocalSafe(selectedDateStr).toLocaleDateString()}</h3>
              <button onClick={() => setIsDayAgendaOpen(false)} className="hover:text-slate-300 transition text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-0 bg-slate-50 flex-1 overflow-y-auto">
              <div className="divide-y divide-slate-200">
                {walks.filter(w => w.date === selectedDateStr).length === 0 ? (
                  <div className="p-12 text-center text-slate-500">No walks scheduled for this day.</div>
                ) : (
                  walks.filter(w => w.date === selectedDateStr).sort((a,b) => String(a.startTime).localeCompare(String(b.startTime))).map(walk => {
                    const senior = getSenior(walk.seniorId);
                    const isCompleted = walk.status === 'completed';

                    return (
                      <div key={walk.id} className="p-5 bg-white hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-xl border shadow-sm flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
                            {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg flex items-center">
                              <Heart className="h-4 w-4 mr-1.5 text-rose-500"/> {senior?.name || 'Unknown Senior'}
                            </h4>
                            <div className="text-sm text-slate-600 flex items-center mt-1 font-medium">
                              <User className="h-3.5 w-3.5 mr-1 text-slate-400" /> Assigned: {getWalkerName(walk.walkerId)}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center mt-1">
                              <MapPin className="h-3.5 w-3.5 mr-1" /> {senior?.address || 'No address'}
                            </div>
                            
                            {/* NEW: Highlights Gifts on the Daily Agenda */}
                            {walk.addOns && (
                              <div className="mt-3 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-2 rounded-lg text-sm font-bold flex items-center">
                                <Gift className="h-4 w-4 mr-2 text-amber-600 shrink-0" />
                                Special Instructions: {walk.addOns}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-start sm:items-end justify-between">
                           <div className="text-sm font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 mb-3">
                             {walk.startTime} - {walk.endTime}
                           </div>
                           <button 
                             onClick={() => { if(window.confirm('Are you sure you want to delete this walk from the schedule?')) runMutation('ws_walks', walk.id, 'delete'); }} 
                             className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center transition"
                           >
                             <Trash2 className="h-3 w-3 mr-1" /> Delete Walk
                           </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center shrink-0">
              <button onClick={() => setIsScheduleModalOpen(true)} className="px-4 py-2 text-sm font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-md hover:bg-teal-100 transition shadow-sm">
                + Add Walk to Day
              </button>
              <button onClick={() => setIsDayAgendaOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition shadow-sm">
                Close Agenda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      <AddWalkModal 
        isOpen={isScheduleModalOpen} 
        onClose={() => setIsScheduleModalOpen(false)} 
        selectedDate={selectedDateStr} 
        walkers={walkers} 
        seniors={seniors} 
        runMutation={runMutation} 
      />

    </div>
  );
}
