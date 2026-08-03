import React, { useState, useEffect } from 'react';
import { Search, Stethoscope, HandMetal, CheckCircle, Plus, Send, AlertTriangle, KeyRound, CheckSquare, BellRing } from 'lucide-react';
import { addDoc, collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { sendPushNotification } from '../utils/fcm';

const Doctors = ({ doctors, setDoctors, doctorPatients, setDoctorPatients, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

  // Add doctor fields
  const [docName, setDocName] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');

  // Notification fields
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');

  const [doctorOtpLogs, setDoctorOtpLogs] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'otp_logs'), where('type', '==', 'Doctor Login'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        const date = data.timestamp && data.timestamp.toDate ? data.timestamp.toDate() : new Date();
        const timestampStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + date.toLocaleDateString() + ')';
        return {
          name: data.name || 'Doctor',
          phone: data.phone || doc.id,
          code: data.code || '0000',
          timestamp: timestampStr,
          dateObj: date,
          status: data.status || 'Pending'
        };
      });
      logs.sort((a, b) => b.dateObj - a.dateObj);
      setDoctorOtpLogs(logs);
    }, (err) => {
      console.warn("Failed to listen to doctor otp logs:", err);
    });
    return unsubscribe;
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtered doctors list
  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone.includes(searchTerm) ||
    (d.specialty && d.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddDoctor = () => {
    if (!docName.trim() || !docPhone.trim()) {
      addToast('Please enter both doctor name and phone number.', 'danger');
      return;
    }
    if (docPhone.length !== 10) {
      addToast('Doctor phone number must be exactly 10 digits.', 'danger');
      return;
    }
    const newDoc = {
      name: docName,
      phone: docPhone,
      specialty: docSpecialty || 'General Physician',
      totalReferrals: 0,
      totalCommission: 0
    };
    setDoctors([newDoc, ...doctors]);
    addToast(`Successfully registered ${docName} as an affiliated doctor.`, 'success');
    setDocName('');
    setDocPhone('');
    setDocSpecialty('');
    setShowAddDoctorModal(false);
  };

  const handleProcessPayout = async () => {
    if (!selectedDoctor) return;
    // Process all pending payouts for doctorPatients referred by this doctor
    const updatedPatients = doctorPatients.map(p => 
      p.doctorPhone === selectedDoctor.phone || (selectedDoctor.name.includes(p.name) /* fallback match */)
        ? { ...p, status: 'Report Ready' } // complete their referral cycle
        : p
    );
    setDoctorPatients(updatedPatients);
    
    // Add real-time notification to the doctor
    try {
      const docTitle = "Commission Payout Processed";
      const docBody = `Your outstanding referral commission of ₹${selectedDoctor.totalCommission || 0} has been successfully paid out.`;
      await addDoc(collection(db, 'notifications'), {
        title: docTitle,
        body: docBody,
        kind: 'offer',
        targetType: 'specific',
        targetPhone: selectedDoctor.phone,
        targetRole: 'doctor',
        timestamp: new Date().toISOString(),
        dateString: new Date().toLocaleDateString('en-IN') + ', ' + new Date().toLocaleTimeString('en-IN'),
      });

      // Trigger FCM push notification to Doctor
      sendPushNotification(selectedDoctor.phone, 'doctor', docTitle, docBody);
    } catch (err) {
      console.error("Failed to save payout notification:", err);
    }

    // Update commissions paid
    addToast(`Successfully processed commission payouts for ${selectedDoctor.name}.`, 'success');
    setShowPayoutModal(false);
  };

  const handleSendNotification = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      addToast('Please enter both title and body for the notification.', 'danger');
      return;
    }
    if (!selectedDoctor?.phone) {
      addToast('Doctor phone number is missing for this notification.', 'danger');
      return;
    }

    try {
      await addDoc(collection(db, 'notifications'), {
        title: notifTitle.trim(),
        body: notifBody.trim(),
        kind: 'offer',
        targetType: 'specific',
        targetPhone: selectedDoctor.phone,
        targetRole: 'doctor',
        recipientName: selectedDoctor.name,
        timestamp: new Date().toISOString(),
        dateString: new Date().toLocaleDateString('en-IN') + ', ' + new Date().toLocaleTimeString('en-IN'),
      });

      // Trigger FCM push notification to Doctor
      sendPushNotification(selectedDoctor.phone, 'doctor', notifTitle.trim(), notifBody.trim());

      addToast(`Push notification successfully pushed to ${selectedDoctor.name} (${selectedDoctor.phone}).`, 'success');
      setNotifTitle('');
      setNotifBody('');
      setShowNotifModal(false);
    } catch (err) {
      console.error('Error sending doctor notification:', err);
      addToast('Failed to save doctor notification.', 'danger');
    }
  };

  // Columns definition for Doctors List
  const doctorColumns = [
    { header: 'Doctor Name', field: 'name', sortable: true, render: (val, row) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 700 }}>{val}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.specialty || 'General Practitioner'}</span>
      </div>
    )},
    { header: 'Phone Number', field: 'phone', sortable: true },
    { header: 'Referrals Count', field: 'totalReferrals', sortable: true, render: (val) => (
      <span style={{ fontWeight: 600 }}>{val} patients</span>
    )},
    { header: 'Earnings Summary', field: 'totalCommission', sortable: true, render: (val) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{val}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Referred Ledger</span>
      </div>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      {/* Title block with action buttons */}
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Doctor Affiliates & Referrals</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Manage medical affiliations, track commissions, review doctor OTP codes, and trigger direct alert messages</p>
        </div>
        <div className="page-header-actions">
          <button 
            onClick={() => setShowOtpModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            <KeyRound size={16} />
            Doctor OTP Codes
          </button>
          <button 
            onClick={() => setShowAddDoctorModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} />
            Affiliate Doctor
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <input
            type="text"
            placeholder="Search doctors by name, phone, or specialty..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={16} style={{
            position: 'absolute',
            left: '0.875rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)'
          }} />
        </div>
      </div>

      {/* Affiliated Doctors Table */}
      <div className="card">
        <Table
          columns={doctorColumns}
          data={filteredDoctors}
          keyField="phone"
          pageSize={5}
          actions={(row) => (
            <>
              {/* Send Notification Button */}
              <button
                onClick={() => {
                  setSelectedDoctor(row);
                  setShowNotifModal(true);
                }}
                className="btn btn-secondary"
                style={{ padding: '0.375rem 0.5rem', color: 'var(--accent)' }}
                title="Send notification alert"
              >
                <Send size={14} />
              </button>

              {/* Payout Ledger Button */}
              <button
                onClick={() => {
                  setSelectedDoctor(row);
                  setShowPayoutModal(true);
                }}
                className="btn btn-secondary"
                style={{ padding: '0.375rem 0.5rem', color: 'var(--success)' }}
                title="Manage commission payout"
              >
                <CheckSquare size={14} />
              </button>
            </>
          )}
        />
      </div>

      {/* Modal 1: Register New Doctor affiliate */}
      <Modal
        isOpen={showAddDoctorModal}
        onClose={() => setShowAddDoctorModal(false)}
        title="Affiliate New Doctor Profile"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAddDoctorModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddDoctor}>Add Doctor</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Doctor Name</label>
          <input
            type="text"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            placeholder="e.g. Dr. Senthil Kumar"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Contact Phone</label>
          <input
            type="text"
            value={docPhone}
            onChange={(e) => setDocPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit mobile number"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Medical Specialty</label>
          <input
            type="text"
            value={docSpecialty}
            onChange={(e) => setDocSpecialty(e.target.value)}
            placeholder="e.g. Cardiologist, Diabetologist"
            className="form-control"
          />
        </div>
      </Modal>

      {/* Modal 2: Payout Commissions Management */}
      <Modal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        title={`Payout Summary - ${selectedDoctor?.name}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowPayoutModal(false)}>Close Ledger</button>
            <button className="btn btn-primary" onClick={handleProcessPayout}>Mark All Paid</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '1rem',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Accumulated Commissions</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>₹{selectedDoctor?.totalCommission || 0}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Status</span>
              <span className="badge badge-success" style={{ marginTop: '0.5rem' }}>Active Partnership</span>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Clicking "Mark All Paid" resets outstanding ledger commissions and logs the payment verification code to the doctor's payout account records.
          </p>
        </div>
      </Modal>

      {/* Modal 3: Send Push Notification to Doctor */}
      <Modal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        title={`Send Push Alert - ${selectedDoctor?.name}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowNotifModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSendNotification} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BellRing size={14} />
              Send Alert
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Notification Title</label>
          <input
            type="text"
            value={notifTitle}
            onChange={(e) => setNotifTitle(e.target.value)}
            placeholder="e.g. Monthly Commission Report"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Notification Body</label>
          <textarea
            value={notifBody}
            onChange={(e) => setNotifBody(e.target.value)}
            placeholder="e.g. Your monthly commission statement for July is now generated and ready to download in your profile."
            className="form-control"
            rows="3"
            style={{ resize: 'none' }}
          />
        </div>
      </Modal>

      {/* Modal 4: Real-time Doctor OTP Codes Log */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Doctor Portal Authentication Logs"
        footer={<button className="btn btn-secondary" onClick={() => setShowOtpModal(false)}>Close Log</button>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            Lists real-time login codes requested by affiliated doctors to log into the partner dashboard of the mobile app.
          </p>
          <div className="table-container" style={{ border: '1px solid var(--border-color)' }}>
            <table className="admin-table" style={{ fontSize: '0.8125rem' }}>
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>OTP Code</th>
                  <th>Request Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {doctorOtpLogs.map((log, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 600 }}>{log.name}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1px' }}>{log.code}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{log.timestamp}</td>
                    <td>
                      <span className={`badge ${
                        log.status === 'Verified' ? 'badge-success' : 'badge-secondary'
                      }`} style={{ fontSize: '0.65rem' }}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button 
            onClick={() => addToast('Doctor OTP Logs are updated in real-time.', 'info')}
            className="btn btn-secondary"
            style={{ alignSelf: 'flex-end' }}
          >
            Sync Active
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Doctors;
