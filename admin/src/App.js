import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  onSnapshot 
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase';
import './App.css';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Doctors from './pages/Doctors';
import Bookings from './pages/Bookings';
import Tests from './pages/Tests';
import Collections from './pages/Collections';
import Reports from './pages/Reports';
import Payments from './pages/Payments';
import Marketing from './pages/Marketing';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

// Mock Seed Data
const initialTests = [
  { id: 'cbc', name: 'CBC (Complete Blood Count)', short: 'Complete Blood Count', desc: 'Measures red cells, white cells & platelets to detect infections, anemia and blood disorders.', price: 299, mrp: 399, fasting: false, sample: 'Blood', report: 'Same day, by 6:00 PM', prep: 'No special preparation needed.', image: 'assets/cbc.jpg', isPackage: false },
  { id: 'sugar', name: 'Blood Sugar (Fasting / PP / HbA1c)', short: 'Blood Sugar', desc: 'Tracks fasting & post-meal glucose plus 3-month average sugar control (HbA1c).', price: 499, mrp: 650, fasting: true, sample: 'Blood', report: 'Same day, by 6:00 PM', prep: '8-10 hours fasting required before the test.', image: 'assets/sugar.jpg', isPackage: false },
  { id: 'thyroid', name: 'Thyroid Test', short: 'Thyroid Test', desc: 'Assesses thyroid gland function and hormone balance.', price: 599, mrp: 799, fasting: false, sample: 'Blood', report: 'Next day, by 10:00 AM', prep: 'No special preparation needed.', image: 'assets/thyroid.jpg', isPackage: false },
  { id: 'lipid', name: 'Lipid Profile', short: 'Lipid Profile', desc: 'Checks total cholesterol, HDL, LDL & triglycerides for heart health.', price: 649, mrp: 849, fasting: true, sample: 'Blood', report: 'Next day, by 10:00 AM', prep: '10-12 hours fasting required before the test.', image: 'assets/lipid.jpg', isPackage: false },
  { id: 'lft_kft', name: 'Liver & Kidney Test', short: 'Liver & Kidney Test', desc: 'Evaluates liver enzymes and kidney filtration markers together.', price: 899, mrp: 1199, fasting: true, sample: 'Blood', report: 'Next day, by 10:00 AM', prep: '8 hours fasting recommended.', image: 'assets/liver_kidney.jpg', isPackage: false },
  { id: 'urine', name: 'Urine Test', short: 'Urine Test', desc: 'Screens for infections, kidney issues & diabetes markers in urine.', price: 199, mrp: 249, fasting: false, sample: 'Urine', report: 'Same day, by 6:00 PM', prep: 'Collect the first morning sample if possible.', image: 'assets/urine.jpg', isPackage: false },
  { id: 'fever', name: 'Fever Tests (Dengue, Typhoid, Malaria)', short: 'Fever Tests', desc: 'Detects the most common fever-causing infections in one panel.', price: 1299, mrp: 1699, fasting: false, sample: 'Blood', report: 'Next day, by 10:00 AM', prep: 'No special preparation needed.', image: 'assets/fever.jpg', isPackage: false },
  { id: 'fullbody', name: 'Full Body Checkup', short: 'Full Body Checkup', desc: 'All 7 essential tests in one package - a complete health snapshot.', price: 2999, mrp: 5294, fasting: true, sample: 'Blood + Urine', report: 'Next day, by 10:00 AM', prep: '10-12 hours fasting required.', isPackage: true, includedTestIds: ['cbc', 'sugar', 'thyroid', 'lipid', 'lft_kft', 'urine', 'fever'] },
  { id: 'diabetes', name: 'Diabetes Care Package', short: 'Diabetes Care', desc: 'Sugar, Thyroid & Lipid - ideal for ongoing diabetes monitoring.', price: 1499, mrp: 1948, fasting: true, sample: 'Blood', report: 'Next day, by 10:00 AM', prep: '8-10 hours fasting required.', isPackage: true, includedTestIds: ['sugar', 'thyroid', 'lipid'] }
];

const initialCategories = [
  { id: 'blood', label: 'Blood Tests' },
  { id: 'diabetes', label: 'Diabetes Care' },
  { id: 'heart', label: 'Heart Care' },
  { id: 'thyroid', label: 'Thyroid Care' },
  { id: 'fever', label: 'Fever Care' }
];

