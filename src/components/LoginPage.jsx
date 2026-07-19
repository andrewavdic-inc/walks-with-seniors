import React, { useState } from 'react';
import { Lock, Mail, Loader2, Activity } from 'lucide-react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export default function LoginPage({ onLogin, isDbReady }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isDbReady) return;
    
    setIsLoggingIn(true);
    await onLogin(email, password);
    setIsLoggingIn(false); 
  };

  const handlePasswordReset = async () => {
    if (!email) {
      alert("Please enter your email address in the field above to reset your password.");
      return;
    }
    setIsResetting(true);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      alert(`A secure password reset link has been sent to ${email}.`);
    } catch (error) {
      console.error("Reset error:", error);
      alert("Failed to send reset email. Please ensure this email is registered in our system.");
    }
    setIsResetting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="bg-teal-600 p-3 rounded-2xl shadow-lg border-4 border-white">
            <Activity className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-slate-800 tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to view your loved one's updates.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100 sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={onSubmit}>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-slate-50" 
                  placeholder="you@example.com"
                  disabled={!isDbReady || isLoggingIn} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <button 
                  type="button" 
                  onClick={handlePasswordReset}
                  disabled={isResetting}
                  className="text-xs font-bold text-teal-600 hover:text-teal-500 transition disabled:opacity-50"
                >
                  {isResetting ? 'Sending...' : 'Forgot Password?'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-slate-50" 
                  placeholder="••••••••"
                  disabled={!isDbReady || isLoggingIn} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!isDbReady || isLoggingIn}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isDbReady ? 'Connecting to Server...' : isLoggingIn ? <><Loader2 className="h-5 w-5 mr-2 animate-spin"/> Authenticating...</> : 'Secure Sign In'}
            </button>
          </form>
        </div>
        
        {/* Helper text linking back to the sales page */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Need an account? <button onClick={() => window.location.href="/#pricing"} className="font-bold text-teal-600 hover:text-teal-500">View Walk Packages</button>
        </div>
      </div>
    </div>
  );
}
