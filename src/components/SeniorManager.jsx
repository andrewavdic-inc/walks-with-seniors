import React, { useState } from 'react';
import { Heart, Search, MapPin, Activity, Phone, Plus, User, Archive, RefreshCcw, Key, ShoppingBag, ExternalLink, X, Pencil } from 'lucide-react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export default function SeniorManager({ seniors, runMutation }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusView, setStatusView] = useState('active');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [editingId, setEditingId] = useState(null); // Tracks which senior is being edited

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    mobility: 'Independent', 
    pace: 'Moderate', 
    routePreferences: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    monthlyWalksPackage: '8', 
    accountHolderName: '', 
    accountHolderEmail: '' 
  });

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleEditClick = (senior) => {
    setEditingId(senior.id);
    setFormData({
      name: senior.name || '',
      address: senior.address || '',
      phone: senior.phone || '',
      mobility: senior.mobility || 'Independent',
      pace: senior.pace || 'Moderate',
      routePreferences: senior.routePreferences || '',
      emergencyContactName: senior.emergencyContactName || '',
      emergencyContactPhone: senior.emergencyContactPhone || '',
      monthlyWalksPackage: senior.monthlyWalksPackage?.toString() || '8',
      accountHolderName: senior.accountHolderName || '',
      accountHolderEmail: senior.accountHolderEmail || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '', address: '', phone: '', mobility: 'Independent', pace: 'Moderate', 
      routePreferences: '', emergencyContactName: '', emergencyContactPhone: '', monthlyWalksPackage: '8',
      accountHolderName: '', accountHolderEmail: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setIsUploading(true);

    if (editingId) {
      // Update existing senior
      await runMutation('ws_seniors', editingId, 'update', {
        ...formData,
        monthlyWalksPackage: Number(formData.monthlyWalksPackage) || 0
      });
      setEditingId(null);
    } else {
      // Create new senior
      const newId = `senior_${Date.now()}`;
      await runMutation('ws_seniors', newId, 'set', {
        ...formData,
        id: newId,
        monthlyWalksPackage: Number(formData.monthlyWalksPackage) || 0,
        isActive: true
      });
    }

    setFormData({
      name: '', address: '', phone: '', mobility: 'Independent', pace: 'Moderate', 
      routePreferences: '', emergencyContactName: '', emergencyContactPhone: '', monthlyWalksPackage: '8',
      accountHolderName: '', accountHolderEmail: ''
    });
    setIsUploading(false);
  };

  const handlePasswordReset = async (email) => {
    if (!email) return;
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      alert(`A secure password reset link has been sent to ${email}`);
    } catch (error) {
      console.error("Reset error:", error);
      alert("Failed to send reset email. Please ensure this email is registered in the system.");
    }
  };

  const filteredSeniors = seniors.filter(senior => {
    const isMatch = senior.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isStatusMatch = statusView === 'active' ? senior.isActive !== false : senior.isActive === false;
    return isMatch && isStatusMatch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT COLUMN: Directory */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[800px]">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-teal-600" />
            Senior Directory
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50/50 shrink-0">
          <button onClick={() => setStatusView('active')} className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 ${statusView === 'active' ? 'border-teal-600 text-teal-700 bg-white' : 'border-transparent text-slate-500'}`}>Active</button>
          <button onClick={() => setStatusView('inactive')} className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 ${statusView === 'inactive' ? 'border-amber-500 text-amber-700 bg-white' : 'border-transparent text-slate-500'}`}>Inactive</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {filteredSeniors.length === 0 ? (
            <div className="text-center p-8 text-slate-500">No seniors found.</div>
          ) : (
            filteredSeniors.map(senior => (
              <div key={senior.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col relative group">
                
                {/* Action Buttons (Edit / Archive / Restore) */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 bg-white shadow-sm rounded-md border border-slate-100 p-0.5 z-10">
                  <button onClick={() => handleEditClick(senior)} className="p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded" title="Edit Profile">
                    <Pencil className="h-4 w-4"/>
                  </button>
                  {senior.isActive !== false ? (
                    <button onClick={() => { if(window.confirm('Deactivate this profile?')) runMutation('ws_seniors', senior.id, 'update', { isActive: false })}} className="p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 rounded" title="Archive Profile">
                      <Archive className="h-4 w-4"/>
                    </button>
                  ) : (
                    <button onClick={() => runMutation('ws_seniors', senior.id, 'update', { isActive: true })} className="p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded" title="Restore Profile">
                      <RefreshCcw className="h-4 w-4"/>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{senior.name}</h3>
                    <div className="flex items-center space-x-3 mt-1 text-sm text-slate-600">
                      <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-slate-400"/> {senior.address || 'No address provided'}</span>
                      <span className="flex items-center"><Phone className="h-4 w-4 mr-1 text-slate-400"/> {senior.phone || 'No phone provided'}</span>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded text-xs font-bold flex items-center">
                        <Activity className="h-3.5 w-3.5 mr-1" /> Pace: {senior.pace || 'Moderate'}
                      </span>
                      <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded text-xs font-bold">
                        Aid: {senior.mobility || 'Independent'}
                      </span>
                    </div>

                    {senior.routePreferences && (
                      <p className="mt-3 text-sm text-slate-600 italic">" {senior.routePreferences} "</p>
                    )}
                  </div>

                  <div className="mt-4 sm:mt-0 sm:text-right flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase">Monthly Package</div>
                      <div className="text-xl font-black text-teal-600">{senior.monthlyWalksPackage || 0} Walks</div>
                    </div>

                    {/* Sell Add-On Button */}
                    <div className="mt-3 relative">
                      <button 
                        onClick={() => setActiveTooltip(activeTooltip === senior.id ? null : senior.id)}
                        className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg font-bold transition flex items-center ml-auto"
                      >
                        <ShoppingBag className="h-3 w-3 mr-1.5" /> Sell Add-On
                      </button>

                      {activeTooltip === senior.id && (
                        <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 text-left animate-in fade-in zoom-in-95">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-slate-800 text-sm">Phone Add-On Sale</h4>
                            <button onClick={() => setActiveTooltip(null)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4"/></button>
                          </div>
                          <ol className="text-xs text-slate-600 space-y-2 mb-4 list-decimal pl-4 marker:font-bold marker:text-amber-600">
                            <li>Open Stripe and search for <strong>{senior.accountHolderName || senior.name}</strong>.</li>
                            <li>Create a "One-off charge" on their saved card.</li>
                            <li>Go to the <strong>Dispatch Center</strong> and add the item to an upcoming walk.</li>
                          </ol>
                          <a href="https://dashboard.stripe.com/customers" target="_blank" rel="noopener noreferrer" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg transition flex items-center justify-center text-xs shadow-sm">
                            Launch Stripe <ExternalLink className="h-3 w-3 ml-1.5" />
                          </a>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* FAMILY PORTAL ACCESS CONTROLS */}
                <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase flex items-center mb-1"><User className="h-3 w-3 mr-1"/> Family Portal Login</div>
                    {senior.accountHolderEmail ? (
                      <div className="text-sm font-medium text-slate-700">{senior.accountHolderName} ({senior.accountHolderEmail})</div>
                    ) : (
                      <div className="text-sm font-medium text-amber-600">No portal account linked</div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {senior.accountHolderEmail && (
                      <button 
                        onClick={() => handlePasswordReset(senior.accountHolderEmail)}
                        className="text-xs bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 hover:border-teal-200 px-3 py-2 rounded-lg transition flex items-center font-bold"
                      >
                        <Key className="h-3 w-3 mr-1.5" /> Send Password Reset
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Senior Form (Add or Edit) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-fit">
        <div className={`px-6 py-4 border-b border-slate-200 ${editingId ? 'bg-blue-50 text-blue-900' : 'bg-slate-50 text-slate-800'}`}>
          <h2 className="text-lg font-semibold flex items-center">
            {editingId ? <><Pencil className="h-5 w-5 mr-2" /> Edit Senior Profile</> : 'Add New Senior'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm" required disabled={isUploading}/>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="text" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm" disabled={isUploading}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Walk Package / Mo</label>
              <input type="number" min="0" value={formData.monthlyWalksPackage} onChange={e => handleChange('monthlyWalksPackage', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm font-bold" required disabled={isUploading}/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Address</label>
            <input type="text" value={formData.address} onChange={e => handleChange('address', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm" required disabled={isUploading}/>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Walking Pace</label>
              <select value={formData.pace} onChange={e => handleChange('pace', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm bg-white" disabled={isUploading}>
                <option value="Leisurely">Leisurely</option>
                <option value="Moderate">Moderate</option>
                <option value="Brisk">Brisk</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobility Aid</label>
              <select value={formData.mobility} onChange={e => handleChange('mobility', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm bg-white" disabled={isUploading}>
                <option value="Independent">Independent</option>
                <option value="Cane">Cane</option>
                <option value="Walker">Walker</option>
                <option value="Wheelchair">Wheelchair</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Route Preferences & Notes</label>
            <textarea value={formData.routePreferences} onChange={e => handleChange('routePreferences', e.target.value)} placeholder="e.g. Loves looking at gardens, avoids busy roads." className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm" rows="2" disabled={isUploading}/>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1 text-teal-800 flex items-center"><User className="h-4 w-4 mr-1.5" /> Family Account Link</label>
            <p className="text-xs text-slate-500 mb-3">Link this senior to the family member's login email.</p>
            <div className="grid grid-cols-1 gap-3">
              <input type="text" value={formData.accountHolderName} onChange={e => handleChange('accountHolderName', e.target.value)} placeholder="Family Member Name" className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm bg-slate-50" disabled={isUploading}/>
              <input type="email" value={formData.accountHolderEmail} onChange={e => handleChange('accountHolderEmail', e.target.value)} placeholder="Family Login Email" className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm bg-slate-50" disabled={isUploading}/>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={formData.emergencyContactName} onChange={e => handleChange('emergencyContactName', e.target.value)} placeholder="Name" className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm" disabled={isUploading}/>
              <input type="text" value={formData.emergencyContactPhone} onChange={e => handleChange('emergencyContactPhone', e.target.value)} placeholder="Phone" className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm" disabled={isUploading}/>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            {editingId && (
              <button 
                type="button" 
                onClick={handleCancelEdit} 
                disabled={isUploading} 
                className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold py-3 px-4 rounded-lg transition shadow-sm disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              disabled={isUploading} 
              className={`flex-1 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center disabled:bg-slate-400 shadow-sm ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-teal-600 hover:bg-teal-700'}`}
            >
              {editingId ? <><Pencil className="h-5 w-5 mr-2"/> Save Changes</> : <><Plus className="h-5 w-5 mr-2"/> Add Profile</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
