import React, { useState } from 'react';
import { CalendarIcon, Heart, Users, Coins, MessageSquare, Filter, PhoneCall, ExternalLink, X } from 'lucide-react';

import DispatchDashboard from './DispatchDashboard';
import SeniorManager from './SeniorManager';
import WalkerManager from './WalkerManager';
import AdminEarningsManager from './AdminEarningsManager';
import MilestonesAndFeed from './MilestonesAndFeed';
import LeadManager from './LeadManager';

export default function AdminDashboard(props) {
  // Defaulting to the leads tab so you can see your new pipeline immediately
  const [activeAdminTab, setActiveAdminTab] = useState('leads');
  const [showPhoneOrderHelp, setShowPhoneOrderHelp] = useState(false);

  const renderAdminTab = () => {
    switch (activeAdminTab) {
      case 'dispatch': return <DispatchDashboard {...props} />;
      case 'leads': return <LeadManager {...props} />;
      case 'seniors': return <SeniorManager {...props} />;
      case 'walkers': return <WalkerManager {...props} />;
      case 'earnings': return <AdminEarningsManager {...props} />;
      case 'culture': return <MilestonesAndFeed {...props} />;
      default: return <LeadManager {...props} />;
    }
  };

  const tabs = [
    { id: 'leads', icon: Filter, label: 'Sales & Intake' }, 
    { id: 'dispatch', icon: CalendarIcon, label: 'Dispatch Center' }, 
    { id: 'seniors', icon: Heart, label: 'Senior Directory' }, 
    { id: 'walkers', icon: Users, label: 'Walker Team' }, 
    { id: 'earnings', icon: Coins, label: 'Payroll & Earnings' }, 
    { id: 'culture', icon: MessageSquare, label: 'Culture & Milestones' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500">Manage schedule, seniors, and personnel.</p>
        </div>

        {/* NEW: Phone Order Button & Tooltip */}
        <div className="relative">
          <button 
            onClick={() => setShowPhoneOrderHelp(!showPhoneOrderHelp)}
            className="bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold px-4 py-2 rounded-lg transition flex items-center text-sm border border-teal-200 shadow-sm"
          >
            <PhoneCall className="h-4 w-4 mr-2" /> Phone Order (Stripe)
          </button>

          {showPhoneOrderHelp && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-5 z-50 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-black text-slate-800">Phone Sign-Up Process</h3>
                <button onClick={() => setShowPhoneOrderHelp(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4"/></button>
              </div>
              <ol className="text-sm text-slate-600 space-y-3 mb-5 list-decimal pl-4 marker:font-bold marker:text-teal-600">
                <li>Go to the <strong>Senior Directory</strong> tab and add the new client to create their Family Login.</li>
                <li>Click the link below to open your secure Stripe Dashboard.</li>
                <li>Create a new Customer in Stripe, enter their credit card over the phone, and assign them a monthly subscription.</li>
              </ol>
              <a href="https://dashboard.stripe.com/" target="_blank" rel="noopener noreferrer" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition flex items-center justify-center text-sm shadow-md">
                Launch Stripe Dashboard <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-4 border-b border-slate-200 overflow-x-auto scrollbar-hide pb-2">
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveAdminTab(tab.id)} 
            className={`relative px-4 py-2 font-medium whitespace-nowrap flex items-center rounded-t-lg transition-colors ${activeAdminTab === tab.id ? 'text-teal-700 bg-teal-50 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <tab.icon className="h-4 w-4 mr-2" /> {tab.label}
          </button>
        ))}
      </div>
      
      {renderAdminTab()}
    </div>
  );
}
