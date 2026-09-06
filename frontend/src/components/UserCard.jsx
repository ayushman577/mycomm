import { useNavigate } from 'react-router-dom';

function UserCard({ user }) {
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  return (
    <button
      className="user-card"
      onClick={() => navigate('/profile')}
      type="button"
      aria-label="View user profile"
      style={{
        position: 'relative',
        paddingLeft: '22px', // Shifted content further right away from the vertical bar
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Attached Vertical Neon Bar */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '3px',
          background: 'var(--neon-accent)',
          boxShadow: '0 0 8px var(--neon-accent), 0 0 16px var(--neon-accent)',
          borderTopLeftRadius: 'inherit',
          borderBottomLeftRadius: 'inherit'
        }}
      />

      <div className="user-info">
        <h3 className="user-name">{user.username || 'Authorized User'}</h3>
        <p className="user-email">{user.email || 'No email specified'}</p>
      </div>

      <div className="user-card-action" style={{ marginLeft: 'auto' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6"></path>
        </svg>
      </div>
    </button>
  );
}

export default UserCard;