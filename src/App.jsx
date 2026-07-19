import React, { useState, useEffect } from 'react';
import { Briefcase, LogOut, User } from 'lucide-react';
import LandingPage from './components/LandingPage';
import CareersPage from './components/CareersPage';
import TeamPage from './components/TeamPage';
import LegalPage from './components/LegalPage';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword // <-- ADDED THIS IMPORT
} from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- UTILS & COMPONENTS ---
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import WalkerPortal from './components/WalkerPortal';
import FamilyPortal from './components/FamilyPortal';

// --- FIREBASE INITIALIZATION ---
let firebaseApp, auth, db, storage, appId;
try {
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
  const [currentUser, setCurrentUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isDbReady, setIsDbReady] = useState(false);
  const [viewMode, setViewMode] = useState('walker');
  
  const [walkers, setWalkers] = useState([]);
  const [seniors, setSeniors] = useState([]);
  const [walks, setWalks] = useState([]);
  const [mileageLogs, setMileageLogs] = useState([]);
  const [leads, setLeads] = useState([]);
  
  const [officeLocation, setOfficeLocation] = useState('Port Colborne, ON');
  const [flatRatePayout, setFlatRatePayout] = useState(25);
  const [mileageRate, setMileageRate] = useState(0.68);

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
      setIsDbReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!firebaseUser || !db) return;

    const getCol = (name) => collection(db, 'artifacts', appId, 'public', 'data', name);
    const unsubs = [];
    const handleError = (err) => console.error("Firestore Error:", err);

    unsubs.push(onSnapshot(getCol('ws_walkers'), snap => { 
      setWalkers(snap.docs.map(d => ({ ...d.data(), id: d.id }))); 
    }, handleError));

    unsubs.push(onSnapshot(getCol('ws_seniors'), snap => {
      setSeniors(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, handleError));

    unsubs.push(onSnapshot(getCol('ws_walks'), snap => {
      setWalks(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, handleError));

    unsubs.push(onSnapshot(getCol('ws_mileage'), snap => {
      setMileageLogs(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, handleError));

    unsubs.push(onSnapshot(getCol('ws_leads'), snap => {
      setLeads(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, handleError));

    return () => unsubs.forEach(unsub => unsub());
  }, [firebaseUser]);

  // --- CHECKOUT & REGISTRATION LOGIC ---
  const handleCheckoutSignup = async (checkoutData) => {
    try {
      // 1. Create the Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, checkoutData.email, checkoutData.password);
      const secureEmail = userCredential.user.email;

      // 2. Create the active client lead in the pipeline
      const leadId = `lead_${Date.now()}`;
      const leadData = {
        name: checkoutData.familyName,
        email: secureEmail,
        phone: checkoutData.phone,
        seniorName: checkoutData.seniorName,
        tier: checkoutData.tierSelected,
        type: 'New Booking Intake',
        status: 'Active Client' // Bypasses inquiry stage directly to Active Client
      };

      await runMutation('ws_leads', leadId, 'set', leadData);
      
    } catch (error) {
      console.error("Signup Error:", error);
      throw error; // Passes the error back to the LandingPage to halt Stripe redirect
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const secureEmail = userCredential.user.email;

      let foundUser = walkers.find(w => w.email && String(w.email).toLowerCase() === String(secureEmail).toLowerCase());
      let userRoleType = 'walker';

      if (!foundUser) {
        const foundFamily = seniors.find(s => s.accountHolderEmail && String(s.accountHolderEmail).toLowerCase() === String(secureEmail).toLowerCase());
        if (foundFamily) {
          foundUser = { ...foundFamily, role: 'Family', id: foundFamily.id, name: foundFamily.accountHolderName };
          userRoleType = 'family';
        }
      }

      if (!foundUser && String(secureEmail).toLowerCase() === 'blueberry@gmail.com') {
         foundUser = { id: 'admin1', name: 'Master Admin', role: 'Master Admin', isActive: true };
         userRoleType = 'admin';
      }

      if (foundUser) {
        setCurrentUser(foundUser);
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

  const getDocRef = (cName, dId) => doc(db, 'artifacts', appId, 'public', 'data', cName, String(dId));
  
  const runMutation = async (cName, dId, action, data) => {
    if(!firebaseUser) return;
    const ref = getDocRef(cName, dId);
    if(action === 'set') await setDoc(ref, data);
    if(action === 'update') await updateDoc(ref, data);
    if(action === 'delete') await deleteDoc(ref);
  };

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

  const [publicPage, setPublicPage] = useState('home');

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
      return <CareersPage onHomeClick={() => setPublicPage('home')} onLegalClick={() => setPublicPage('legal')} />;
    }

    if (publicPage === 'team') {
      return <TeamPage onHomeClick={() => setPublicPage('home')} onCareersClick={() => setPublicPage('careers')} onLegalClick={() => setPublicPage('legal')} />;
    }

    if (publicPage === 'legal') {
      return <LegalPage onHomeClick={() => setPublicPage('home')} />;
    }
    
    return (
      <LandingPage 
        onLoginClick={() => setPublicPage('login')} 
        onCareersClick={() => setPublicPage('careers')} 
        onTeamClick={() => setPublicPage('team')}
        onLegalClick={() => setPublicPage('legal')}
        runMutation={runMutation}
        onCheckoutSignup={handleCheckoutSignup} // <-- PASSED DOWN TO LANDING PAGE
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
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
            leads={leads}
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
