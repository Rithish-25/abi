import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  CalendarCheck, 
  FlaskConical, 
  Truck, 
  FileText, 
  CreditCard, 
  Percent, 
  Settings, 
  LogOut,
  Bell
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, handleLogout, adminPhone }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Registered Patients', icon: Users },
    { id: 'doctors', label: 'Doctors & Referrals', icon: UserSquare2 },
    { id: 'bookings', label: 'Bookings Log', icon: CalendarCheck },
    { id: 'tests', label: 'Tests & Packages', icon: FlaskConical },
    { id: 'collections', label: 'Sample Collections', icon: Truck },
    { id: 'reports', label: 'Dispatch Reports', icon: FileText },
    { id: 'payments', label: 'Payments Ledger', icon: CreditCard },
    { id: 'marketing', label: 'Banners & Offers', icon: Percent },
    { id: 'notifications', label: 'Notification Management', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="sidebar" style={{
      width: '260px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100
    }}>
      {/* Sidebar Header */}
      <div className="sidebar-header" style={{
        padding: '1.75rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          color: 'white',
          fontSize: '1rem'
        }}>
          AL
        </div>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Abirami Lab</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Admin Dashboard</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-menu" style={{
        padding: '1.25rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        flexGrow: 1,
        overflowY: 'auto'
      }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                border: 'none',
                background: isActive ? 'var(--bg-active)' : 'none',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--accent)' : 'inherit' }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer" style={{
        padding: '1.25rem 1.5rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-active)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--accent)'
          }}>
            A
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>Administrator</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{adminPhone || '98949 13330'}</span>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.625rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--danger)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--danger-tint)';
            e.currentTarget.style.borderColor = 'var(--danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
