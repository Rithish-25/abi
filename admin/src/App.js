import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  setDoc,
  onSnapshot 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
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
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { sendPushNotification } from './utils/fcm';

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

const ADMIN_EMAIL = 'admin@gmail.com';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [adminEmail, setAdminEmail] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  
  // Login input states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Dynamic collections states
  const [tests, setTests] = useState(initialTests);
  const [categories, setCategories] = useState(initialCategories);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reports, setReports] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // App notification toasts list
  const [toasts, setToasts] = useState([]);

  // Persistent notification logs driven by Firestore bookings
  const [dismissedBookings, setDismissedBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('dismissed_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  const [readBookings, setReadBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('read_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  const displayBookings = bookings.map(b => {
    const userDoc = users.find(u => u.id === b.userId || u.phone === b.userId);
    if (!userDoc) return b;
    return {
      ...b,
      member: b.member ? b.member.replace(/Karthik Raja/g, userDoc.name) : userDoc.name
    };
  });

  const q = globalSearchQuery.toLowerCase().trim();

  const filteredUsers = q
    ? users.filter(u => (u.name || '').toLowerCase().includes(q) || (u.phone || '').toLowerCase().includes(q))
    : users;

  const filteredBookings = q
    ? displayBookings.filter(b => 
        (b.id || '').toLowerCase().includes(q) || 
        (b.member || '').toLowerCase().includes(q) || 
        (b.testSummary || '').toLowerCase().includes(q) || 
        (b.status || '').toLowerCase().includes(q) || 
        (b.testNames || []).some(n => n.toLowerCase().includes(q))
      )
    : displayBookings;

  const filteredDoctors = q
    ? doctors.filter(d => 
        (d.name || '').toLowerCase().includes(q) || 
        (d.phone || '').toLowerCase().includes(q) || 
        (d.specialty || '').toLowerCase().includes(q)
      )
    : doctors;

  const filteredTests = q
    ? tests.filter(t => 
        (t.name || '').toLowerCase().includes(q) || 
        (t.short || '').toLowerCase().includes(q) || 
        (t.desc || '').toLowerCase().includes(q)
      )
    : tests;

  const filteredReports = q
    ? reports.filter(r => 
        (r.id || '').toLowerCase().includes(q) || 
        (r.name || '').toLowerCase().includes(q) || 
        (r.member || '').toLowerCase().includes(q) || 
        (r.status || '').toLowerCase().includes(q)
      )
    : reports;

  const activeNotifications = displayBookings
    .filter(b => !dismissedBookings.includes(b.id))
    .map(b => ({
      id: b.id,
      title: 'New Booking Request',
      body: `${b.member} booked ${b.testSummary || (b.testNames ? b.testNames.join(', ') : 'Tests')}.`,
      time: b.date || 'Recently',
      read: readBookings.includes(b.id)
    }));

  const handleMarkAllNotificationsRead = () => {
    const activeIds = displayBookings.map(b => b.id);
    const newRead = Array.from(new Set([...readBookings, ...activeIds]));
    setReadBookings(newRead);
    localStorage.setItem('read_bookings', JSON.stringify(newRead));
  };

  const handleMarkNotificationRead = (id) => {
    const newRead = Array.from(new Set([...readBookings, id]));
    setReadBookings(newRead);
    localStorage.setItem('read_bookings', JSON.stringify(newRead));
  };

  const handleClearAllNotifications = () => {
    const currentIds = bookings.map(b => b.id);
    const newDismissed = Array.from(new Set([...dismissedBookings, ...currentIds]));
    setDismissedBookings(newDismissed);
    localStorage.setItem('dismissed_bookings', JSON.stringify(newDismissed));
  };

  // Toast notifier
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts([...toasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(tList => tList.filter(t => t.id !== id));
    }, 4000);
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const isAllowedAdminEmail = (email) => {
    return email.trim().toLowerCase() === ADMIN_EMAIL;
  };

  const getAuthErrorMessage = (error) => {
    switch (error?.code) {
      case 'auth/invalid-email':
        return 'Enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
        return 'Invalid email or password.';
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is not enabled in Firebase Authentication.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later.';
      case 'auth/network-request-failed':
        return 'Network error while signing in. Check your connection.';
      default:
        return error?.message || 'Sign-in failed. Please try again.';
    }
  };

  // Persist Firebase Auth across refreshes and keep the UI in sync with the signed-in user.
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.warn('Unable to enable persisted auth session:', error.message);
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthReady(true);

      if (user?.email && isAllowedAdminEmail(user.email)) {
        setIsAuthenticated(true);
        setAdminEmail(user.email);
        setLoginEmail(user.email);
        setAuthError('');
      } else if (user?.email) {
        signOut(auth).catch((error) => {
          console.warn('Unable to clear unauthorized session:', error.message);
        });
        setIsAuthenticated(false);
        setAdminEmail('');
        setAuthError('Only the admin account can access the Admin Panel.');
      } else {
        setIsAuthenticated(false);
        setAdminEmail('');
      }
    });

    return () => unsubscribe();
  }, []);

  // Firebase listener & Seeding synchronization
  useEffect(() => {
    if (process.env.REACT_APP_FIREBASE_API_KEY === 'your-api-key-here') {
      return; // Fallback to mock lists
    }

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
    seedCollectionIfEmpty('tests', initialTests);
    seedCollectionIfEmpty('categories', initialCategories);

    try {
      // Real-time synchronization listeners
      const unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
        const list = [];
        snap.forEach(doc => {
          const data = doc.data();
          let dateStr = data.date;
          if (data.timestamp && data.timestamp.seconds) {
            const d = new Date(data.timestamp.seconds * 1000);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            dateStr = `${day}/${month}/${year}`;
          }
          list.push({ id: doc.id, ...data, date: dateStr });
        });
        list.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            const secA = a.timestamp.seconds || 0;
            const secB = b.timestamp.seconds || 0;
            if (secA !== secB) return secB - secA;
          }
          return b.id.localeCompare(a.id);
        });
        setBookings(list);
      });

      const unsubTests = onSnapshot(collection(db, 'tests'), (snap) => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setTests(list);
      });

      const unsubCategories = onSnapshot(collection(db, 'categories'), (snap) => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setCategories(list);
      });

      const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setUsers(list);
      });

      const unsubReports = onSnapshot(collection(db, 'reports'), (snap) => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setReports(list);
      });

      const unsubDoctors = onSnapshot(collection(db, 'doctors'), (snap) => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setDoctors(list);
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

  const handleSignIn = async (e) => {
    e.preventDefault();

    const trimmedEmail = loginEmail.trim();
    if (!trimmedEmail) {
      const message = 'Please enter your email address.';
      setAuthError(message);
      addToast(message, 'danger');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      const message = 'Please enter a valid email address.';
      setAuthError(message);
      addToast(message, 'danger');
      return;
    }

    if (!isAllowedAdminEmail(trimmedEmail)) {
      const message = 'Only the admin account can access the Admin Panel.';
      setAuthError(message);
      addToast(message, 'danger');
      return;
    }

    if (!loginPassword.trim()) {
      const message = 'Please enter your password.';
      setAuthError(message);
      addToast(message, 'danger');
      return;
    }

    setAuthLoading(true);
    setAuthError('');

    try {
      await setPersistence(auth, browserLocalPersistence);
      const credential = await signInWithEmailAndPassword(auth, trimmedEmail, loginPassword);
      const signedInEmail = credential.user?.email || trimmedEmail;

      if (!isAllowedAdminEmail(signedInEmail)) {
        await signOut(auth);
        const message = 'Only the admin account can access the Admin Panel.';
        setAuthError(message);
        addToast(message, 'danger');
        return;
      }

      setIsAuthenticated(true);
      setAdminEmail(signedInEmail);
      setLoginEmail(signedInEmail);
      setLoginPassword('');
      setActivePage('dashboard');
      addToast('Administrator authenticated successfully.', 'success');
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setAuthError(message);
      addToast(message, 'danger');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .catch((error) => {
        console.warn('Sign out failed:', error.message);
      })
      .finally(() => {
        setIsAuthenticated(false);
        setAdminEmail('');
        setLoginEmail('');
        setLoginPassword('');
        setAuthError('');
        setActivePage('dashboard');
        setIsMobileSidebarOpen(false);
        addToast('Logged out of Admin Panel.', 'info');
      });
  };

  // Firestore update helper callbacks
  const updateBookings = async (newBookings) => {
    // Intercept state changes to trigger real-time notifications for status or slot rescheduling
    try {
      for (const b of newBookings) {
        const oldB = bookings.find(x => x.id === b.id);
        if (oldB) {
          // 1. If status changed:
          if (oldB.status !== b.status) {
            const recipientPhone = b.userId || '';
            if (recipientPhone) {
              let title = "Booking Updated";
              let body = `Your booking ${b.id} status has been updated to ${b.status}.`;
              let kind = "check";
              
              if (b.status === 'Sample Collected') {
                title = "Sample Collected";
                body = `Your sample for booking ID ${b.id} has been successfully collected.`;
                kind = "truck";
              } else if (b.status === 'Under Process') {
                title = "Sample Under Process";
                body = `Your sample for booking ID ${b.id} is now under process in our lab.`;
                kind = "check";
              } else if (b.status === 'Report Ready') {
                title = "Lab Report Ready";
                body = `Your diagnostic lab report for booking ID ${b.id} is ready. You can now view and download it.`;
                kind = "report";
              } else if (b.status === 'Cancelled') {
                title = "Booking Cancelled";
                body = `Your booking ID ${b.id} has been cancelled.`;
                kind = "check";
              }

              // Save notification for User
              await addDoc(collection(db, 'notifications'), {
                title,
                body,
                kind,
                targetType: 'specific',
                targetPhone: recipientPhone,
                targetRole: 'user',
                timestamp: new Date().toISOString(),
                dateString: new Date().toLocaleDateString('en-IN') + ', ' + new Date().toLocaleTimeString('en-IN')
              });

              // Trigger FCM push notification to User
              sendPushNotification(recipientPhone, 'user', title, body);
            }

            // Also check if there is a referred doctor to notify
            const docPhone = b.doctorPhone || (b.userId && doctors.some(d => d.phone === b.userId) ? b.userId : null);
            if (docPhone && docPhone !== b.userId) {
              let docTitle = "Patient Booking Updated";
              let docBody = `Referred patient ${b.member || 'patient'}'s booking ${b.id} status is now ${b.status}.`;
              if (b.status === 'Report Ready') {
                docTitle = "Patient Report Ready";
                docBody = `Report is ready for referred patient ${b.member}. Commission of ₹${Math.round(b.amount * 0.1)} is credited to your ledger pending payout.`;
              }
              await addDoc(collection(db, 'notifications'), {
                title: docTitle,
                body: docBody,
                kind: 'check',
                targetType: 'specific',
                targetPhone: docPhone,
                targetRole: 'doctor',
                timestamp: new Date().toISOString(),
                dateString: new Date().toLocaleDateString('en-IN') + ', ' + new Date().toLocaleTimeString('en-IN')
              });

              // Trigger FCM push notification to Doctor
              sendPushNotification(docPhone, 'doctor', docTitle, docBody);
            }
          }

          // 2. If slot (rescheduled) changed:
          if (oldB.slot !== b.slot) {
            const recipientPhone = b.userId || '';
            if (recipientPhone) {
              await addDoc(collection(db, 'notifications'), {
                title: "Booking Rescheduled",
                body: `Your booking ID ${b.id} has been rescheduled to: ${b.slot}.`,
                kind: 'check',
                targetType: 'specific',
                targetPhone: recipientPhone,
                targetRole: 'user',
                timestamp: new Date().toISOString(),
                dateString: new Date().toLocaleDateString('en-IN') + ', ' + new Date().toLocaleTimeString('en-IN')
              });

              // Trigger FCM push notification to User
              sendPushNotification(recipientPhone, 'user', "Booking Rescheduled", `Your booking ID ${b.id} has been rescheduled to: ${b.slot}.`);
            }

            const docPhone = b.doctorPhone || (b.userId && doctors.some(d => d.phone === b.userId) ? b.userId : null);
            if (docPhone && docPhone !== b.userId) {
              await addDoc(collection(db, 'notifications'), {
                title: "Referred Booking Rescheduled",
                body: `Referred patient ${b.member}'s booking ID ${b.id} has been rescheduled to: ${b.slot}.`,
                kind: 'check',
                targetType: 'specific',
                targetPhone: docPhone,
                targetRole: 'doctor',
                timestamp: new Date().toISOString(),
                dateString: new Date().toLocaleDateString('en-IN') + ', ' + new Date().toLocaleTimeString('en-IN')
              });

              // Trigger FCM push notification to Doctor
              sendPushNotification(docPhone, 'doctor', "Referred Booking Rescheduled", `Referred patient ${b.member}'s booking ID ${b.id} has been rescheduled to: ${b.slot}.`);
            }
          }
        }
      }
    } catch (err) {
      console.warn("Error triggering update notifications:", err.message);
    }

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

  if (!authReady) {
    return (
      <div className="auth-page">
        <div className="auth-card animate-fade-in" style={{ textAlign: 'center' }}>
          <img 
            src="/admin-logo.png" 
            alt="Abirami Lab Admin Logo"
            style={{
              width: '130px',
              height: 'auto',
              objectFit: 'contain',
              marginBottom: '1rem'
            }}
          />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Restoring Session</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Please wait while Firebase restores your admin session.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-page">
        <div className="auth-card animate-fade-in">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img 
              src="/admin-logo.png" 
              alt="Abirami Lab Admin Logo"
              style={{
                width: '120px',
                height: 'auto',
                objectFit: 'contain',
                marginBottom: '1rem'
              }}
            />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>Administrator Login</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Sign in to manage Abirami Laboratory</p>
          </div>

          <form onSubmit={handleSignIn} className="animate-fade-in">
            {authError ? (
              <div style={{
                marginBottom: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--danger-tint)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--danger)',
                fontSize: '0.8125rem',
                lineHeight: 1.45
              }}>
                {authError}
              </div>
            ) : null}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Enter admin email"
                className="form-control"
                autoComplete="email"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                className="form-control"
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={authLoading}>
              {authLoading ? (
                <span className="auth-loading">
                  <span className="auth-spinner" />
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
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
        adminPhone={adminEmail}
        isMobileSidebarOpen={isMobileSidebarOpen}
        closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
      />
      
      <div className="main-content">
        <Header 
          activePage={activePage} 
          adminPhone={adminEmail} 
          handleLogout={handleLogout}
          isMobileSidebarOpen={isMobileSidebarOpen}
          openMobileSidebar={() => setIsMobileSidebarOpen(true)}
          closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
          notifications={activeNotifications}
          markAllRead={handleMarkAllNotificationsRead}
          markRead={handleMarkNotificationRead}
          clearAll={handleClearAllNotifications}
          globalSearchQuery={globalSearchQuery}
          setGlobalSearchQuery={setGlobalSearchQuery}
        />

        {isMobileSidebarOpen ? (
          <button
            type="button"
            className="sidebar-overlay"
            aria-label="Close navigation"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        ) : null}
        
        <div className="content-body">
          {activePage === 'dashboard' && (
            <Dashboard 
              bookings={filteredBookings} 
              users={filteredUsers} 
              doctors={filteredDoctors}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'users' && (
            <Users 
              users={filteredUsers} 
              setUsers={updateUsers} 
              addToast={addToast}
            />
          )}

          {activePage === 'doctors' && (
            <Doctors 
              doctors={filteredDoctors} 
              setDoctors={updateDoctors} 
              doctorPatients={filteredBookings}
              setDoctorPatients={updateBookings}
              addToast={addToast}
            />
          )}

          {activePage === 'bookings' && (
            <Bookings 
              bookings={filteredBookings} 
              setBookings={updateBookings} 
              addToast={addToast}
            />
          )}

          {activePage === 'tests' && (
            <Tests 
              tests={filteredTests} 
              setTests={updateTests} 
              categories={categories} 
              setCategories={updateCategories} 
              addToast={addToast}
            />
          )}

          {activePage === 'collections' && (
            <Collections 
              bookings={filteredBookings} 
              setBookings={updateBookings} 
              addToast={addToast}
            />
          )}

          {activePage === 'reports' && (
            <Reports 
              bookings={filteredBookings} 
              setBookings={updateBookings} 
              reports={filteredReports}
              setReports={updateReports}
              addToast={addToast}
            />
          )}

          {activePage === 'payments' && (
            <Payments 
              bookings={filteredBookings} 
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
