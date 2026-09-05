import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getCommunity,
    getAnnouncements,
    addAnnouncement,
    getEvents,
    addEvent,
    leaveCommunity
} from '../services/communityService';

function CommunityDashboard() {
    const { communityId } = useParams();
    const navigate = useNavigate();

    const [community, setCommunity] = useState(null);
    const [role, setRole] = useState('member');

    const [announcements, setAnnouncements] = useState([]);
    const [events, setEvents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [announcementError, setAnnouncementError] = useState('');
    const [eventError, setEventError] = useState('');

    /* ========================================
       ADD ANNOUNCEMENT STATE
    ======================================== */
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementMessage, setAnnouncementMessage] = useState('');
    const [announcementLoading, setAnnouncementLoading] = useState(false);
    const [announcementFormError, setAnnouncementFormError] = useState('');

    /* ========================================
       ADD EVENT STATE
    ======================================== */
    const [showEventModal, setShowEventModal] = useState(false);
    const [eventName, setEventName] = useState('');
    const [eventPlace, setEventPlace] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventLoading, setEventLoading] = useState(false);
    const [eventFormError, setEventFormError] = useState('');

    /* ========================================
       SHARE & LEAVE MODAL STATE
    ======================================== */
    const [showShareModal, setShowShareModal] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [leaveError, setLeaveError] = useState('');
    const [leaveSuccess, setLeaveSuccess] = useState(false);

    /* ========================================
       LOAD COMMUNITY DATA
    ======================================== */
    useEffect(() => {
        const loadCommunityData = async () => {
            if (!communityId) {
                setError('Invalid community reference.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');

                const communityResponse = await getCommunity(communityId);
                const loadedCommunity = communityResponse?.data?.community || communityResponse?.data;

                if (!loadedCommunity) {
                    throw new Error('Community not found.');
                }

                setCommunity(loadedCommunity);
                setRole(communityResponse?.data?.role || loadedCommunity?.role || 'member');

                try {
                    const announcementResponse = await getAnnouncements(communityId);
                    setAnnouncements(announcementResponse?.data?.announcements || announcementResponse?.data || []);
                    setAnnouncementError('');
                } catch (announcementErr) {
                    console.error('Error loading announcements:', announcementErr);
                    setAnnouncements([]);
                    setAnnouncementError('Unable to load announcements.');
                }

                try {
                    const eventResponse = await getEvents(communityId);
                    setEvents(eventResponse?.data?.events || eventResponse?.data || []);
                    setEventError('');
                } catch (eventErr) {
                    console.error('Error loading events:', eventErr);
                    setEvents([]);
                    setEventError('Unable to load events.');
                }

            } catch (err) {
                console.error('Error loading community:', err);
                setError(err?.response?.data?.message || err.message || 'Failed to load community data.');
            } finally {
                setLoading(false);
            }
        };

        loadCommunityData();
    }, [communityId]);

    const normalizedRole = String(role || 'member').toLowerCase();
    const isManager = normalizedRole === 'admin' || normalizedRole === 'owner';

    /* ========================================
       ANNOUNCEMENT ACTIONS
    ======================================== */
    const openAnnouncementModal = (event) => {
        if (event) event.stopPropagation();
        setAnnouncementTitle('');
        setAnnouncementMessage('');
        setAnnouncementFormError('');
        setShowAnnouncementModal(true);
    };

    const closeAnnouncementModal = () => {
        if (announcementLoading) return;
        setShowAnnouncementModal(false);
        setAnnouncementTitle('');
        setAnnouncementMessage('');
        setAnnouncementFormError('');
    };

    const handleAddAnnouncement = async (event) => {
        event.preventDefault();

        if (!announcementTitle.trim()) {
            setAnnouncementFormError('Announcement title is required.');
            return;
        }

        if (!announcementMessage.trim()) {
            setAnnouncementFormError('Announcement message is required.');
            return;
        }

        try {
            setAnnouncementLoading(true);
            setAnnouncementFormError('');

            const response = await addAnnouncement(communityId, {
                title: announcementTitle.trim(),
                message: announcementMessage.trim()
            });

            const newAnnouncement = response?.data?.announcement || response?.data;
            if (newAnnouncement) {
                setAnnouncements((prev) => [...prev, newAnnouncement]);
            }

            closeAnnouncementModal();
        } catch (err) {
            console.error('Error adding announcement:', err);
            setAnnouncementFormError(
                err?.response?.data?.message || 'Failed to add announcement.'
            );
        } finally {
            setAnnouncementLoading(false);
        }
    };

    /* ========================================
       EVENT ACTIONS
    ======================================== */
    const openEventModal = (event) => {
        if (event) event.stopPropagation();
        setEventName('');
        setEventPlace('');
        setEventDate('');
        setEventTime('');
        setEventDescription('');
        setEventFormError('');
        setShowEventModal(true);
    };

    const closeEventModal = () => {
        if (eventLoading) return;
        setShowEventModal(false);
        setEventName('');
        setEventPlace('');
        setEventDate('');
        setEventTime('');
        setEventDescription('');
        setEventFormError('');
    };

    const getLocalDateString = () => {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleAddEvent = async (event) => {
        event.preventDefault();

        if (!eventName.trim() || !eventPlace.trim() || !eventDate || !eventTime || !eventDescription.trim()) {
            setEventFormError('Please complete all event details.');
            return;
        }

        const eventDateTime = `${eventDate}T${eventTime}`;
        const selectedDate = new Date(eventDateTime);

        if (Number.isNaN(selectedDate.getTime()) || selectedDate.getTime() <= Date.now()) {
            setEventFormError('Please select a valid future date and time.');
            return;
        }

        try {
            setEventLoading(true);
            setEventFormError('');

            const response = await addEvent(communityId, {
                name: eventName.trim(),
                place: eventPlace.trim(),
                date: eventDateTime,
                description: eventDescription.trim()
            });

            const newEvent = response?.data?.event || response?.data;
            if (newEvent) {
                setEvents((prev) => [...prev, newEvent]);
            }

            closeEventModal();
        } catch (err) {
            console.error('Error scheduling event:', err);
            setEventFormError(
                err?.response?.data?.message || 'Failed to schedule event.'
            );
        } finally {
            setEventLoading(false);
        }
    };

    const getEventTimestamp = (eventItem) => {
        if (!eventItem?.date) return null;
        const timestamp = new Date(eventItem.date).getTime();
        return Number.isNaN(timestamp) ? null : timestamp;
    };

    const findNearestEvent = () => {
        if (!events || events.length === 0) return null;
        const currentTime = Date.now();
        const validEvents = events.filter((ev) => getEventTimestamp(ev) !== null);

        if (validEvents.length === 0) return null;

        const upcomingEvents = validEvents
            .filter((ev) => getEventTimestamp(ev) >= currentTime)
            .sort((a, b) => getEventTimestamp(a) - getEventTimestamp(b));

        if (upcomingEvents.length > 0) return upcomingEvents[0];

        return [...validEvents].sort(
            (a, b) => getEventTimestamp(b) - getEventTimestamp(a)
        )[0];
    };

    /* ========================================
       SHARE & LEAVE ACTIONS
    ======================================== */
    const openShareModal = () => {
        setCopySuccess(false);
        setShowShareModal(true);
    };

    const closeShareModal = () => {
        setShowShareModal(false);
        setCopySuccess(false);
    };

    const handleCopyCommunityCode = async () => {
        try {
            await navigator.clipboard.writeText(community.communityCode);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy community code:', err);
        }
    };

    const confirmLeaveCommunity = async () => {
        if (leaveLoading) return;

        try {
            setLeaveLoading(true);
            setLeaveError('');

            await leaveCommunity(communityId);
            setLeaveSuccess(true);
            setLeaveLoading(false);

            setTimeout(() => {
                setShowLeaveModal(false);
                navigate('/dashboard');
            }, 1200);
        } catch (err) {
            console.error('Leave community error:', err);
            setLeaveError(
                err?.response?.data?.message || err?.message || 'Failed to leave the community.'
            );
            setLeaveLoading(false);
        }
    };

    const formatEventDate = (dateValue) => {
        if (!dateValue) return '';
        const value = new Date(dateValue);
        if (Number.isNaN(value.getTime())) return '';
        return value.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) {
        return (
            <main className="community-dashboard-page dashboard-loading-state">
                <div className="spinner"></div>
                <p>Loading community...</p>
            </main>
        );
    }

    if (error || !community) {
        return (
            <main className="community-dashboard-page">
                <div className="community-dashboard-container">
                    <div className="alert alert-error">
                        {error || 'Community could not be found.'}
                    </div>
                    <button
                        type="button"
                        className="button button-ghost button-small"
                        onClick={() => navigate('/dashboard')}
                    >
                        Return to Dashboard
                    </button>
                </div>
            </main>
        );
    }

    const latestAnnouncement = announcements.length > 0
        ? [...announcements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null;

    const nextEvent = findNearestEvent();
    const nextEventIsPast = nextEvent && getEventTimestamp(nextEvent) < Date.now();

    return (
        <main className="community-dashboard-page">
            <div className="community-dashboard-container">

                {/* COMMUNITY HEADER */}
                <header className="community-dashboard-header">
                    <div>
                        <div className="workspace-badge-row">
                            <span className={`community-role ${normalizedRole}`}>
                                {normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)}
                            </span>
                        </div>
                        <h1>{community.name}</h1>
                        <p>{community.description || 'A collaborative space for your community.'}</p>
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

                {/* ANNOUNCEMENTS MODULE */}
                <section
                    className="community-dashboard-section clickable-section"
                    onClick={() => navigate(`/community/${communityId}/announcements`)}
                >
                    <div className="section-header">
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: 800,
                            letterSpacing: '0em',
                            color: 'var(--neon-accent)'
                        }}>Announcements</h2>
                        {isManager && (
                            <div className="section-actions" onClick={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    className="button button-ghost button-small"
                                    onClick={openAnnouncementModal}
                                >
                                    ADD
                                </button>
                                <button
                                    type="button"
                                    className="button button-ghost button-small"
                                    onClick={() => navigate(`/community/${communityId}/announcements`)}
                                >
                                    Modify
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="section-content">
                        {announcementError ? (
                            <p className="empty-state-text">{announcementError}</p>
                        ) : !latestAnnouncement ? (
                            <p className="empty-state-text">No announcements</p>
                        ) : (
                            <article className="announcement-item-preview">
                                <h3>{latestAnnouncement.title}</h3>
                                <p>{latestAnnouncement.message}</p>
                                <div className="announcement-meta">
                                    <span>{latestAnnouncement.createdBy?.username || 'Community Administrator'}</span>
                                    <span style={{
                                        color: 'var(--neon-accent)'
                                    }}>{formatEventDate(latestAnnouncement.createdAt)}</span>
                                </div>
                            </article>
                        )}
                    </div>
                </section>

                {/* EVENTS MODULE */}
                <section
                    className="community-dashboard-section clickable-section"
                    onClick={() => navigate(`/community/${communityId}/events`)}
                >
                    <div className="section-header">
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: 800,
                            letterSpacing: '0em',
                            color: 'var(--neon-accent)'
                        }}>Events</h2>
                        {isManager && (
                            <div className="section-actions" onClick={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    className="button button-ghost button-small"
                                    onClick={openEventModal}
                                >
                                    ADD
                                </button>
                                <button
                                    type="button"
                                    className="button button-ghost button-small"
                                    onClick={() => navigate(`/community/${communityId}/events`)}
                                >
                                    Modify
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="section-content">
                        {eventError ? (
                            <p className="empty-state-text">{eventError}</p>
                        ) : !nextEvent ? (
                            <p className="empty-state-text">No upcoming events</p>
                        ) : (
                            <article className="event-preview">
                                <div className="event-preview-main">
                                    <div className="event-preview-heading">
                                        <h3>{nextEvent.name}</h3>
                                        {nextEventIsPast && <span className="event-past-badge">Archived</span>}
                                    </div>
                                    <p className="event-preview-description">
                                        {nextEvent.description || 'No event description available.'}
                                    </p>
                                </div>
                                <div className="event-preview-meta">
                                    <span className="event-place">{nextEvent.place}</span>
                                    <span style={{
                                        textTransform: 'uppercase'
                                    }} className="event-date">{formatEventDate(nextEvent.date)}</span>
                                </div>
                            </article>
                        )}
                    </div>
                </section>

                {/* COMMUNITY MEMBERS & ATTENDANCE MODULES */}
                <div className="dashboard-grid-dual">
                    <section
                        className="community-dashboard-section clickable-section"
                        onClick={() => navigate(`/community/${communityId}/members`)}
                    >
                        <div className="section-header">
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: 800,
                                letterSpacing: '0em',
                                color: 'var(--neon-accent)'
                            }}>members</h2>
                        </div>
                        <div className="section-content">
                            <p
                                className="empty-state-text"
                                style={{ color: 'white', fontSize: '13px' }}
                            >
                                Click to view member details
                            </p>
                        </div>
                    </section>

                    <section
                        className="community-dashboard-section clickable-section"
                        onClick={() => navigate(`/community/${communityId}/attendance`)}
                    >
                        <div className="section-header">
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: 800,
                                letterSpacing: '0em',
                                color: 'var(--neon-accent)'
                            }}>Attendance</h2>
                        </div>
                        <div className="section-content">
                            <p
                                className="empty-state-text"
                                style={{ color: 'white', fontSize: '13px' }}
                            >
                                Click to view attendance details
                            </p>
                        </div>
                    </section>
                </div>

                {/* GLOBAL ACTIONS FOOTER */}
                <section className="community-dashboard-actions">
                    <button
                        type="button"
                        className="button button-ghost"
                        onClick={openShareModal}
                    >
                        INVITE VIA CODE
                    </button>
                    <button
                        type="button"
                        className="button button-ghost leave-action-btn"
                        onClick={() => {
                            setLeaveError('');
                            setLeaveSuccess(false);
                            setShowLeaveModal(true);
                        }}
                        disabled={leaveLoading}
                    >
                        Leave community
                    </button>
                </section>

                {/* SHARE / INVITE MODAL */}
                {showShareModal && (
                    <div className="modal-overlay" onClick={closeShareModal}>
                        <div className="community-modal share-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Invite Members</h2>
                                <p>Share this community code with people you want to invite.</p>
                            </div>

                            <div className="community-code-modal-box">
                                <span className="code-label">Community Code</span>
                                <strong className="code-value">{community.communityCode}</strong>
                            </div>

                            <button
                                type="button"
                                className="button button-primary button-small"
                                onClick={handleCopyCommunityCode}
                            >
                                {copySuccess ? 'Code Copied!' : 'Copy Community Code'}
                            </button>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="button button-ghost button-small"
                                    onClick={closeShareModal}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================
                    MODERN INLINE LEAVE COMMUNITY MODAL
                ======================================== */}
                {showLeaveModal && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        onClick={() => {
                            if (!leaveLoading) {
                                setShowLeaveModal(false);
                                setLeaveError('');
                                setLeaveSuccess(false);
                            }
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
                                border: `1px solid ${
                                    leaveSuccess
                                        ? 'rgba(46, 204, 113, 0.4)'
                                        : 'rgba(255, 51, 51, 0.35)'
                                }`,
                                borderRadius: '16px',
                                padding: '32px 28px',
                                boxShadow: leaveSuccess
                                    ? '0 24px 48px rgba(0, 0, 0, 0.9), 0 0 24px rgba(46, 204, 113, 0.15)'
                                    : '0 24px 48px rgba(0, 0, 0, 0.9), 0 0 24px rgba(255, 51, 51, 0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                gap: '18px'
                            }}
                        >
                            {/* Glyph Icon */}
                            <div
                                style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: leaveSuccess
                                        ? 'rgba(46, 204, 113, 0.12)'
                                        : 'rgba(255, 51, 51, 0.12)',
                                    border: `1px solid ${
                                        leaveSuccess
                                            ? 'rgba(46, 204, 113, 0.4)'
                                            : 'rgba(255, 51, 51, 0.4)'
                                    }`,
                                    color: leaveSuccess ? '#2ecc71' : 'var(--neon-accent, #ff3333)',
                                    fontSize: '22px',
                                    fontWeight: '700',
                                    boxShadow: leaveSuccess
                                        ? '0 0 16px rgba(46, 204, 113, 0.25)'
                                        : '0 0 16px rgba(255, 51, 51, 0.25)'
                                }}
                            >
                                {leaveSuccess ? (
                                    '✓'
                                ) : (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                )}
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
                                    {leaveSuccess ? 'Community Left' : 'Leave Community'}
                                </h3>
                                <p
                                    style={{
                                        fontSize: '13px',
                                        lineHeight: 1.6,
                                        color: 'var(--text-secondary, #a1a1aa)',
                                        margin: 0
                                    }}
                                >
                                    {leaveSuccess ? (
                                        'You have successfully left the community. Returning to your dashboard...'
                                    ) : normalizedRole === 'owner' ? (
                                        'As the community owner, you cannot leave until workspace ownership has been transferred to another administrator.'
                                    ) : (
                                        <>
                                            Are you sure you want to leave{' '}
                                            <span style={{ color: '#ffffff', fontWeight: 600 }}>{community.name}</span>? You will lose immediate access to all events, member directories, and announcements.
                                        </>
                                    )}
                                </p>
                            </div>

                            {leaveError && (
                                <div
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        background: 'rgba(255, 51, 51, 0.1)',
                                        border: '1px solid rgba(255, 51, 51, 0.3)',
                                        color: 'var(--neon-accent, #ff3333)',
                                        fontSize: '12px',
                                        textAlign: 'center'
                                    }}
                                >
                                    {leaveError}
                                </div>
                            )}

                            {/* Modal Actions */}
                            {!leaveSuccess && (
                                <div
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        gap: '12px',
                                        marginTop: '6px'
                                    }}
                                >
                                    {leaveError ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowLeaveModal(false)}
                                            style={{
                                                width: '100%',
                                                padding: '11px 16px',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                background: '#16181f',
                                                border: '1px solid #282c39',
                                                color: '#e4e4e7',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Understood
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setShowLeaveModal(false)}
                                                disabled={leaveLoading}
                                                style={{
                                                    flex: 1,
                                                    padding: '11px 16px',
                                                    borderRadius: '8px',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    background: '#16181f',
                                                    border: '1px solid #282c39',
                                                    color: '#e4e4e7',
                                                    cursor: leaveLoading ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={confirmLeaveCommunity}
                                                disabled={leaveLoading}
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
                                                    cursor: leaveLoading ? 'not-allowed' : 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                {leaveLoading ? (
                                                    <>
                                                        <span
                                                            style={{
                                                                width: '12px',
                                                                height: '12px',
                                                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                                                borderTopColor: '#ffffff',
                                                                borderRadius: '50%',
                                                                display: 'inline-block',
                                                                animation: 'spin 0.6s linear infinite'
                                                            }}
                                                        />
                                                        Leaving...
                                                    </>
                                                ) : (
                                                    'Leave Community'
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ADD ANNOUNCEMENT MODAL */}
                {showAnnouncementModal && (
                    <div className="modal-overlay" onClick={closeAnnouncementModal}>
                        <div className="community-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Add Announcement</h2>
                                <p>Share an important update with the community.</p>
                            </div>

                            <form onSubmit={handleAddAnnouncement}>
                                <div className="field">
                                    <label htmlFor="announcementTitle">Announcement Title</label>
                                    <input
                                        id="announcementTitle"
                                        type="text"
                                        placeholder="e.g. Important Community Update"
                                        value={announcementTitle}
                                        maxLength={120}
                                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                                        disabled={announcementLoading}
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="announcementMessage">Message</label>
                                    <textarea
                                        id="announcementMessage"
                                        placeholder="Write your announcement..."
                                        value={announcementMessage}
                                        maxLength={1000}
                                        onChange={(e) => setAnnouncementMessage(e.target.value)}
                                        disabled={announcementLoading}
                                    />
                                </div>

                                {announcementFormError && (
                                    <div className="alert alert-error">{announcementFormError}</div>
                                )}

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="button button-ghost button-small"
                                        onClick={closeAnnouncementModal}
                                        disabled={announcementLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="button button-primary button-small"
                                        disabled={announcementLoading}
                                    >
                                        {announcementLoading ? <span className="spinner"></span> : 'Add Announcement'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ADD EVENT MODAL */}
                {showEventModal && (
                    <div className="modal-overlay" onClick={closeEventModal}>
                        <div className="community-modal event-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Schedule Event</h2>
                                <p>Add the details and schedule for your community event.</p>
                            </div>

                            <form onSubmit={handleAddEvent}>
                                <div className="field">
                                    <label htmlFor="eventName">Event Name</label>
                                    <input
                                        id="eventName"
                                        type="text"
                                        placeholder="e.g. Team Meeting"
                                        value={eventName}
                                        maxLength={120}
                                        onChange={(e) => setEventName(e.target.value)}
                                        disabled={eventLoading}
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="eventPlace">Location</label>
                                    <input
                                        id="eventPlace"
                                        type="text"
                                        placeholder="e.g. Conference Room / Online"
                                        value={eventPlace}
                                        maxLength={200}
                                        onChange={(e) => setEventPlace(e.target.value)}
                                        disabled={eventLoading}
                                    />
                                </div>

                                <div className="form-grid">
                                    <div className="field">
                                        <label htmlFor="eventDate">Date</label>
                                        <input
                                            id="eventDate"
                                            type="date"
                                            value={eventDate}
                                            min={getLocalDateString()}
                                            onChange={(e) => setEventDate(e.target.value)}
                                            disabled={eventLoading}
                                        />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="eventTime">Time</label>
                                        <input
                                            id="eventTime"
                                            type="time"
                                            value={eventTime}
                                            onChange={(e) => setEventTime(e.target.value)}
                                            disabled={eventLoading}
                                        />
                                    </div>
                                </div>

                                <div className="field">
                                    <label htmlFor="eventDescription">Description</label>
                                    <textarea
                                        id="eventDescription"
                                        placeholder="Add event details..."
                                        value={eventDescription}
                                        maxLength={1000}
                                        onChange={(e) => setEventDescription(e.target.value)}
                                        disabled={eventLoading}
                                    />
                                </div>

                                {eventFormError && (
                                    <div className="alert alert-error">{eventFormError}</div>
                                )}

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="button button-ghost button-small"
                                        onClick={closeEventModal}
                                        disabled={eventLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="button button-primary button-small"
                                        disabled={eventLoading}
                                    >
                                        {eventLoading ? <span className="spinner"></span> : 'Schedule Event'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}

export default CommunityDashboard;