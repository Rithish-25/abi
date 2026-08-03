import React, { useState, useEffect } from 'react';
import { Search, Send, Bell, User, Users, Megaphone, Trash2 } from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import Table from '../components/Table';
import { sendPushNotification } from '../utils/fcm';

const Notifications = ({ addToast }) => {
  const [targetType, setTargetType] = useState('all_users'); // all_users | all_doctors | specific
  const [specificPhone, setSpecificPhone] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notificationLogs, setNotificationLogs] = useState([]);
  
  // Real-time synchronization
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'notifications'), (snap) => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        // Sort logs by date descending
        list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotificationLogs(list);
      });
      return () => unsub();
    } catch (err) {
      console.warn('Notifications Firestore connection offline:', err.message);
    }
  }, []);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifBody.trim()) {
      addToast('Please enter both title and body values.', 'danger');
      return;
    }
    
    if (targetType === 'specific' && !specificPhone.trim()) {
      addToast('Please enter a target mobile number.', 'danger');
      return;
    }

    const payload = {
      title: notifTitle,
      body: notifBody,
      targetType: targetType,
      targetPhone: targetType === 'specific' ? specificPhone : 'All',
      timestamp: new Date().toISOString(),
      dateString: new Date().toLocaleDateString('en-IN') + ', ' + new Date().toLocaleTimeString('en-IN')
    };

    try {
      await addDoc(collection(db, 'notifications'), payload);
      
      // Trigger FCM push notification to topic or specific recipient
      if (targetType === 'specific') {
        sendPushNotification(specificPhone, 'user', notifTitle, notifBody);
        sendPushNotification(specificPhone, 'doctor', notifTitle, notifBody);
      } else {
        sendPushNotification(targetType, null, notifTitle, notifBody);
      }

      addToast(`Notification successfully broadcasted to: ${targetType === 'specific' ? specificPhone : targetType.replace('_', ' ')}`, 'success');
      
      // Reset form
      setNotifTitle('');
      setNotifBody('');
      setSpecificPhone('');
    } catch (err) {
      console.error('Error broadcasting notification:', err);
      addToast('Error saving notification. Checking local updates.', 'danger');
    }
  };

  const handleDeleteLog = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification record?')) {
      try {
        await deleteDoc(doc(db, 'notifications', id));
        addToast('Notification record deleted.', 'info');
      } catch (err) {
        console.error('Error deleting notification:', err);
      }
    }
  };

  const columns = [
    { header: 'Date & Time', field: 'dateString', sortable: true },
    { header: 'Recipient', field: 'targetType', render: (val, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
        {val === 'specific' ? <User size={12} style={{ color: 'var(--accent)' }} /> : <Users size={12} style={{ color: 'var(--success)' }} />}
        <strong>{val === 'specific' ? row.targetPhone : val.toUpperCase().replace('_', ' ')}</strong>
      </div>
    )},
    { header: 'Title', field: 'title', sortable: true },
    { header: 'Message Body', field: 'body', render: (val) => (
      <div style={{ maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={val}>
        {val}
      </div>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Notification Management</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Send alerts, broad promotions, updates, and custom push notification logs to patient and doctor profiles</p>
      </div>

      <div className="notifications-layout-grid">
        {/* Send Broadcast form */}
        <div className="card flex flex-col" style={{ gap: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Megaphone size={16} style={{ color: 'var(--accent)' }} />
            New Broadcast Trigger
          </h3>

          <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Recipient Segment</label>
              <select 
                value={targetType} 
                onChange={(e) => setTargetType(e.target.value)} 
                className="form-control"
              >
                <option value="all_users">All Registered Patients</option>
                <option value="all_doctors">All Affiliated Doctors</option>
                <option value="specific">Specific Mobile Number</option>
              </select>
            </div>

            {targetType === 'specific' && (
              <div className="form-group">
                <label className="form-label">Target Mobile Number</label>
                <input 
                  type="text" 
                  value={specificPhone} 
                  onChange={(e) => setSpecificPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  placeholder="Enter 10-digit number" 
                  className="form-control" 
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Notification Title</label>
              <input 
                type="text" 
                value={notifTitle} 
                onChange={(e) => setNotifTitle(e.target.value)} 
                placeholder="e.g. Free Blood Camp this Sunday!" 
                className="form-control" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message Body</label>
              <textarea 
                value={notifBody} 
                onChange={(e) => setNotifBody(e.target.value)} 
                placeholder="Type your notification message here..." 
                className="form-control" 
                rows="4" 
                style={{ resize: 'none' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem' }}>
              <Send size={14} />
              Broadcast Notification
            </button>
          </form>
        </div>

        {/* History of broadcasts */}
        <div className="card flex flex-col" style={{ gap: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={16} style={{ color: 'var(--success)' }} />
            Broadcast Log History
          </h3>

          <Table
            columns={columns}
            data={notificationLogs}
            keyField="id"
            pageSize={5}
            actions={(row) => (
              <button 
                onClick={() => handleDeleteLog(row.id)} 
                className="btn btn-secondary" 
                style={{ padding: '0.375rem 0.5rem', color: 'var(--danger)' }}
              >
                <Trash2 size={14} />
              </button>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default Notifications;
