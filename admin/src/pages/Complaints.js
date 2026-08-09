import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Send, CheckCircle } from 'lucide-react';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Table from '../components/Table';
import Modal from '../components/Modal';

const STATUS_OPTIONS = ['Pending Response', 'Admin Responded', 'Resolved'];

const Complaints = ({ addToast }) => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('Admin Responded');

  // Real-time synchronization
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'complaints'), (snap) => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setComplaints(list);
      });
      return () => unsub();
    } catch (err) {
      console.warn('Complaints Firestore connection offline:', err.message);
    }
  }, []);

  const handleOpenReply = (complaint) => {
    setSelectedComplaint(complaint);
    setReplyText(complaint.adminReply || '');
    setReplyStatus(complaint.status === 'Pending Response' ? 'Admin Responded' : (complaint.status || 'Admin Responded'));
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (!selectedComplaint) return;
    if (!replyText.trim() && replyStatus !== 'Resolved') {
      addToast('Please enter a reply message.', 'danger');
      return;
    }

    const now = new Date();
    const repliedDateString = now.toLocaleDateString('en-IN') + ', ' + now.toLocaleTimeString('en-IN');

    try {
      await updateDoc(doc(db, 'complaints', selectedComplaint.id), {
        adminReply: replyText.trim(),
        status: replyStatus,
        repliedDateString,
      });
      addToast(`Reply sent to ${selectedComplaint.userName || selectedComplaint.userId}.`, 'success');
      setShowReplyModal(false);
      setSelectedComplaint(null);
    } catch (err) {
      addToast('Failed to send reply. Please try again.', 'danger');
    }
  };

  const columns = [
    { header: 'User', field: 'userName', sortable: true, render: (val, row) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 700 }}>{val || 'User'}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.userId}</span>
      </div>
    )},
    { header: 'Complaint', field: 'message', render: (val) => (
      <div style={{ maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={val}>
        {val}
      </div>
    )},
    { header: 'Submitted', field: 'dateString', sortable: true },
    { header: 'Status', field: 'status', sortable: true, render: (val) => (
      <span className={`badge ${
        val === 'Resolved' ? 'badge-success' :
        val === 'Admin Responded' ? 'badge-info' :
        'badge-warning'
      }`}>
        {val}
      </span>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      {/* Page Title */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Complaints</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Review user complaints, reply, and update their resolution status</p>
      </div>

      {/* Complaints Table */}
      <div className="card">
        <Table
          columns={columns}
          data={complaints}
          keyField="id"
          pageSize={6}
          actions={(row) => (
            <button
              onClick={() => handleOpenReply(row)}
              className="btn btn-secondary"
              style={{ padding: '0.375rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <MessageSquare size={14} />
              {row.adminReply ? 'View / Edit Reply' : 'Reply'}
            </button>
          )}
        />
      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={showReplyModal}
        onClose={() => { setShowReplyModal(false); setSelectedComplaint(null); }}
        title="Respond to Complaint"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setShowReplyModal(false); setSelectedComplaint(null); }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSendReply} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={14} />
              Send Reply
            </button>
          </>
        }
      >
        {selectedComplaint && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <User size={14} />
              <strong style={{ color: 'var(--text-primary)' }}>{selectedComplaint.userName || 'User'}</strong>
              · {selectedComplaint.userId}
              <span style={{ marginLeft: 'auto' }}>{selectedComplaint.dateString}</span>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.875rem 1rem',
              fontSize: '0.875rem',
              lineHeight: 1.5
            }}>
              {selectedComplaint.message}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Update Status</label>
              <select
                value={replyStatus}
                onChange={(e) => setReplyStatus(e.target.value)}
                className="form-control"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Admin Reply</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to the user..."
                className="form-control"
                rows="4"
                style={{ resize: 'none' }}
              />
            </div>

            {selectedComplaint.adminReply && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--success)' }}>
                <CheckCircle size={12} />
                Last replied {selectedComplaint.repliedDateString || 'previously'}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Complaints;
