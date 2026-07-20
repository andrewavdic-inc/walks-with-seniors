import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, Trash2, Heart, User, CheckCircle, MapPin, Gift, Pencil, CalendarDays, LayoutList } from 'lucide-react';

// --- INLINE HELPERS ---
const parseLocalSafe = (dateStr) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d || isNaN(y) || isNaN(m) || isNaN(d)) return new Date();
  return new Date(y, m - 1, d);
};

// --- SUB-COMPONENTS ---

function AddWalkModal({ isOpen, onClose, selectedDate, editingWalk, walkers, seniors, runMutation }) {
  const [walkerId, setWalkerId] = useState('');
  const [seniorId, setSeniorId] = useState('');
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [addOns, setAddOns] = useState('');

  // 1 & 2: Updates the modal fields whenever it opens, fixing the stale date issue and allowing edits
  useEffect(() => {
    if (isOpen) {
      if (editingWalk) {
        setWalkerId(editingWalk.walkerId || '');
        setSeniorId(editingWalk.seniorId || '');
        setDate(editingWalk.date || selectedDate || new Date().toISOString().split('T')[0]);
        setStartTime(editingWalk.startTime || '09:00');
        setEndTime(editingWalk.endTime || '10:00');
        setAddOns(editingWalk.addOns || '');
      } else {
        setWalkerId('');
        setSeniorId('');
        setDate(selectedDate || new Date().toISOString().split('T')[0]);
        setStartTime('09:00');
        setEndTime('10:00');
        setAddOns('');
      }
    }
  }, [isOpen, editingWalk, selectedDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walkerId || !seniorId) return alert("Please select both a Walker and a Senior.");

    if (editingWalk) {
      // Edit existing walk
      await runMutation('ws_walks', editingWalk.id, 'update', {
        walkerId,
        seniorId,
        date,
        startTime,
        endTime,
        addOns: addOns.trim()
      });
    } else {
      // Create new walk
      const newId = `walk_${Date.now()}`;
      await runMutation('ws_walks', newId, 'set', {
        id: newId,
        walkerId,
        seniorId,
        date,
        startTime,
        endTime,
        status: 'scheduled',
        walkNotes: '',
        photoUrl: '',
        addOns: addOns.trim()
      });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className={`px-6 py-4 border-b border-slate-200 flex justify-between items-center ${editingWalk ? 'bg-blue-700' : 'bg-teal-700'} text-white`}>
          <h3 className="text-lg font-bold flex items-center">
            {editingWalk ? <><Pencil className="h-5 w-5 mr-2"/> Edit Booking</> : <><Plus className="h-5 w-5 mr-2"/> Schedule a Walk</>}
          </h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition text-2xl leading-none">&times;</button>
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
              {seniors.filter(s => s.isActive || s.id === seniorId).map(s => <option key={s.id} value={s.id}>{s.name} ({s.address})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assign Walker</label>
            <select value={walkerId} onChange={(e) => setWalkerId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 text-sm" required>
              <option value="" disabled>-- Choose a Walker --</option>
              {walkers.filter(w => (w.isActive && w.id !== 'admin1') || w.id === walkerId).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
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
            <button type="submit" className={`px-4 py-2 text-sm font-bold text-white rounded-md transition shadow-sm flex items-center ${editingWalk ? 'bg-blue-600 hover:bg-blue-700' : 'bg-teal-600 hover:bg-teal-700'}`}>
              {editingWalk ? <><CheckCircle className="h-4 w-4 mr-1"/> Save Changes</> : <><Plus className="h-4 w-4 mr-1"/> Dispatch Walk</>}
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
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingWalk, setEditingWalk] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

  // Helper getters
  const getWalkerName = (id) => walkers.find(w => w.id === id)?.name || 'Unknown';
  const getSenior = (id) => seniors.find(s => s.id === id);

  // --- ACTIONS ---
  const openModalForNew = (dateStr) => {
    setEditingWalk(null);
    setCurrentDate(parseLocalSafe(dateStr));
    setIsScheduleModalOpen(true);
  };

  const openModalForEdit = (walk) => {
    setEditingWalk(walk);
    setCurrentDate(parseLocalSafe(walk.date));
    setIsScheduleModalOpen(true);
  };

  const goToDayView = (dateObj) => {
    setCurrentDate(dateObj);
    setViewMode('day');
  };

  // --- NAVIGATION MATH ---
  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    if (viewMode === 'week') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    if (viewMode === 'day') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    if (viewMode === 'week') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    if (viewMode === 'day') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1));
  };

  const getHeaderTitle = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (viewMode === 'month') return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6);
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      }
      return `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
    }

    if (viewMode === 'day') return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };


  // --- VIEW RENDERERS ---
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanksArray = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    return (
      <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px">
        {blanksArray.map(blank => (<div key={`blank-${blank}`} className="bg-white min-h-[120px] opacity-50 p-2"></div>))}
        {daysArray.map(day => {
          const dayDate = new Date(year, month, day);
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const dayWalks = walks.filter(w => w.date === dateStr).sort((a,b) => String(a.startTime).localeCompare(String(b.startTime)));
          
          return (
            <div key={day} className={`bg-white min-h-[130px] p-2 hover:bg-teal-50 transition relative group flex flex-col ${isToday ? 'border-2 border-teal-500 z-10 shadow-inner' : ''}`}>
              <div className="flex justify-between items-start mb-1 gap-1">
                <span 
                  onClick={() => goToDayView(dayDate)}
                  className={`font-medium text-sm px-1.5 py-0.5 -ml-1.5 rounded cursor-pointer hover:bg-slate-200 ${isToday ? 'text-teal-700 font-bold' : 'text-slate-600'}`}
                >
                  {day}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); openModalForNew(dateStr); }} 
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-teal-100 rounded text-slate-400 hover:text-teal-700 transition"
                  title="Schedule Walk Here"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1 flex-1 overflow-hidden" onClick={() => goToDayView(dayDate)}>
                {/* STRICT LIMIT OF 3 PER DAY IN MONTH VIEW */}
                {dayWalks.slice(0, 3).map(walk => {
                  const isCompleted = walk.status === 'completed';
                  return (
                    <div key={walk.id} className={`text-[10px] p-1.5 rounded relative border shadow-sm cursor-pointer hover:brightness-95 ${isCompleted ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                      <div className="font-semibold truncate flex items-center justify-between">
                        <div className="flex items-center truncate">
                          {isCompleted ? <CheckCircle className="h-2.5 w-2.5 mr-1 shrink-0" /> : <Clock className="h-2.5 w-2.5 mr-1 shrink-0" />}
                          <span className="truncate">{getSenior(walk.seniorId)?.name.split(' ')[0] || 'Unknown'}</span>
                        </div>
                        {walk.addOns && <Gift className="h-3 w-3 text-amber-500 shrink-0 ml-1" />}
                      </div>
                      <div className="truncate opacity-80 mt-0.5">{getWalkerName(walk.walkerId).split(' ')[0]}</div>
                    </div>
                  )
                })}
                {dayWalks.length > 3 && (
                  <div className="text-[10px] font-bold text-teal-600 hover:text-teal-800 text-center bg-teal-50 hover:bg-teal-100 border border-teal-100 rounded py-1 mt-1 cursor-pointer transition">
                    + {dayWalks.length - 3} more walks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay());
    const weekDays = Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i));

    return (
      <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px min-h-[500px]">
        {weekDays.map((dayDate, i) => {
          const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const dayWalks = walks.filter(w => w.date === dateStr).sort((a,b) => String(a.startTime).localeCompare(String(b.startTime)));

          return (
            <div key={i} className={`bg-white p-2 flex flex-col hover:bg-slate-50 transition relative ${isToday ? 'border-2 border-teal-500 z-10 shadow-inner' : ''}`}>
              <div 
                className="text-center mb-3 pb-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100 rounded transition" 
                onClick={() => goToDayView(dayDate)}
              >
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{dayDate.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className={`text-xl font-black ${isToday ? 'text-teal-600' : 'text-slate-700'}`}>{dayDate.getDate()}</div>
              </div>
              
              <div className="space-y-2 flex-1 overflow-y-auto scrollbar-hide">
                {dayWalks.map(walk => {
                  const isCompleted = walk.status === 'completed';
                  return (
                    <div 
                      key={walk.id} 
                      onClick={() => openModalForEdit(walk)}
                      className={`text-xs p-2 rounded-lg relative border shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition ${isCompleted ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}
                    >
                      <div className="font-bold flex items-center justify-between mb-1">
                        <span className="bg-white/50 px-1.5 py-0.5 rounded text-[10px]">{walk.startTime}</span>
                        {walk.addOns && <Gift className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                      </div>
                      <div className="font-black truncate">{getSenior(walk.seniorId)?.name || 'Unknown'}</div>
                      <div className="truncate opacity-80 mt-0.5 flex items-center"><User className="h-3 w-3 mr-1"/>{getWalkerName(walk.walkerId).split(' ')[0]}</div>
                    </div>
                  )
                })}
              </div>
              <button onClick={() => openModalForNew(dateStr)} className="mt-3 w-full py-1.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-teal-100 hover:text-teal-700 rounded transition flex items-center justify-center border border-slate-200">
                <Plus className="h-3 w-3 mr-1" /> Add Walk
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayWalks = walks.filter(w => w.date === currentDateStr).sort((a,b) => String(a.startTime).localeCompare(String(b.startTime)));

    return (
      <div className="bg-slate-50 p-6 flex-1 min-h-[500px]">
        <div className="max-w-4xl mx-auto space-y-4">
          {dayWalks.length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-500 rounded-xl border border-dashed border-slate-300 shadow-sm flex flex-col items-center">
              <CalendarIcon className="h-10 w-10 text-slate-300 mb-3" />
              <p className="font-medium text-lg text-slate-600">No walks scheduled for this day.</p>
              <button onClick={() => openModalForNew(currentDateStr)} className="mt-4 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition shadow-sm">
                Schedule First Walk
              </button>
            </div>
          ) : (
            dayWalks.map(walk => {
              const senior = getSenior(walk.seniorId);
              const isCompleted = walk.status === 'completed';

              return (
                <div key={walk.id} className="p-5 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-teal-300 transition">
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
                      
                      {/* Displays Gifts on the Daily Agenda */}
                      {walk.addOns && (
                        <div className="mt-3 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-2 rounded-lg text-sm font-bold flex items-center shadow-sm">
                          <Gift className="h-4 w-4 mr-2 text-amber-600 shrink-0" />
                          Special Instructions: {walk.addOns}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start sm:items-end justify-between">
                     <div className="text-sm font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 mb-3 text-center sm:text-right min-w-[140px]">
                       {walk.startTime} - {walk.endTime}
                     </div>
                     <div className="flex space-x-2 w-full sm:w-auto">
                       <button 
                         onClick={() => openModalForEdit(walk)} 
                         className="flex-1 sm:flex-none text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center justify-center transition"
                       >
                         <Pencil className="h-3 w-3 mr-1" /> Edit
                       </button>
                       <button 
                         onClick={() => { if(window.confirm('Are you sure you want to delete this walk from the schedule?')) runMutation('ws_walks', walk.id, 'delete'); }} 
                         className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg flex items-center justify-center transition"
                       >
                         <Trash2 className="h-3 w-3 mr-1" /> Delete
                       </button>
                     </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };


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
        
        {/* VIEW TOGGLES */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-full sm:w-auto">
          <button onClick={() => setViewMode('month')} className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-bold rounded-md transition flex items-center justify-center ${viewMode === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <CalendarIcon className="h-4 w-4 mr-1.5 sm:mr-0 lg:mr-1.5" /> <span className="sm:hidden lg:inline">Month</span>
          </button>
          <button onClick={() => setViewMode('week')} className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-bold rounded-md transition flex items-center justify-center ${viewMode === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <CalendarDays className="h-4 w-4 mr-1.5 sm:mr-0 lg:mr-1.5" /> <span className="sm:hidden lg:inline">Week</span>
          </button>
          <button onClick={() => setViewMode('day')} className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-bold rounded-md transition flex items-center justify-center ${viewMode === 'day' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <LayoutList className="h-4 w-4 mr-1.5 sm:mr-0 lg:mr-1.5" /> <span className="sm:hidden lg:inline">Day</span>
          </button>
        </div>

        <button 
          onClick={() => openModalForNew(currentDateStr)}
          className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition shadow-sm text-sm"
        >
          <Plus className="h-4 w-4 mr-1" /> Schedule Walk
        </button>
      </div>

      {/* CALENDAR CONTAINER */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* CALENDAR DATE HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">{getHeaderTitle()}</h3>
          <div className="flex space-x-2">
            <button onClick={handlePrev} className="p-1.5 rounded hover:bg-slate-200 transition"><ChevronLeft className="h-5 w-5 text-slate-600" /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-semibold border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition bg-white">Today</button>
            <button onClick={handleNext} className="p-1.5 rounded hover:bg-slate-200 transition"><ChevronRight className="h-5 w-5 text-slate-600" /></button>
          </div>
        </div>

        {/* COLUMN HEADERS (Only for Month and Week views) */}
        {viewMode !== 'day' && (
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{day}</div>
            ))}
          </div>
        )}
        
        {/* RENDER DYNAMIC VIEW */}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}

      </div>

      {/* SCHEDULE/EDIT MODAL */}
      <AddWalkModal 
        isOpen={isScheduleModalOpen} 
        onClose={() => setIsScheduleModalOpen(false)} 
        selectedDate={currentDateStr} 
        editingWalk={editingWalk}
        walkers={walkers} 
        seniors={seniors} 
        runMutation={runMutation} 
      />

    </div>
  );
}
