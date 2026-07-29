import React, { useState } from 'react';
import { Search, Eye, Filter, Calendar, MapPin, CheckCircle, Clock, Truck, ShieldAlert } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';

const Bookings = ({ bookings, setBookings, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [assignedTechnician, setAssignedTechnician] = useState('');

  // Sample collection technicians database
  const techniciansList = [
    { id: 1, name: 'Venkatesh Prasad', phone: '9845012345' },
    { id: 2, name: 'Saravanan M', phone: '9865123456' },
    { id: 3, name: 'Babu Raj', phone: '9894012345' }
  ];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtered bookings
  const filteredBookings = bookings.filter(b => {
    const matchSearch = b.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.testNames.join(' ').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusUpdate = (status) => {
    if (!selectedBooking) return;
    const updated = bookings.map(b => b.id === selectedBooking.id ? { ...b, status } : b);
    setBookings(updated);
    setSelectedBooking({ ...selectedBooking, status });
    addToast(`Booking status for ${selectedBooking.id} updated to: ${status}`, 'success');
  };

  const handleAssignTechnician = () => {
    if (!assignedTechnician) {
      addToast('Please select a technician to assign.', 'danger');
      return;
    }
    // Update booking state with tech info
    const updated = bookings.map(b => 
      b.id === selectedBooking.id 
        ? { ...b, status: 'Sample Collected', assignedTech: assignedTechnician } 
        : b
    );
    setBookings(updated);
    setSelectedBooking({ ...selectedBooking, status: 'Sample Collected', assignedTech: assignedTechnician });
    addToast(`Technician ${assignedTechnician} successfully assigned to booking ${selectedBooking.id}. Status changed to: Sample Collected`, 'success');
    setAssignedTechnician('');
  };

  // Columns definition for Table component
  const columns = [
    { header: 'Booking ID', field: 'id', sortable: true, render: (val) => (
      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{val}</span>
    )},
    { header: 'Patient Name', field: 'member', sortable: true },
    { header: 'Tests Summary', field: 'testSummary', render: (val, row) => (
      <div style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.testNames.join(', ')}>
        {val}
      </div>
    )},
    { header: 'Slot & Date', field: 'slot', render: (val, row) => (
      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8125rem' }}>
        <span>{val !== '-' ? val : 'No slot'}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Booked: {row.date}</span>
      </div>
    )},
    { header: 'Amount', field: 'amount', sortable: true, render: (val) => (
      <span style={{ fontWeight: 700 }}>₹{val}</span>
    )},
    { header: 'Status', field: 'status', sortable: true, render: (val) => (
      <span className={`badge ${
        val === 'Report Ready' ? 'badge-success' : 
        val === 'Sample Collected' ? 'badge-info' : 
        val === 'Cancelled' ? 'badge-danger' : 
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
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Bookings Log Dashboard</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Track home blood test appointments, update statuses, and assign logistical technicians</p>
      </div>

      {/* Filter and Search Card */}
      <div className="card grid grid-cols-2 gap-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            placeholder="Search bookings by ID, patient name, or test name..."
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

        {/* Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
            style={{ fontSize: '0.8125rem', padding: '0.5rem' }}
          >
            <option value="all">All Booking Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Sample Collected">Sample Collected</option>
            <option value="Report Ready">Report Ready</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card">
        <Table
          columns={columns}
          data={filteredBookings}
          keyField="id"
          pageSize={6}
          actions={(row) => (
            <button
              onClick={() => {
                setSelectedBooking(row);
                setShowDetailModal(true);
              }}
              className="btn btn-secondary"
              style={{ padding: '0.375rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <Eye size={14} />
              Manage
            </button>
          )}
        />
      </div>

      {/* Booking Details Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Manage Booking appointment - ${selectedBooking?.id}`}
        footer={<button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Close Manager</button>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Patient info grid */}
          <div className="grid grid-cols-2 gap-4" style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Patient Member Name</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{selectedBooking?.member}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Total Paid Amount</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>₹{selectedBooking?.amount}</span>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                <MapPin size={12} />
                Collection Address
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{selectedBooking?.address}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Booking Date</span>
              <span style={{ fontSize: '0.8125rem' }}>{selectedBooking?.date}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Scheduled Slot</span>
              <span style={{ fontSize: '0.8125rem' }}>{selectedBooking?.slot}</span>
            </div>
          </div>

          {/* Test item lines */}
          <div>
            <span className="form-label">Chosen Diagnostics</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {selectedBooking?.testNames.map((t, index) => (
                <div key={index} style={{
                  padding: '0.625rem 0.75rem',
                  fontSize: '0.8125rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent)', borderRadius: '50%' }} />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Logistics & Assign technician */}
          {selectedBooking?.status !== 'Cancelled' && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span className="form-label">Technician Assignment (Home Collection)</span>
              
              {selectedBooking?.assignedTech ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--success)', fontWeight: 600 }}>
                  <CheckCircle size={14} />
                  Assigned Collector: {selectedBooking.assignedTech}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select 
                    value={assignedTechnician}
                    onChange={(e) => setAssignedTechnician(e.target.value)}
                    className="form-control"
                    style={{ flexGrow: 1 }}
                  >
                    <option value="">Choose technician to dispatch...</option>
                    {techniciansList.map(t => (
                      <option key={t.id} value={t.name}>{t.name} ({t.phone})</option>
                    ))}
                  </select>
                  <button onClick={handleAssignTechnician} className="btn btn-primary">Dispatch</button>
                </div>
              )}
            </div>
          )}

          {/* Status Controls */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <span className="form-label">Update Booking Milestones</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => handleStatusUpdate('Confirmed')}
                disabled={selectedBooking?.status === 'Confirmed'}
                className="btn btn-secondary"
                style={{ flexGrow: 1, padding: '0.5rem', fontSize: '0.8125rem' }}
              >
                Confirm Booking
              </button>
              <button 
                onClick={() => handleStatusUpdate('Sample Collected')}
                disabled={selectedBooking?.status === 'Sample Collected'}
                className="btn btn-secondary"
                style={{ flexGrow: 1, padding: '0.5rem', fontSize: '0.8125rem' }}
              >
                Collect Sample
              </button>
              <button 
                onClick={() => handleStatusUpdate('Cancelled')}
                disabled={selectedBooking?.status === 'Cancelled'}
                className="btn btn-danger"
                style={{ flexGrow: 1, padding: '0.5rem', fontSize: '0.8125rem' }}
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Bookings;
