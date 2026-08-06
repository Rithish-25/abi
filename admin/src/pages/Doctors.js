import React, { useState } from 'react';
import { Search, Plus, Send, CheckSquare, BellRing } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { sendPushNotification } from '../utils/fcm';

const Doctors = ({ doctors, setDoctors, doctorPatients, setDoctorPatients, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

  // Add doctor fields
  const [docName, setDocName] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docHospital, setDocHospital] = useState('');

  // Notification fields
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtered doctors list
  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone.includes(searchTerm) ||
    (d.specialty && d.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.hospital && d.hospital.toLowerCase().includes(searchTerm.toLowerCase()))
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
    const loginOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const newDoc = {
      id: docPhone,
      name: docName,
      phone: docPhone,
      specialty: docSpecialty || 'General Physician',
      hospital: docHospital || 'City Hospital',
      otp: loginOtp,
      totalReferrals: 0,
      totalCommission: 0
    };
    setDoctors([newDoc, ...doctors]);
    addToast(`Successfully registered ${docName}. Login OTP: ${loginOtp}`, 'success');
    setDocName('');
    setDocPhone('');
    setDocSpecialty('');
    setDocHospital('');
    setShowAddDoctorModal(false);
  };

  const handleProcessPayout = async () => {
    if (!selectedDoctor) return;
    const updatedPatients = doctorPatients.map(p => 
      p.doctorPhone === selectedDoctor.phone || (selectedDoctor.name.includes(p.name))
        ? { ...p, status: 'Report Ready' }
        : p
    );
    setDoctorPatients(updatedPatients);
    
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

      sendPushNotification(selectedDoctor.phone, 'doctor', docTitle, docBody);
    } catch (err) {
      console.error("Failed to save payout notification:", err);
    }

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

  const doctorColumns = [
    { header: 'Doctor Name', field: 'name', sortable: true, render: (val, row) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 700 }}>{val}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.specialty || 'General Practitioner'}</span>
      </div>
    )},
    { header: 'Phone Number', field: 'phone', sortable: true },
    { header: 'Login OTP', field: 'otp', render: (val) => (
      <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em' }}>{val || '—'}</span>
    )},
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
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Doctor Affiliates & Referrals</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Manage medical affiliations, track commissions, and trigger direct alert messages</p>
        </div>
        <div className="page-header-actions">
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

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative', flexGrow: 1, maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search doctors by name, phone, specialty..."
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

      <div className="card">
        <Table
          columns={doctorColumns}
          data={filteredDoctors}
          keyField="phone"
          pageSize={6}
          actions={(row) => (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  setSelectedDoctor(row);
                  setShowNotifModal(true);
                }}
                className="btn btn-secondary"
                style={{ padding: '0.375rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem' }}
                title="Send direct alert message"
              >
                <Send size={14} />
                Alert
              </button>
              <button
                onClick={() => {
                  setSelectedDoctor(row);
                  setShowPayoutModal(true);
                }}
                className="btn btn-secondary"
                style={{ padding: '0.375rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--success)', borderColor: 'var(--success)' }}
              >
                Payout
              </button>
            </div>
          )}
        />
      </div>

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
            placeholder="e.g. General Physician"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Hospital Name / Clinic</label>
          <input
            type="text"
            value={docHospital}
            onChange={(e) => setDocHospital(e.target.value)}
            placeholder="e.g. City Hospital"
            className="form-control"
          />
        </div>
      </Modal>

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
            Clicking "Mark All Paid" resets outstanding ledger commissions.
          </p>
        </div>
      </Modal>

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
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Notification Body</label>
          <textarea
            value={notifBody}
            onChange={(e) => setNotifBody(e.target.value)}
            className="form-control"
            rows="3"
            style={{ resize: 'none' }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Doctors;
