import React, { useState } from 'react';
import {
  Search, Eye, Filter, MapPin, CheckCircle, Clock, Truck,
  Upload, AlertCircle, ArrowLeft, Calendar,
  FileText, Trash2, Bookmark, User, FileUp
} from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';

const Bookings = ({ bookings, setBookings, reports = [], setReports = () => {}, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected booking for Full Page View & Modals
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Which of the 3 Booking Manager sections is active: 'bookings' | 'logistics' | 'report'
  const [activeSection, setActiveSection] = useState('bookings');

  // Modals state
  const [showRejectConfirmModal, setShowRejectConfirmModal] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  // Form states for modals
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [techStatus, setTechStatus] = useState('Confirmed');

  // Fixed collection time slots (must match the customer app's slot options)
  const TIME_SLOTS = [
    '7:00 AM - 8:00 AM',
    '8:00 AM - 9:00 AM',
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '5:00 PM - 6:00 PM',
    '6:00 PM - 7:00 PM'
  ];

  // Minutes-since-midnight of a slot's start time, e.g. "7:00 AM - 8:00 AM" -> 420
  const getSlotStartMinutes = (slot) => {
    const [time, meridiem] = slot.split(' - ')[0].split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Report Management state
  const [pdfFile, setPdfFile] = useState(null);
  const [reportRows, setReportRows] = useState([]);
  const [paramName, setParamName] = useState('');
  const [paramValue, setParamValue] = useState('');
  const [paramRange, setParamRange] = useState('');
  const [paramAbnormal, setParamAbnormal] = useState(false);

  // Filtered bookings list — Pending bookings are surfaced first by default
  const filteredBookings = bookings
    .filter(b => {
      const matchSearch = b.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.testNames.join(' ').toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => (a.status === 'Pending' ? -1 : 0) - (b.status === 'Pending' ? -1 : 0));

  // Appends a new, immutable timestamped entry for a status change — never overwrites prior entries
  const appendStatusHistory = (booking, status) => {
    const priorHistory = Array.isArray(booking.statusHistory) ? booking.statusHistory : [];
    return [...priorHistory, { status, timestamp: new Date().toISOString() }];
  };

  // Handler: Confirm Rejection
  const handleConfirmReject = () => {
    if (!selectedBooking) return;
    const statusHistory = appendStatusHistory(selectedBooking, 'Rejected');
    const updated = bookings.map(b => b.id === selectedBooking.id ? { ...b, status: 'Rejected', statusHistory } : b);
    setBookings(updated);
    setSelectedBooking({ ...selectedBooking, status: 'Rejected', statusHistory });
    addToast(`Booking ${selectedBooking.id} marked as Rejected. Workflow stopped.`, 'success');
    setShowRejectConfirmModal(false);
  };

  // Handler: Reschedule Slot
  const handleReschedule = () => {
    if (!selectedBooking) return;
    if (!newSlotDate || !newSlotTime) {
      addToast('Please select both a date and a time slot.', 'danger');
      return;
    }
    const [year, month, day] = newSlotDate.split('-');
    const formattedSlot = `${day}/${month}/${year}, ${newSlotTime}`;

    const updated = bookings.map(b =>
      b.id === selectedBooking.id
        ? { ...b, slot: formattedSlot }
        : b
    );
    setBookings(updated);
    setSelectedBooking({ ...selectedBooking, slot: formattedSlot });
    addToast(`Booking ${selectedBooking.id} successfully rescheduled to: ${formattedSlot}`, 'success');
    setNewSlotDate('');
    setNewSlotTime('');
  };

  // Handler: Upload Lab Bill Copy
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

  // Handler: Open Update Logistics section
  const handleOpenLogisticsModal = (booking) => {
    setSelectedBooking(booking);
    setTechStatus(booking.status || 'Confirmed');
    setActiveSection('logistics');
  };

  const handleSaveLogistics = () => {
    if (!selectedBooking) return;
    const statusHistory = appendStatusHistory(selectedBooking, techStatus);
    const updated = bookings.map(b => b.id === selectedBooking.id ? { ...b, status: techStatus, statusHistory } : b);
    setBookings(updated);
    setSelectedBooking({ ...selectedBooking, status: techStatus, statusHistory });
    addToast(`Logistics progress for booking ${selectedBooking.id} updated to: ${techStatus}`, 'success');
  };

  // Handler: Open Reports section
  const handleOpenReportModal = (booking) => {
    setSelectedBooking(booking);
    setPdfFile(null);

    // Load existing report parameters if already created
    const existingReport = reports.find(r => r.id === booking.id);
    setReportRows(existingReport && existingReport.rows ? existingReport.rows : []);
    setActiveSection('report');
  };

  const handleAddParameter = () => {
    if (!paramName.trim() || !paramValue.trim() || !paramRange.trim()) {
      addToast('Please fill out all parameter details.', 'danger');
      return;
    }
    const newParam = {
      name: paramName,
      value: paramValue,
      range: paramRange,
      abnormal: paramAbnormal
    };
    setReportRows([...reportRows, newParam]);
    setParamName('');
    setParamValue('');
    setParamRange('');
    setParamAbnormal(false);
  };

  const handleRemoveParameter = (index) => {
    setReportRows(reportRows.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    if (selectedBooking) {
      addToast(`Draft report saved for booking ${selectedBooking.id}`, 'info');
    }
    setShowDraftDialog(true);
  };

  const handleConfirmDraftClose = () => {
    setShowDraftDialog(false);
    setActiveSection('bookings');
  };

  const handleSaveReport = () => {
    if (reportRows.length === 0) {
      addToast('Please add at least one test parameter result row.', 'danger');
      return;
    }

    const reportIndex = reports.findIndex(r => r.id === selectedBooking.id);
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const updatedReport = {
      id: selectedBooking.id,
      name: selectedBooking.testNames ? selectedBooking.testNames.join(' + ') : 'Lab Report',
      date: formattedDate,
      member: selectedBooking.member,
      status: 'Report Ready',
      rows: reportRows,
      pdfUrl: pdfFile ? `files/reports/${selectedBooking.id}.pdf` : null
    };

    if (reportIndex > -1) {
      const updated = [...reports];
      updated[reportIndex] = updatedReport;
      setReports(updated);
    } else {
      setReports([updatedReport, ...reports]);
    }

    // Update booking status to Report Ready
    const statusHistory = appendStatusHistory(selectedBooking, 'Report Ready');
    const updatedBookings = bookings.map(b =>
      b.id === selectedBooking.id ? { ...b, status: 'Report Ready', statusHistory } : b
    );
    setBookings(updatedBookings);
    setSelectedBooking({ ...selectedBooking, status: 'Report Ready', statusHistory });

    addToast(`Report published & dispatched for booking ${selectedBooking.id}!`, 'success');
  };

  // Table Columns Definition
  const columns = [
    { header: 'Booking ID', field: 'id', sortable: true, render: (val) => (
      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{val}</span>
    )},
    { header: 'Patient Name', field: 'member', sortable: true },
    { header: 'Tests Summary', field: 'testSummary', render: (val, row) => (
      <div style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.testNames ? row.testNames.join(', ') : ''}>
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
        val === 'Report Ready' || val === 'Reports Ready' ? 'badge-success' : 
        val === 'Sample Collected' || val === 'Under Process' || val === 'Confirmed' ? 'badge-info' : 
        val === 'Cancelled' || val === 'Rejected' ? 'badge-danger' : 
        'badge-warning'
      }`}>
        {val}
      </span>
    )}
  ];

  // Full Page Booking Manager View
  if (selectedBooking) {
    const isRejected = selectedBooking.status === 'Rejected' || selectedBooking.status === 'Cancelled';

    // Only show time slots that haven't already passed when the picked date is today
    const todayStr = new Date().toISOString().split('T')[0];
    const availableTimeSlots = newSlotDate === todayStr
      ? TIME_SLOTS.filter(slot => getSlotStartMinutes(slot) > new Date().getHours() * 60 + new Date().getMinutes())
      : TIME_SLOTS;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
        {/* Top Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setSelectedBooking(null)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem' }}
            >
              <ArrowLeft size={16} />
              Back to All Bookings
            </button>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              Booking Manager – {selectedBooking.id}
            </h2>
          </div>
          <span className={`badge ${
            selectedBooking.status === 'Report Ready' || selectedBooking.status === 'Reports Ready' ? 'badge-success' : 
            selectedBooking.status === 'Sample Collected' || selectedBooking.status === 'Under Process' || selectedBooking.status === 'Confirmed' ? 'badge-info' : 
            isRejected ? 'badge-danger' : 
            'badge-warning'
          }`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.875rem' }}>
            {selectedBooking.status}
          </span>
        </div>

        {/* Rejection Alert Notice */}
        {isRejected && (
          <div style={{ 
            backgroundColor: '#FEE2E2', 
            border: '1px solid #FCA5A5', 
            color: '#991B1B', 
            padding: '1rem 1.25rem', 
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.875rem' }}>Appointment Rejected</strong>
              <span style={{ fontSize: '0.8125rem' }}>This appointment has been rejected. The booking workflow is stopped and cannot proceed to sample collection or report processing.</span>
            </div>
          </div>
        )}

        {/* Main Card Container */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', padding: '1.75rem' }}>
          
          {/* Booking Manager Sections */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
            <button
              onClick={() => setActiveSection('bookings')}
              className={`btn ${activeSection === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
            >
              <Calendar size={14} />
              Bookings
            </button>

            <button
              onClick={() => handleOpenLogisticsModal(selectedBooking)}
              disabled={isRejected}
              className={`btn ${activeSection === 'logistics' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
            >
              <Truck size={14} />
              Update Logistics
            </button>

            <button
              onClick={() => handleOpenReportModal(selectedBooking)}
              disabled={isRejected}
              className={`btn ${activeSection === 'report' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
            >
              <FileText size={14} />
              Reports
            </button>

            {(selectedBooking.status === 'Confirmed' || selectedBooking.status === 'Sample Collected') && (
              <button
                onClick={() => setShowRejectConfirmModal(true)}
                className="btn btn-danger"
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', fontSize: '0.8125rem', marginLeft: 'auto' }}
              >
                <AlertCircle size={14} />
                Reject
              </button>
            )}
          </div>

          {activeSection === 'bookings' && (
          <>
          {/* Patient Details Grid */}
          <div className="grid grid-cols-2 gap-4" style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Patient Member Name</span>
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedBooking.member}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Total Paid Amount</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)' }}>₹{selectedBooking.amount}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Mode of Payment</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                {selectedBooking.paymentMethod === 'upi' ? 'UPI' :
                 selectedBooking.paymentMethod === 'cod' ? 'Cash on Collection' :
                 selectedBooking.paymentMethod || 'UPI'}
              </span>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                <MapPin size={14} />
                Collection Address
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{selectedBooking.address}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Booking Date</span>
              <span style={{ fontSize: '0.875rem' }}>{selectedBooking.date}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Scheduled Slot</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)' }}>{selectedBooking.slot}</span>
            </div>
          </div>

          {/* Chosen Diagnostics */}
          <div>
            <span className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Chosen Diagnostics</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(() => {
                const members = selectedBooking.member ? selectedBooking.member.split(',').map(m => m.trim()) : [];
                if (members.length <= 1) {
                  return (selectedBooking.testNames || []).map((t, index) => (
                    <div key={index} style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent)', borderRadius: '50%' }} />
                      {t}
                    </div>
                  ));
                }
                return members.map((m, mIdx) => (
                  <div key={mIdx} style={{
                    padding: '0.875rem',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent)', display: 'block', marginBottom: '0.5rem' }}>
                      {m}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {(selectedBooking.testNames || []).map((t, index) => (
                        <div key={index} style={{
                          fontSize: '0.8125rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          paddingLeft: '0.5rem',
                          color: 'var(--text-primary)'
                        }}>
                          <div style={{ width: '5px', height: '5px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%' }} />
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Lab Bill Copy Management */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <span className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Bill Management (Upload Bill Copy - Lab)</span>
            {selectedBooking.billUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <CheckCircle size={16} />
                  Bill Copied: {selectedBooking.billName || 'lab_bill_copy.pdf'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg"
                  id="replaceBillInput"
                  onChange={handleUploadBill}
                  style={{ display: 'none' }}
                />
                <label htmlFor="replaceBillInput" className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', cursor: 'pointer', margin: 0 }}>
                  Replace
                </label>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg"
                  id="uploadBillInput"
                  onChange={handleUploadBill}
                  disabled={isRejected}
                  style={{ display: 'none' }}
                />
                <label htmlFor="uploadBillInput" className={`btn btn-secondary ${isRejected ? 'disabled' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: isRejected ? 'not-allowed' : 'pointer', margin: 0 }}>
                  <Upload size={16} />
                  Upload
                </label>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>PDF, PNG or JPG (Max 5MB)</span>
              </div>
            )}
          </div>

          {/* Reschedule Booking Slot */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <span className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Reschedule Slot</span>
            <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '600px', flexWrap: 'wrap' }}>
              <input
                type="date"
                value={newSlotDate}
                onChange={(e) => {
                  setNewSlotDate(e.target.value);
                  setNewSlotTime('');
                }}
                min={todayStr}
                className="form-control"
                disabled={isRejected}
                style={{ flexGrow: 1, minWidth: '160px' }}
              />
              <select
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="form-control"
                disabled={isRejected || !newSlotDate}
                style={{ flexGrow: 1, minWidth: '180px' }}
              >
                <option value="">{newSlotDate ? 'Select time slot' : 'Pick a date first'}</option>
                {availableTimeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
              <button onClick={handleReschedule} disabled={isRejected} className="btn btn-secondary" style={{ flexShrink: 0 }}>
                Reschedule
              </button>
            </div>
          </div>
          </>
          )}

          {/* Update Logistics Section */}
          {activeSection === 'logistics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <User size={14} style={{ color: 'var(--text-secondary)' }} />
                  <strong>Patient:</strong> {selectedBooking.member}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <MapPin size={14} style={{ color: 'var(--text-secondary)' }} />
                  <strong>Collection Location:</strong> {selectedBooking.address}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
                  <strong>Time Window:</strong> {selectedBooking.slot}
                </div>
              </div>

              <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <label className="form-label">Current Transit Checkpoint / Status</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <select
                    value={techStatus}
                    onChange={(e) => setTechStatus(e.target.value)}
                    className="form-control"
                    style={{ flexGrow: 1 }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Sample Collected">Sample Collected</option>
                    <option value="Under Process">Under Process</option>
                    <option value="Report Ready">Report Ready</option>
                  </select>

                  {(techStatus === 'Confirmed' || techStatus === 'Sample Collected') && (
                    <button
                      onClick={() => setShowRejectConfirmModal(true)}
                      className="btn btn-danger"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', fontSize: '0.8125rem', flexShrink: 0 }}
                    >
                      <AlertCircle size={14} />
                      Reject
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button className="btn btn-primary" onClick={handleSaveLogistics}>Update Progress</button>
              </div>
            </div>
          )}

          {/* Reports Section */}
          {activeSection === 'report' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Upload PDF Box */}
              <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center', backgroundColor: 'var(--bg-tertiary)' }}>
                <FileUp size={32} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Upload Scanned PDF report</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0 0 0.75rem' }}>Files up to 5MB are supported</p>

                <input
                  type="file"
                  accept=".pdf"
                  id="pdfFileInput"
                  onChange={(e) => {
                    if (e.target.files.length > 0) setPdfFile(e.target.files[0]);
                  }}
                  style={{ display: 'none' }}
                />
                <label htmlFor="pdfFileInput" className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.375rem 0.875rem', fontSize: '0.8125rem' }}>
                  {pdfFile ? `Attached: ${pdfFile.name}` : 'Browse Files'}
                </label>
              </div>

              {/* Dynamic Parameter Rows */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="form-label" style={{ margin: 0, fontWeight: 700 }}>Parameter values (Dynamic Mobile View)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {reportRows.map((row, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 0.875rem',
                        backgroundColor: row.abnormal ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-tertiary)',
                        border: `1px solid ${row.abnormal ? 'var(--danger)' : 'var(--border-color)'}`,
                        borderLeft: `4px solid ${row.abnormal ? 'var(--danger)' : 'var(--success)'}`,
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8125rem'
                      }}
                    >
                      <div>
                        <strong>{row.name}:</strong> {row.value}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: '0.5rem' }}>
                          Range: {row.range}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveParameter(index)}
                        style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}
                        title="Remove Parameter"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Parameter Inputs */}
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                    + Add Custom Test Parameter
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Parameter Name (e.g. TSH)"
                      value={paramName}
                      onChange={(e) => setParamName(e.target.value)}
                      className="form-control"
                      style={{ fontSize: '0.8125rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 2.1 uIU/mL)"
                      value={paramValue}
                      onChange={(e) => setParamValue(e.target.value)}
                      className="form-control"
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Reference Range (e.g. 0.4 - 4.0)"
                      value={paramRange}
                      onChange={(e) => setParamRange(e.target.value)}
                      className="form-control"
                      style={{ fontSize: '0.8125rem', flexGrow: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleAddParameter}
                      className="btn btn-secondary"
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', flexShrink: 0 }}
                    >
                      Add Row
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={handleSaveDraft}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                >
                  <Bookmark size={14} />
                  Save as Draft
                </button>
                <button className="btn btn-primary" onClick={handleSaveReport}>Publish Report</button>
              </div>
            </div>
          )}
        </div>

        {/* Modal 1: Confirmation Popup for Rejecting Appointment */}
        <Modal
          isOpen={showRejectConfirmModal}
          onClose={() => setShowRejectConfirmModal(false)}
          title="Confirm Rejection"
          footer={
            <>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowRejectConfirmModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleConfirmReject}
              >
                Reject
              </button>
            </>
          }
        >
          <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <AlertCircle size={24} />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
              Are you sure you want to reject this appointment?
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Booking <strong>{selectedBooking.id}</strong> for <strong>{selectedBooking.member}</strong> will be marked as <strong>Rejected</strong> and will not proceed to sample collection or any further step.
            </p>
          </div>
        </Modal>

        {/* Modal 4: Draft Saved Dialog Modal */}
        {showDraftDialog && selectedBooking && (
          <Modal
            isOpen={showDraftDialog}
            onClose={() => setShowDraftDialog(false)}
            title="Draft Saved Successfully"
            footer={
              <button className="btn btn-primary" onClick={handleConfirmDraftClose}>
                Done & Return to Bookings
              </button>
            }
          >
            <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#DBEAFE',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Bookmark size={24} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                Report Saved as Draft!
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Your test report parameters and uploaded files for booking <strong>{selectedBooking.id}</strong> have been safely stored as a draft. You can complete and publish it at any time.
              </p>
            </div>
          </Modal>
        )}
      </div>
    );
  }

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
            <option value="Confirmed">Technician Scheduled</option>
            <option value="Sample Collected">Sample Collected</option>
            <option value="Under Process">Under Process</option>
            <option value="Report Ready">Report Ready</option>
            <option value="Rejected">Rejected</option>
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
                setActiveSection('bookings');
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
    </div>
  );
};

export default Bookings;
