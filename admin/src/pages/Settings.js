import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, ShieldAlert, Database, RefreshCw, FileSliders } from 'lucide-react';

const Settings = ({ addToast }) => {
  const [labName, setLabName] = useState('Abirami Laboratory');
  const [labPhone, setLabPhone] = useState('9894913330');
  const [collectionFee, setCollectionFee] = useState('150');
  const [enableTechnicianLogistics, setEnableTechnicianLogistics] = useState(true);

  const handleSaveSettings = () => {
    addToast('Global configurations updated successfully.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      {/* Page Title */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>System Settings & Config</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Configure system variables, home sample collection parameters, and backup utilities</p>
      </div>

      <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Left Side: General System Variables */}
        <div className="card flex flex-col" style={{ gap: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSliders size={16} style={{ color: 'var(--accent)' }} />
            General Parameters
          </h3>

          <div className="form-group">
            <label className="form-label">Laboratory Branding Name</label>
            <input type="text" value={labName} onChange={(e) => setLabName(e.target.value)} className="form-control" />
          </div>

          <div className="form-group">
            <label className="form-label">Support Helpdesk Hotline</label>
            <input type="text" value={labPhone} onChange={(e) => setLabPhone(e.target.value)} className="form-control" />
          </div>

          <div className="form-group">
            <label className="form-label">Home Sample Collection Fee (INR)</label>
            <input type="number" value={collectionFee} onChange={(e) => setCollectionFee(e.target.value)} className="form-control" />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="logisticsCheck" checked={enableTechnicianLogistics} onChange={(e) => setEnableTechnicianLogistics(e.target.checked)} style={{ width: '16px', height: '16px' }} />
            <label htmlFor="logisticsCheck" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Enable Technician Dispatch Workflows?</label>
          </div>

          <button onClick={handleSaveSettings} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} />
            Save Configuration
          </button>
        </div>

        {/* Right Side: Maintenance and Databases */}
        <div className="card flex flex-col" style={{ gap: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={16} style={{ color: 'var(--warning)' }} />
            Database Maintenance
          </h3>

          <div style={{ fontSize: '0.8125rem', lineHeight: 1.4, color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShieldAlert size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <span>Warning: These operations directly manipulate database storage states and could cause disruption if performed during high traffic.</span>
            </div>
          </div>

          <button 
            onClick={() => addToast('System cached resources rebuilt successfully.', 'success')} 
            className="btn btn-secondary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={14} />
            Rebuild System Cache
          </button>

          <button 
            onClick={() => addToast('Database backup successfully generated.', 'success')} 
            className="btn btn-secondary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem' }}
          >
            Generate Database Backup
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
