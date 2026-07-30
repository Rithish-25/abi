import React from 'react';
import { 
  Users, 
  CalendarCheck, 
  IndianRupee, 
  Stethoscope,
  Activity,
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import StatCard from '../components/StatCard';

const Dashboard = ({ bookings, users, doctors, setActivePage }) => {
  // Compute basic metrics
  const totalRevenue = bookings.reduce((sum, b) => b.status !== 'Cancelled' ? sum + b.amount : sum, 0);
  const activeBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Sample Collected').length;
  const patientCount = users.filter(u => u.role !== 'admin' && u.role !== 'doctor').length;
  const doctorCount = doctors.length;

  // Custom SVG Bar Chart Sales Trend
  const salesData = [
    { label: 'Jan', value: 12000 },
    { label: 'Feb', value: 19000 },
    { label: 'Mar', value: 15000 },
    { label: 'Apr', value: 24000 },
    { label: 'May', value: 32000 },
    { label: 'Jun', value: 28000 },
    { label: 'Jul', value: totalRevenue }
  ];

  const maxVal = Math.max(...salesData.map(d => d.value)) * 1.15 || 50000;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      {/* Overview Metric Row */}
      <div className="stat-grid">
        <StatCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString('en-IN')}`} 
          icon={IndianRupee} 
          change="+18.4%" 
          isPositive={true}
          note="vs last month"
        />
        <StatCard 
          title="Active Bookings" 
          value={activeBookings} 
          icon={CalendarCheck} 
          change="+12.3%" 
          isPositive={true}
          note="samples pending"
        />
        <StatCard 
          title="Registered Patients" 
          value={patientCount} 
          icon={Users} 
          change="+8.1%" 
          isPositive={true}
          note="unique phone numbers"
        />
        <StatCard 
          title="Affiliated Doctors" 
          value={doctorCount} 
          icon={Stethoscope} 
          change="+4.0%" 
          isPositive={true}
          note="referral program active"
        />
      </div>

      {/* Charts and Feeds Layout */}
      <div className="dashboard-layout-grid">
        {/* Left Side: Sales and Bookings Chart */}
        <div className="card flex flex-col">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Earnings Distribution</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Monthly revenue stats in Indian Rupees</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>
              <TrendingUp size={14} />
              +14% Year-over-Year
            </div>
          </div>

          {/* Simple Custom SVG Bar Chart */}
          <div className="chart-container">
            {salesData.map((d, index) => {
              const barHeightPct = (d.value / maxVal) * 100;
              return (
                <div key={index} className="chart-bar-wrapper">
                  <div className="chart-bar" style={{ height: `${barHeightPct}%` }}>
                    <div className="chart-bar-tooltip">₹{d.value.toLocaleString('en-IN')}</div>
                  </div>
                  <span className="chart-label">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Recent Bookings Activity feed */}
        <div className="card flex flex-col" style={{ gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Recent Activity</h3>
            <button 
              onClick={() => setActivePage('bookings')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                cursor: 'pointer'
              }}
            >
              See all <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1, overflowY: 'auto' }}>
            {bookings.slice(0, 4).map((b) => (
              <div key={b.id} style={{
                display: 'flex',
                gap: '0.75rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border-color)',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: b.status === 'Report Ready' ? 'var(--success-tint)' : b.status === 'Cancelled' ? 'var(--danger-tint)' : 'var(--accent-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: b.status === 'Report Ready' ? 'var(--success)' : b.status === 'Cancelled' ? 'var(--danger)' : 'var(--accent)',
                  flexShrink: 0
                }}>
                  {b.status === 'Report Ready' ? <FileCheck size={16} /> : <Activity size={16} />}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{b.member}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{b.id}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {b.testSummary}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    fontSize: '0.65rem',
                    color: b.status === 'Report Ready' ? 'var(--success)' : b.status === 'Cancelled' ? 'var(--danger)' : 'var(--warning)',
                    fontWeight: 700,
                    marginTop: '0.25rem'
                  }}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
