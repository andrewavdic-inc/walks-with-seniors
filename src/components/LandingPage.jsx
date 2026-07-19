import React, { useState, useEffect } from 'react';
import { 
  MapPin, ShieldCheck, Camera, Coffee, Flower, 
  ArrowRight, CheckCircle, Sun, Umbrella, Activity, Phone, Mail
} from 'lucide-react';

export default function LandingPage({ onLoginClick, onCareersClick, onTeamClick, onLegalClick, runMutation }) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [intakeForm, setIntakeForm] = useState({ name: '', phone: '', mobilityNotes: '' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });

  // Listens for a simulated successful redirect from Stripe
  useEffect(() => {
    if (window.location.search.includes('success=true')) {
      setShowSuccessModal(true);
    }
  }, []);

  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    if (!runMutation) return;
    await runMutation('ws_leads', `lead_${Date.now()}`, 'set', { ...intakeForm, type: 'New Booking Intake', status: 'New Inquiry' });
    setShowSuccessModal(false);
    alert("Information submitted securely. We'll be in touch shortly!");
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!runMutation) return;
    await runMutation('ws_leads', `lead_${Date.now()}`, 'set', { ...contactForm, type: 'Contact Form', status: 'New Inquiry' });
    setContactForm({ name: '', email: '', phone: '', message: '' });
    alert("Message sent! We will get back to you shortly.");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col pb-16 md:pb-0">
      
      {/* CHECKOUT SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center relative overflow-hidden">
            <div className="bg-teal-100 text-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Payment Successful</h2>
            <p className="text-lg font-bold text-teal-700 mb-6">We will contact you within 24 hrs to schedule your first walk.</p>
            
            <div className="bg-slate-50 rounded-xl p-6 text-left border border-slate-200">
              <p className="text-sm font-bold text-slate-700 mb-4">While we prepare your file, please help us by answering a few quick questions about the senior:</p>
              <form onSubmit={handleIntakeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Senior's Name</label>
                  <input required type="text" value={intakeForm.name} onChange={e => setIntakeForm({...intakeForm, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Your Phone Number</label>
                  <input required type="text" value={intakeForm.phone} onChange={e => setIntakeForm({...intakeForm, phone: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Mobility Limitations / Notes</label>
                  <textarea required rows="2" value={intakeForm.mobilityNotes} onChange={e => setIntakeForm({...intakeForm, mobilityNotes: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500"></textarea>
                </div>
                <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition">Submit Info & Finish</button>
              </form>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="mt-6 text-sm text-slate-500 hover:text-slate-700 font-medium">Close for now</button>
          </div>
        </div>
      )}

      {/* STICKY MOBILE CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-[60] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex justify-center">
        <a href="#pricing" className="bg-teal-600 hover:bg-teal-700 text-white w-full py-3.5 rounded-xl font-bold text-center shadow-sm transition">
          Book a Walk Now
        </a>
      </div>

      {/* NAVIGATION BAR */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="bg-teal-600 p-2 rounded-lg mr-3 shadow-sm">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tight text-teal-900">
                Walks with Seniors
              </span>
            </div>
            <div className="hidden md:flex space-x-8 items-center font-semibold text-sm text-slate-600">
              <button onClick={onTeamClick} className="hover:text-teal-600 transition">Our Team</button>
              <a href="#services" className="hover:text-teal-600 transition">Services</a>
              <a href="#how-it-works" className="hover:text-teal-600 transition">How it Works</a>
              <a href="#pricing" className="hover:text-teal-600 transition">Pricing</a>
              <a href="#contact" className="hover:text-teal-600 transition">Contact</a>
              <button 
                onClick={onLoginClick} 
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-full transition shadow-md font-bold"
              >
                Family Login
              </button>
            </div>
            {/* Mobile Login Button */}
            <div className="md:hidden">
              <button 
                onClick={onLoginClick} 
                className="bg-teal-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-sm"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative bg-teal-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="2idfno2i.png" 
            alt="Walker and Senior on Canal" 
            className="w-full h-full object-cover opacity-30 mix-blend-multiply"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-teal-800/50 border border-teal-500/30 text-teal-100 font-bold text-sm mb-6 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4 mr-2 text-teal-300" />
              Fully Vetted & VSC Certified Companions
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">
              Active Companionship, <br/>
              <span className="text-teal-300">One Step at a Time.</span>
            </h1>
            <p className="text-lg text-teal-50 mb-8 max-w-xl leading-relaxed">
              Safe, joyful walking companions for seniors in the Niagara region. We keep your loved ones active while delivering real-time photo updates right to your phone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#pricing" className="bg-white text-teal-900 hover:bg-slate-100 px-8 py-4 rounded-full font-black text-lg transition shadow-xl text-center flex items-center justify-center">
                View Walk Packages <ArrowRight className="h-5 w-5 ml-2" />
              </a>
            </div>
          </div>
          <div className="lg:w-1/2 mt-12 lg:mt-0">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 transform lg:rotate-2">
              <img src="2idfno2i.png" alt="Senior enjoying a walk" className="w-full h-auto object-cover" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg flex items-center">
                <div className="bg-emerald-100 p-2 rounded-full mr-3 shrink-0">
                  <Camera className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Update Sent</p>
                  <p className="text-sm font-bold text-slate-800">"We had a beautiful walk by the canal today!"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST & SAFETY BANNER */}
      <section className="bg-emerald-700 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-emerald-600/50">
            <div className="px-4 py-2">
              <ShieldCheck className="h-8 w-8 mx-auto text-emerald-200 mb-3" />
              <h3 className="font-bold text-white text-lg">Police Record Checked</h3>
              <p className="text-emerald-100 text-sm mt-1">Every walker passes a strict Vulnerable Sector Check.</p>
            </div>
            <div className="px-4 py-2 pt-6 md:pt-2">
              <Activity className="h-8 w-8 mx-auto text-emerald-200 mb-3" />
              <h3 className="font-bold text-white text-lg">CPR & First Aid Certified</h3>
              <p className="text-emerald-100 text-sm mt-1">Trained to handle emergencies with confidence.</p>
            </div>
            <div className="px-4 py-2 pt-6 md:pt-2">
              <Camera className="h-8 w-8 mx-auto text-emerald-200 mb-3" />
              <h3 className="font-bold text-white text-lg">Photo Guarantee</h3>
              <p className="text-emerald-100 text-sm mt-1">See a photo from every walk in your Family Portal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES: MORE THAN JUST A WALK */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mb-4">More Than Just a Walk</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              We adapt to mobility levels and weather conditions. From brisk park trails to slow-paced cafe visits, we ensure your loved one gets out of the house safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden border border-slate-100 group">
              <div className="h-64 overflow-hidden relative">
                <img src="j3ei5lj3.png" alt="Outdoor Adventures" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-teal-800 flex items-center shadow-sm"><Sun className="h-3 w-3 mr-1"/> Outdoors</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Outdoor Adventures</h3>
                <p className="text-slate-600 leading-relaxed">Scenic routes along the canal, local parks, and safe neighborhood sidewalks. Perfect for enjoying fresh air and sunshine.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden border border-slate-100 group">
              <div className="h-64 overflow-hidden relative">
                <img src="h4ye4v.png" alt="All-Weather Mall Walks" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-teal-800 flex items-center shadow-sm"><Umbrella className="h-3 w-3 mr-1"/> Climate Controlled</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">All-Weather Mall Walks</h3>
                <p className="text-slate-600 leading-relaxed">Don't let rain or snow stop the routine. We provide safe, flat, climate-controlled walking in local shopping centers.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden border border-slate-100 group">
              <div className="h-64 overflow-hidden relative">
                <img src="0fk2hc0.png" alt="Cafe Companionship" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-teal-800 flex items-center shadow-sm"><Coffee className="h-3 w-3 mr-1"/> Social Focus</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Cafe Companionship</h3>
                <p className="text-slate-600 leading-relaxed">Slower-paced outings focused on connection. A short stroll ending at a local shop for a warm drink and great conversation.</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden border border-slate-100 group">
              <div className="h-64 overflow-hidden relative">
                <img src="nlvvy.png" alt="Light Mobility Assistance" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-teal-800 flex items-center shadow-sm"><Activity className="h-3 w-3 mr-1"/> Gentle Activity</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Light Mobility Assistance</h3>
                <p className="text-slate-600 leading-relaxed">Accommodating canes, walkers, and wheelchairs. We focus on stretching and gentle movement to keep joints healthy safely.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-1 bg-teal-100 -z-10"></div>
            
            <div className="text-center relative bg-white">
              <div className="h-24 w-24 mx-auto bg-teal-50 border-4 border-teal-100 rounded-full flex items-center justify-center text-3xl font-black text-teal-600 mb-6 shadow-sm">1</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Choose a Package</h3>
              <p className="text-slate-600">Select how often you want us to visit each month. From weekly strolls to a dedicated routine.</p>
            </div>
            
            <div className="text-center relative bg-white">
              <div className="h-24 w-24 mx-auto bg-teal-50 border-4 border-teal-100 rounded-full flex items-center justify-center text-3xl font-black text-teal-600 mb-6 shadow-sm">2</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Meet Your Match</h3>
              <p className="text-slate-600">We pair your loved one with a thoroughly background-checked local walker based on their mobility needs.</p>
            </div>

            <div className="text-center relative bg-white">
              <div className="h-24 w-24 mx-auto bg-teal-50 border-4 border-teal-100 rounded-full flex items-center justify-center text-3xl font-black text-teal-600 mb-6 shadow-sm">3</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Get Updates</h3>
              <p className="text-slate-600">Log into your secure Family Portal to see photos and read notes after every single completed walk.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mb-4">Simple, Predictable Pricing</h2>
            <p className="text-lg text-slate-600">Prepaid monthly packages with no hidden fees. Cancel or adjust anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Tier 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group hover:border-teal-400 hover:shadow-xl transition">
              <h3 className="text-2xl font-black text-slate-800 mb-2">The Stroller</h3>
              <div className="text-slate-500 font-medium mb-6">4 Walks / Month</div>
              <div className="text-4xl font-black text-teal-700 mb-2">$180<span className="text-lg text-slate-400 font-medium">/mo</span></div>
              <div className="text-sm font-bold text-teal-600/70 mb-8 border-b border-slate-100 pb-8">$45 per walk</div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center text-slate-600 font-medium"><CheckCircle className="h-5 w-5 text-teal-500 mr-3 shrink-0"/> 45-60 minute visits</li>
                <li className="flex items-center text-slate-600 font-medium"><CheckCircle className="h-5 w-5 text-teal-500 mr-3 shrink-0"/> Dedicated matched walker</li>
                <li className="flex items-center text-slate-600 font-medium"><CheckCircle className="h-5 w-5 text-teal-500 mr-3 shrink-0"/> Live photo updates</li>
              </ul>
              {/* Note: In production, href will be your actual Stripe Payment Link */}
              <a href="?success=true" className="w-full block py-4 text-center rounded-xl font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-600 hover:text-white transition">Get Started</a>
            </div>

            {/* Tier 2 */}
            <div className="bg-teal-700 rounded-3xl p-8 border border-teal-600 shadow-2xl flex flex-col relative overflow-hidden transform md:-translate-y-4">
              <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-teal-400 to-emerald-400 text-teal-950 text-xs font-black uppercase tracking-widest text-center py-2 shadow-sm">Most Popular</div>
              <h3 className="text-2xl font-black text-white mb-2 mt-4">The Explorer</h3>
              <div className="text-teal-200 font-medium mb-6">8 Walks / Month</div>
              <div className="text-4xl font-black text-white mb-2">$344<span className="text-lg text-teal-200 font-medium">/mo</span></div>
              <div className="text-sm font-bold text-teal-300 mb-8 border-b border-teal-600 pb-8">$43 per walk</div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center text-teal-50 font-medium"><CheckCircle className="h-5 w-5 text-teal-400 mr-3 shrink-0"/> 45-60 minute visits</li>
                <li className="flex items-center text-teal-50 font-medium"><CheckCircle className="h-5 w-5 text-teal-400 mr-3 shrink-0"/> Dedicated matched walker</li>
                <li className="flex items-center text-teal-50 font-medium"><CheckCircle className="h-5 w-5 text-teal-400 mr-3 shrink-0"/> Live photo updates</li>
                <li className="flex items-center text-teal-50 font-medium"><CheckCircle className="h-5 w-5 text-teal-400 mr-3 shrink-0"/> Priority scheduling</li>
              </ul>
              <a href="?success=true" className="w-full block py-4 text-center rounded-xl font-black text-teal-900 bg-white hover:bg-slate-100 shadow-lg transition">Get Started</a>
            </div>

            {/* Tier 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group hover:border-teal-400 hover:shadow-xl transition">
              <h3 className="text-2xl font-black text-slate-800 mb-2">The Centurion</h3>
              <div className="text-slate-500 font-medium mb-6">12 Walks / Month</div>
              <div className="text-4xl font-black text-teal-700 mb-2">$492<span className="text-lg text-slate-400 font-medium">/mo</span></div>
              <div className="text-sm font-bold text-teal-600/70 mb-8 border-b border-slate-100 pb-8">$41 per walk</div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center text-slate-600 font-medium"><CheckCircle className="h-5 w-5 text-teal-500 mr-3 shrink-0"/> 45-60 minute visits</li>
                <li className="flex items-center text-slate-600 font-medium"><CheckCircle className="h-5 w-5 text-teal-500 mr-3 shrink-0"/> Dedicated matched walker</li>
                <li className="flex items-center text-slate-600 font-medium"><CheckCircle className="h-5 w-5 text-teal-500 mr-3 shrink-0"/> Live photo updates</li>
              </ul>
              <a href="?success=true" className="w-full block py-4 text-center rounded-xl font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-600 hover:text-white transition">Get Started</a>
            </div>

          </div>

          {/* Add-ons */}
          <div className="mt-16 bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm">
            <h3 className="text-2xl font-black text-slate-800 text-center mb-8">Special Add-Ons & Gifting</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <div className="flex items-start sm:pr-8">
                <div className="bg-amber-100 p-4 rounded-2xl mr-5 shrink-0"><Coffee className="h-8 w-8 text-amber-700"/></div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-1">Coffee & Conversation (+$15)</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Treat them! The walker will stop at a local cafe to buy the senior a coffee or tea to enjoy mid-walk.</p>
                </div>
              </div>
              <div className="flex items-start pt-8 sm:pt-0 sm:pl-8">
                <div className="bg-rose-100 p-4 rounded-2xl mr-5 shrink-0"><Flower className="h-8 w-8 text-rose-600"/></div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-1">Fresh Blooms (+$25)</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">A beautiful, seasonal flower bouquet delivered directly to the senior on the first walk of the month.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-800 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 mb-2">What happens if it rains or snows?</h3>
              <p className="text-slate-600">We monitor the weather closely. If it is unsafe or uncomfortable, we transition to our climate-controlled mall walk routes, or we can simply reschedule the walk based on your preference.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 mb-2">Do you handle wheelchairs and walkers?</h3>
              <p className="text-slate-600">Absolutely. Our companions are trained to assist with light mobility aids, ensuring safe transitions, comfortable pacing, and zero pressure.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 mb-2">Can I meet the walker first?</h3>
              <p className="text-slate-600">Yes! The first scheduled visit is always a "Meet & Greet" at the senior's home where everyone can get comfortable and establish the routine together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-24 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-16">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-black mb-6">Get in Touch</h2>
            <p className="text-slate-400 mb-10 leading-relaxed">Have questions about our packages or need a custom arrangement for your loved one? Reach out directly. We are local and here to help.</p>
            
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="bg-teal-800 p-4 rounded-full mr-5"><Phone className="h-6 w-6 text-teal-300"/></div>
                <div>
                  <div className="text-sm text-teal-400 font-bold mb-1 uppercase tracking-wider">Call Us</div>
                  <a href="tel:2265549966" className="font-black text-2xl hover:text-teal-300 transition">226-554-9966</a>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-teal-800 p-4 rounded-full mr-5"><Mail className="h-6 w-6 text-teal-300"/></div>
                <div>
                  <div className="text-sm text-teal-400 font-bold mb-1 uppercase tracking-wider">Email Us</div>
                  <a href="mailto:admin@walkswithseniors.com" className="font-bold text-xl hover:text-teal-300 transition">admin@walkswithseniors.com</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 bg-white rounded-3xl p-8 sm:p-10 text-slate-800 shadow-xl">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Send a Message</h3>
            <form onSubmit={handleContactSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Your Name</label>
                <input required type="text" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-slate-50" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                  <input required type="email" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                  <input type="text" value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-slate-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">How can we help?</label>
                <textarea required rows="4" value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-slate-50"></textarea>
              </div>
              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-4 rounded-xl transition shadow-sm">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-teal-500 mr-3" />
              <span className="font-black text-2xl tracking-tight text-white">Walks with Seniors</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <a href="tel:2265549966" className="text-slate-300 hover:text-white font-bold text-lg transition">Call: 226-554-9966</a>
              <a href="#contact" className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-6 py-3 rounded-full font-black transition">Request a Call</a>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Walks with Seniors. All rights reserved.</p>
            <div className="flex space-x-6 text-sm font-medium items-center">
              
              <button onClick={onTeamClick} className="text-slate-300 hover:text-white transition">Our Team</button>

              <button 
                onClick={onCareersClick} 
                className="text-teal-400 font-bold hover:text-teal-300 transition"
              >
                Careers
              </button>

              <button onClick={onLegalClick} className="text-slate-500 hover:text-slate-300 transition">Privacy Policy</button>
              <button onClick={onLegalClick} className="text-slate-500 hover:text-slate-300 transition">Terms of Service</button>
              
              {/* HIDDEN STAFF LOGIN LINK */}
              <button 
                onClick={onLoginClick} 
                className="text-slate-800 hover:text-slate-500 transition ml-4"
                title="Staff Portal"
              >
                Staff
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