const initialUsers = [
  { id: 'u1', phone: '9894913330', name: 'Karthik Raja', relation: 'Self', age: '34', gender: 'Male', role: 'admin' },
  { id: 'u2', phone: '9876543210', name: 'Dr. Senthil Kumar', relation: 'Self', age: '45', gender: 'Male', role: 'doctor' },
  { id: 'u3', phone: '9865321470', name: 'Meena Karthik', relation: 'Wife', age: '31', gender: 'Female', role: 'user' },
  { id: 'u4', phone: '9843217650', name: 'Suresh Babu', relation: 'Self', age: '50', gender: 'Male', role: 'user' },
  { id: 'u5', phone: '9845012345', name: 'Venkatesh Prasad', relation: 'Self', age: '29', gender: 'Male', role: 'technician' }
];

const initialBookings = [
  { id: 'AB2314', date: '20/07/2026', testNames: ['CBC (Complete Blood Count)', 'Blood Sugar (Fasting / PP / HbA1c)'], testSummary: 'CBC + Blood Sugar', member: 'Karthik Raja', status: 'Report Ready', amount: 798, address: '12, Bharathi Street, Thindal, Erode - 638012', slot: '20/07/2026, 7:30 AM', assignedTech: 'Venkatesh Prasad', userId: '9894913330' },
  { id: 'AB2298', date: '21/07/2026', testNames: ['Thyroid Test', 'Lipid Profile'], testSummary: 'Thyroid + Lipid', member: 'Meena Karthik', status: 'Sample Collected', amount: 1248, address: '12, Bharathi Street, Thindal, Erode - 638012', slot: '23/07/2026, 8:00 AM', assignedTech: 'Saravanan M', userId: '9894913330' },
  { id: 'AB2276', date: '18/07/2026', testNames: ['Thyroid Test'], testSummary: 'Thyroid Test', member: 'Karthik Raja', status: 'Confirmed', amount: 599, address: '45, Perundurai Road, Erode - 638011', slot: '24/07/2026, 7:00 AM', assignedTech: '', userId: '9894913330' },
  { id: 'AB2250', date: '02/07/2026', testNames: ['Urine Test'], testSummary: 'Urine Test', member: 'Aadhira', status: 'Cancelled', amount: 199, address: '12, Bharathi Street, Thindal, Erode - 638012', slot: '-', assignedTech: '', userId: '9894913330' }
];

const initialReports = [
  { id: 'AB2314', name: 'CBC + Blood Sugar', date: '20/07/2026', member: 'Karthik Raja', status: 'Report Ready', rows: [
    { name: 'Hemoglobin', value: '13.8 g/dL', range: '13-17', abnormal: false },
    { name: 'WBC Count', value: '7,200 /uL', range: '4,000-11,000', abnormal: false },
    { name: 'Platelet Count', value: '2.4 L/uL', range: '1.5-4.5 L', abnormal: false },
    { name: 'Fasting Sugar', value: '108 mg/dL', range: '70-100', abnormal: true },
    { name: 'HbA1c', value: '5.9 %', range: '<5.7', abnormal: true }
  ]},
  { id: 'AB2199', name: 'Lipid Profile', date: '28/06/2026', member: 'Karthik Raja', status: 'Report Ready', rows: [
    { name: 'Total Cholesterol', value: '176 mg/dL', range: '<200', abnormal: false },
    { name: 'HDL', value: '42 mg/dL', range: '>40', abnormal: false },
    { name: 'LDL', value: '110 mg/dL', range: '<100', abnormal: true },
    { name: 'Triglycerides', value: '138 mg/dL', range: '<150', abnormal: false }
  ]}
];

