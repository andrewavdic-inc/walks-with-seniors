import React, { useState } from 'react';
import { MapPin, ChevronLeft, Shield, FileText } from 'lucide-react';

export default function LegalPage({ onHomeClick }) {
  const [activeTab, setActiveTab] = useState('terms');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      
      {/* NAVIGATION BAR */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer" onClick={onHomeClick}>
              <div className="bg-teal-600 p-2 rounded-lg mr-3 shadow-sm">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tight text-teal-900 hidden sm:block">
                Walks with Seniors
              </span>
            </div>
            <button 
              onClick={onHomeClick} 
              className="flex items-center text-teal-700 font-bold hover:text-teal-900 transition"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className="bg-slate-900 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
          Legal & Privacy
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Walks with Seniors is an operating subsidiary of AHA Company Incorporated.
        </p>
      </section>

      {/* CONTENT AREA */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        
        {/* TABS */}
        <div className="flex space-x-2 border-b border-slate-200 mb-8">
          <button 
            onClick={() => setActiveTab('terms')}
            className={`px-6 py-3 font-bold text-sm sm:text-base rounded-t-lg transition flex items-center ${activeTab === 'terms' ? 'bg-white border-t border-x border-slate-200 text-teal-700 -mb-px' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
          >
            <FileText className="h-4 w-4 mr-2" /> Terms of Service
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`px-6 py-3 font-bold text-sm sm:text-base rounded-t-lg transition flex items-center ${activeTab === 'privacy' ? 'bg-white border-t border-x border-slate-200 text-teal-700 -mb-px' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
          >
            <Shield className="h-4 w-4 mr-2" /> Privacy Policy
          </button>
        </div>

        {/* TERMS OF SERVICE CONTENT */}
        {activeTab === 'terms' && (
          <div className="bg-white p-8 sm:p-10 rounded-b-2xl rounded-tr-2xl border border-slate-200 shadow-sm prose prose-slate max-w-none">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Terms of Service</h2>
            <p className="text-sm text-slate-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p>
                <strong>1. ACCEPTANCE OF TERMS</strong><br/>
                By accessing and using the services provided by Walks with Seniors, a wholly-owned operating subsidiary of AHA Company Incorporated ("the Company," "we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>

              <p>
                <strong>2. DESCRIPTION OF SERVICES</strong><br/>
                Walks with Seniors provides walking companionship and light mobility assistance for seniors. We are not a medical service provider, nursing service, or personal support worker (PSW) agency. Our companions ("Walkers") are not authorized to administer medication, provide medical advice, or perform medical interventions.
              </p>

              <p>
                <strong>3. PAYMENT AND BILLING</strong><br/>
                All financial transactions, billing, and payroll operations are processed through AHA Company Incorporated. Charges on your financial statements will appear under AHA Company Incorporated. Services are billed on a prepaid monthly basis according to the selected package.
              </p>

              <p>
                <strong>4. LIMITATION OF LIABILITY & WAIVER</strong><br/>
                Physical exercise, including walking, carries inherent risks of injury, especially for seniors. By utilizing our services, you acknowledge these risks. To the fullest extent permitted by law, AHA Company Incorporated and its subsidiary Walks with Seniors, including its owners, employees, and contractors, shall not be held liable for any personal injury, property damage, or loss sustained during or resulting from our companionship services, except in cases of gross negligence.
              </p>

              <p>
                <strong>5. CANCELLATION POLICY</strong><br/>
                Appointments cancelled with less than 24 hours' notice may be billed at the full rate of the scheduled walk. We reserve the right to alter or shorten outdoor walks due to severe weather conditions for the safety of both the client and the Walker.
              </p>

              <p>
                <strong>6. GOVERNING LAW</strong><br/>
                These Terms shall be governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to conflict of law principles.
              </p>
            </div>
          </div>
        )}

        {/* PRIVACY POLICY CONTENT */}
        {activeTab === 'privacy' && (
          <div className="bg-white p-8 sm:p-10 rounded-b-2xl rounded-tr-2xl border border-slate-200 shadow-sm prose prose-slate max-w-none">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Privacy Policy</h2>
            <p className="text-sm text-slate-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p>
                <strong>1. INTRODUCTION</strong><br/>
                AHA Company Incorporated, operating as Walks with Seniors ("we," "our," "us"), is committed to protecting the privacy and personal information of our clients and their families. This policy outlines how we collect, use, and protect your data.
              </p>

              <p>
                <strong>2. INFORMATION WE COLLECT</strong><br/>
                We collect information necessary to provide safe and effective companionship services. This includes:<br/>
                - Contact information (names, phone numbers, emails, addresses).<br/>
                - Emergency contact information.<br/>
                - Relevant mobility or non-medical behavioral notes provided voluntarily by the family to ensure safe walks.<br/>
                - Payment and billing information (processed securely through third-party processors; we do not store full credit card numbers).
              </p>

              <p>
                <strong>3. USE OF PHOTOGRAPHY (LIVE UPDATES)</strong><br/>
                As part of our service, Walkers take photographs during outings to send as "Live Updates" to authorized family members via our secure portal. <br/>
                - These photos are used strictly for family reporting and peace of mind.<br/>
                - We will never use these photographs for public marketing, social media, or advertising without obtaining explicit, separate written consent from the client or their legal power of attorney.
              </p>

              <p>
                <strong>4. DATA SHARING & SECURITY</strong><br/>
                We do not sell, rent, or trade personal information to third parties. Data is shared internally only with the specific matched Walker and management team on a need-to-know basis. We utilize secure, industry-standard cloud databases to store client profiles and portal data.
              </p>

              <p>
                <strong>5. YOUR RIGHTS</strong><br/>
                You have the right to request access to, correction of, or deletion of your personal data stored on our systems. To make a request, please contact administration directly.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-8 border-t border-slate-800 text-center mt-auto">
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} AHA Company Incorporated operating as Walks with Seniors. All rights reserved.</p>
      </footer>
    </div>
  );
}
