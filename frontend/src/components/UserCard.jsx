import { useNavigate } from 'react-router-dom';

function UserCard({ user }) {
    const navigate = useNavigate();

    if (!user) {
        return null;
    }

    const initial = user.username?.charAt(0).toUpperCase() || 'U';

    return (
        <button
            className="user-card"
            onClick={() => navigate('/profile')}
            type="button"
            aria-label="View user profile"
        >
            <div className="user-avatar">
                <span>{initial}</span>
            </div>

            <div className="user-info">
                <h3 className="user-name">{user.username || 'Authorized User'}</h3>
                <p className="user-email">{user.email || 'No email specified'}</p>
            </div>

            <div className="user-card-action">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"></path>
                </svg>
            </div>
        </button>
    );
}

export default UserCard;