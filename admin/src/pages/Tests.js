import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Check, Layers, FlaskConical, Box } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';

const Tests = ({ tests, setTests, categories, setCategories, addToast }) => {
  const [activeTab, setActiveTab] = useState('tests'); // tests | packages | categories
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals status
  const [showTestModal, setShowTestModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState(null); // for edit mode

  // Test form fields
  const [testName, setTestName] = useState('');
  const [testShort, setTestShort] = useState('');
  const [testDesc, setTestDesc] = useState('');
  const [testPrice, setTestPrice] = useState('');
  const [testMrp, setTestMrp] = useState('');
  const [testFasting, setTestFasting] = useState(false);
  const [testSample, setTestSample] = useState('Blood');
  const [testPrep, setTestPrep] = useState('');
  const [testReport, setTestReport] = useState('Same day, by 6:00 PM');
  const [testIncludedIds, setTestIncludedIds] = useState([]);

  // Category form fields
  const [catId, setCatId] = useState('');
  const [catLabel, setCatLabel] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtered lists
  const filteredTests = tests.filter(t => !t.isPackage && t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredPackages = tests.filter(t => t.isPackage && t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCategories = categories.filter(c => c.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSaveTest = () => {
    if (!testName.trim() || !testPrice || !testMrp) {
      addToast('Please enter name, price, and MRP fields.', 'danger');
      return;
    }

    const priceNum = parseInt(testPrice);
    const mrpNum = parseInt(testMrp);

    if (priceNum > mrpNum) {
      addToast('Selling Price cannot exceed Market MRP.', 'danger');
      return;
    }

    if (selectedItem) {
      // Edit mode
      const updated = tests.map(t => t.id === selectedItem.id ? {
        ...t,
        name: testName,
        short: testShort || testName,
        desc: testDesc,
        price: priceNum,
        mrp: mrpNum,
        fasting: testFasting,
        sample: testSample,
        prep: testPrep,
        report: testReport,
        includedTestIds: testIncludedIds
      } : t);
      setTests(updated);
      addToast(`Successfully updated test details: ${testName}`, 'success');
    } else {
      // Add mode
      const newId = testName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(Math.random() * 100);
      const newTest = {
        id: newId,
        name: testName,
        short: testShort || testName,
        desc: testDesc,
        price: priceNum,
        mrp: mrpNum,
        fasting: testFasting,
        sample: testSample,
        prep: testPrep,
        report: testReport,
        isPackage: activeTab === 'packages',
        includedTestIds: testIncludedIds,
        image: activeTab === 'packages' ? 'assets/packages.jpg' : 'assets/cbc.jpg'
      };
      setTests([newTest, ...tests]);
      addToast(`New ${activeTab === 'packages' ? 'health package' : 'blood test'} created: ${testName}`, 'success');
    }

    // Reset fields
    resetForm();
    setShowTestModal(false);
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setTestName(item.name);
    setTestShort(item.short);
    setTestDesc(item.desc);
    setTestPrice(item.price.toString());
    setTestMrp(item.mrp.toString());
    setTestFasting(item.fasting);
    setTestSample(item.sample);
    setTestPrep(item.prep);
    setTestReport(item.report);
    setTestIncludedIds(item.includedTestIds || []);
    setShowTestModal(true);
  };

  const handleDeleteTest = (id) => {
    if (window.confirm('Are you sure you want to delete this diagnostics item?')) {
      const updated = tests.filter(t => t.id !== id);
      setTests(updated);
      addToast('Item removed successfully.', 'info');
    }
  };

  const resetForm = () => {
    setSelectedItem(null);
    setTestName('');
    setTestShort('');
    setTestDesc('');
    setTestPrice('');
    setTestMrp('');
    setTestFasting(false);
    setTestSample('Blood');
    setTestPrep('');
    setTestReport('Same day, by 6:00 PM');
    setTestIncludedIds([]);
  };

  // Toggle test inside package selection
  const handleToggleInclude = (id) => {
    if (testIncludedIds.includes(id)) {
      setTestIncludedIds(testIncludedIds.filter(item => item !== id));
    } else {
      setTestIncludedIds([...testIncludedIds, id]);
    }
  };

  // Render lists columns
  const testColumns = [
    { header: 'Test Name', field: 'name', sortable: true, render: (val, row) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 700 }}>{val}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Code: {row.id}</span>
      </div>
    )},
    { header: 'Sample Type', field: 'sample' },
    { header: 'Fasting?', field: 'fasting', render: (val) => (
      <span className={`badge ${val ? 'badge-warning' : 'badge-secondary'}`}>
        {val ? 'Yes (8-10 hrs)' : 'No'}
      </span>
    )},
    { header: 'Pricing', field: 'price', sortable: true, render: (val, row) => (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontWeight: 700 }}>₹{val}</span>
        <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-tertiary)' }}>₹{row.mrp}</span>
      </div>
    )}
  ];

  const packageColumns = [
    { header: 'Package Name', field: 'name', sortable: true },
    { header: 'Included Tests Count', field: 'includedTestIds', render: (val) => (
      <span style={{ fontWeight: 600 }}>{val?.length || 0} tests included</span>
    )},
    { header: 'Offer Price', field: 'price', sortable: true, render: (val, row) => (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{val}</span>
        <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-tertiary)' }}>₹{row.mrp}</span>
      </div>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      {/* Title */}
      <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Laboratory Catalog</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Manage categories, specific blood tests, and bundled health checkup packages</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`} onClick={() => setActiveTab('tests')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FlaskConical size={14} />
            Blood Tests
          </div>
        </button>
        <button className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => setActiveTab('packages')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Box size={14} />
            Health Packages
          </div>
        </button>
        <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={14} />
            Test Categories
          </div>
        </button>
      </div>

      {/* Search Filter Box */}
      <div className="card">
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
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

      {/* Dynamic Tables Card */}
      <div className="card">
        {activeTab === 'tests' && (
          <Table
            columns={testColumns}
            data={filteredTests}
            keyField="id"
            pageSize={5}
            actions={(row) => (
              <>
                <button onClick={() => handleEditClick(row)} className="btn btn-secondary" style={{ padding: '0.375rem 0.5rem' }}><Edit2 size={14} /></button>
                <button onClick={() => handleDeleteTest(row.id)} className="btn btn-secondary" style={{ padding: '0.375rem 0.5rem', color: 'var(--danger)' }}><Trash2 size={14} /></button>
              </>
            )}
          />
        )}

        {activeTab === 'packages' && (
          <Table
            columns={packageColumns}
            data={filteredPackages}
            keyField="id"
            pageSize={5}
            actions={(row) => (
              <>
                <button onClick={() => handleEditClick(row)} className="btn btn-secondary" style={{ padding: '0.375rem 0.5rem' }}><Edit2 size={14} /></button>
                <button onClick={() => handleDeleteTest(row.id)} className="btn btn-secondary" style={{ padding: '0.375rem 0.5rem', color: 'var(--danger)' }}><Trash2 size={14} /></button>
              </>
            )}
          />
        )}

        {activeTab === 'categories' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Category ID</th>
                    <th>Category Label</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{c.id}</td>
                      <td>{c.label}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete category?')) {
                              setCategories(categories.filter(cat => cat.id !== c.id));
                              addToast('Category deleted.', 'info');
                            }
                          }} 
                          className="btn btn-secondary" 
                          style={{ padding: '0.375rem 0.5rem', color: 'var(--danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick add category */}
            <div className="card flex gap-4" style={{ alignItems: 'flex-end', backgroundColor: 'var(--bg-tertiary)' }}>
              <div style={{ flexGrow: 1 }}>
                <label className="form-label">Category Code (lowercase)</label>
                <input type="text" value={catId} onChange={(e) => setCatId(e.target.value.toLowerCase().replace(/\s/g, ''))} placeholder="e.g. liver" className="form-control" />
              </div>
              <div style={{ flexGrow: 1 }}>
                <label className="form-label">Category Name</label>
                <input type="text" value={catLabel} onChange={(e) => setCatLabel(e.target.value)} placeholder="e.g. Liver Diagnostics" className="form-control" />
              </div>
              <button 
                onClick={() => {
                  if (!catId || !catLabel) {
                    addToast('Both code and label fields are required.', 'danger');
                    return;
                  }
                  setCategories([...categories, { id: catId, label: catLabel }]);
                  addToast(`Category ${catLabel} registered successfully.`, 'success');
                  setCatId('');
                  setCatLabel('');
                }} 
                className="btn btn-primary"
              >
                Add Category
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Test or Package */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title={selectedItem ? `Edit ${activeTab === 'packages' ? 'Package' : 'Test'}` : `Create ${activeTab === 'packages' ? 'Package' : 'Test'}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowTestModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveTest}>Save</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input type="text" value={testName} onChange={(e) => setTestName(e.target.value)} placeholder="e.g. Thyroid Profile" className="form-control" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Description / Summary</label>
            <textarea value={testDesc} onChange={(e) => setTestDesc(e.target.value)} placeholder="What does this test detect..." className="form-control" rows="2" style={{ resize: 'none' }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Selling Price (INR)</label>
              <input type="number" value={testPrice} onChange={(e) => setTestPrice(e.target.value)} className="form-control" placeholder="Selling cost" />
            </div>
            <div className="form-group">
              <label className="form-label">Market MRP (INR)</label>
              <input type="number" value={testMrp} onChange={(e) => setTestMrp(e.target.value)} className="form-control" placeholder="mrp" />
            </div>
          </div>

          {activeTab === 'tests' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Sample Material</label>
                  <select value={testSample} onChange={(e) => setTestSample(e.target.value)} className="form-control">
                    <option value="Blood">Blood (Standard Serum)</option>
                    <option value="Urine">Urine</option>
                    <option value="Swab">Swab (Nasal/Throat)</option>
                    <option value="Sputum">Sputum</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Report TAT</label>
                  <input type="text" value={testReport} onChange={(e) => setTestReport(e.target.value)} className="form-control" placeholder="e.g. Next day by 10 AM" />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="fastingCheck" checked={testFasting} onChange={(e) => setTestFasting(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                <label htmlFor="fastingCheck" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Fasting required (8-12 hours)?</label>
              </div>

              <div className="form-group">
                <label className="form-label">Preparations instructions</label>
                <input type="text" value={testPrep} onChange={(e) => setTestPrep(e.target.value)} className="form-control" placeholder="e.g. Rest prior to test, drink water" />
              </div>
            </>
          ) : (
            /* Health Package tests bundling selection */
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <label className="form-label">Select Bundled Diagnostics ({testIncludedIds.length} chosen)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                {tests.filter(t => !t.isPackage).map(t => {
                  const isChecked = testIncludedIds.includes(t.id);
                  return (
                    <div 
                      key={t.id} 
                      onClick={() => handleToggleInclude(t.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'between',
                        padding: '0.5rem',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        backgroundColor: isChecked ? 'var(--accent-tint)' : 'transparent',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'background-color 0.1s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FlaskConical size={12} style={{ color: isChecked ? 'var(--accent)' : 'var(--text-secondary)' }} />
                        {t.name}
                      </div>
                      {isChecked && <Check size={14} style={{ color: 'var(--accent)', marginLeft: 'auto' }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Tests;
