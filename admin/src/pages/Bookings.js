import React, { useState } from 'react';
import { Search, Eye, Filter, Calendar, MapPin, CheckCircle, Clock, Truck, ShieldAlert, FileSpreadsheet, FileDown, Upload } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';

const Bookings = ({ bookings, setBookings, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [newSlotDate, setNewSlotDate] = useState('');

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

  const handleReschedule = () => {
    if (!selectedBooking) return;
    if (!newSlotDate.trim()) {
      addToast('Please specify a new rescheduled date and time slot.', 'danger');
      return;
    }
    const updated = bookings.map(b => 
      b.id === selectedBooking.id 
        ? { ...b, slot: newSlotDate } 
        : b
    );
    setBookings(updated);
    setSelectedBooking({ ...selectedBooking, slot: newSlotDate });
    addToast(`Booking ${selectedBooking.id} successfully rescheduled to: ${newSlotDate}`, 'success');
    setNewSlotDate('');
  };

  const handleUploadBill = (e) => {
    if (!selectedBooking) return;
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const billPath = `files/bills/${selectedBooking.id}_bill.pdf`;
      const updated = bookings.map(b => 
        b.id === selectedBooking.id 
          ? { ...b, billUrl: billPath, billName: file.name } 
          : b
      );
      setBookings(updated);
      setSelectedBooking({ ...selectedBooking, billUrl: billPath, billName: file.name });
      addToast(`Lab Bill Copy "${file.name}" uploaded successfully for booking ${selectedBooking.id}!`, 'success');
    }
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
      <div style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.testNames.join(', ')}>
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
    { header: 'Bill copy', field: 'billUrl', render: (val, row) => (
      val ? (
        <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
          <CheckCircle size={12} />
          Uploaded
        </span>
      ) : (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Pending</span>
      )
    )},
    { header: 'Status', field: 'status', sortable: true, render: (val) => (
      <span className={`badge ${
        val === 'Report Ready' || val === 'Reports Ready' ? 'badge-success' : 
        val === 'Sample Collected' || val === 'Under Process' || val === 'Confirmed' ? 'badge-info' : 
        val === 'Cancelled' || val === 'Rejected' ? 'badge-danger' : 
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
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Bookings & Appointment Log</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Approve, reject, reschedule, dispatch technicians, and upload lab bills</p>
      </div>

      {/* Filter and Search Card */}
      <div className="card bookings-filter-grid">
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
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Sample Collected">Sample Collected</option>
            <option value="Under Process">Under Process</option>
            <option value="Report Ready">Report Ready</option>
            <option value="Cancelled">Cancelled / Rejected</option>
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
        title={`Booking Manager - ${selectedBooking?.id}`}
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
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)' }}>{selectedBooking?.slot}</span>
            </div>
          </div>

          {/* Test item lines */}
          <div>
            <span className="form-label">Chosen Diagnostics</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(() => {
                const members = selectedBooking?.member ? selectedBooking.member.split(',').map(m => m.trim()) : [];
                if (members.length <= 1) {
                  return selectedBooking?.testNames.map((t, index) => (
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
                  ));
                }
                return members.map((m, mIdx) => (
                  <div key={mIdx} style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent)', display: 'block', marginBottom: '0.5rem' }}>
                      {m}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {selectedBooking?.testNames.map((t, index) => (
                        <div key={index} style={{
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          paddingLeft: '0.5rem',
                          color: 'var(--text-primary)'
                        }}>
                          <div style={{ width: '4px', height: '4px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%' }} />
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Bill copy upload (Bill Management) */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <span className="form-label">Bill Management (Upload Bill Copy - Lab)</span>
            {selectedBooking?.billUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <CheckCircle size={14} />
                  Bill Copied: {selectedBooking.billName || 'lab_bill_copy.pdf'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg"
                  id="replaceBillInput"
                  onChange={handleUploadBill}
                  style={{ display: 'none' }}
                />
                <label htmlFor="replaceBillInput" className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', margin: 0 }}>
                  Replace
                </label>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg"
                  id="uploadBillInput"
                  onChange={handleUploadBill}
                  style={{ display: 'none' }}
                />
                <label htmlFor="uploadBillInput" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', fontSize: '0.8125rem', cursor: 'pointer', margin: 0 }}>
                  <Upload size={14} />
                  Upload Lab Copy Receipt
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>PDF, PNG or JPG (Max 5MB)</span>
              </div>
            )}
          </div>

          {/* Reschedule Booking Slot */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <span className="form-label">Reschedule Appointment Slot</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newSlotDate}
                onChange={(e) => setNewSlotDate(e.target.value)}
                placeholder="e.g. 25/07/2026, 9:00 AM - 10:00 AM"
                className="form-control"
                style={{ flexGrow: 1 }}
              />
              <button onClick={handleReschedule} className="btn btn-secondary" style={{ flexShrink: 0 }}>
                Reschedule
              </button>
            </div>
          </div>

          {/* Logistics & Assign technician */}
          {selectedBooking?.status !== 'Cancelled' && selectedBooking?.status !== 'Rejected' && (
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
            <span className="form-label">Appointment Actions & Milestones</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => handleStatusUpdate('Confirmed')}
                disabled={selectedBooking?.status === 'Confirmed'}
                className="btn btn-primary"
                style={{ flexGrow: 1, padding: '0.5rem', fontSize: '0.8125rem' }}
              >
                Approve (Confirm)
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
                onClick={() => handleStatusUpdate('Under Process')}
                disabled={selectedBooking?.status === 'Under Process'}
                className="btn btn-secondary"
                style={{ flexGrow: 1, padding: '0.5rem', fontSize: '0.8125rem' }}
              >
                Under Process
              </button>
              <button 
                onClick={() => handleStatusUpdate('Report Ready')}
                disabled={selectedBooking?.status === 'Report Ready'}
                className="btn btn-secondary"
                style={{ flexGrow: 1, padding: '0.5rem', fontSize: '0.8125rem' }}
              >
                Report Ready
              </button>
              <button 
                onClick={() => handleStatusUpdate('Rejected')}
                disabled={selectedBooking?.status === 'Rejected' || selectedBooking?.status === 'Cancelled'}
                className="btn btn-danger"
                style={{ flexGrow: 1, padding: '0.5rem', fontSize: '0.8125rem' }}
              >
                Reject Appointment
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Bookings;
