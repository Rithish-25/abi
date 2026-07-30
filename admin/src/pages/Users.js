import React, { useState } from 'react';
import { Search, ShieldAlert, Send, Eye, Shield, KeyRound, BellRing } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import Table from '../components/Table';
import Modal from '../components/Modal';

const Users = ({ users, setUsers, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [newRole, setNewRole] = useState('user');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');

  // Mock OTP verification codes database for real-time audit option
  const [otpLogs, setOtpLogs] = useState([
    { phone: '9894913330', code: '4392', type: 'Login request', timestamp: 'Just now', status: 'Pending' },
    { phone: '9876543210', code: '8810', type: 'Doctor setup', timestamp: '12 mins ago', status: 'Verified' },
    { phone: '9865321470', code: '2105', type: 'Profile edit', timestamp: '1 hour ago', status: 'Expired' }
  ]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtered users list
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Columns definition for Table component
  const columns = [
    { header: 'Name', field: 'name', sortable: true, render: (val, row) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 700 }}>{val}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.relation || 'Self'}</span>
      </div>
    )},
    { header: 'Phone Number', field: 'phone', sortable: true },
    { header: 'Role', field: 'role', sortable: true, render: (val) => (
      <span className={`badge ${
        val === 'admin' ? 'badge-danger' : 
        val === 'doctor' ? 'badge-success' : 
        val === 'technician' ? 'badge-info' : 
        'badge-secondary'
      }`}>
        {val.toUpperCase()}
      </span>
    )},
    { header: 'Details', field: 'age', render: (val, row) => (
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        {row.gender} · {val} yrs
      </span>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      {/* Title block with OTP log trigger button */}
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Registered Patients Ledger</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Manage profiles, assign credentials, view real-time OTP logs, and trigger push alerts</p>
        </div>
        <div className="page-header-actions">
          <button 
            onClick={() => setShowOtpModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            <KeyRound size={16} />
            Real-time OTP Audit
          </button>
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
            <>
              {/* Send Notification Button */}
              <button
                onClick={() => {
                  setSelectedUser(row);
                  setShowNotifModal(true);
                }}
                className="btn btn-secondary"
                style={{ padding: '0.375rem 0.5rem', color: 'var(--accent)' }}
                title="Send notification"
              >
                <Send size={14} />
              </button>

              {/* Edit Role Button */}
              <button
                onClick={() => {
                  setSelectedUser(row);
                  setNewRole(row.role);
                  setShowRoleModal(true);
                }}
                className="btn btn-secondary"
                style={{ padding: '0.375rem 0.5rem' }}
                title="Change role"
              >
                <Shield size={14} />
              </button>
            </>
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
            <option value="doctor">Doctor (Affiliated Partner)</option>
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

      {/* Modal 3: Real-time OTP Logging Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Real-time Authentication OTP Logs"
        footer={<button className="btn btn-secondary" onClick={() => setShowOtpModal(false)}>Close Log</button>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            This log displays the last generated verification codes for SMS logins in real-time. Helpful for user assistance and debugging.
          </p>
          <div className="table-container" style={{ border: '1px solid var(--border-color)' }}>
            <table className="admin-table" style={{ fontSize: '0.8125rem' }}>
              <thead>
                <tr>
                  <th>Phone</th>
                  <th>OTP Code</th>
                  <th>Context</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {otpLogs.map((log, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 600 }}>{log.phone}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1px' }}>{log.code}</td>
                    <td>{log.type}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{log.timestamp}</td>
                    <td>
                      <span className={`badge ${
                        log.status === 'Verified' ? 'badge-success' : 
                        log.status === 'Expired' ? 'badge-secondary' : 
                        'badge-warning'
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
            onClick={() => {
              // Simulate refresh
              setOtpLogs([
                { phone: '9894913330', code: '4392', type: 'Login request', timestamp: '1 min ago', status: 'Verified' },
                { phone: '9843217650', code: '9156', type: 'Login request', timestamp: 'Just now', status: 'Pending' },
                ...otpLogs.slice(1)
              ]);
              addToast('OTP Logs refreshed.', 'info');
            }}
            className="btn btn-secondary"
            style={{ alignSelf: 'flex-end' }}
          >
            Refresh Log
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
