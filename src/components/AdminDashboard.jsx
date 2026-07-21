import React, { useState, useMemo } from 'react';
import { 
  CalendarIcon, Heart, Users, Coins, MessageSquare, Filter, 
  PhoneCall, ExternalLink, X, Receipt, Settings, BellRing, 
  CheckCircle, MessageCircle 
} from 'lucide-react';

import DispatchDashboard from './DispatchDashboard';
import SeniorManager from './SeniorManager';
import WalkerManager from './WalkerManager';
import AdminEarningsManager from './AdminEarningsManager';
import MilestonesAndFeed from './MilestonesAndFeed';
import LeadManager from './LeadManager';
import AdminOrdersManager from './AdminOrdersManager';
import AdminSettings from './AdminSettings'; // <-- NEW IMPORT

export default function AdminDashboard(props) {
  const { walks = [], seniors = [] } = props;
  
  const [activeAdminTab, setActiveAdminTab] = useState('leads');
  const [showPhoneOrderHelp, setShowPhoneOrderHelp] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  // --- DAILY ACTION CENTER LOGIC ---
  const actionItems = useMemo(() => {
    const items = [];
    const todayStr = new Date().toISOString().split('T')[0];
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Group walks by senior to find their chronological first walk
    seniors.forEach(senior => {
      const seniorWalks = walks
        .filter(w => w.seniorId === senior.id && w.status !== 'cancelled')
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      if (seniorWalks.length > 0) {
        const firstWalk = seniorWalks[0];
        const familyName = senior.accountHolderName?.split(' ')[0] || 'the family';
        
        // 1. Morning SMS Alert (First walk is today and scheduled)
        if (firstWalk.date === todayStr && firstWalk.status === 'scheduled') {
          const alertId = `sms_${firstWalk.id}`;
          if (!dismissedAlerts.includes(alertId)) {
            items.push({
              id: alertId,
              type: 'sms',
              icon: MessageCircle,
              title: 'Morning SMS Required',
              message: `${senior.name.split(' ')[0]} has their Meet & Greet today at ${firstWalk.startTime}. Send a quick morning confirmation text to ${familyName}.`,
            });
          }
        }
        
        // 2. Post-Walk Call Alert (First walk was yesterday and completed)
        if (firstWalk.date === yesterdayStr && firstWalk.status === 'completed') {
          const alertId = `call_${firstWalk.id}`;
          if (!dismissedAlerts.includes(alertId)) {
            items.push({
              id: alertId,
              type: 'call',
              icon: PhoneCall,
              title: 'Post-Walk Check-In Call',
              message: `${senior.name.split(' ')[0]} completed their very first walk yesterday! Call ${familyName} to see how it went and ensure the pacing was comfortable.`,
            });
          }
        }
      }
    });

    return items;
  }, [walks, seniors, dismissedAlerts]);

  // --- ROUTING ---
  const renderAdminTab = () => {
    switch (activeAdminTab) {
      case 'dispatch': return <DispatchDashboard {...props} />;
      case 'leads': return <LeadManager {...props} />;
      case 'seniors': return <SeniorManager {...props} />;
      case 'walkers': return <WalkerManager {...props} />;
      case 'earnings': return <AdminEarningsManager {...props} />;
      case 'orders': return <AdminOrdersManager {...props} />; 
      case 'culture': return <MilestonesAndFeed {...props} />;
      case 'settings': return <AdminSettings {...props} />; // <-- NEW ROUTE
      default: return <LeadManager {...props} />;
    }
  };

  const tabs = [
    { id: 'leads', icon: Filter, label: 'Sales & Intake' }, 
    { id: 'dispatch', icon: CalendarIcon, label: 'Dispatch Center' }, 
    { id: 'seniors', icon: Heart, label: 'Senior Directory' }, 
    { id: 'walkers', icon: Users, label: 'Walker Team' }, 
    { id: 'orders', icon: Receipt, label: 'Receivables' }, 
    { id: 'earnings', icon: Coins, label: 'Payroll' }, 
    { id: 'culture', icon: MessageSquare, label: 'Culture' },
    { id: 'settings', icon: Settings, label: 'Settings' } // <-- NEW TAB
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500">Manage schedule, seniors, and personnel.</p>
        </div>

        {/* Phone Order Button & Tooltip */}
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

      {/* --- DAILY ACTION CENTER --- */}
      {actionItems.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 shadow-sm animate-in slide-in-from-top-4">
          <h3 className="text-indigo-900 font-black mb-4 flex items-center text-lg">
            <BellRing className="h-5 w-5 mr-2" /> Daily Action Center
          </h3>
          <div className="space-y-3">
            {actionItems.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-indigo-300">
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-2.5 rounded-lg text-indigo-600 mr-4 shrink-0">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{item.title}</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setDismissedAlerts(prev => [...prev, item.id])}
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition flex items-center justify-center shrink-0 shadow-sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Mark as Done
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HORIZONTAL TABS SCROLL CONTAINER */}
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
