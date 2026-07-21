import React, { useState, useEffect } from 'react';
import { Save, Mail, Trophy, UserPlus, Info, Loader2, CheckCircle } from 'lucide-react';

export default function AdminSettings({ settings = [], runMutation }) {
  // Find the email_templates doc from the database, or fall back to empty
  const templateDoc = settings.find(s => s.id === 'email_templates') || {};
  
  const [activeTab, setActiveTab] = useState('welcome');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Default templates so you have a great starting point
  const [formData, setFormData] = useState({
    welcomeSubject: templateDoc.welcomeSubject || "Welcome to Walks with Seniors! (Your account details inside)",
    welcomeBody: templateDoc.welcomeBody || "Hi {{FamilyName}},\n\nI wanted to personally welcome you to Walks with Seniors, and thank you for trusting us with {{SeniorName}}'s routine. We are thrilled to have you on board!\n\nWhat happens next?\nWithin the next 24 hours, I will be reaching out to introduce myself and schedule a quick \"Meet & Greet\" at {{SeniorName}}’s home. This gives us a chance to introduce their dedicated walker, get comfortable with each other, and make sure we know all of their favorite local routes before we begin.\n\nYour Family Portal\nYour Family Portal account is officially live. This is where you can view upcoming schedules, securely purchase Add-Ons, and see the live photo updates our walkers send after every visit.\n\nYou can log in anytime here: [Your Website Link]\nUsername: {{EmailAddress}}\nPassword: The password you created during checkout.\n\nWarmly,\nWalks with Seniors",
    
    meetGreetSubject: templateDoc.meetGreetSubject || "Meet & Greet Confirmation for {{SeniorName}}",
    meetGreetBody: templateDoc.meetGreetBody || "Hi {{FamilyName}},\n\nWe are all set for your Meet & Greet! \n\nYour dedicated companion, {{WalkerName}}, will be coming by on {{Date}} at {{Time}} to meet you and {{SeniorName}}. \n\nThis is a casual, no-pressure visit just to say hello, go over any specific mobility needs, and establish a comfortable routine.\n\nIf you need to reschedule, please let us know. Otherwise, we will see you then!\n\nWarmly,\nWalks with Seniors",
    
    milestoneSubject: templateDoc.milestoneSubject || "🎉 {{SeniorName}} just reached {{MilestoneCount}} walks!",
    milestoneBody: templateDoc.milestoneBody || "Hi {{FamilyName}},\n\nWe are so excited to share that {{SeniorName}} just completed their {{MilestoneCount}}th walk with us! \n\nConsistency is the key to maintaining mobility and a great mood, and we are so proud to be part of their routine.\n\nBe sure to check your Family Portal to see the latest photo update from today's milestone walk.\n\nWarmly,\nThe Team at Walks with Seniors"
  });

  // Sync state if settings load after the component mounts
  useEffect(() => {
    if (templateDoc.welcomeSubject) {
      setFormData({
        welcomeSubject: templateDoc.welcomeSubject,
        welcomeBody: templateDoc.welcomeBody,
        meetGreetSubject: templateDoc.meetGreetSubject,
        meetGreetBody: templateDoc.meetGreetBody,
        milestoneSubject: templateDoc.milestoneSubject,
        milestoneBody: templateDoc.milestoneBody
      });
    }
  }, [settings]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await runMutation('ws_settings', 'email_templates', 'set', {
        id: 'email_templates',
        ...formData,
        updatedAt: new Date().toISOString()
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save templates:", error);
      alert("Failed to save templates. Please try again.");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Settings & Templates</h2>
          <p className="text-slate-500">Manage your automated email messaging and merge tags.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition shadow-sm text-sm disabled:opacity-70"
        >
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {isSaving ? 'Saving...' : 'Save All Templates'}
        </button>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center shadow-sm animate-in slide-in-from-top-2">
          <CheckCircle className="h-5 w-5 mr-2 text-emerald-600" />
          <span className="font-bold text-sm">Templates saved successfully! All new emails will use this messaging.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: Vertical Tabs */}
        <div className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('welcome')}
            className={`w-full flex items-center text-left px-4 py-3 rounded-xl font-bold transition ${activeTab === 'welcome' ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <UserPlus className={`h-5 w-5 mr-3 ${activeTab === 'welcome' ? 'text-teal-600' : 'text-slate-400'}`} />
            Onboarding / Welcome
          </button>
          
          <button 
            onClick={() => setActiveTab('meet')}
            className={`w-full flex items-center text-left px-4 py-3 rounded-xl font-bold transition ${activeTab === 'meet' ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <Mail className={`h-5 w-5 mr-3 ${activeTab === 'meet' ? 'text-teal-600' : 'text-slate-400'}`} />
            Meet & Greet
          </button>

          <button 
            onClick={() => setActiveTab('milestone')}
            className={`w-full flex items-center text-left px-4 py-3 rounded-xl font-bold transition ${activeTab === 'milestone' ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <Trophy className={`h-5 w-5 mr-3 ${activeTab === 'milestone' ? 'text-teal-600' : 'text-slate-400'}`} />
            Milestone Celebrations
          </button>
        </div>

        {/* RIGHT COLUMN: Editor */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">
                {activeTab === 'welcome' && 'Automated Welcome Email'}
                {activeTab === 'meet' && 'Manual Meet & Greet Trigger'}
                {activeTab === 'milestone' && 'Automated Milestone Email (10, 50, 100 walks)'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'welcome' && 'Sent automatically when a family purchases a package via Stripe.'}
                {activeTab === 'meet' && 'Sent manually by the Admin when scheduling the very first visit.'}
                {activeTab === 'milestone' && 'Sent automatically when a walker marks a milestone walk as completed.'}
              </p>
            </div>
            
            <div className="p-6 space-y-5">
              {/* MERGE TAGS CHEAT SHEET */}
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-3 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-blue-900 mb-1">Available Merge Tags</div>
                  <div className="text-xs text-blue-800 flex flex-wrap gap-2">
                    <code className="bg-white px-1.5 py-0.5 rounded font-bold border border-blue-200">{"{{FamilyName}}"}</code>
                    <code className="bg-white px-1.5 py-0.5 rounded font-bold border border-blue-200">{"{{SeniorName}}"}</code>
                    <code className="bg-white px-1.5 py-0.5 rounded font-bold border border-blue-200">{"{{EmailAddress}}"}</code>
                    
                    {activeTab === 'meet' && (
                      <>
                        <code className="bg-white px-1.5 py-0.5 rounded font-bold border border-blue-200">{"{{WalkerName}}"}</code>
                        <code className="bg-white px-1.5 py-0.5 rounded font-bold border border-blue-200">{"{{Date}}"}</code>
                        <code className="bg-white px-1.5 py-0.5 rounded font-bold border border-blue-200">{"{{Time}}"}</code>
                      </>
                    )}
                    
                    {activeTab === 'milestone' && (
                      <code className="bg-white px-1.5 py-0.5 rounded font-bold border border-blue-200">{"{{MilestoneCount}}"}</code>
                    )}
                  </div>
                </div>
              </div>

              {/* EDITOR FIELDS */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Subject Line</label>
                <input 
                  type="text" 
                  value={
                    activeTab === 'welcome' ? formData.welcomeSubject : 
                    activeTab === 'meet' ? formData.meetGreetSubject : 
                    formData.milestoneSubject
                  }
                  onChange={(e) => {
                    if (activeTab === 'welcome') handleChange('welcomeSubject', e.target.value);
                    if (activeTab === 'meet') handleChange('meetGreetSubject', e.target.value);
                    if (activeTab === 'milestone') handleChange('milestoneSubject', e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800 bg-slate-50 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Body</label>
                <textarea 
                  value={
                    activeTab === 'welcome' ? formData.welcomeBody : 
                    activeTab === 'meet' ? formData.meetGreetBody : 
                    formData.milestoneBody
                  }
                  onChange={(e) => {
                    if (activeTab === 'welcome') handleChange('welcomeBody', e.target.value);
                    if (activeTab === 'meet') handleChange('meetGreetBody', e.target.value);
                    if (activeTab === 'milestone') handleChange('milestoneBody', e.target.value);
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm leading-relaxed text-slate-700 bg-slate-50 focus:bg-white transition"
                  rows="14"
                />
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
