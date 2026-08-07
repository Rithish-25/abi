import React, { useState } from 'react';
import { Search, Edit2, Ban, CheckCircle2, Check, Plus, FlaskConical, Box, UploadCloud, X, Layers } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';

const resizeImageToDataUrl = (file, maxDimension = 480, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const Tests = ({ tests, setTests, categories, setCategories, addToast }) => {
  const [activeTab, setActiveTab] = useState('tests'); // tests | packages
  const [searchTerm, setSearchTerm] = useState('');

  // Modals status
  const [showTestModal, setShowTestModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null); // for edit mode

  // Test form fields
  const [testType, setTestType] = useState('test'); // test | package
  const [testCategory, setTestCategory] = useState('');
  const [testName, setTestName] = useState('');
  const [testShort, setTestShort] = useState('');
  const [testImage, setTestImage] = useState('');
  const [testDesc, setTestDesc] = useState('');
  const [testPrice, setTestPrice] = useState('');
  const [testMrp, setTestMrp] = useState('');
  const [testSample, setTestSample] = useState(['Blood']);
  const [testPrep, setTestPrep] = useState('');
  const [testReport, setTestReport] = useState('');
  const [testFastingPrep, setTestFastingPrep] = useState('');
  const [testIncludedIds, setTestIncludedIds] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Category form fields
  const [catId, setCatId] = useState('');
  const [catLabel, setCatLabel] = useState('');

  const handleAddCategory = () => {
    if (!catId.trim() || !catLabel.trim()) {
      addToast('Both code and label fields are required.', 'danger');
      return;
    }
    if (categories.some(c => c.id === catId)) {
      addToast('A category with this code already exists.', 'danger');
      return;
    }
    setCategories([...categories, { id: catId, label: catLabel }]);
    addToast(`Category ${catLabel} registered successfully.`, 'success');
    setCatId('');
    setCatLabel('');
    setShowCategoryModal(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please upload a valid image file.', 'danger');
      return;
    }
    setUploadingImage(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setTestImage(dataUrl);
      addToast('Image added.', 'success');
    } catch (err) {
      addToast('Could not read that image. Please try another file.', 'danger');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    handleImageFile(e.dataTransfer.files?.[0]);
  };

  const handleImageInputChange = (e) => {
    handleImageFile(e.target.files?.[0]);
    e.target.value = '';
  };

  // Filtered lists
  const filteredTests = tests.filter(t => !t.isPackage && t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredPackages = tests.filter(t => t.isPackage && t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSaveTest = () => {
    if (!testName.trim() || !testPrice || !testMrp) {
      addToast('Please enter name, price, and Actual Price fields.', 'danger');
      return;
    }

    const priceNum = parseInt(testPrice);
    const mrpNum = parseInt(testMrp);

    if (priceNum > mrpNum) {
      addToast('Selling Price cannot exceed Actual Price.', 'danger');
      return;
    }

    const reportVal = testReport.toString().trim() ? `${testReport.toString().trim()} hrs` : '';

    if (selectedItem) {
      // Edit mode
      const updated = tests.map(t => t.id === selectedItem.id ? {
        ...t,
        name: testName,
        short: testShort || testName,
        category: testCategory,
        image: testImage || t.image,
        desc: testDesc,
        price: priceNum,
        mrp: mrpNum,
        sample: testSample,
        prep: testPrep,
        report: reportVal,
        fastingPrepInstructions: testFastingPrep,
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
        category: testCategory,
        image: testImage || (testType === 'package' ? 'assets/packages.jpg' : 'assets/cbc.jpg'),
        desc: testDesc,
        price: priceNum,
        mrp: mrpNum,
        sample: testSample,
        prep: testPrep,
        report: reportVal,
        fastingPrepInstructions: testFastingPrep,
        isPackage: testType === 'package',
        includedTestIds: testIncludedIds
      };
      setTests([newTest, ...tests]);
      addToast(`New ${testType === 'package' ? 'health package' : 'blood test'} created: ${testName}`, 'success');
    }

    // Reset fields
    resetForm();
    setShowTestModal(false);
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setTestType(item.isPackage ? 'package' : 'test');
    setTestCategory(item.category || '');
    setTestName(item.name);
    setTestShort(item.short);
    setTestImage(item.image || '');
    setTestDesc(item.desc);
    setTestPrice(item.price.toString());
    setTestMrp(item.mrp.toString());
    setTestSample(Array.isArray(item.sample) ? item.sample : (item.sample ? [item.sample] : []));
    setTestPrep(item.prep);
    const reportMatch = (item.report || '').toString().trim().match(/^(\d+)\s*hrs?$/i);
    setTestReport(reportMatch ? reportMatch[1] : '');
    setTestFastingPrep(item.fastingPrepInstructions || '');
    setTestIncludedIds(item.includedTestIds || []);
    setShowTestModal(true);
  };

  const handleToggleDisable = (id) => {
    const target = tests.find(t => t.id === id);
    if (!target) return;
    const nextDisabled = !target.disabled;
    const updated = tests.map(t => t.id === id ? { ...t, disabled: nextDisabled } : t);
    setTests(updated);
    addToast(`${target.name} has been ${nextDisabled ? 'disabled' : 'enabled'}.`, 'info');
  };

  const resetForm = () => {
    setSelectedItem(null);
    setTestType(activeTab === 'packages' ? 'package' : 'test');
    setTestCategory('');
    setTestName('');
    setTestShort('');
    setTestImage('');
    setTestDesc('');
    setTestPrice('');
    setTestMrp('');
    setTestSample(['Blood']);
    setTestPrep('');
    setTestReport('');
    setTestFastingPrep('');
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

  const getCategoryLabel = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.label : null;
  };

  // Render lists columns
  const testColumns = [
    { header: 'Test Name', field: 'name', sortable: true, render: (val, row) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {val}
          {row.disabled && <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>Disabled</span>}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Code: {row.id}</span>
      </div>
    )},
    { header: 'Category', field: 'category', render: (val) => (
      getCategoryLabel(val) ? <span className="badge badge-secondary">{getCategoryLabel(val)}</span> : <span style={{ color: 'var(--text-tertiary)' }}>Uncategorized</span>
    )},
    { header: 'Sample Type', field: 'sample', render: (val) => Array.isArray(val) ? val.join(', ') : (val || '-') },
    { header: 'Pricing', field: 'price', sortable: true, render: (val, row) => (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontWeight: 700 }}>₹{val}</span>
        <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-tertiary)' }}>₹{row.mrp}</span>
      </div>
    )}
  ];

  const packageColumns = [
    { header: 'Package Name', field: 'name', sortable: true, render: (val, row) => (
      <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {val}
        {row.disabled && <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>Disabled</span>}
      </span>
    )},
    { header: 'Category', field: 'category', render: (val) => (
      getCategoryLabel(val) ? <span className="badge badge-secondary">{getCategoryLabel(val)}</span> : <span style={{ color: 'var(--text-tertiary)' }}>Uncategorized</span>
    )},
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
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Laboratory Catalog</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Manage specific blood tests and bundled health checkup packages</p>
        </div>
        <div className="page-header-actions">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Layers size={16} />
            Add Category
          </button>
          <button
            onClick={() => { resetForm(); setShowTestModal(true); }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} />
            Add Test
          </button>
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
                <button onClick={() => handleToggleDisable(row.id)} className="btn btn-secondary" style={{ padding: '0.375rem 0.5rem', color: row.disabled ? 'var(--success)' : 'var(--danger)' }} title={row.disabled ? 'Enable' : 'Disable'}>
                  {row.disabled ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                </button>
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
                <button onClick={() => handleToggleDisable(row.id)} className="btn btn-secondary" style={{ padding: '0.375rem 0.5rem', color: row.disabled ? 'var(--success)' : 'var(--danger)' }} title={row.disabled ? 'Enable' : 'Disable'}>
                  {row.disabled ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                </button>
              </>
            )}
          />
        )}

      </div>

      {/* Modal: Create/Edit Test or Package */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title={selectedItem ? `Edit ${testType === 'package' ? 'Package' : 'Test'}` : `Create ${testType === 'package' ? 'Package' : 'Test'}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowTestModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveTest} disabled={uploadingImage}>{uploadingImage ? 'Processing...' : 'Save'}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Item Type</label>
              <select value={testType} onChange={(e) => setTestType(e.target.value)} className="form-control">
                <option value="test">Blood Test</option>
                <option value="package">Health Package</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={testCategory} onChange={(e) => setTestCategory(e.target.value)} className="form-control">
                <option value="">Uncategorized</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input type="text" value={testName} onChange={(e) => setTestName(e.target.value)} placeholder="e.g. Thyroid Profile" className="form-control" />
          </div>

          <div className="form-group">
            <label className="form-label">Image</label>
            <div
              onDrop={handleImageDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragActive(false); }}
              onClick={() => document.getElementById('testImageFileInput').click()}
              style={{
                border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragActive ? 'var(--accent-tint)' : 'var(--bg-tertiary)',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <input
                id="testImageFileInput"
                type="file"
                accept="image/*"
                onChange={handleImageInputChange}
                style={{ display: 'none' }}
              />
              {testImage ? (
                <div style={{ position: 'relative' }}>
                  <img src={testImage} alt="Preview" style={{ maxHeight: '100px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setTestImage(''); }}
                    className="btn btn-secondary"
                    style={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem', padding: '0.25rem', borderRadius: 'var(--radius-full)' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <UploadCloud size={24} style={{ color: 'var(--text-tertiary)' }} />
              )}
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {uploadingImage ? 'Processing...' : 'Drag & drop an image here, or click to browse'}
              </span>
            </div>
            <input
              type="text"
              value={testImage}
              onChange={(e) => setTestImage(e.target.value)}
              placeholder="or paste an image URL"
              className="form-control"
              style={{ marginTop: '0.5rem' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">About</label>
            <textarea value={testDesc} onChange={(e) => setTestDesc(e.target.value)} placeholder="What does this test detect..." className="form-control" rows="2" style={{ resize: 'none' }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Selling Price (INR)</label>
              <input type="number" value={testPrice} onChange={(e) => setTestPrice(e.target.value)} className="form-control" placeholder="Selling cost" />
            </div>
            <div className="form-group">
              <label className="form-label">Actual Price (INR)</label>
              <input type="number" value={testMrp} onChange={(e) => setTestMrp(e.target.value)} className="form-control" placeholder="mrp" />
            </div>
          </div>

          {testType === 'test' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Sample Material</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                    {[
                      { value: 'Blood', label: 'Blood (Standard Serum)' },
                      { value: 'Urine', label: 'Urine' },
                      { value: 'Swab', label: 'Swab (Nasal/Throat)' },
                      { value: 'Sputum', label: 'Sputum' }
                    ].map((opt) => {
                      const isChecked = testSample.includes(opt.value);
                      return (
                        <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setTestSample(isChecked ? testSample.filter(s => s !== opt.value) : [...testSample, opt.value]);
                            }}
                            style={{ width: '14px', height: '14px' }}
                          />
                          {opt.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Report Timing</label>
                  <input type="number" min="0" value={testReport} onChange={(e) => setTestReport(e.target.value)} className="form-control" placeholder="e.g. 5" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Preparations instructions</label>
                <input type="text" value={testPrep} onChange={(e) => setTestPrep(e.target.value)} className="form-control" placeholder="e.g. Rest prior to test, drink water" />
              </div>

              <div className="form-group">
                <label className="form-label">Fasting / Preparation Instructions</label>
                <textarea value={testFastingPrep} onChange={(e) => setTestFastingPrep(e.target.value)} placeholder="e.g. Fasting for 8-12 hours, avoid medication, drink water..." className="form-control" rows="2" style={{ resize: 'none' }} />
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

      {/* Modal: Add Category */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Add Test Category"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddCategory}>Add Category</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Category Code (lowercase)</label>
          <input type="text" value={catId} onChange={(e) => setCatId(e.target.value.toLowerCase().replace(/\s/g, ''))} placeholder="e.g. liver" className="form-control" />
        </div>
        <div className="form-group">
          <label className="form-label">Category Name</label>
          <input type="text" value={catLabel} onChange={(e) => setCatLabel(e.target.value)} placeholder="e.g. Liver Diagnostics" className="form-control" />
        </div>
      </Modal>
    </div>
  );
};

export default Tests;
