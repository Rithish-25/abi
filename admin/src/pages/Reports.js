import React, { useState } from 'react';
import { FileText, Search, Plus, Trash2, FileUp, ListPlus, Bell } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';

const Reports = ({ bookings, setBookings, reports, setReports, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
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
      // Pre-fill parameters based on test names to guide the admin
      const rows = [];
      if (booking.testNames.some(t => t.includes('CBC'))) {
        rows.push({ name: 'Hemoglobin', value: '14.2 g/dL', range: '13.0 - 17.0', abnormal: false });
        rows.push({ name: 'WBC Count', value: '7,200 /uL', range: '4,000 - 11,000', abnormal: false });
        rows.push({ name: 'Platelet Count', value: '2.5 L/uL', range: '1.5 - 4.5 L', abnormal: false });
      }
      if (booking.testNames.some(t => t.includes('Sugar'))) {
        rows.push({ name: 'Fasting Blood Sugar', value: '98 mg/dL', range: '70 - 100', abnormal: false });
        rows.push({ name: 'HbA1c', value: '5.6 %', range: '< 5.7', abnormal: false });
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

    // Update booking status to "Report Ready"
    const updatedBookings = bookings.map(b => 
      b.id === selectedBooking.id ? { ...b, status: 'Report Ready' } : b
    );
    setBookings(updatedBookings);

    addToast(`Successfully distributed lab report parameters for booking: ${selectedBooking.id}. Status changed to Report Ready.`, 'success');
    setShowReportModal(false);
  };

  const columns = [
    { header: 'Booking ID', field: 'id', sortable: true, render: (val) => (
      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{val}</span>
    )},
    { header: 'Patient Name', field: 'member', sortable: true },
    { header: 'Diagnostics Ordered', field: 'testSummary' },
    { header: 'Time Slot', field: 'slot' },
    { header: 'Report Status', field: 'status', sortable: true, render: (val) => (
      <span className={`badge ${
        val === 'Report Ready' ? 'badge-success' : 'badge-warning'
      }`}>
        {val === 'Report Ready' ? 'Report Uploaded' : 'Pending Upload'}
      </span>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Report Dispatch Management</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Upload PDF test sheets, configure dynamic analysis parameters, and authorize digital releases</p>
      </div>

      {/* Search Filter Box */}
      <div className="card">
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
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
                  No parameter rows created yet. Fill forms below to add.
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

            {/* Parameters addition form */}
            <div className="card grid grid-cols-2 gap-4" style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Parameter Name</label>
                <input type="text" value={paramName} onChange={(e) => setParamName(e.target.value)} placeholder="e.g. Total Cholesterol" className="form-control" style={{ padding: '0.5rem' }} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Observed Value</label>
                <input type="text" value={paramValue} onChange={(e) => setParamValue(e.target.value)} placeholder="e.g. 180 mg/dL" className="form-control" style={{ padding: '0.5rem' }} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Reference Range</label>
                <input type="text" value={paramRange} onChange={(e) => setParamRange(e.target.value)} placeholder="e.g. < 200" className="form-control" style={{ padding: '0.5rem' }} />
              </div>
              <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label htmlFor="abnormalCheck" className="form-label" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                  <input type="checkbox" id="abnormalCheck" checked={paramAbnormal} onChange={(e) => setParamAbnormal(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  Flag as Abnormal?
                </label>
              </div>
              <button 
                onClick={handleAddParameter} 
                className="btn btn-secondary" 
                style={{ gridColumn: 'span 2', padding: '0.5rem', fontSize: '0.8125rem' }}
              >
                Add Parameter Row
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reports;
