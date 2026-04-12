import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api, FriendInfo, FriendRequestInfo } from '../services/api';
import BookCover from '../components/BookCover';
import AddFriendModal from '../components/AddFriendModal';

export default function SocialPage() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<FriendInfo[]>([]);
  const [requests, setRequests] = useState<FriendRequestInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = async () => {
    try {
      const [friendsData, requestsData] = await Promise.all([
        api.friends.getAll(),
        api.friends.getPendingRequests(),
      ]);
      setFriends(friendsData);
      setRequests(requestsData);
    } catch (err) {
      console.error('Failed to load social data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAccept = async (id: string) => {
    try {
      await api.friends.acceptRequest(id);
      loadData();
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await api.friends.declineRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to decline request:', err);
    }
  };

  const getInitials = (friend: FriendInfo) => {
    const name = friend.displayName || friend.username;
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem', lineHeight: 1 }}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>Friends</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          + Add Friend
        </button>
      </header>

      {/* Pending Requests */}
      {requests.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, fontWeight: 600 }}>
            Pending Requests
          </div>
          {requests.map((req) => (
            <div key={req.id} className="card" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {req.sender.displayName || req.sender.username}
                </div>
                <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                  @{req.sender.username}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => handleAccept(req.id)}
                >
                  Accept
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => handleDecline(req.id)}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friend List */}
      {friends.length === 0 && requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
          <p style={{ fontSize: '1rem', marginBottom: 4 }}>No friends yet</p>
          <p style={{ fontSize: '0.85rem' }}>Add friends with their friend code to see what they're reading.</p>
        </div>
      ) : (
        <>
          {friends.length > 0 && (
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, fontWeight: 600 }}>
              Your Friends ({friends.length})
            </div>
          )}
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="card"
              style={{ marginBottom: 8, cursor: 'pointer' }}
              onClick={() => navigate(`/friends/${friend.id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'var(--primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, flexShrink: 0,
                }}>
                  {getInitials(friend)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)' }}>
                    {friend.displayName || friend.username}
                  </div>
                  {friend.lastBook ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      {friend.lastBook.coverImage && (
                        <BookCover src={friend.lastBook.coverImage} title={friend.lastBook.title} width={18} height={26} />
                      )}
                      <span className="text-secondary" style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Last read: {friend.lastBook.title.length > 25 ? friend.lastBook.title.substring(0, 25) + '...' : friend.lastBook.title}
                      </span>
                    </div>
                  ) : (
                    <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: 2 }}>No books yet</div>
                  )}
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: 12, flexShrink: 0 }}>→</span>
              </div>
            </div>
          ))}
        </>
      )}

      {showAddModal && (
        <AddFriendModal
          onClose={() => setShowAddModal(false)}
          onSent={() => {
            setShowAddModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
