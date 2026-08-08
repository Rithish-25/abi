import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  CalendarCheck,
  FlaskConical,
  CreditCard,
  Settings,
  LogOut,
  Bell,
  UserCog
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, handleLogout, adminPhone, isMobileSidebarOpen, closeMobileSidebar }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'users', label: 'Patients', icon: Users },
    { id: 'doctors', label: 'Doctors & Referrals', icon: UserSquare2 },
    { id: 'tests', label: 'Tests & Packages', icon: FlaskConical },
    { id: 'notifications', label: 'Notification Management', icon: Bell },
    { id: 'usersRoles', label: 'Users & Roles', icon: UserCog },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="sidebar" style={{
      width: '260px',
      backgroundColor: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100
    }}
    data-mobile-open={isMobileSidebarOpen ? 'true' : 'false'}>
      {/* Sidebar Header */}
      <div className="sidebar-header" style={{
        padding: '0.875rem 0.5rem',
        borderBottom: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          width: '180px',
          height: '72px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-sm)',
          padding: '0.25rem 0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <img
            src={`${process.env.PUBLIC_URL}/admin-logo.png`}
            alt="Abirami Laboratory"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transform: 'scale(1.15)',
              display: 'block'
            }}
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-menu" style={{
        padding: '0.875rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.30rem',
        flexGrow: 1,
        overflowY: 'auto'
      }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                if (closeMobileSidebar) closeMobileSidebar();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                border: 'none',
                background: isActive ? 'var(--sidebar-active)' : 'none',
                color: isActive ? 'var(--sidebar-text-primary)' : 'var(--sidebar-text-secondary)',
                opacity: isActive ? 1 : 0.8,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--sidebar-text-primary)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.opacity = '1';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--sidebar-text-secondary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--sidebar-text-primary)' : 'inherit' }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer" style={{
        padding: '0.75rem 1rem',
        borderTop: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--sidebar-active)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--sidebar-text-primary)'
          }}>
            A
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--sidebar-text-primary)' }}>Administrator</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--sidebar-text-secondary)', opacity: 0.7 }}>{adminPhone || '98949 13330'}</span>
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
            backgroundColor: 'var(--danger)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-sm)',
            color: '#ffffff',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#b91c1c';
            e.currentTarget.style.borderColor = '#b91c1c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--danger)';
            e.currentTarget.style.borderColor = 'var(--danger)';
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
