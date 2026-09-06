import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getProfile, updateProfile, changePassword } from '../services/profileService';
import { logout } from '../services/authService';

function Profile() {

    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {

        try {

            setLoading(true);
            setError('');

            const response = await getProfile();

            const user = response.data.user || response.data;

            setProfile(user);

            setName(user.username || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');

        } catch (err) {

            console.error('Error loading profile:', err);

            setError(
                err.response?.data?.message ||
                'Unable to load profile.'
            );

        } finally {

            setLoading(false);

        }
    };

    const handleProfileUpdate = async (event) => {

        event.preventDefault();

        setMessage('');
        setError('');

        try {

            setSaving(true);

            const response = await updateProfile({
                username: name,
                phone
            });

            const updatedUser = response.data.user || response.data;

            setProfile(updatedUser);
            setName(updatedUser.username || name);

            setMessage('Profile updated successfully.');

        } catch (err) {

            console.error('Profile update error:', err);

            setError(
                err.response?.data?.message ||
                'Unable to update profile.'
            );

        } finally {

            setSaving(false);

        }
    };

    const handlePasswordChange = async (event) => {

        event.preventDefault();

        setMessage('');
        setError('');

        if (!currentPassword || !newPassword || !confirmPassword) {

            setError('Please fill in all password fields.');
            return;

        }

        if (newPassword !== confirmPassword) {

            setError('New passwords do not match.');
            return;

        }

        try {

            setPasswordLoading(true);

            await changePassword({
                currentPassword,
                newPassword
            });

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            setMessage('Password changed successfully.');

        } catch (err) {

            console.error('Password change error:', err);

            setError(
                err.response?.data?.message ||
                'Unable to change password.'
            );

        } finally {

            setPasswordLoading(false);

        }
    };

    const handleConfirmLogout = async () => {

        try {

            setLogoutLoading(true);

            await logout();

            localStorage.removeItem('token');
            sessionStorage.clear();

            navigate('/login');

        } catch (err) {

            console.error('Logout error:', err);

            localStorage.removeItem('token');
            sessionStorage.clear();

            navigate('/login');

        } finally {

            setLogoutLoading(false);

        }
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

    return (

        <main className="profile-page">

            <div className="profile-container">

                <section className="profile-header">

                    <div>

                        <h1>Profile</h1>

                        <p>
                            Manage your account information and security.
                        </p>

                    </div>

                </section>


                {message && (

                    <div className="profile-message success">
                        {message}
                    </div>

                )}





                <section className="profile-card">

                    <div className="profile-card-header">

                        <h2>Personal Information</h2>

                        <p>
                            Update your basic account information.
                        </p>

                    </div>


                    <form onSubmit={handleProfileUpdate}>

                        <div className="profile-form-group">

                            <label htmlFor="name">
                                Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="Enter your name"
                            />

                        </div>

                        <div className="profile-form-group">

                            <label htmlFor="phone">
                                Phone
                            </label>

                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(event) =>
                                    setPhone(event.target.value)
                                }
                                placeholder="Enter your phone number"
                            />

                        </div>


                        <div className="profile-form-group">

                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                disabled
                            />

                        </div>


                        <button
                            type="submit"
                            disabled={saving}
                        >

                            {saving
                                ? 'Saving...'
                                : 'Save Changes'
                            }

                        </button>

                    </form>

                </section>


                <section className="profile-card">

                    <div className="profile-card-header">

                        <h2>Change Password</h2>

                        <p>
                            Keep your account secure by using a strong password.
                        </p>

                    </div>


                    <form onSubmit={handlePasswordChange}>

                        <div className="profile-form-group">

                            <label htmlFor="currentPassword">
                                Current Password
                            </label>

                            <input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(event) =>
                                    setCurrentPassword(event.target.value)
                                }
                                placeholder="Enter current password"
                            />

                        </div>


                        <div className="profile-form-group">

                            <label htmlFor="newPassword">
                                New Password
                            </label>

                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(event) =>
                                    setNewPassword(event.target.value)
                                }
                                placeholder="Enter new password"
                            />

                        </div>


                        <div className="profile-form-group">

                            <label htmlFor="confirmPassword">
                                Confirm New Password
                            </label>

                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                placeholder="Confirm new password"
                            />

                        </div>


                        <button
                            type="submit"
                            disabled={passwordLoading}
                        >

                            {passwordLoading
                                ? 'Changing...'
                                : 'Change Password'
                            }

                        </button>

                        {error && (
                            <div className="profile-message error">
                                {error}
                            </div>
                        )}

                    </form>

                </section>


                <section className="profile-card danger-card">

                    <div className="profile-card-header">

                        <h2>Account</h2>

                        <p>
                            Sign out of your MyComm account.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="logout-button"
                        onClick={() => setShowLogoutModal(true)}
                    >
                        Log Out
                    </button>

                </section>

            </div>


            {showLogoutModal && (

                <div className="logout-modal-overlay">

                    <div className="logout-modal">

                        <h2>Log out?</h2>

                        <p>
                            Are you sure you want to log out of your MyComm account?
                        </p>


                        <div className="logout-modal-actions">

                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                disabled={logoutLoading}
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="logout-confirm-button"
                                onClick={handleConfirmLogout}
                                disabled={logoutLoading}
                            >

                                {logoutLoading
                                    ? 'Logging out...'
                                    : 'Log Out'
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </main>

    );
}

export default Profile;