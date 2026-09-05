import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getProfile,
    updateProfile,
    changePassword
} from '../services/profileService';

function Profile() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /* ========================================
        PROFILE EDIT STATE
    ======================================== */
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');
    const [profileError, setProfileError] = useState('');

    /* ========================================
        CHANGE PASSWORD STATE
    ======================================== */
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');

    /* ========================================
        LOGOUT MODAL STATE
    ======================================== */
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await getProfile();
                const currentUser = response.data.user;

                setUser(currentUser);
                setUsername(currentUser?.username || '');
                setPhone(currentUser?.phone || '');
            } catch (err) {
                console.error('Error loading profile:', err);
                setError(err.response?.data?.message || 'Failed to load your profile.');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleUpdateProfile = async (event) => {
        event.preventDefault();
        setProfileMessage('');
        setProfileError('');

        if (!username.trim()) {
            setProfileError('Username cannot be empty.');
            return;
        }

        try {
            setProfileLoading(true);
            const response = await updateProfile({
                username: username.trim(),
                phone: phone.trim()
            });

            const updatedUser = response.data.user;
            setUser(updatedUser);
            setUsername(updatedUser?.username || '');
            setPhone(updatedUser?.phone || '');
            setProfileMessage(response.data.message || 'Profile updated successfully.');
        } catch (err) {
            console.error('Update profile error:', err);
            setProfileError(err.response?.data?.message || 'Failed to update your profile.');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();
        setPasswordMessage('');
        setPasswordError('');

        if (!currentPassword) {
            setPasswordError('Current password is required.');
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('The new passwords do not match.');
            return;
        }

        try {
            setPasswordLoading(true);
            const response = await changePassword({
                currentPassword,
                newPassword
            });

            setPasswordMessage(response.data.message || 'Password updated successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Change password error:', err);
            setPasswordError(err.response?.data?.message || 'Failed to update your password.');
        } finally {
            setPasswordLoading(false);
        }
    };

    /* ========================================
        LOGOUT CONFIRMATION
    ======================================== */
    const handleConfirmLogout = () => {
        setLogoutLoading(true);
        localStorage.removeItem('token');
        sessionStorage.clear();
        navigate('/login');
    };

    if (loading) {
        return (
            <main className="profile-page dashboard-loading-state">
                <div className="spinner"></div>
                <p>Loading your profile...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="profile-page">
                <div className="profile-container">
                    <div className="alert alert-error">{error}</div>
                </div>
            </main>
        );
    }

    return (
        <main className="profile-page" style={{ position: 'relative', minHeight: '100vh' }}>
            <div className="profile-container">

                {/* HEADER */}
                <header className="profile-header">
                    <div>
                        <h1 style={{ color: 'var(--neon-accent)' }}>Account Profile</h1>
                        <p>Manage your account details and password.</p>
                    </div>

                    <button
                        type="button"
                        className="button button-ghost button-small"
                        onClick={() => navigate('/dashboard')}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Dashboard
                    </button>
                </header>

                {/* EDIT PROFILE SECTION */}
                <section className="profile-card">
                    <div className="profile-card-header">
                        <h2>Personal Information</h2>
                        <p>Update your username and contact details.</p>
                    </div>

                    <form className="profile-edit-form" onSubmit={handleUpdateProfile}>
                        <div className="field">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                disabled={profileLoading}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={user?.email || ''}
                                disabled
                            />
                            <small className="field-hint">Your email address cannot be changed here.</small>
                        </div>

                        <div className="field">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                id="phone"
                                type="text"
                                placeholder="e.g. +1 (555) 019-2834"
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                disabled={profileLoading}
                            />
                        </div>

                        {profileError && (
                            <div className="alert alert-error">{profileError}</div>
                        )}

                        {profileMessage && (
                            <div className="alert alert-success">{profileMessage}</div>
                        )}

                        <button
                            type="submit"
                            className="button button-primary button-small"
                            disabled={profileLoading}
                        >
                            {profileLoading ? <span className="spinner"></span> : 'Save Changes'}
                        </button>
                    </form>
                </section>

                {/* CHANGE PASSWORD SECTION */}
                <section className="profile-password-section">
                    <div className="profile-password-header">
                        <div>
                            <h2>Password & Security</h2>
                            <p>Update your account password.</p>
                        </div>

                        <button
                            type="button"
                            className="button button-ghost button-small"
                            onClick={() => {
                                setShowPasswordForm((prev) => !prev);
                                setPasswordError('');
                                setPasswordMessage('');
                            }}
                        >
                            {showPasswordForm ? 'Close' : 'Change Password'}
                        </button>
                    </div>

                    {showPasswordForm && (
                        <form className="profile-password-form" onSubmit={handleChangePassword}>
                            <div className="field">
                                <label htmlFor="currentPassword">Current Password</label>
                                <input
                                    id="currentPassword"
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={currentPassword}
                                    onChange={(event) => setCurrentPassword(event.target.value)}
                                    disabled={passwordLoading}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    disabled={passwordLoading}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Enter your new password again"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    disabled={passwordLoading}
                                />
                            </div>

                            {passwordError && (
                                <div className="alert alert-error">{passwordError}</div>
                            )}

                            {passwordMessage && (
                                <div className="alert alert-success">{passwordMessage}</div>
                            )}

                            <button
                                type="submit"
                                className="button button-primary button-small"
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? <span className="spinner"></span> : 'Update Password'}
                            </button>
                        </form>
                    )}
                </section>

                {/* LOGOUT SECTION */}
                <section className="profile-password-section">
                    <div className="profile-password-header">
                        <div>
                            <h2>Sign Out</h2>
                            <p>Sign out of your MyComm account on this device.</p>
                        </div>

                        <button
                            type="button"
                            className="button button-danger button-small"
                            onClick={() => setShowLogoutModal(true)}
                        >
                            Log Out
                        </button>
                    </div>
                </section>

            </div>

            {/* ========================================
                LOGOUT CONFIRMATION MODAL
            ======================================== */}
            {showLogoutModal && (
                <div
                    role="dialog"
                    aria-modal="true"
                    onClick={() => {
                        if (!logoutLoading) setShowLogoutModal(false);
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.82)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        zIndex: 9999
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '440px',
                            background: 'linear-gradient(145deg, #131418 0%, #090a0d 100%)',
                            border: '1px solid rgba(255, 51, 51, 0.35)',
                            borderRadius: '16px',
                            padding: '32px 28px',
                            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.9), 0 0 24px rgba(255, 51, 51, 0.15)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: '18px'
                        }}
                    >
                        {/* Warning Icon Badge */}
                        <div
                            style={{
                                width: '52px',
                                height: '52px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255, 51, 51, 0.12)',
                                border: '1px solid rgba(255, 51, 51, 0.4)',
                                color: 'var(--neon-accent, #ff3333)',
                                boxShadow: '0 0 16px rgba(255, 51, 51, 0.25)'
                            }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </div>

                        <div>
                            <h3
                                style={{
                                    fontSize: '20px',
                                    fontWeight: 700,
                                    margin: '0 0 8px 0',
                                    color: '#ffffff',
                                    letterSpacing: '-0.02em',
                                    textTransform: 'none'
                                }}
                            >
                                Sign Out?
                            </h3>
                            <p
                                style={{
                                    fontSize: '13px',
                                    lineHeight: 1.6,
                                    color: 'var(--text-secondary, #a1a1aa)',
                                    margin: 0
                                }}
                            >
                                Are you sure you want to sign out of your account? You will need to log back in to access your workspace.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div
                            style={{
                                display: 'flex',
                                width: '100%',
                                gap: '12px',
                                marginTop: '8px'
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                disabled={logoutLoading}
                                style={{
                                    flex: 1,
                                    padding: '11px 16px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    background: '#16181f',
                                    border: '1px solid #282c39',
                                    color: '#e4e4e7',
                                    cursor: logoutLoading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmLogout}
                                disabled={logoutLoading}
                                style={{
                                    flex: 1,
                                    padding: '11px 16px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    background: 'var(--neon-accent, #ff3333)',
                                    color: '#ffffff',
                                    border: 'none',
                                    boxShadow: '0 0 16px rgba(255, 51, 51, 0.4)',
                                    cursor: logoutLoading ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {logoutLoading ? 'Signing out...' : 'Sign Out'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default Profile;