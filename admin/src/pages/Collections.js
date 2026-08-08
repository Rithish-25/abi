import React, { useState } from 'react';
import { Truck, Search, MapPin, Phone, User, Clock, CheckCircle2 } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';

const Collections = ({ bookings, setBookings, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLogistics, setSelectedLogistics] = useState(null);
  const [showLogisticsModal, setShowLogisticsModal] = useState(false);
  const [techStatus, setTechStatus] = useState('Scheduled');

  // Filter out bookings that require home sample collection (i.e. those not cancelled or rejected)
  const homeCollections = bookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Rejected');

  const filteredCollections = homeCollections.filter(b => 
    b.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.assignedTech && b.assignedTech.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleUpdateLogistics = () => {
    if (!selectedLogistics) return;
    const updated = bookings.map(b => b.id === selectedLogistics.id ? { ...b, status: techStatus } : b);
    setBookings(updated);
    addToast(`Collection progress for booking ${selectedLogistics.id} updated to: ${techStatus}`, 'success');
    setShowLogisticsModal(false);
  };

  const columns = [
    { header: 'Booking ID', field: 'id', sortable: true, render: (val) => (
      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{val}</span>
    )},
    { header: 'Patient Name', field: 'member', sortable: true },
    { header: 'Technician Assigned', field: 'assignedTech', sortable: true, render: (val) => (
      <span style={{ fontWeight: 600, color: val ? 'var(--text-primary)' : 'var(--danger)' }}>
        {val || 'Not Dispatched'}
      </span>
    )},
    { header: 'Address & Details', field: 'address', render: (val) => (
      <div style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={val}>
        {val}
      </div>
    )},
    { header: 'Slot Time', field: 'slot' },
    { header: 'Logistics Status', field: 'status', sortable: true, render: (val) => (
      <span className={`badge ${
        val === 'Report Ready' ? 'badge-success' : 
        val === 'Sample Collected' || val === 'Under Process' ? 'badge-info' : 
        'badge-warning'
      }`}>
        {val}
      </span>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Sample Collection Logistics</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Monitor blood samples transit, technician tracking, and logistics updates in real-time</p>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <input
            type="text"
            placeholder="Search collections by booking ID, patient, or technician..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Table */}
      <div className="card">
        <Table
          columns={columns}
          data={filteredCollections}
          keyField="id"
          pageSize={5}
          actions={(row) => (
            <button
              onClick={() => {
                setSelectedLogistics(row);
                setTechStatus(row.status);
                setShowLogisticsModal(true);
              }}
              className="btn btn-secondary"
              style={{ padding: '0.375rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <Truck size={14} />
              Update Logistics
            </button>
          )}
        />
      </div>

      {/* Modal to update status */}
      <Modal
        isOpen={showLogisticsModal}
        onClose={() => setShowLogisticsModal(false)}
        title={`Transit Checkpoint - ${selectedLogistics?.id}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowLogisticsModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleUpdateLogistics}>Update Progress</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <User size={14} style={{ color: 'var(--text-secondary)' }} />
              <strong>Patient:</strong> {selectedLogistics?.member}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <MapPin size={14} style={{ color: 'var(--text-secondary)' }} />
              <strong>Collection Location:</strong> {selectedLogistics?.address}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
              <strong>Time Window:</strong> {selectedLogistics?.slot}
            </div>
          </div>

          <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <label className="form-label">Current Transit checkpoint</label>
            <select 
              value={techStatus} 
              onChange={(e) => setTechStatus(e.target.value)} 
              className="form-control"
            >
              <option value="Confirmed">Technician Scheduled</option>
              <option value="Sample Collected">Sample Collected (In Transit to Lab)</option>
              <option value="Under Process">Under Process (At Central Lab)</option>
              <option value="Report Ready">Processing Complete (Report Ready)</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Collections;
