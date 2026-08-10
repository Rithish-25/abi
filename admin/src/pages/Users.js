import React, { useState, useRef } from 'react';
import { Search, ShieldAlert, Send, Eye, Shield, BellRing, FileText } from 'lucide-react';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import Table from '../components/Table';
import Modal from '../components/Modal';

const Users = ({ users, setUsers, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [newRole, setNewRole] = useState('user');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');

  // Medical records viewer
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [patientRecords, setPatientRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const recordsUnsubRef = useRef(null);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtered users list — doctor accounts are managed exclusively on the Doctors & Referrals page
  const filteredUsers = users.filter(u =>
    u.role.toLowerCase() !== 'doctor' &&
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRoleChange = () => {
    if (!selectedUser) return;
    const updated = users.map(u => u.phone === selectedUser.phone ? { ...u, role: newRole } : u);
    setUsers(updated);
    addToast(`Successfully changed role for ${selectedUser.name} to ${newRole}.`, 'success');
    setShowRoleModal(false);
  };

  const handleSendNotification = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      addToast('Please enter both title and body for the notification.', 'danger');
      return;
    }
    if (!selectedUser?.phone) {
      addToast('User phone number is missing for this notification.', 'danger');
      return;
    }

    try {
      await addDoc(collection(db, 'notifications'), {
        title: notifTitle.trim(),
        body: notifBody.trim(),
        kind: 'offer',
        targetType: 'specific',
        targetPhone: selectedUser.phone,
        targetRole: 'user',
        recipientName: selectedUser.name,
        timestamp: new Date().toISOString(),
        dateString: new Date().toLocaleDateString('en-IN') + ', ' + new Date().toLocaleTimeString('en-IN'),
      });

      addToast(`Push notification sent successfully to ${selectedUser.name} (${selectedUser.phone}).`, 'success');
      setNotifTitle('');
      setNotifBody('');
      setShowNotifModal(false);
    } catch (err) {
      console.error('Error sending user notification:', err);
      addToast('Failed to save user notification.', 'danger');
    }
  };

  const handleViewRecords = (user) => {
    setSelectedUser(user);
    setShowRecordsModal(true);
    setRecordsLoading(true);
    setPatientRecords([]);

    if (recordsUnsubRef.current) recordsUnsubRef.current();
    try {
      recordsUnsubRef.current = onSnapshot(
        collection(db, 'users', user.phone, 'records'),
        (snap) => {
          const list = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
          list.sort((a, b) => (b.id || 0) - (a.id || 0));
          setPatientRecords(list);
          setRecordsLoading(false);
        },
        () => setRecordsLoading(false)
      );
    } catch (err) {
      setRecordsLoading(false);
    }
  };

  const handleCloseRecordsModal = () => {
    if (recordsUnsubRef.current) {
      recordsUnsubRef.current();
      recordsUnsubRef.current = null;
    }
    setShowRecordsModal(false);
  };

  // Columns definition for Table component
  const columns = [
    { header: 'Name', field: 'name', sortable: true, render: (val, row) => (
      <div className="user-name-cell" style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 700 }}>{val}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.relation || 'Self'}</span>
      </div>
    )},
    { header: 'Phone Number', field: 'phone', sortable: true },
    { header: 'Details', field: 'age', render: (val, row) => (
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        {row.gender} · {val} yrs
      </span>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Registered Patients Ledger</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Manage profiles, assign credentials, and trigger push alerts</p>
        </div>
      </div>

      {/* Filter and Search Card */}
      <div className="card">
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <input
            type="text"
            placeholder="Search patients by name, phone, or role..."
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

      {/* Patients Data Table */}
      <div className="card">
        <Table
          columns={columns}
          data={filteredUsers}
          keyField="phone"
          pageSize={6}
          actions={(row) => (
            <button
              onClick={() => handleViewRecords(row)}
              className="btn btn-secondary"
              style={{ padding: '0.375rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <FileText size={14} />
              Records
            </button>
          )}
        />
      </div>

      {/* Modal 1: Role Management Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title={`Change User Role - ${selectedUser?.name}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowRoleModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleRoleChange}>Update Role</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Select System Role</label>
          <select 
            value={newRole} 
            onChange={(e) => setNewRole(e.target.value)} 
            className="form-control"
          >
            <option value="user">User (Standard Patient)</option>
            <option value="technician">Technician (Sample Collector)</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          <strong>Notice:</strong> Elevating user privileges grants access to administrative or logging subsystems. Please verify identity before upgrading roles.
        </p>
      </Modal>

      {/* Modal 2: Send Single Push Notification Modal */}
      <Modal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        title={`Send Push Alert - ${selectedUser?.name}`}
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
            placeholder="e.g. Lab report ready"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Notification Body</label>
          <textarea
            value={notifBody}
            onChange={(e) => setNotifBody(e.target.value)}
            placeholder="e.g. Your CBC report is uploaded and available to view in your reports tab."
            className="form-control"
            rows="3"
            style={{ resize: 'none' }}
          />
        </div>
      </Modal>

      {/* Modal 3: Medical Records Viewer */}
      <Modal
        isOpen={showRecordsModal}
        onClose={handleCloseRecordsModal}
        title={`Medical Records - ${selectedUser?.name || ''}`}
      >
        {recordsLoading ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1.5rem 0' }}>
            Loading records...
          </p>
        ) : patientRecords.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1.5rem 0' }}>
            No medical records uploaded by this patient yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto' }}>
            {patientRecords.map((rec) => (
              <div key={rec.id} style={{ display: 'flex', gap: '0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.875rem' }}>
                {rec.imageUrl && (
                  <a href={rec.imageUrl} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                    <img
                      src={rec.imageUrl}
                      alt={rec.title || 'Medical record'}
                      style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                  </a>
                )}
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.875rem' }}>{rec.title || 'Untitled record'}</strong>
                    <span className={`badge ${rec.type === 'prescription' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                      {rec.type === 'prescription' ? 'Prescription' : 'Lab Report'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rec.date}</span>
                  {rec.notes && (
                    <p style={{ fontSize: '0.8125rem', margin: '0.375rem 0 0', color: 'var(--text-primary)' }}>{rec.notes}</p>
                  )}
                  {rec.imageUrl && (
                    <a
                      href={rec.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, display: 'inline-block', marginTop: '0.375rem' }}
                    >
                      View Full Image →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
