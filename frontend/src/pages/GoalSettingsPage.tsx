import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

export default function GoalSettingsPage() {
  const navigate = useNavigate();
  const { year } = useParams<{ year: string }>();
  const [goalCount, setGoalCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (year) {
      loadGoal();
    }
  }, [year]);

  const loadGoal = async () => {
    try {
      const goal = await api.getGoal(parseInt(year!));
      setGoalCount(goal.goalCount.toString());
    } catch (err) {
      console.log('No existing goal found');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(goalCount);

    if (isNaN(count) || count < 1) {
      setError('Please enter a valid number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.setGoal(parseInt(year!), count);

      // Navigate based on which year we're setting the goal for
      const currentYear = new Date().getFullYear();
      if (parseInt(year!) === currentYear) {
        navigate('/');
      } else {
        navigate(`/year/${year}`);
      }
    } catch (err) {
      setError('Failed to save goal');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', position: 'relative' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
            marginRight: '0.5rem',
          }}
        >
          ←
        </button>
        <h1 style={{ fontSize: '1.5rem' }}>Set Reading Goal</h1>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              How many books do you want to read in {year}?
            </span>
            <input
              type="number"
              className="input"
              placeholder="e.g., 50"
              value={goalCount}
              onChange={(e) => setGoalCount(e.target.value)}
              min="1"
              required
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Goal'}
          </button>
        </form>
      </div>

      <div className="mt-3 text-center text-secondary" style={{ fontSize: '0.9rem' }}>
        You can update this goal anytime throughout the year.
      </div>
    </div>
  );
}
