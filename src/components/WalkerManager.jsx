import React, { useState } from 'react';
import { Users, Search, User, Plus, Phone, Mail, ShieldCheck, AlertCircle, Archive, RefreshCcw } from 'lucide-react';

export default function WalkerManager({ walkers, runMutation }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusView, setStatusView] = useState('active');
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    phone: '',
    email: '',
    vscStatus: 'missing', // missing, valid, expired
  });

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleAddWalker = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) return;
    
    setIsUploading(true);
    const newId = `walker_${Date.now()}`;
    
    await runMutation('ws_walkers', newId, 'set', {
      ...formData,
      id: newId,
      role: 'Walker',
      isActive: true
    });

    setFormData({ name: '', username: '', password: '', phone: '', email: '', vscStatus: 'missing' });
    setIsUploading(false);
  };

  const filteredWalkers = walkers.filter(walker => {
    // Hide the master admin from standard directory management
    if (walker.id === 'admin1') return false; 
    
    const isMatch = walker.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isStatusMatch = statusView === 'active' ? walker.isActive !== false : walker.isActive === false;
    return isMatch && isStatusMatch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT COLUMN: Directory */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[800px]">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <Users className="h-5 w-5 mr-2 text-teal-600" />
            Walker Team
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50/50 shrink-0">
          <button onClick={() => setStatusView('active')} className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 ${statusView === 'active' ? 'border-teal-600 text-teal-700 bg-white' : 'border-transparent text-slate-500'}`}>Active Staff</button>
          <button onClick={() => setStatusView('inactive')} className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 ${statusView === 'inactive' ? 'border-amber-500 text-amber-700 bg-white' : 'border-transparent text-slate-500'}`}>Deactivated</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {filteredWalkers.length === 0 ? (
            <div className="text-center p-8 text-slate-500">No walkers found.</div>
          ) : (
            filteredWalkers.map(walker => (
              <div key={walker.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between relative group">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {walker.isActive !== false ? (
                    <button onClick={() => { if(window.confirm('Revoke access for this walker?')) runMutation('ws_walkers', walker.id, 'update', { isActive: false })}} className="p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 rounded"><Archive className="h-4 w-4"/></button>
                  ) : (
                    <button onClick={() => runMutation('ws_walkers', walker.id, 'update', { isActive: true })} className="p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded"><RefreshCcw className="h-4 w-4"/></button>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{walker.name}</h3>
                    <div className="text-xs text-slate-500 font-medium">Login: {walker.username}</div>
                    <div className="flex items-center space-x-3 mt-1.5 text-sm text-slate-600">
                      <span className="flex items-center"><Phone className="h-3.5 w-3.5 mr-1 text-slate-400"/> {walker.phone || 'N/A'}</span>
                      <span className="flex items-center"><Mail className="h-3.5 w-3.5 mr-1 text-slate-400"/> {walker.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 sm:text-right flex flex-col justify-center">
                  {walker.vscStatus === 'valid' ? (
                    <div className="inline-flex items-center justify-end text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
                      <ShieldCheck className="h-4 w-4 mr-1.5" /> Clearances Valid
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-end text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded border border-red-200">
                      <AlertCircle className="h-4 w-4 mr-1.5" /> Action Required (VSC)
                    </div>
                  )}
                  
                  <div className="mt-3 flex justify-end">
                    <select 
                      value={walker.vscStatus || 'missing'} 
                      onChange={(e) => runMutation('ws_walkers', walker.id, 'update', { vscStatus: e.target.value })}
                      className="text-xs border border-slate-300 rounded px-2 py-1 focus:ring-teal-500 bg-white"
                    >
                      <option value="missing">VSC Missing</option>
                      <option value="valid">VSC Valid</option>
                      <option value="expired">VSC Expired</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Add Walker Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-fit">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Add New Walker</h2>
        </div>
        <form onSubmit={handleAddWalker} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm" required disabled={isUploading}/>
          </div>
          
          <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input type="text" value={formData.username} onChange={e => handleChange('username', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm" required disabled={isUploading}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="text" value={formData.password} onChange={e => handleChange('password', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm" required disabled={isUploading}/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="text" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm" disabled={isUploading}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm" disabled={isUploading}/>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Vulnerable Sector Check (VSC)</label>
            <select value={formData.vscStatus} onChange={e => handleChange('vscStatus', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm bg-white" disabled={isUploading}>
              <option value="missing">Not Yet Provided</option>
              <option value="valid">Verified & Valid</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">Required for liability when working with seniors.</p>
          </div>

          <button type="submit" disabled={isUploading} className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded transition flex items-center justify-center disabled:bg-slate-400">
            <Plus className="h-4 w-4 mr-2"/> Create Staff Profile
          </button>
        </form>
      </div>
    </div>
  );
}
