import React, { useState } from 'react';
import { CalendarIcon, Heart, Users, Coins, MessageSquare, Filter } from 'lucide-react';

import DispatchDashboard from './DispatchDashboard';
import SeniorManager from './SeniorManager';
import WalkerManager from './WalkerManager';
import AdminEarningsManager from './AdminEarningsManager';
import MilestonesAndFeed from './MilestonesAndFeed';
import LeadManager from './LeadManager';

export default function AdminDashboard(props) {
  const [activeAdminTab, setActiveAdminTab] = useState('dispatch');

  const renderAdminTab = () => {
    switch (activeAdminTab) {
      case 'dispatch': return <DispatchDashboard {...props} />;
      case 'leads': return <LeadManager {...props} />;
      case 'seniors': return <SeniorManager {...props} />;
      case 'walkers': return <WalkerManager {...props} />;
      case 'earnings': return <AdminEarningsManager {...props} />;
      case 'culture': return <MilestonesAndFeed {...props} />;
      default: return <DispatchDashboard {...props} />;
    }
  };

  const tabs = [
    { id: 'dispatch', icon: CalendarIcon, label: 'Dispatch Center' }, 
    { id: 'leads', icon: Filter, label: 'Sales & Intake' }, 
    { id: 'seniors', icon: Heart, label: 'Senior Directory' }, 
    { id: 'walkers', icon: Users, label: 'Walker Team' }, 
    { id: 'earnings', icon: Coins, label: 'Payroll & Earnings' }, 
    { id: 'culture', icon: MessageSquare, label: 'Culture & Milestones' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500">Manage schedule, seniors, and personnel.</p>
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
