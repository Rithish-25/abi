import React from 'react';
import {
  Users,
  CalendarCheck,
  IndianRupee,
  Stethoscope,
  Activity,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  FileCheck
} from 'lucide-react';
import StatCard from '../components/StatCard';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Booking dates are stored as 'DD/MM/YYYY'
const parseBookingDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
};

const Dashboard = ({ bookings, users, doctors, setActivePage }) => {
  // Compute basic metrics
  const totalRevenue = bookings.reduce((sum, b) => b.status !== 'Cancelled' ? sum + b.amount : sum, 0);
  const activeBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Sample Collected').length;
  const patientCount = users.filter(u => u.role !== 'admin' && u.role !== 'doctor').length;
  const doctorCount = doctors.length;

  // Real earnings-by-month chart: revenue actually booked in each of the trailing 7 months
  const now = new Date();
  const revenueInMonth = (year, month) => bookings.reduce((sum, b) => {
    if (b.status === 'Cancelled') return sum;
    const bDate = parseBookingDate(b.date);
    if (!bDate || bDate.getFullYear() !== year || bDate.getMonth() !== month) return sum;
    return sum + (b.amount || 0);
  }, 0);

  const salesData = [];
  for (let i = 6; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    salesData.push({
      label: MONTH_LABELS[monthDate.getMonth()],
      value: revenueInMonth(monthDate.getFullYear(), monthDate.getMonth())
    });
  }

  const maxVal = Math.max(...salesData.map(d => d.value), 1) * 1.15;

  // Year-over-Year: this trailing 7-month window vs the same window one year earlier
  const currentWindowTotal = salesData.reduce((sum, d) => sum + d.value, 0);
  const priorWindowTotal = (() => {
    let sum = 0;
    for (let i = 6; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear() - 1, now.getMonth() - i, 1);
      sum += revenueInMonth(monthDate.getFullYear(), monthDate.getMonth());
    }
    return sum;
  })();
  const yoyChange = priorWindowTotal > 0
    ? ((currentWindowTotal - priorWindowTotal) / priorWindowTotal) * 100
    : null;

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
            {yoyChange !== null ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem',
                color: yoyChange >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700
              }}>
                {yoyChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {yoyChange >= 0 ? '+' : ''}{yoyChange.toFixed(1)}% Year-over-Year
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                Not enough data for Year-over-Year yet
              </div>
            )}
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
