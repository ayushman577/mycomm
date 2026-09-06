import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserCard from '../components/UserCard';
import NotificationButton from '../components/NotificationButton';
import CommunityCard from '../components/CommunityCard';
import { getCurrentUser } from '../services/authService';
import {
    getMyCommunities,
    createCommunity,
    joinCommunity
} from '../services/communityService';

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);

    const [communityName, setCommunityName] = useState('');
    const [communityDescription, setCommunityDescription] = useState('');
    const [communityCode, setCommunityCode] = useState('');

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    const loadCommunities = async () => {
        try {
            const response = await getMyCommunities();
            setCommunities(response.data.communities);
        } catch (error) {
            console.error('Error loading communities:', error);
        }
    };

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [userResponse, communitiesResponse] = await Promise.all([
                    getCurrentUser(),
                    getMyCommunities()
                ]);

                setUser(userResponse.data.user);
                setCommunities(communitiesResponse.data.communities);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const handleCreate = async (event) => {
        event.preventDefault();

        if (!communityName.trim()) {
            setActionError('Community name is required.');
            return;
        }

        if (communityDescription.length > 100) {
            setActionError('Description cannot exceed 100 characters.');
            return;
        }

        setActionLoading(true);
        setActionError('');

        try {
            await createCommunity({
                name: communityName,
                description: communityDescription
            });

            setCommunityName('');
            setCommunityDescription('');
            setShowCreate(false);

            await loadCommunities();
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                'Failed to create community.'
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleJoin = async (event) => {
        event.preventDefault();

        if (!communityCode.trim()) {
            setActionError('Community code is required.');
            return;
        }

        setActionLoading(true);
        setActionError('');

        try {
            await joinCommunity({
                communityCode: communityCode.trim().toUpperCase()
            });

            setCommunityCode('');
            setShowJoin(false);

            await loadCommunities();
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                'Failed to join community.'
            );
        } finally {
            setActionLoading(false);
        }
    };

    const closeModals = () => {
        setShowCreate(false);
        setShowJoin(false);
        setActionError('');
    };

    if (loading) {
        return (
            <main
                className="community-dashboard-page dashboard-loading-state"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999
                }}
            >
                <style>{`
        @keyframes miniPulse {
          0%, 100% {
            opacity: 0.25;
            transform: scale(0.75);
            box-shadow: none;
          }
          50% {
            opacity: 1;
            transform: scale(1.35);
            box-shadow: 0 0 10px var(--neon-accent), 0 0 20px var(--neon-accent);
          }
        }
      `}</style>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {[0, 0.16, 0.32].map((delay, i) => (
                        <div
                            key={i}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--neon-accent)',
                                animation: 'miniPulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                animationDelay: `${delay}s`
                            }}
                        />
                    ))}
                </div>
            </main>
        );
    }

    const firstName = user?.username?.trim().split(/\s+/)[0] || 'there';

    return (
        <main className="dashboard-page">

            <header className="dashboard-header">
                <UserCard user={user} />
                <NotificationButton />
            </header>

            <section className="dashboard-action-bar">
                <div className="dashboard-welcome-text">
                    <h1 style={{ fontWeight: 200 }}>
                        <span>Welcome, </span>
                        <span
                            style={{
                                fontWeight: 800,
                                background: 'linear-gradient(90deg, #ff4d00, #ff7300, #ffb000, #ff5e00)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                        >
                            {firstName}!
                        </span>
                    </h1>
                    <p>Your spaces. Your people. Your community.</p>
                </div>

                <div className="dashboard-action-buttons">
                    <button
                        className="button button-ghost button-small"
                        onClick={() => {
                            setShowCreate(true);
                            setShowJoin(false);
                            setActionError('');
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Create Community
                    </button>

                    <button
                        className="button button-primary button-small"
                        onClick={() => {
                            setShowJoin(true);
                            setShowCreate(false);
                            setActionError('');
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                        Join Community
                    </button>
                </div>
            </section>

            <section className="communities-section">
                <div className="section-header-row">
                    <h2 >Active Communities</h2>
                    <span className="community-count-badge">{communities.length}</span>
                </div>

                {communities.length === 0 ? (
                    <div className="empty-communities-card">
                        <div className="empty-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        </div>
                        <h3>No Active Communities</h3>
                        <p>Get started by creating a new community or joining with a code.</p>
                    </div>
                ) : (
                    <div className="communities-grid">
                        {communities.map((community) => (
                            <CommunityCard
                                key={community._id}
                                communityId={community._id}
                                name={community.name}
                                description={community.description}
                                code={community.communityCode}
                                role={community.role || 'Member'}
                                onClick={() => navigate(`/community/${community._id}`)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* CREATE COMMUNITY MODAL */}
            {showCreate && (
                <div className="modal-overlay" onClick={closeModals}>
                    <div
                        className="community-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Create Community</h2>
                            <p>Set up a new community and invite your members to join.</p>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div className="field">
                                <label htmlFor="communityName">Community Name</label>
                                <input
                                    id="communityName"
                                    type="text"
                                    placeholder="e.g. Syntax Society"
                                    value={communityName}
                                    onChange={(event) =>
                                        setCommunityName(event.target.value)
                                    }
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="communityDescription">
                                    Description (Optional)
                                </label>

                                <textarea
                                    id="communityDescription"
                                    placeholder="Briefly describe the purpose of the community..."
                                    value={communityDescription}
                                    maxLength={75}
                                    onChange={(event) => {
                                        setCommunityDescription(event.target.value);

                                        if (event.target.value.length > 75) {
                                            setActionError('Description cannot exceed 75 characters.');
                                        } else {
                                            setActionError('');
                                        }
                                    }}
                                />
                            </div>

                            {actionError && (
                                <div className="alert alert-error">
                                    {actionError}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="button button-ghost button-small"
                                    onClick={closeModals}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="button button-primary button-small"
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <span className="spinner"></span> : 'Create Community'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* JOIN COMMUNITY MODAL */}
            {showJoin && (
                <div className="modal-overlay" onClick={closeModals}>
                    <div
                        className="community-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Join Community</h2>
                            <p>Enter the 6-character community code to join.</p>
                        </div>

                        <form onSubmit={handleJoin}>
                            <div className="field">
                                <label htmlFor="communityCode">Community Code</label>
                                <input
                                    id="communityCode"
                                    type="text"
                                    className="otp-input-modal"
                                    placeholder="A7K2P9"
                                    maxLength={6}
                                    value={communityCode}
                                    onChange={(event) =>
                                        setCommunityCode(
                                            event.target.value.toUpperCase()
                                        )
                                    }
                                />
                            </div>

                            {actionError && (
                                <div className="alert alert-error">
                                    {actionError}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="button button-ghost button-small"
                                    onClick={closeModals}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="button button-primary button-small"
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <span className="spinner"></span> : 'Join Community'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </main>
    );
}

export default Dashboard;