import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, PlatformStats, AdminUser, AdminInviteCode } from '../services/api';

type Tab = 'stats' | 'users' | 'codes';

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [codes, setCodes] = useState<AdminInviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Password reset state
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const loadData = async (tab: Tab) => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'stats') {
        setStats(await api.admin.getStats());
      } else if (tab === 'users') {
        setUsers(await api.admin.getUsers());
      } else {
        setCodes(await api.admin.getInviteCodes());
      }
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: string) => {
    try {
      const result = await api.admin.toggleUserActive(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: result.isActive } : u))
      );
    } catch {
      setError('Failed to toggle user status');
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (newPassword.length < 8) {
      setResetMsg('Password must be at least 8 characters');
      return;
    }
    try {
      await api.admin.resetUserPassword(userId, newPassword);
      setResetMsg('Password reset successfully');
      setNewPassword('');
      setTimeout(() => {
        setResetUserId(null);
        setResetMsg('');
      }, 2000);
    } catch {
      setResetMsg('Failed to reset password');
    }
  };

  const handleDeactivateCode = async (id: string) => {
    try {
      await api.admin.deactivateInviteCode(id);
      setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: false } : c)));
    } catch {
      setError('Failed to deactivate code');
    }
  };

  const tabStyle = (tab: Tab) => ({
    flex: 1,
    padding: '0.6rem',
    fontSize: '0.9rem',
    fontWeight: activeTab === tab ? '600' : '400' as const,
    background: activeTab === tab ? 'var(--primary)' : 'transparent',
    color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
    border: activeTab === tab ? 'none' : '1px solid var(--border)',
    borderRadius: '6px',
    cursor: 'pointer',
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const roleBadge = (role: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      admin: { bg: '#fee2e2', color: '#991b1b' },
      user: { bg: '#dbeafe', color: '#1e40af' },
      demo: { bg: '#fef3c7', color: '#92400e' },
    };
    const c = colors[role] || colors.user;
    return (
      <span style={{
        display: 'inline-block',
        background: c.bg,
        color: c.color,
        padding: '0.15rem 0.5rem',
        borderRadius: '999px',
        fontSize: '0.7rem',
        fontWeight: '600',
      }}>
        {role}
      </span>
    );
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '1rem',
            cursor: 'pointer',
            padding: '0',
            marginBottom: '1rem',
          }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Admin Dashboard</h1>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button style={tabStyle('stats')} onClick={() => setActiveTab('stats')}>Stats</button>
        <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>Users</button>
        <button style={tabStyle('codes')} onClick={() => setActiveTab('codes')}>Invite Codes</button>
      </div>

      {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <div>
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Total Users', value: stats.totalUsers },
                //   { label: 'Total Books', value: stats.totalBooks },
                //   { label: 'Total DNF', value: stats.totalDNF },
                //   { label: 'Want to Read', value: stats.totalWantToRead },
                  { label: 'Invite Codes Generated', value: stats.totalInviteCodes },
                ].map((s) => (
                  <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Registrations by month */}
              <div className="card" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: '600' }}>
                  Registrations by Month
                </h3>
                {Object.entries(stats.registrationsByMonth).map(([month, count]) => (
                  <div key={month} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid var(--border)' }}>
                    <span>{month}</span>
                    <span style={{ fontWeight: '600' }}>{count}</span>
                  </div>
                ))}
              </div>

              {/* Top users */}
              <div className="card">
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: '600' }}>
                  Most Active Users
                </h3>
                {stats.topUsers.map((u, i) => (
                  <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid var(--border)' }}>
                    <span>{i + 1}. {u.username}</span>
                    <span style={{ fontWeight: '600' }}>{u.completedBooks} books</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {users.map((u) => (
                <div key={u.id} className="card" style={{ opacity: u.isActive ? 1 : 0.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{u.username}</span>
                        {roleBadge(u.role)}
                        {!u.isActive && (
                          <span style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: '600' }}>
                            DEACTIVATED
                          </span>
                        )}
                      </div>
                      <p className="text-secondary" style={{ fontSize: '0.8rem' }}>
                        Joined {formatDate(u.createdAt)}
                        {u.invitedBy && ` · Invited by ${u.invitedBy}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                    {u.completedBooks} completed · {u.dnfBooks} DNF · {u.wantToReadBooks} want to read
                  </div>

                  {u.role !== 'admin' && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleToggleActive(u.id)}
                        style={{
                          background: 'none',
                          border: `1px solid ${u.isActive ? '#7f1d1d' : '#065f46'}`,
                          borderRadius: '6px',
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.75rem',
                          color: u.isActive ? '#f87171' : '#6ee7b7',
                          cursor: 'pointer',
                        }}
                      >
                        {u.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                      <button
                        onClick={() => {
                          setResetUserId(resetUserId === u.id ? null : u.id);
                          setNewPassword('');
                          setResetMsg('');
                        }}
                        style={{
                          background: 'none',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        Reset Password
                      </button>
                    </div>
                  )}

                  {resetUserId === u.id && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="password"
                        placeholder="New password (min 8 chars)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{
                          flex: 1,
                          minWidth: '180px',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.85rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-secondary, #1a1a2e)',
                          color: 'var(--text)',
                        }}
                      />
                      <button
                        onClick={() => handleResetPassword(u.id)}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        Confirm
                      </button>
                      {resetMsg && (
                        <span style={{ fontSize: '0.8rem', color: resetMsg.includes('success') ? '#6ee7b7' : '#f87171' }}>
                          {resetMsg}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Invite Codes Tab */}
          {activeTab === 'codes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {codes.length === 0 ? (
                <div className="card" style={{ textAlign: 'center' }}>
                  <p className="text-secondary">No invite codes yet.</p>
                </div>
              ) : (
                codes.map((c) => (
                  <div key={c.id} className="card" style={{ opacity: c.isActive ? 1 : 0.5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <code style={{
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            color: c.isActive ? 'var(--primary)' : 'var(--text-secondary)',
                            letterSpacing: '0.1em',
                          }}>
                            {c.code}
                          </code>
                          {!c.isActive && (
                            <span style={{ fontSize: '0.75rem', color: '#f87171' }}>Deactivated</span>
                          )}
                        </div>
                        <p className="text-secondary" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                          Created by <strong>{c.creatorUsername}</strong> · {formatDate(c.createdAt)}
                        </p>
                        <p className="text-secondary" style={{ fontSize: '0.8rem' }}>
                          Used {c.useCount} / {c.maxUses}
                          {c.usedByUsernames.length > 0 && (
                            <> · by {c.usedByUsernames.join(', ')}</>
                          )}
                        </p>
                      </div>
                      {c.isActive && (
                        <button
                          onClick={() => handleDeactivateCode(c.id)}
                          style={{
                            background: 'none',
                            border: '1px solid #7f1d1d',
                            borderRadius: '6px',
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.75rem',
                            color: '#f87171',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
