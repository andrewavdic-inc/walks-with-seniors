import React from 'react';
import { MapPin, Heart, ShieldCheck, Car, Clock, ArrowRight, Laptop, Briefcase, ChevronLeft, FileText } from 'lucide-react';

export default function CareersPage({ onHomeClick }) {
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

      {/* HERO SECTION */}
      <section className="bg-teal-900 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
            Join Our Team of <span className="text-teal-300">Great Neighbours</span>
          </h1>
          <p className="text-lg text-teal-50 leading-relaxed max-w-2xl mx-auto">
            We are looking for compassionate, reliable, and active individuals to provide joyful companionship to seniors in our community. If you love the outdoors and want to make a real difference, we want to hear from you.
          </p>
        </div>
      </section>

      {/* WHY WORK WITH US */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="bg-teal-50 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-600">
                <Heart className="h-8 w-8 fill-current" />
              </div>
              <h3 className="font-bold text-xl text-slate-800 mb-2">Rewarding Work</h3>
              <p className="text-slate-600 text-sm">Build meaningful relationships and directly improve the physical and mental well-being of local seniors.</p>
            </div>
            <div className="p-6">
              <div className="bg-teal-50 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-600">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-xl text-slate-800 mb-2">Flexible Scheduling</h3>
              <p className="text-slate-600 text-sm">Set your availability. We work with your schedule to assign walks that fit your life.</p>
            </div>
            <div className="p-6">
              <div className="bg-teal-50 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-600">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-xl text-slate-800 mb-2">Safe & Supported</h3>
              <p className="text-slate-600 text-sm">We provide the software, the clients, and the operational support so you can focus entirely on the walk.</p>
            </div>
          </div>
        </div>
      </section>

      {/* OPEN POSITIONS */}
      <section className="py-20 bg-slate-50 flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-10 text-center">Open Positions</h2>
          
          <div className="space-y-8">
            
            {/* 1. WALKER POSITION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
              <div className="p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">Senior Walking Companion</h3>
                    <div className="text-teal-600 font-bold mt-1 text-lg">$20.00 / hour</div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Hiring Now</span>
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  As a Walking Companion, you are the heart of our service. You will be matched with local seniors to provide safe, engaging, and active companionship. From brisk walks along the canal to leisurely strolls in the mall, you ensure our clients stay mobile and connected.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <ShieldCheck className="h-5 w-5 mr-3 text-teal-500 shrink-0"/> Vulnerable Sector Check Required
                  </div>
                  <div className="flex items-center text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <Car className="h-5 w-5 mr-3 text-teal-500 shrink-0"/> Vehicle & Valid License Required
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="/Walker%20Job%20Description.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full sm:w-auto bg-white border-2 border-teal-600 text-teal-700 hover:bg-teal-50 font-bold px-8 py-3.5 rounded-xl transition shadow-sm">
                    <FileText className="h-5 w-5 mr-2" /> Read Full Details
                  </a>
                  <a href="mailto:careers@walkswithseniors.ca?subject=Application:%20Senior%20Walking%20Companion" className="inline-flex items-center justify-center w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-sm">
                    Apply via Email <ArrowRight className="h-5 w-5 ml-2" />
                  </a>
                </div>
              </div>
            </div>

            {/* 2. MANAGER POSITION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
              <div className="p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">Field Operations Manager</h3>
                    <div className="text-teal-600 font-bold mt-1 text-lg">$25.00 / hour</div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Hiring Now</span>
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  The Field Operations Manager is the operational touchpoint for the owner and the team. You will oversee scheduling, manage proprietary company software, and handle initial financial and payroll documentation. <strong>Note: You must be willing to start as a Walker to master our field operations before transitioning into this management role.</strong>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <Laptop className="h-5 w-5 mr-3 text-indigo-500 shrink-0"/> Highly Tech-Savvy
                  </div>
                  <div className="flex items-center text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <Briefcase className="h-5 w-5 mr-3 text-indigo-500 shrink-0"/> Leadership Experience
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="/Manager%20Job%20Description.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full sm:w-auto bg-white border-2 border-slate-800 text-slate-800 hover:bg-slate-50 font-bold px-8 py-3.5 rounded-xl transition shadow-sm">
                    <FileText className="h-5 w-5 mr-2" /> Read Full Details
                  </a>
                  <a href="mailto:careers@walkswithseniors.ca?subject=Application:%20Field%20Operations%20Manager" className="inline-flex items-center justify-center w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-sm">
                    Apply via Email <ArrowRight className="h-5 w-5 ml-2" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-8 border-t border-slate-800 text-center">
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Walks with Seniors. All rights reserved.</p>
      </footer>
    </div>
  );
}
