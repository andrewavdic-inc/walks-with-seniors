import React from 'react';
import { Mail, Phone } from 'lucide-react';

export default function LeadManager({ leads = [], runMutation }) {
  const columns = ['New Inquiry', 'Contacted', 'Active Client'];

  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDrop = (e, status) => {
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId && runMutation) {
      runMutation('ws_leads', leadId, 'update', { status });
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sales & Intake Pipeline</h2>
          <p className="text-slate-500">Drag and drop incoming website leads to track onboarding.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[700px]">
        {columns.map(col => (
          <div 
            key={col} 
            onDrop={(e) => handleDrop(e, col)} 
            onDragOver={handleDragOver}
            className="bg-slate-100 rounded-xl p-4 flex flex-col h-full border border-slate-200"
          >
            <h3 className="font-bold text-slate-700 mb-4 flex justify-between items-center">
              {col}
              <span className="bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-xs">
                {leads.filter(l => (l.status || 'New Inquiry') === col).length}
              </span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pb-10">
              {leads.filter(l => (l.status || 'New Inquiry') === col).map(lead => (
                <div 
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:border-teal-400 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${lead.type === 'New Booking Intake' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                      {lead.type || 'Contact'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{new Date(parseInt(lead.id.split('_')[1])).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{lead.name}</h4>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-3">{lead.message || lead.mobilityNotes}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                    {lead.email && <div className="flex items-center"><Mail className="h-3 w-3 mr-1.5 text-slate-400"/> {lead.email}</div>}
                    {lead.phone && <div className="flex items-center"><Phone className="h-3 w-3 mr-1.5 text-slate-400"/> {lead.phone}</div>}
                  </div>
                </div>
              ))}
              {leads.filter(l => (l.status || 'New Inquiry') === col).length === 0 && (
                 <div className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-200 rounded-lg">Drop lead here</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