const initialDoctors = [
  { id: 'doc1', name: 'Dr. Senthil Kumar', phone: '9876543210', specialty: 'Diabetologist', totalReferrals: 3, totalCommission: 275 },
  { id: 'doc2', name: 'Dr. Ramesh Kumar', phone: '9843217650', specialty: 'General Physician', totalReferrals: 1, totalCommission: 65 }
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [adminPhone, setAdminPhone] = useState('');
  
  // Login input states
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  
  // Dynamic collections states
  const [tests, setTests] = useState(initialTests);
  const [categories, setCategories] = useState(initialCategories);
  const [users, setUsers] = useState(initialUsers);
  const [bookings, setBookings] = useState(initialBookings);
  const [reports, setReports] = useState(initialReports);
  const [doctors, setDoctors] = useState(initialDoctors);

  // App notification toasts list
  const [toasts, setToasts] = useState([]);

  // Toast notifier
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts([...toasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(tList => tList.filter(t => t.id !== id));
    }, 4000);
  };

  // Check login states in localStorage on mount
  useEffect(() => {
    const isLogged = localStorage.getItem('admin_logged') === 'true';
    const phone = localStorage.getItem('admin_phone') || '';
    if (isLogged) {
      setIsAuthenticated(true);
      setAdminPhone(phone);
    }
  }, []);

  // Firebase listener & Seeding synchronization
  useEffect(() => {
    if (process.env.REACT_APP_FIREBASE_API_KEY === 'your-api-key-here') {
      return; // Fallback to mock lists
    }

    // Perform a one-time upgrade for mock bookings to add userId if missing
    const upgradeBookings = async () => {
      try {
        const snap = await getDocs(collection(db, 'bookings'));
        snap.forEach(async (docSnap) => {
          const data = docSnap.data();
          if (!data.userId) {
            await updateDoc(doc(db, 'bookings', docSnap.id), { userId: '9894913330' });
          }
        });
      } catch (err) {
        console.warn('Upgrade bookings error:', err);
      }
    };
    upgradeBookings();

    const seedCollectionIfEmpty = async (colName, seedArray) => {
      try {
        const colRef = collection(db, colName);
        const snap = await getDocs(colRef);
        if (snap.empty) {
          console.log(`Seeding Firestore collection: ${colName}`);
          for (const item of seedArray) {
            const docId = item.id || item.code;
            if (docId) {
              await setDoc(doc(db, colName, docId), item);
            } else {
              await addDoc(colRef, item);
            }
          }
        }
      } catch (err) {
        console.warn(`Error seeding collection ${colName}:`, err.message);
      }
    };

    // Trigger seeding of all datasets to Firestore
    seedCollectionIfEmpty('bookings', initialBookings);
    seedCollectionIfEmpty('tests', initialTests);
    seedCollectionIfEmpty('categories', initialCategories);
    seedCollectionIfEmpty('users', initialUsers);
    seedCollectionIfEmpty('reports', initialReports);
    seedCollectionIfEmpty('doctors', initialDoctors);

    try {
      // Real-time synchronization listeners
      const unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        if (list.length > 0) setBookings(list);
      });

      const unsubTests = onSnapshot(collection(db, 'tests'), (snap) => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        if (list.length > 0) setTests(list);
      });

      const unsubCategories = onSnapshot(collection(db, 'categories'), (snap) => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        if (list.length > 0) setCategories(list);
      });

      const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        if (list.length > 0) setUsers(list);
      });

      const unsubReports = onSnapshot(collection(db, 'reports'), (snap) => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        if (list.length > 0) setReports(list);
      });

      const unsubDoctors = onSnapshot(collection(db, 'doctors'), (snap) => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        if (list.length > 0) setDoctors(list);
      });

      return () => {
        unsubBookings();
        unsubTests();
        unsubCategories();
        unsubUsers();
        unsubReports();
        unsubDoctors();
      };
    } catch (e) {
      console.warn('Firebase sync failed to initialize:', e.message);
    }
  }, []);

  // Direct login credentials or real-time passcode bypass
  const handleRequestOtp = (e) => {
    e.preventDefault();
    if (loginPhone.length !== 10) {
      addToast('Please enter a valid 10-digit mobile number.', 'danger');
      return;
    }
    // Simulate SMS dispatch
    setShowOtpField(true);
    addToast('OTP verification code successfully sent via SMS bypass: 4392', 'success');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (loginOtp === '4392' || loginPhone === '9894913330') {
      setIsAuthenticated(true);
      setAdminPhone(loginPhone);
      localStorage.setItem('admin_logged', 'true');
      localStorage.setItem('admin_phone', loginPhone);
      addToast('Administrator authenticated successfully.', 'success');
    } else {
      addToast('Invalid OTP passcode. Please try again.', 'danger');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminPhone('');
    localStorage.removeItem('admin_logged');
    localStorage.removeItem('admin_phone');
    addToast('Logged out of Admin Panel.', 'info');
  };

  // Firestore update helper callbacks
  const updateBookings = async (newBookings) => {
    setBookings(newBookings);
    try {
      for (const b of newBookings) {
        await setDoc(doc(db, 'bookings', b.id), b, { merge: true });
      }
    } catch (_) {}
  };

  const updateTests = async (newTests) => {
    setTests(newTests);
    try {
      for (const t of newTests) {
        await setDoc(doc(db, 'tests', t.id), t, { merge: true });
      }
    } catch (_) {}
  };

  const updateCategories = async (newCategories) => {
    setCategories(newCategories);
    try {
      for (const c of newCategories) {
        await setDoc(doc(db, 'categories', c.id), c, { merge: true });
      }
    } catch (_) {}
  };

  const updateUsers = async (newUsers) => {
    setUsers(newUsers);
    try {
      for (const u of newUsers) {
        await setDoc(doc(db, 'users', u.id), u, { merge: true });
      }
    } catch (_) {}
  };

  const updateReports = async (newReports) => {
    setReports(newReports);
    try {
      for (const r of newReports) {
        await setDoc(doc(db, 'reports', r.id), r, { merge: true });
      }
    } catch (_) {}
  };

  const updateDoctors = async (newDoctors) => {
    setDoctors(newDoctors);
    try {
      for (const d of newDoctors) {
        await setDoc(doc(db, 'doctors', d.id), d, { merge: true });
      }
    } catch (_) {}
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: 'white',
              fontSize: '1.25rem',
              marginBottom: '1rem'
            }}>
              AL
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>Administrator Login</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Sign in to manage Abirami Laboratory</p>
          </div>

          <form onSubmit={showOtpField ? handleVerifyOtp : handleRequestOtp}>
            {!showOtpField ? (
              <>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9894913330"
                    className="form-control"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Send OTP Code
                </button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Verification OTP Code (Bypass: 4392)</label>
                  <input
                    type="text"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Enter 4-digit code"
                    className="form-control"
                    maxLength={4}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Verify & Sign In
                </button>
                <button 
                  onClick={() => setShowOtpField(false)} 
                  className="btn btn-secondary" 
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  Change Phone Number
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast" style={{
            borderLeft: `4px solid ${
              t.type === 'success' ? 'var(--success)' : 
              t.type === 'danger' ? 'var(--danger)' : 
              'var(--accent)'
            }`
          }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{t.message}</span>
          </div>
        ))}
      </div>

      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        handleLogout={handleLogout}
        adminPhone={adminPhone}
      />
      
      <div className="main-content">
        <Header 
          activePage={activePage} 
          adminPhone={adminPhone} 
          handleLogout={handleLogout}
        />
        
        <div className="content-body">
          {activePage === 'dashboard' && (
            <Dashboard 
              bookings={bookings} 
              users={users} 
              doctors={doctors}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'users' && (
            <Users 
              users={users} 
              setUsers={updateUsers} 
              addToast={addToast}
            />
          )}

          {activePage === 'doctors' && (
            <Doctors 
              doctors={doctors} 
              setDoctors={updateDoctors} 
              doctorPatients={bookings}
              setDoctorPatients={updateBookings}
              addToast={addToast}
            />
          )}

          {activePage === 'bookings' && (
            <Bookings 
              bookings={bookings} 
              setBookings={updateBookings} 
              addToast={addToast}
            />
          )}

          {activePage === 'tests' && (
            <Tests 
              tests={tests} 
              setTests={updateTests} 
              categories={categories} 
              setCategories={updateCategories} 
              addToast={addToast}
            />
          )}

          {activePage === 'collections' && (
            <Collections 
              bookings={bookings} 
              setBookings={updateBookings} 
              addToast={addToast}
            />
          )}

          {activePage === 'reports' && (
            <Reports 
              bookings={bookings} 
              setBookings={updateBookings} 
              reports={reports}
              setReports={updateReports}
              addToast={addToast}
            />
          )}

          {activePage === 'payments' && (
            <Payments 
              bookings={bookings} 
              addToast={addToast}
            />
          )}

          {activePage === 'marketing' && (
            <Marketing 
              addToast={addToast}
            />
          )}

          {activePage === 'notifications' && (
            <Notifications 
              addToast={addToast}
            />
          )}

          {activePage === 'settings' && (
            <Settings 
              addToast={addToast}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
