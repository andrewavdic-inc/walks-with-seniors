import React from 'react';
import { MapPin, ChevronLeft, HeartPulse, Sparkles, Users, ArrowRight } from 'lucide-react';

export default function TeamPage({ onHomeClick, onCareersClick, onLegalClick }) {
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
      <section className="bg-white py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 font-bold text-sm mb-6">
                <Users className="h-4 w-4 mr-2" />
                Meet Your Neighbours
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight mb-6">
                The faces behind the <span className="text-teal-600">footsteps.</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                We are a collective of compassionate, local professionals dedicated to keeping our community moving. Every member of our team is fully vetted, highly trained, and passionate about senior care.
              </p>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white transform rotate-1 hover:rotate-0 transition duration-500">
                <img src="/Team.png" alt="Walks with Seniors Team" className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE IMPORTANCE OF OUR WORK */}
      <section className="py-20 bg-teal-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <HeartPulse className="h-12 w-12 text-teal-300 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-black mb-6">Movement is Medicine</h2>
          <p className="text-lg text-teal-50 leading-relaxed mb-8">
            Staying active is the single most important factor in maintaining independence as we age. Consistent, gentle exercise does more than just lubricate stiff joints and improve cardiovascular health—it fundamentally boosts mood, sharpens cognitive function, and combats the silent epidemic of isolation. 
          </p>
          <p className="text-lg text-teal-50 leading-relaxed">
            We aren't just here to take a walk. We are here to build confidence, foster genuine connection, and ensure your loved ones look forward to stepping out their front door every single week.
          </p>
        </div>
      </section>

      {/* TEAM PROFILES GRID */}
      <section className="py-24 bg-slate-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            
            {/* Profile 1 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition group">
              <div className="h-64 overflow-hidden bg-slate-200">
                <img src="/EmilyS.png" alt="Emily S." className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black text-slate-800">Emily S.</h3>
                <div className="text-teal-600 font-bold mb-4 text-sm uppercase tracking-wider">Senior Walking Companion</div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  A lifelong resident of the region, Emily knows all the best scenic routes. She believes that a great walk is just as much about the engaging conversation as it is about getting the steps in.
                </p>
              </div>
            </div>

            {/* Profile 2 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition group">
              <div className="h-64 overflow-hidden bg-slate-200">
                <img src="/JessicaD.png" alt="Jessica D." className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black text-slate-800">Jessica D.</h3>
                <div className="text-teal-600 font-bold mb-4 text-sm uppercase tracking-wider">Senior Walking Companion</div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  With a background in health wellness, Jessica specializes in gentle, confidence-building mobility. She is a favorite among our clients who prefer our climate-controlled indoor mall walks.
                </p>
              </div>
            </div>

            {/* Profile 3 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition group">
              <div className="h-64 overflow-hidden bg-slate-200">
                <img src="/MariaP.png" alt="Maria P." className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black text-slate-800">Maria P.</h3>
                <div className="text-teal-600 font-bold mb-4 text-sm uppercase tracking-wider">Senior Walking Companion</div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Maria brings endless warmth and energy to every single visit. She excels at pacing and loves capping off a great neighborhood stroll with a well-deserved stop at a local cafe.
                </p>
              </div>
            </div>

            {/* Profile 4 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition group">
              <div className="h-64 overflow-hidden bg-slate-200">
                <img src="/SarahB.png" alt="Sarah B." className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black text-slate-800">Sarah B.</h3>
                <div className="text-teal-600 font-bold mb-4 text-sm uppercase tracking-wider">Senior Walking Companion</div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Patient and incredibly observant, Sarah is wonderful with seniors who use mobility aids. Her calming presence ensures every client feels safe, supported, and never rushed.
                </p>
              </div>
            </div>

            {/* Future Profile (Careers Link) */}
            <div 
              onClick={onCareersClick}
              className="bg-teal-50 rounded-2xl shadow-sm border-2 border-dashed border-teal-300 overflow-hidden hover:bg-teal-100 hover:border-teal-500 transition group cursor-pointer flex flex-col"
            >
              <div className="h-64 overflow-hidden bg-teal-100/50 flex items-center justify-center p-6">
                <img src="/Future.png" alt="Join Our Team" className="w-full h-full object-contain opacity-70 group-hover:scale-105 transition duration-500 mix-blend-multiply" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black text-teal-900 flex items-center">Is this you? <Sparkles className="h-5 w-5 ml-2 text-teal-500"/></h3>
                  <div className="text-teal-700 font-bold mb-3 text-sm uppercase tracking-wider">Future Team Member</div>
                  <p className="text-teal-800/80 text-sm leading-relaxed">
                    We are actively looking for compassionate, reliable individuals with a reliable vehicle and a heart for senior care.
                  </p>
                </div>
                <div className="mt-4 font-bold text-teal-700 flex items-center group-hover:text-teal-900">
                  View Open Roles <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-8 border-t border-slate-800 text-center">
        <p className="text-slate-500 text-sm mb-4">© {new Date().getFullYear()} Walks with Seniors. All rights reserved.</p>
        <div className="flex justify-center space-x-6 text-sm font-medium">
          <button onClick={onLegalClick} className="text-slate-500 hover:text-slate-300 transition">Privacy Policy</button>
          <button onClick={onLegalClick} className="text-slate-500 hover:text-slate-300 transition">Terms of Service</button>
        </div>
      </footer>
    </div>
  );
}
