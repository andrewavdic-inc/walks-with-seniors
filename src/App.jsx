import React, { useState, useEffect } from 'react';
import { Briefcase, LogOut, User } from 'lucide-react';
import LandingPage from './components/LandingPage';
import CareersPage from './components/CareersPage';
import TeamPage from './components/TeamPage';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- UTILS & COMPONENTS ---
// Note: We will build these components in the upcoming phases
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import WalkerPortal from './components/WalkerPortal';
import FamilyPortal from './components/FamilyPortal';

// --- FIREBASE INITIALIZATION ---
let firebaseApp, auth, db, storage, appId;
try {
  // Utilizing your existing Firebase project infrastructure, re-keyed for the new app
  const firebaseConfig = {
    apiKey: "AIzaSyCMhO6iAPDuWJhZLdWZ_orO8-AyWDItnQo",
    authDomain: "good-neighbour-portal.firebaseapp.com",
    projectId: "good-neighbour-portal",
    storageBucket: "good-neighbour-portal.firebasestorage.app",
    messagingSenderId: "570654987529",
    appId: "1:570654987529:web:400f90a7a63a03b6aa6fd8"
  };
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
  appId = 'good-neighbour-portal'; 
} catch (e) {
  console.error("Firebase init error:", e);
}

export default function App() {
  // --- AUTH STATE ---
  const [currentUser, setCurrentUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isDbReady, setIsDbReady] = useState(false);
  const [viewMode, setViewMode] = useState('walker'); // 'admin', 'walker', or 'family'
  
  // --- CORE APP STATE ---
  const [walkers, setWalkers] = useState([]);
  const [seniors, setSeniors] = useState([]);
  const [walks, setWalks] = useState([]);
  const [mileageLogs, setMileageLogs] = useState([]);
  
  // --- GLOBAL SETTINGS ---
  const [officeLocation, setOfficeLocation] = useState('Port Colborne, ON');
  const [flatRatePayout, setFlatRatePayout] = useState(25); // Default flat rate per walk
  const [mileageRate, setMileageRate] = useState(0.68);

// Setup Firebase Auth
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) { console.error('Firebase Auth Error:', error); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, user => { 
      setFirebaseUser(user); 
      setIsDbReady(true); // <--- ADD THIS HERE: Unlocks the login button instantly
    });
    return () => unsubscribe();
  }, []);

  // Setup Lean Firestore Listeners
  useEffect(() => {
    if (!firebaseUser || !db) return;

    const getCol = (name) => collection(db, 'artifacts', appId, 'public', 'data', name);
    const unsubs = [];
    const handleError = (err) => console.error("Firestore Error:", err);

    // 1. Walkers (Formerly Employees)
    unsubs.push(onSnapshot(getCol('ws_walkers'), snap => { 
      setWalkers(snap.docs.map(d => ({ ...d.data(), id: d.id }))); 
    }, handleError));

    // 2. Seniors (Formerly Clients)
    unsubs.push(onSnapshot(getCol('ws_seniors'), snap => {
      setSeniors(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, handleError));

    // 3. Walks (Formerly Shifts) - Now includes embedded photoUrls and update notes
    unsubs.push(onSnapshot(getCol('ws_walks'), snap => {
      setWalks(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, handleError));

    // 4. Mileage Logs
    unsubs.push(onSnapshot(getCol('ws_mileage'), snap => {
      setMileageLogs(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, handleError));

    return () => unsubs.forEach(unsub => unsub());
  }, [firebaseUser]);

  // --- AUTHENTICATION ROUTING ---
  const handleLogin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const secureEmail = userCredential.user.email;

      // Check if user is a Walker/Admin
      let foundUser = walkers.find(w => w.email && String(w.email).toLowerCase() === String(secureEmail).toLowerCase());
      let userRoleType = 'walker';

      // If not a walker, check if they are a Family Account Holder
      if (!foundUser) {
        const foundFamily = seniors.find(s => s.accountHolderEmail && String(s.accountHolderEmail).toLowerCase() === String(secureEmail).toLowerCase());
        if (foundFamily) {
          foundUser = { ...foundFamily, role: 'Family', id: foundFamily.id, name: foundFamily.accountHolderName };
          userRoleType = 'family';
        }
      }

      // Emergency Master Admin Fallback
      if (!foundUser && String(secureEmail).toLowerCase() === 'blueberry@gmail.com') {
         foundUser = { id: 'admin1', name: 'Master Admin', role: 'Master Admin', isActive: true };
         userRoleType = 'admin';
      }

      if (foundUser) {
        setCurrentUser(foundUser);
        
        // Route to the correct portal based on role
        if (userRoleType === 'family') {
          setViewMode('family');
        } else {
          const isAdmin = ['Administrator', 'Master Admin'].includes(foundUser.role);
          setViewMode(isAdmin ? 'admin' : 'walker');
        }
      } else { 
        alert("Login successful, but this email is not assigned to an active profile. Please contact administration."); 
      }
    } catch (error) {
      console.error("Auth Error:", error);
      alert("Invalid email or password. Please try again.");
    }
  };
  
  const handleLogout = () => { 
    setCurrentUser(null); 
    setViewMode('walker'); 
  };

  // --- DATABASE MUTATION ENGINE ---
  const getDocRef = (cName, dId) => doc(db, 'artifacts', appId, 'public', 'data', cName, String(dId));
  
  const runMutation = async (cName, dId, action, data) => {
    if(!firebaseUser) return;
    const ref = getDocRef(cName, dId);
    if(action === 'set') await setDoc(ref, data);
    if(action === 'update') await updateDoc(ref, data);
    if(action === 'delete') await deleteDoc(ref);
  };

  // --- UNIFIED FILE UPLOADER (Avatars & Walk Updates) ---
  const handleFileUpload = async (file, folder) => {
    if (!file || !firebaseUser || !storage) return null;
    try {
      const uniqueName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const fileRef = ref(storage, `${appId}/${folder}/${uniqueName}`);
      await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("File upload failed. Please try again.");
      return null;
    }
  };

  // State to toggle between the public pages
  const [publicPage, setPublicPage] = useState('home'); // 'home', 'login', 'careers', or 'team'

  if (!currentUser) {
    if (publicPage === 'login') {
      return (
        <div className="relative">
          <button 
            onClick={() => setPublicPage('home')} 
            className="absolute top-6 left-6 z-50 text-teal-800 font-bold bg-white/80 backdrop-blur px-4 py-2 rounded-lg border border-teal-100 shadow-sm hover:bg-white transition"
          >
            &larr; Back to Home
          </button>
          <LoginPage onLogin={handleLogin} isDbReady={isDbReady} />
        </div>
      );
    }
    
    if (publicPage === 'careers') {
      return <CareersPage onHomeClick={() => setPublicPage('home')} />;
    }

    if (publicPage === 'team') {
      return <TeamPage onHomeClick={() => setPublicPage('home')} onCareersClick={() => setPublicPage('careers')} />;
    }
    
    return (
      <LandingPage 
        onLoginClick={() => setPublicPage('login')} 
        onCareersClick={() => setPublicPage('careers')} 
        onTeamClick={() => setPublicPage('team')}
      />
    );
  }

  // --- RENDER PORTALS BASED ON VIEW MODE ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Universal Navigation Bar */}
      <nav className="bg-teal-700 text-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="font-bold text-xl flex items-center">
          <Briefcase className="mr-2 h-6 w-6 text-teal-200"/> 
          Walks with Seniors
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm hidden sm:flex">
            <div className="h-7 w-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 border border-teal-500 overflow-hidden mr-2 shrink-0">
              {currentUser.photoUrl ? <img src={currentUser.photoUrl} alt="Avatar" className="h-full w-full object-cover" /> : <User className="h-4 w-4" />}
            </div>
            {String(currentUser.name)}
          </div>
          <button onClick={handleLogout} className="p-2 rounded-full hover:bg-teal-600 transition" title="Logout">
            <LogOut className="h-5 w-5"/>
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {viewMode === 'admin' && (
          <AdminDashboard 
            walkers={walkers} 
            seniors={seniors} 
            walks={walks}
            mileageLogs={mileageLogs}
            flatRatePayout={flatRatePayout}
            runMutation={runMutation}
            handleFileUpload={handleFileUpload}
            officeLocation={officeLocation}
          />
        )}
        
        {viewMode === 'walker' && (
          <WalkerPortal 
            currentUser={currentUser}
            walks={walks}
            seniors={seniors}
            runMutation={runMutation}
            handleFileUpload={handleFileUpload}
          />
        )}

        {viewMode === 'family' && (
          <FamilyPortal 
            currentUser={currentUser}
            seniorProfile={seniors.find(s => s.id === currentUser.id)}
            walks={walks}
          />
        )}
      </main>
    </div>
  );
}
