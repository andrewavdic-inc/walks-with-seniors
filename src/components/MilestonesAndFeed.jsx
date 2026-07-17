import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MessageSquare, Send, User, Trash2, AlertTriangle, CheckCircle, 
  Camera, Loader2, Image as ImageIcon, Users, CheckSquare, 
  Lock, Award, Medal, Trophy, Star, Map, CalendarDays
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

const STANDARD_BADGES = [
  { id: '10_walks', icon: '👟', label: '10 Walks Milestone' },
  { id: '50_walks', icon: '🏃', label: '50 Walks Milestone' },
  { id: '100_walks', icon: '🏅', label: '100 Walks Centurion' },
  { id: 'rain_shine', icon: '☔', label: 'Rain or Shine Walker' },
  { id: 'senior_fav', icon: '💖', label: 'Senior Favorite' },
  { id: 'weekend', icon: '🌅', label: 'Weekend Warrior' }
];

export default function MilestonesAndFeed({ 
  currentUser, 
  walkers = [], 
  walks = [],
  messages = [], 
  directMessages = [],
  milestones = [],
  runMutation,
  handleFileUpload,
  bulletinPictureUrl 
}) {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'chat', 'issue_badge', 'leaderboard'
  
  // Feed State
  const [feedText, setFeedText] = useState('');
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [expandedTrackerId, setExpandedTrackerId] = useState(null);

  // Chat State
  const [selectedDmUserId, setSelectedDmUserId] = useState(null);
  const [dmText, setDmText] = useState('');
  const chatEndRef = useRef(null);

  // Badge State
  const [badgeWalkerId, setBadgeWalkerId] = useState('');
  const [badgeType, setBadgeType] = useState(STANDARD_BADGES[0].label);
  const [badgeNote, setBadgeNote] = useState('');
  const [isSubmittingBadge, setIsSubmittingBadge] = useState(false);

  const activeWalkers = walkers.filter(w => w.isActive && w.id !== 'admin1');
  const now = new Date();

  // --- LEADERBOARD MATH ---
  const leaderboard = useMemo(() => {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return activeWalkers.map(walker => {
      const completedThisMonth = walks.filter(w => {
        if (w.walkerId !== walker.id || w.status !== 'completed' || !w.date) return false;
        const d = parseLocalSafe(w.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      return { walker, walkCount: completedThisMonth.length };
    }).filter(r => r.walkCount > 0).sort((a, b) => b.walkCount - a.walkCount);
  }, [activeWalkers, walks, now]);

  // --- AUTO SCROLL CHAT ---
  useEffect(() => {
    if (activeTab === 'chat') {
       chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [directMessages, activeTab, selectedDmUserId]);

  // --- HANDLERS ---
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!feedText.trim()) return;
    
    const newId = `msg_${Date.now()}`;
    await runMutation('ws_messages', newId, 'set', {
      id: newId,
      text: feedText,
      senderId: currentUser.id,
      date: new Date().toISOString(),
      isHighPriority,
      acknowledgements: []
    });
    
    setFeedText('');
    setIsHighPriority(false);
  };

  const handleSendDm = async (e) => {
    e.preventDefault();
    if (!dmText.trim() || !selectedDmUserId) return;
    
    const newId = `dm_${Date.now()}`;
    await runMutation('ws_directMessages', newId, 'set', {
      id: newId,
      text: dmText,
      senderId: currentUser.id,
      receiverId: selectedDmUserId,
      date: new Date().toISOString(),
      read: false
    });
    setDmText('');
  };

  const handleIssueBadge = async (e) => {
    e.preventDefault();
    if (!badgeWalkerId || !badgeNote || isSubmittingBadge) return;
    
    setIsSubmittingBadge(true);
    const badgeObj = STANDARD_BADGES.find(b => b.label === badgeType);
    const newId = `milestone_${Date.now()}`;
    
    await runMutation('ws_milestones', newId, 'set', {
      id: newId,
      walkerId: badgeWalkerId,
      date: new Date().toISOString().split('T')[0],
      icon: badgeObj?.icon || '⭐',
      label: badgeType,
      note: badgeNote
    });

    setBadgeWalkerId('');
    setBadgeNote('');
    setIsSubmittingBadge(false);
    alert('Milestone badge awarded!');
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingPic(true);
    const url = await handleFileUpload(file, 'bulletin');
    if (url) {
      await runMutation('ws_settings', 'global', 'update', { bulletinPictureUrl: url });
    }
    setIsUploadingPic(false);
  };

  // --- RENDER HELPERS ---
  const sortedMessages = [...messages].sort((a,b) => new Date(b.date) - new Date(a.date));
  
  const renderChat = () => {
    const activeMessages = [...directMessages].filter(m => 
      (m.senderId === currentUser.id && m.receiverId === selectedDmUserId) || 
      (m.senderId === selectedDmUserId && m.receiverId === currentUser.id)
    ).sort((a,b) => new Date(a.date) - new Date(b.date));

    return (
      <div className="flex flex-col sm:flex-row h-[600px] border-t border-slate-200">
        <div className="w-full sm:w-1/3 border-r border-slate-200 bg-white overflow-y-auto shrink-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-sm text-slate-700 sticky top-0">
            Walker Directory
          </div>
          <div className="divide-y divide-slate-100">
            {activeWalkers.map(walker => {
              const unreadCount = directMessages.filter(m => m.senderId === walker.id && m.receiverId === currentUser.id && !m.read).length;
              return (
                <button 
                  key={walker.id} 
                  onClick={() => {
                    setSelectedDmUserId(walker.id);
                    // Mark as read immediately
                    directMessages.filter(m => m.senderId === walker.id && m.receiverId === currentUser.id && !m.read)
                      .forEach(m => runMutation('ws_directMessages', m.id, 'update', { read: true }));
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition relative ${selectedDmUserId === walker.id ? 'bg-teal-50 border-l-4 border-l-teal-500' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className="font-bold text-sm text-slate-800">{walker.name}</div>
                  {unreadCount > 0 && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-slate-50">
          {!selectedDmUserId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">Select a walker to start a secure chat.</p>
            </div>
          ) : (
            <>
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {activeMessages.length === 0 ? (
                  <div className="text-center py-10 text-sm text-slate-400 italic">No messages yet.</div>
                ) : (
                  activeMessages.map(m => {
                    const isMine = m.senderId === currentUser.id;
                    return (
                      <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isMine ? 'bg-teal-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
                          <div className="whitespace-pre-wrap">{m.text}</div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendDm} className="p-4 bg-white border-t border-slate-200 flex gap-3">
                <input type="text" value={dmText} onChange={e => setDmText(e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-full focus:ring-2 focus:ring-teal-500 text-sm" placeholder="Type a message..." />
                <button type="submit" disabled={!dmText.trim()} className="bg-teal-600 hover:bg-teal-700 text-white rounded-full h-10 w-10 flex items-center justify-center shrink-0 disabled:bg-slate-300">
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[850px]">
      {/* HEADER & TABS */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Award className="h-6 w-6 mr-2 text-teal-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-800">Culture & Communication</h2>
            <p className="text-xs text-slate-500 font-medium">Broadcasts, Chats, and Milestones</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200 p-1 rounded-lg w-full sm:w-auto shrink-0 overflow-x-auto">
          <button onClick={() => setActiveTab('feed')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === 'feed' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Company Feed</button>
          <button onClick={() => setActiveTab('chat')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors whitespace-nowrap flex items-center ${activeTab === 'chat' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}><Lock className="h-3.5 w-3.5 mr-1.5" /> Secure Chat</button>
          <button onClick={() => setActiveTab('issue_badge')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === 'issue_badge' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Issue Badge</button>
          <button onClick={() => setActiveTab('leaderboard')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === 'leaderboard' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Leaderboard</button>
        </div>
      </div>

      {/* TAB 1: COMPANY FEED */}
      {activeTab === 'feed' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            
            <div className="bg-slate-100 border border-slate-200 rounded-xl overflow-hidden relative group min-h-[150px] flex items-center justify-center">
              {isUploadingPic ? (
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              ) : bulletinPictureUrl ? (
                <img src={bulletinPictureUrl} alt="Bulletin" className="w-full object-cover max-h-[300px]" />
              ) : (
                <div className="text-slate-400 flex flex-col items-center"><ImageIcon className="h-10 w-10 mb-2 opacity-50" /><span className="text-sm font-medium">Bulletin Board Poster</span></div>
              )}
              <label className="absolute inset-0 bg-slate-900/0 hover:bg-slate-900/40 transition-all flex items-center justify-center cursor-pointer group-hover:opacity-100 opacity-0">
                <div className="bg-white text-slate-800 px-4 py-2 rounded-lg shadow font-bold text-sm flex items-center transform translate-y-4 group-hover:translate-y-0 transition-all">
                  <Camera className="h-4 w-4 mr-2" /> Change Picture
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handlePicUpload} disabled={isUploadingPic} />
              </label>
            </div>

            <div className="space-y-4">
              {sortedMessages.length === 0 ? (
                <div className="text-center text-slate-500 py-8 italic border border-dashed border-slate-300 rounded-xl">No announcements yet.</div>
              ) : (
                sortedMessages.map(m => (
                  <div key={m.id} className={`bg-white border rounded-lg p-5 shadow-sm relative ${m.isHighPriority ? 'border-yellow-300' : 'border-slate-200'}`}>
                    {m.isHighPriority && <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>}
                    <div className="flex justify-between items-start mb-2 border-b border-slate-100 pb-2">
                      <div className="font-bold text-sm text-slate-800 flex items-center">
                        <User className="h-4 w-4 mr-1.5 text-slate-400" /> Master Admin
                        {m.isHighPriority && <span className="ml-2 bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold flex items-center border border-yellow-200"><AlertTriangle className="h-3 w-3 mr-1" /> Priority</span>}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-slate-500">{new Date(m.date).toLocaleDateString()}</span>
                        <button onClick={() => { if(window.confirm('Delete this broadcast?')) runMutation('ws_messages', m.id, 'delete'); }} className="text-slate-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">{m.text}</div>
                    
                    {m.isHighPriority && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <button onClick={() => setExpandedTrackerId(expandedTrackerId === m.id ? null : m.id)} className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition flex items-center">
                          <Users className="h-4 w-4 mr-1.5" /> Tracker: {m.acknowledgements?.length || 0} / {activeWalkers.length} Acknowledged
                        </button>
                        {expandedTrackerId === m.id && (
                          <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                            <span className="font-bold text-slate-700">Acknowledged by: </span>
                            <span className="text-slate-600">
                              {activeWalkers.filter(w => (m.acknowledgements||[]).includes(w.id)).map(w => w.name).join(', ') || 'No one yet.'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <form onSubmit={handleBroadcast} className="p-5 border-t border-slate-200 bg-slate-50 flex flex-col gap-3 shrink-0">
            <textarea 
              value={feedText} 
              onChange={(e) => setFeedText(e.target.value)} 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-teal-500 text-sm resize-none" 
              placeholder="Broadcast an update to all Walkers..." 
              rows="2"
            />
            <div className="flex justify-between items-center">
              <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input type="checkbox" checked={isHighPriority} onChange={(e) => setIsHighPriority(e.target.checked)} className="rounded text-yellow-500 focus:ring-yellow-400 h-4 w-4" />
                <span>Require Acknowledgement</span>
              </label>
              <button type="submit" disabled={!feedText.trim()} className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-md px-6 py-2 font-bold text-sm transition shadow-sm flex items-center">
                <Send className="h-4 w-4 mr-2" /> Broadcast
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SECURE CHAT */}
      {activeTab === 'chat' && renderChat()}

      {/* TAB 3: ISSUE BADGE */}
      {activeTab === 'issue_badge' && (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/50 flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-slate-200 bg-amber-50 flex items-center">
              <Star className="h-5 w-5 mr-2 text-amber-600" />
              <h2 className="text-lg font-bold text-amber-900">Award a Milestone Badge</h2>
            </div>
            <form onSubmit={handleIssueBadge} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Select Walker</label>
                <select value={badgeWalkerId} onChange={(e)=>setBadgeWalkerId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-amber-500 text-sm bg-white" required>
                  <option value="" disabled>-- Choose --</option>
                  {activeWalkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Milestone Badge</label>
                <select value={badgeType} onChange={(e)=>setBadgeType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-amber-500 text-sm bg-white">
                  {STANDARD_BADGES.map(b => <option key={b.id} value={b.label}>{b.icon} {b.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Congratulatory Note</label>
                <textarea value={badgeNote} onChange={(e)=>setBadgeNote(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-amber-500 text-sm" rows="3" placeholder="Great job hitting 50 walks! Thanks for your hard work." required />
              </div>
              <button type="submit" disabled={isSubmittingBadge} className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-400 text-white font-bold py-2.5 rounded-md transition flex items-center justify-center shadow-sm">
                {isSubmittingBadge ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Award className="h-4 w-4 mr-2"/>} Issue Milestone
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit flex flex-col max-h-[600px]">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50"><h3 className="font-bold text-slate-800">Recent Milestones Issued</h3></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {milestones.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No milestones awarded yet.</p>
              ) : (
                [...milestones].sort((a,b) => new Date(b.date) - new Date(a.date)).map(m => {
                  const walker = walkers.find(w => w.id === m.walkerId);
                  return (
                    <div key={m.id} className="border border-slate-200 rounded-lg p-3 flex items-start bg-slate-50 hover:bg-white transition group">
                      <div className="text-3xl bg-white border border-slate-100 shadow-sm h-12 w-12 rounded-full flex items-center justify-center shrink-0 mr-3">{m.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800 text-sm">{walker?.name || 'Unknown'}</div>
                        <div className="text-xs font-bold text-amber-600">{m.label}</div>
                        <div className="text-xs text-slate-500 italic mt-1">"{m.note}"</div>
                      </div>
                      <button onClick={() => { if(window.confirm('Revoke this badge?')) runMutation('ws_milestones', m.id, 'delete')}} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                        <Trash2 className="h-4 w-4"/>
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="p-6 bg-gradient-to-b from-slate-50 to-slate-100 flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <Map className="h-12 w-12 text-teal-600 mx-auto mb-3" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Distance Leaderboard</h2>
              <p className="text-slate-500 font-medium mt-1">Ranking walkers by completed walks for {now.toLocaleString('en-US', { month: 'long', year: 'numeric' })}.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-teal-700 text-white">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Rank</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Walker Name</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Completed Walks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboard.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-10 text-slate-500">No walks completed this month yet.</td></tr>
                  ) : (
                    leaderboard.map((r, idx) => (
                      <tr key={r.walker.id} className="hover:bg-teal-50 transition">
                        <td className="px-6 py-4 font-black text-slate-500">
                          {idx === 0 ? <Trophy className="h-6 w-6 text-yellow-500" /> : 
                           idx === 1 ? <Medal className="h-6 w-6 text-slate-400" /> : 
                           idx === 2 ? <Award className="h-6 w-6 text-amber-600" /> : 
                           <span className="ml-2">{idx + 1}</span>}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800 text-lg">{r.walker.name}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center justify-center bg-teal-100 text-teal-800 font-black px-4 py-1.5 rounded-full border border-teal-200">
                            {r.walkCount}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
