import React, { useState } from 'react';
import { Search, Bell, Shield, ChevronDown, Check } from 'lucide-react';

const Header = ({ activePage, adminPhone, handleLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Mock admin notifications
  const adminNotifications = [
    { id: 1, title: 'New Booking Request', body: 'Karthik Raja booked CBC Test for tomorrow.', time: '5m ago', read: false },
    { id: 2, title: 'Payment Confirmed', body: 'Payment of ₹1,248 received for booking AB2298.', time: '1h ago', read: true },
    { id: 3, title: 'New Referral Registered', body: 'Dr. Senthil referred patient Priya S.', time: '1d ago', read: true }
  ];

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'Dashboard Overview';
      case 'users': return 'Registered Patients';
      case 'doctors': return 'Doctors & Referrals';
      case 'bookings': return 'Bookings Log';
      case 'tests': return 'Tests & Packages';
      case 'collections': return 'Sample Collections';
      case 'reports': return 'Report Management';
      case 'payments': return 'Payments Ledger';
      case 'marketing': return 'Marketing & Banners';
      case 'settings': return 'System Settings';
      default: return 'Abirami Lab';
    }
  };

  return (
    <header className="header" style={{
      height: '70px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'between',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      {/* Title / Breadcrumb */}
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{getPageTitle()}</h1>
        <span style={{
          fontSize: '0.75rem',
          backgroundColor: 'var(--bg-active)',
          color: 'var(--text-secondary)',
          padding: '0.25rem 0.625rem',
          borderRadius: 'var(--radius-full)',
          fontWeight: 600
        }}>
          Live
        </span>
      </div>

      {/* Header Actions */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginLeft: 'auto' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', width: '240px' }} className="hide-mobile">
          <input
            type="text"
            placeholder="Global search..."
            style={{
              width: '100%',
              padding: '0.5rem 1rem 0.5rem 2.25rem',
              fontSize: '0.8125rem',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
          <Search size={14} style={{
            position: 'absolute',
            left: '0.875rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)'
          }} />
        </div>

        {/* Notifications Icon & Popover */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserDropdown(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
            className="hover-bg"
          >
            <Bell size={18} />
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--danger)',
              borderRadius: '50%'
            }} />
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '320px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 200,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '0.875rem 1.25rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>System Notifications</h4>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  Mark read
                </button>
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {adminNotifications.map((notif) => (
                  <div key={notif.id} style={{
                    padding: '0.875rem 1.25rem',
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: notif.read ? 'transparent' : 'rgba(13, 148, 136, 0.03)',
                    cursor: 'pointer'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: notif.read ? 600 : 700 }}>{notif.title}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{notif.time}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{notif.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }} />

        {/* User Account Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotifications(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-primary)',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)'
            }}
            className="hover-bg"
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={14} style={{ color: 'white' }} />
            </div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }} className="hide-mobile">Admin</span>
            <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
          </button>

          {showUserDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '40px',
              width: '180px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 200,
              padding: '0.5rem'
            }}>
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.25rem' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Signed in as</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{adminPhone || '9894913330'}</span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--danger)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderRadius: 'var(--radius-sm)'
                }}
                className="hover-bg-danger"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
