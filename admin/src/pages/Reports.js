import React, { useState } from 'react';
import { FileText, Search, Plus, Trash2, FileUp, ListPlus, Bell, Bookmark } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';

const Reports = ({ bookings, setBookings, reports, setReports, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  
  // Dynamic report parameters rows list
  const [reportRows, setReportRows] = useState([]);

  // Temp input field values for parameters
  const [paramName, setParamName] = useState('');
  const [paramValue, setParamValue] = useState('');
  const [paramRange, setParamRange] = useState('');
  const [paramAbnormal, setParamAbnormal] = useState(false);

  // Filter bookings that have either had samples collected or reports ready
  const bookingsForReports = bookings.filter(b => b.status === 'Sample Collected' || b.status === 'Under Process' || b.status === 'Report Ready');

  const filteredBookings = bookingsForReports.filter(b => 
    b.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.testNames.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenReportModal = (booking) => {
    setSelectedBooking(booking);
    setPdfFile(null);
    
    // Load existing report parameters if already created
    const existingReport = reports.find(r => r.id === booking.id);
    if (existingReport && existingReport.rows) {
      setReportRows(existingReport.rows);
    } else {
      // Default sample parameters based on tests
      const rows = [
        { name: 'Hemoglobin', value: '14.2 g/dL', range: '13.0 - 17.0', abnormal: false },
        { name: 'WBC Count', value: '7,200 /uL', range: '4,000 - 11,000', abnormal: false },
        { name: 'Platelet Count', value: '2.5 L/uL', range: '1.5 - 4.5 L', abnormal: false }
      ];
      if (booking.testNames.some(t => t.includes('Sugar') || t.includes('Glucose'))) {
        rows.push({ name: 'Fasting Blood Sugar', value: '98 mg/dL', range: '70 - 99', abnormal: false });
      }
      if (booking.testNames.some(t => t.includes('Thyroid'))) {
        rows.push({ name: 'TSH', value: '2.1 uIU/mL', range: '0.4 - 4.0', abnormal: false });
      }
      setReportRows(rows);
    }
    setShowReportModal(true);
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
      addToast(`Draft saved for booking ${selectedBooking.id}`, 'info');
    }
    setShowDraftDialog(true);
  };

  const handleConfirmDraftClose = () => {
    setShowDraftDialog(false);
    setShowReportModal(false);
  };

  const handleSaveReport = () => {
    if (reportRows.length === 0) {
      addToast('Please add at least one test parameter result row.', 'danger');
      return;
    }

    // Save report configuration in the reports state
    const reportIndex = reports.findIndex(r => r.id === selectedBooking.id);
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const updatedReport = {
      id: selectedBooking.id,
      name: selectedBooking.testNames.join(' + '),
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

    // Update booking status in main bookings list
    const updatedBookings = bookings.map(b => 
      b.id === selectedBooking.id ? { ...b, status: 'Report Ready' } : b
    );
    setBookings(updatedBookings);

    addToast(`Report published and dispatched for booking ${selectedBooking.id}!`, 'success');
    setShowReportModal(false);
  };

  const columns = [
    { 
      header: 'Booking ID', 
      field: 'id',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{val}</span>
    },
    { header: 'Patient Name', field: 'member' },
    { 
      header: 'Tests Included', 
      field: 'testNames',
      render: (tests) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          {tests.join(', ')}
        </span>
      )
    },
    { header: 'Scheduled Date', field: 'date' },
    { 
      header: 'Report Status', 
      field: 'status',
      render: (status) => {
        const isReady = status === 'Report Ready';
        return (
          <span className={`badge ${isReady ? 'badge-success' : 'badge-warning'}`}>
            {isReady ? 'Report Dispatched' : 'Pending Upload'}
          </span>
        );
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Report Management</h2>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Upload PDF test reports, configure parameters, and dispatch directly to patient mobile apps.
        </span>
      </div>

      {/* Control Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative', flexGrow: 1, maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search report bookings..."
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

      {/* Data Table */}
      <div className="card">
        <Table
          columns={columns}
          data={filteredBookings}
          keyField="id"
          pageSize={5}
          actions={(row) => (
            <button
              onClick={() => handleOpenReportModal(row)}
              className="btn btn-secondary"
              style={{ padding: '0.375rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem', borderColor: row.status === 'Report Ready' ? 'var(--success)' : 'var(--border-color)' }}
            >
              <FileText size={14} style={{ color: row.status === 'Report Ready' ? 'var(--success)' : 'inherit' }} />
              {row.status === 'Report Ready' ? 'Edit Report' : 'Upload Report'}
            </button>
          )}
        />
      </div>

      {/* Report Dispatcher Form Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title={`Report Dispatcher - Booking ${selectedBooking?.id}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Cancel</button>
            <button 
              className="btn btn-secondary" 
              onClick={handleSaveDraft}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', borderColor: '#d97706', color: '#d97706' }}
            >
              <Bookmark size={14} />
              Save as Draft
            </button>
            <button className="btn btn-primary" onClick={handleSaveReport}>Publish Report</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {/* File Upload section */}
          <div style={{
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-tertiary)'
          }}>
            <FileUp size={28} style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }} />
            <span style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Upload Scanned PDF report
            </span>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
              Files up to 5MB are supported
            </span>
            
            <input
              type="file"
              accept=".pdf"
              id="pdfUploadInput"
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  setPdfFile(e.target.files[0]);
                  addToast(`Loaded file: ${e.target.files[0].name}`, 'info');
                }
              }}
              style={{ display: 'none' }}
            />
            <label htmlFor="pdfUploadInput" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', cursor: 'pointer' }}>
              {pdfFile ? 'Replace PDF File' : 'Browse Files'}
            </label>
            {pdfFile && (
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, marginTop: '0.5rem' }}>
                Ready: {pdfFile.name}
              </span>
            )}
          </div>

          {/* Dynamic parameter table editor */}
          <div>
            <span className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ListPlus size={14} />
              Parameter values (Dynamic Mobile View)
            </span>

            {/* List of current params */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
              {reportRows.length === 0 ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '0.5rem' }}>
                  No parameter rows created yet.
                </span>
              ) : (
                reportRows.map((row, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem',
                    fontSize: '0.8125rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: `3px solid ${row.abnormal ? 'var(--danger)' : 'var(--success)'}`
                  }}>
                    <div>
                      <strong>{row.name}:</strong> <span style={{ color: row.abnormal ? 'var(--danger)' : 'var(--text-primary)', fontWeight: 600 }}>{row.value}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>Range: {row.range}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveParameter(index)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </Modal>

      {/* Draft Saved Confirmation Dialogue Box */}
      <Modal
        isOpen={showDraftDialog}
        onClose={() => setShowDraftDialog(false)}
        title="Draft Saved"
        footer={
          <button className="btn btn-primary" onClick={handleConfirmDraftClose}>
            Done
          </button>
        }
      >
        <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Bookmark size={24} />
          </div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
            Report Saved as Draft
          </h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            The report parameters and file attachments for booking <strong>{selectedBooking?.id}</strong> have been saved as a draft.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Reports;
