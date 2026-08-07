import React, { useState } from 'react';
import { Search, IndianRupee, CreditCard, Landmark, Coins, AlertCircle } from 'lucide-react';
import Table from '../components/Table';
import StatCard from '../components/StatCard';

const Payments = ({ bookings, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate metrics
  const completedTransactions = bookings.filter(b => b.status !== 'Cancelled');
  const totalReceived = completedTransactions.reduce((sum, b) => sum + b.amount, 0);
  const totalPending = bookings.filter(b => b.status === 'Confirmed').reduce((sum, b) => sum + b.amount, 0);
  const averageTicket = completedTransactions.length ? Math.round(totalReceived / completedTransactions.length) : 0;

  const filteredTransactions = bookings.filter(b => 
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'Reference', field: 'id', sortable: true, render: (val) => (
      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{val}</span>
    )},
    { header: 'Billed To', field: 'member', sortable: true },
    { header: 'Timestamp', field: 'date', sortable: true },
    { header: 'Payment Method', field: 'paymentMethod', render: (_, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
        {row.amount > 1000 ? <Landmark size={14} style={{ color: 'var(--text-secondary)' }} /> : <CreditCard size={14} style={{ color: 'var(--text-secondary)' }} />}
        <span>{row.amount > 1000 ? 'Net Banking / UPI' : 'Card / Cash'}</span>
      </div>
    )},
    { header: 'Total Value', field: 'amount', sortable: true, render: (val) => (
      <span style={{ fontWeight: 700 }}>₹{val}</span>
    )},
    { header: 'Invoice Status', field: 'status', sortable: true, render: (val) => {
      const isPaid = val !== 'Cancelled';
      return (
        <span className={`badge ${isPaid ? 'badge-success' : 'badge-danger'}`}>
          {isPaid ? 'PAID' : 'REFUNDED'}
        </span>
      );
    }}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      {/* Page Title */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Payments & Accounts Ledger</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Audit transactions, review payment channels, track ticket margins, and settle doctor referrals</p>
      </div>

      {/* Metrics Row */}
      <div className="stat-grid">
        <StatCard title="Total Collected" value={`₹${totalReceived.toLocaleString('en-IN')}`} icon={IndianRupee} change="+12%" isPositive={true} />
        <StatCard title="Ledger Dues" value={`₹${totalPending.toLocaleString('en-IN')}`} icon={Coins} change="-3%" isPositive={false} />
        <StatCard title="Avg Basket Value" value={`₹${averageTicket}`} icon={Landmark} change="+8%" isPositive={true} />
      </div>

      {/* Filter and Search Box */}
      <div className="card">
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <input
            type="text"
            placeholder="Search transactions by reference or billing name..."
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
          data={filteredTransactions}
          keyField="id"
          pageSize={6}
        />
      </div>
    </div>
  );
};

export default Payments;
