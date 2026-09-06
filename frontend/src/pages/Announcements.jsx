import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
    getAnnouncements,
    getCommunity,
    updateAnnouncement,
    deleteAnnouncement
} from '../services/communityService';

function Announcements() {
    const { communityId } = useParams();
    const navigate = useNavigate();

    const [announcements, setAnnouncements] = useState([]);
    const [community, setCommunity] = useState(null);
    const [role, setRole] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /* ========================================
       EDIT ANNOUNCEMENT STATE
    ======================================== */
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editMessage, setEditMessage] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    /* ========================================
       DELETE ANNOUNCEMENT STATE
    ======================================== */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    /* ========================================
       LOAD COMMUNITY & ANNOUNCEMENTS
    ======================================== */
    useEffect(() => {
        const loadAnnouncementsPage = async () => {
            try {
                setLoading(true);
                setError('');

                const [
                    communityResponse,
                    announcementsResponse
                ] = await Promise.all([
                    getCommunity(communityId),
                    getAnnouncements(communityId)
                ]);

                setCommunity(communityResponse?.data?.community || communityResponse?.data);
                setRole(communityResponse?.data?.role || 'member');
                setAnnouncements(announcementsResponse?.data?.announcements || announcementsResponse?.data || []);

            } catch (err) {
                console.error('Error loading announcements:', err);
                setError(
                    err?.response?.data?.message ||
                    'Failed to load announcements.'
                );
            } finally {
                setLoading(false);
            }
        };

        if (communityId) {
            loadAnnouncementsPage();
        }
    }, [communityId]);

    const normalizedRole = String(role || 'member').toLowerCase();
    const isManager = normalizedRole === 'admin' || normalizedRole === 'owner';

    /* ========================================
       DATE & TIME FORMATTER
    ======================================== */
    const formatDateTime = (dateVal) => {
        if (!dateVal) return '';
        const parsed = new Date(dateVal);
        if (Number.isNaN(parsed.getTime())) return '';

        return parsed.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const renderAnnouncementMessage = (message) => {
        if (!message) return null;

        const urlRegex = /https?:\/\/[^\s]+/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = urlRegex.exec(message)) !== null) {
            if (match.index > lastIndex) {
                parts.push(
                    <span key={`text-${lastIndex}`}>
                        {message.slice(lastIndex, match.index)}
                    </span>
                );
            }

            parts.push(
                <a
                    key={`link-${match.index}`}
                    href={match[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: 'var(--neon-accent)',
                        textDecoration: 'underline',
                        cursor: 'pointer'
                    }}
                >
                    {match[0]}
                </a>
            );

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < message.length) {
            parts.push(
                <span key={`text-${lastIndex}`}>
                    {message.slice(lastIndex)}
                </span>
            );
        }

        return parts.length > 0 ? parts : message;
    };

    /* ========================================
       MODAL CONTROLS
    ======================================== */
    const openEditModal = (event, announcement) => {
        event.stopPropagation();
        setEditingAnnouncement(announcement);
        setEditTitle(announcement.title || '');
        setEditMessage(announcement.message || '');
        setEditError('');
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        if (editLoading) return;
        setShowEditModal(false);
        setEditingAnnouncement(null);
        setEditTitle('');
        setEditMessage('');
        setEditError('');
    };

    const openDeleteModal = (event, announcement) => {
        event.stopPropagation();
        setDeletingAnnouncement(announcement);
        setDeleteError('');
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        if (deleteLoading) return;
        setShowDeleteModal(false);
        setDeletingAnnouncement(null);
        setDeleteError('');
    };

    /* ========================================
       UPDATE HANDLER
    ======================================== */
    const handleUpdateAnnouncement = async (event) => {
        event.preventDefault();
        if (!editingAnnouncement) return;

        if (!editTitle.trim()) {
            setEditError('Announcement title is required.');
            return;
        }

        if (!editMessage.trim()) {
            setEditError('Announcement message is required.');
            return;
        }

        try {
            setEditLoading(true);
            setEditError('');

            const response = await updateAnnouncement(
                communityId,
                editingAnnouncement._id,
                {
                    title: editTitle.trim(),
                    message: editMessage.trim()
                }
            );

            const updatedAnnouncement = response?.data?.announcement || response?.data;

            if (updatedAnnouncement) {
                setAnnouncements((previousAnnouncements) =>
                    previousAnnouncements.map((item) =>
                        item._id === updatedAnnouncement._id ? updatedAnnouncement : item
                    )
                );
            }

            closeEditModal();
        } catch (err) {
            console.error('Error updating announcement:', err);
            setEditError(
                err?.response?.data?.message || 'Failed to update announcement.'
            );
        } finally {
            setEditLoading(false);
        }
    };

    /* ========================================
       DELETE HANDLER
    ======================================== */
    const handleDeleteAnnouncement = async () => {
        if (!deletingAnnouncement) return;

        try {
            setDeleteLoading(true);
            setDeleteError('');

            await deleteAnnouncement(
                communityId,
                deletingAnnouncement._id
            );

            setAnnouncements((previousAnnouncements) =>
                previousAnnouncements.filter(
                    (item) =>
                        item._id !== deletingAnnouncement._id
                )
            );

            closeDeleteModal();

        } catch (err) {
            console.error('Error deleting announcement:', err);
            setDeleteError(
                err?.response?.data?.message ||
                'Failed to delete announcement.'
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    /* ========================================
       STATES: LOADING & ERROR
    ======================================== */
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

    if (error) {
        return (
            <main className="announcements-page">
                <div className="announcements-container">
                    <button
                        type="button"
                        className="button button-ghost button-small"
                        onClick={() => navigate(`/community/${communityId}`)}
                    >
                        Back to Community
                    </button>
                    <div className="alert alert-error" style={{ marginTop: '20px' }}>
                        {error}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="announcements-page">
            <div className="announcements-container">

                {/* HEADER */}
                <header className="announcements-header">
                    <div>
                        <div className="workspace-badge-row">
                            <span className="community-role">
                                {community?.name || 'Community'}
                            </span>
                        </div>
                        <h1 style={{ textTransform: 'none', }}>
                            Announcements
                        </h1>
                        <p>Scroll down to see previous announcements</p>
                    </div>

                    <button
                        type="button"
                        className="button button-ghost button-small"
                        onClick={() => navigate(`/community/${communityId}`)}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Community Dashboard
                    </button>
                </header>

                {/* FEED */}
                <section className="announcements-feed-section">
                    {announcements.length === 0 ? (
                        <div className="announcements-empty">
                            <h2>No announcements</h2>
                            <p>No announcements have been published in this community yet.</p>
                        </div>
                    ) : (
                        <div className="announcements-list">
                            {[...announcements]
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .map((announcement) => {
                                    const wasEdited =
                                        announcement.updatedAt &&
                                        new Date(announcement.updatedAt).getTime() !==
                                        new Date(announcement.createdAt).getTime();

                                    return (
                                        <article
                                            key={announcement._id}
                                            className="announcement-card"
                                        >
                                            <div className="announcement-card-top">
                                                <div className="announcement-title-block">
                                                    <h2 style={{ textTransform: 'none' }}>{announcement.title}</h2>
                                                    <div className="announcement-details">
                                                        <span>{formatDateTime(announcement.createdAt)}</span>
                                                        {wasEdited && (
                                                            <span className="announcement-updated">
                                                                Modified
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {isManager && (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            gap: '8px',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <button
                                                            type="button"
                                                            className="button button-ghost button-small"
                                                            onClick={(e) => openEditModal(e, announcement)}
                                                        >
                                                            Edit Announcement
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="button button-danger button-small"
                                                            onClick={(e) => openDeleteModal(e, announcement)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <p
                                                className="announcement-message"
                                                style={{ whiteSpace: 'pre-wrap' }}
                                            >
                                                {renderAnnouncementMessage(announcement.message)}
                                            </p>

                                            <div className="announcement-card-footer">
                                                <span style={{ textTransform: 'none' }}>
                                                    Posted by{' '}
                                                    <span
                                                        style={{
                                                            color: 'var(--neon-accent)',
                                                            textTransform: 'uppercase'
                                                        }}
                                                    >
                                                        {announcement.createdBy?.username || 'System Administrator'}
                                                    </span>
                                                </span>
                                            </div>
                                        </article>
                                    );
                                })}
                        </div>
                    )}
                </section>

                {/* EDIT MODAL */}
                {showEditModal && (
                    <div className="modal-overlay" onClick={closeEditModal}>
                        <div className="community-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Edit Announcement</h2>
                                {/* <p>Update announcement details for your community.</p> */}
                            </div>

                            <form onSubmit={handleUpdateAnnouncement}>
                                <div className="field">
                                    <label htmlFor="editTitle">Title</label>
                                    <input
                                        id="editTitle"
                                        type="text"
                                        placeholder="e.g. Team Meeting Update"
                                        value={editTitle}
                                        maxLength={120}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        disabled={editLoading}
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="editMessage">Description</label>
                                    <textarea
                                        id="editMessage"
                                        placeholder="Write your announcement..."
                                        value={editMessage}
                                        maxLength={1000}
                                        onChange={(e) => setEditMessage(e.target.value)}
                                        disabled={editLoading}
                                    />
                                </div>

                                {editError && (
                                    <div className="alert alert-error">{editError}</div>
                                )}

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="button button-ghost button-small"
                                        onClick={closeEditModal}
                                        disabled={editLoading}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="button button-primary button-small"
                                        disabled={editLoading}
                                    >
                                        {editLoading ? <span className="spinner"></span> : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* DELETE MODAL */}
                {showDeleteModal && (
                    <div className="modal-overlay" onClick={closeDeleteModal}>
                        <div className="community-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Delete Announcement</h2>
                                <p>
                                    Are you sure you want to delete this announcement?
                                    This action cannot be undone.
                                </p>
                            </div>

                            {deletingAnnouncement && (
                                <div
                                    style={{
                                        marginBottom: '20px',
                                        padding: '14px 16px',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'rgba(0, 0, 0, 0.25)'
                                    }}
                                >
                                    <strong
                                        style={{
                                            display: 'block',
                                            color: 'var(--text-primary)',
                                            marginBottom: '5px',
                                            textTransform: 'none'
                                        }}
                                    >
                                        {deletingAnnouncement.title}
                                    </strong>

                                    <span
                                        style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: '13px'
                                        }}
                                    >
                                        {deletingAnnouncement.message}
                                    </span>
                                </div>
                            )}

                            {deleteError && (
                                <div className="alert alert-error">
                                    {deleteError}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="button button-ghost button-small"
                                    onClick={closeDeleteModal}
                                    disabled={deleteLoading}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="button button-danger button-small"
                                    onClick={handleDeleteAnnouncement}
                                    disabled={deleteLoading}
                                >
                                    {deleteLoading ? (
                                        <span className="spinner"></span>
                                    ) : (
                                        'Delete Announcement'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}

export default Announcements;