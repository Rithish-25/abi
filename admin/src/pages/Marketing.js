import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Check, Image, Percent, Star, CheckSquare, BellRing } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';

const Marketing = ({ addToast }) => {
  const [activeTab, setActiveTab] = useState('banners'); // banners | offers | reviews
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  // Mock databases
  const [banners, setBanners] = useState([
    { id: 1, title: 'Independence Day Health Camp', image: 'assets/camp_banner.jpg', link: 'fullbody', active: true },
    { id: 2, title: 'Monsoon Dengue Screening Offer', image: 'assets/dengue_banner.jpg', link: 'fever', active: true },
    { id: 3, title: 'Free Vitamin D Checkup Promotion', image: 'assets/vit_banner.jpg', link: 'fullbody', active: false }
  ]);

  const [offers, setOffers] = useState([
    { code: 'ABIRAMI50', description: 'Flat ₹50 off on all individual blood test bookings', discount: 50, active: true },
    { code: 'HEALTH200', description: '₹200 discount for full body screening packages', discount: 200, active: true },
    { code: 'DIABETES20', description: '20% off diabetic care diagnostic packages', discount: 150, active: false }
  ]);

  const [reviews, setReviews] = useState([
    { id: 1, user: 'Karthik Raja', rating: 5, comment: 'Excellent home collection service! Technician arrived right on time and did the draw painlessly.', date: '2 days ago', approved: true },
    { id: 2, user: 'Meena K', rating: 4, comment: 'Reports were ready within the same evening as promised. Clean and professional dashboard app.', date: '1 week ago', approved: true },
    { id: 3, user: 'Suresh Babu', rating: 2, comment: 'Technician was delayed by 15 minutes. Report was accurate though.', date: '2 weeks ago', approved: false }
  ]);

  // Form fields
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerActive, setBannerActive] = useState(true);

  const [offerCode, setOfferCode] = useState('');
  const [offerDesc, setOfferDesc] = useState('');
  const [offerDiscount, setOfferDiscount] = useState('');
  const [offerActive, setOfferActive] = useState(true);

  const handleSaveBanner = () => {
    if (!bannerTitle.trim()) {
      addToast('Please enter a banner title.', 'danger');
      return;
    }
    const newBanner = {
      id: banners.length + 1,
      title: bannerTitle,
      image: 'assets/banner_placeholder.jpg',
      link: bannerLink || 'fullbody',
      active: bannerActive
    };
    setBanners([...banners, newBanner]);
    addToast('New promotional banner created successfully.', 'success');
    setBannerTitle('');
    setBannerLink('');
    setBannerActive(true);
    setShowBannerModal(false);
  };

  const handleSaveOffer = () => {
    if (!offerCode.trim() || !offerDiscount) {
      addToast('Please enter both coupon code and discount value.', 'danger');
      return;
    }
    const newOffer = {
      code: offerCode.toUpperCase().replace(/\s/g, ''),
      description: offerDesc || 'Promotional coupon code discount',
      discount: parseInt(offerDiscount),
      active: offerActive
    };
    setOffers([newOffer, ...offers]);
    addToast(`Coupon code ${offerCode} created successfully.`, 'success');
    setOfferCode('');
    setOfferDesc('');
    setOfferDiscount('');
    setOfferActive(true);
    setShowOfferModal(false);
  };

  const handleApproveReview = (id) => {
    const updated = reviews.map(r => r.id === id ? { ...r, approved: true } : r);
    setReviews(updated);
    addToast('Review approved for mobile home screen display.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      {/* Title */}
      <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Marketing & Engagement</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Manage app promotional banners, discount coupons, and moderate patient feedback reviews</p>
        </div>
        <button 
          onClick={() => {
            if (activeTab === 'banners') setShowBannerModal(true);
            else if (activeTab === 'offers') setShowOfferModal(true);
            else addToast('Reviews are created by patients in the mobile app.', 'info');
          }}
          disabled={activeTab === 'reviews'}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          {activeTab === 'banners' ? 'Add Banner' : 'Create Coupon'}
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'banners' ? 'active' : ''}`} onClick={() => setActiveTab('banners')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Image size={14} />
            Promotional Banners
          </div>
        </button>
        <button className={`tab-btn ${activeTab === 'offers' ? 'active' : ''}`} onClick={() => setActiveTab('offers')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Percent size={14} />
            Offers & Coupons
          </div>
        </button>
        <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={14} />
            Patient Reviews
          </div>
        </button>
      </div>

      {/* Contents based on active tab */}
      <div className="card">
        {activeTab === 'banners' && (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Banner Details</th>
                  <th>Image Path</th>
                  <th>Target Link</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 700 }}>{b.title}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.image}</td>
                    <td>{b.link}</td>
                    <td>
                      <span className={`badge ${b.active ? 'badge-success' : 'badge-secondary'}`}>
                        {b.active ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => setBanners(banners.map(item => item.id === b.id ? { ...item, active: !item.active } : item))}
                        className="btn btn-secondary" 
                        style={{ padding: '0.375rem 0.5rem', marginRight: '0.5rem' }}
                      >
                        {b.active ? 'Pause' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => setBanners(banners.filter(item => item.id !== b.id))}
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
        )}

        {activeTab === 'offers' && (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Coupon Code</th>
                  <th>Description</th>
                  <th>Discount Value</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o.code}>
                    <td style={{ fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.5px' }}>{o.code}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{o.description}</td>
                    <td style={{ fontWeight: 700 }}>₹{o.discount}</td>
                    <td>
                      <span className={`badge ${o.active ? 'badge-success' : 'badge-secondary'}`}>
                        {o.active ? 'ACTIVE' : 'EXPIRED'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => setOffers(offers.map(item => item.code === o.code ? { ...item, active: !item.active } : item))}
                        className="btn btn-secondary" 
                        style={{ padding: '0.375rem 0.5rem', marginRight: '0.5rem' }}
                      >
                        {o.active ? 'Deactivate' : 'Reactivate'}
                      </button>
                      <button 
                        onClick={() => setOffers(offers.filter(item => item.code !== o.code))}
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
        )}

        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map((r) => (
              <div key={r.id} style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem'
              }}>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{r.user}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{r.date}</span>
                    <div style={{ display: 'flex', gap: '0.125rem', marginLeft: '0.5rem', color: '#f59e0b' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < r.rating ? '#f59e0b' : 'none'} style={{ stroke: '#f59e0b' }} />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                    "{r.comment}"
                  </p>
                </div>
                <div style={{ flexShrink: 0, display: 'flex', gap: '0.5rem' }}>
                  {!r.approved ? (
                    <button 
                      onClick={() => handleApproveReview(r.id)} 
                      className="btn btn-secondary" 
                      style={{ padding: '0.375rem 0.5rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                    >
                      <Check size={12} />
                      Approve
                    </button>
                  ) : (
                    <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}>Visible</span>
                  )}
                  <button 
                    onClick={() => setReviews(reviews.filter(item => item.id !== r.id))} 
                    className="btn btn-secondary" 
                    style={{ padding: '0.375rem 0.5rem', color: 'var(--danger)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal 1: Create Banner */}
      <Modal
        isOpen={showBannerModal}
        onClose={() => setShowBannerModal(false)}
        title="Add Promotional Slider Banner"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowBannerModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveBanner}>Save Banner</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Banner Title / Header</label>
          <input type="text" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} placeholder="e.g. Free Thyroid checkup this Sunday" className="form-control" />
        </div>
        <div className="form-group">
          <label className="form-label">Target Diagnostics Page Code</label>
          <input type="text" value={bannerLink} onChange={(e) => setBannerLink(e.target.value)} placeholder="e.g. sugar, thyroid, cbc" className="form-control" />
        </div>
      </Modal>

      {/* Modal 2: Create Coupon */}
      <Modal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        title="Create Promotional Coupon Code"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowOfferModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveOffer}>Create Coupon</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Coupon Code (Uppercase, alphanumeric)</label>
          <input type="text" value={offerCode} onChange={(e) => setOfferCode(e.target.value)} placeholder="e.g. LABSAVER100" className="form-control" />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input type="text" value={offerDesc} onChange={(e) => setOfferDesc(e.target.value)} placeholder="e.g. Flat ₹100 discount on checkups" className="form-control" />
        </div>
        <div className="form-group">
          <label className="form-label">Discount Value (INR)</label>
          <input type="number" value={offerDiscount} onChange={(e) => setOfferDiscount(e.target.value)} placeholder="Discount amount" className="form-control" />
        </div>
      </Modal>
    </div>
  );
};

export default Marketing;
