import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getEvents,
    getCommunity,
    updateEvent,
    deleteEvent
} from '../services/communityService';

function Events() {
    const { communityId } = useParams();
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [community, setCommunity] = useState(null);
    const [role, setRole] = useState('member');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /* ========================================
       EDIT EVENT STATE
    ======================================== */
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editName, setEditName] = useState('');
    const [editPlace, setEditPlace] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editTime, setEditTime] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    /* ========================================
       ACTION CONFIRMATION MODAL STATE
    ======================================== */
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmLabel: 'Confirm',
        isDanger: false,
        isLoading: false,
        onConfirm: null
    });

    const closeConfirmModal = () => {
        if (confirmModal.isLoading) return;
        setConfirmModal((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
    };

    /* ========================================
       LOAD EVENTS AND COMMUNITY DETAILS
    ======================================== */
    useEffect(() => {
        const loadEventsPage = async () => {
            if (!communityId) {
                setError('Invalid community reference.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');

                const [
                    communityResponse,
                    eventsResponse
                ] = await Promise.all([
                    getCommunity(communityId),
                    getEvents(communityId)
                ]);

                setCommunity(communityResponse?.data?.community || communityResponse?.data);
                setRole(communityResponse?.data?.role || 'member');
                setEvents(eventsResponse?.data?.events || eventsResponse?.data || []);

            } catch (err) {
                console.error('Error loading events:', err);
                setError(
                    err?.response?.data?.message ||
                    'Failed to fetch events.'
                );
            } finally {
                setLoading(false);
            }
        };

        loadEventsPage();
    }, [communityId]);

    const normalizedRole = String(role || 'member').toLowerCase();
    const isManager = normalizedRole === 'admin' || normalizedRole === 'owner';

    /* ========================================
       TIMESTAMPS & FORMATTING
    ======================================== */
    const getEventTimestamp = (dateVal) => {
        if (!dateVal) return null;
        const timestamp = new Date(dateVal).getTime();
        return Number.isFinite(timestamp) ? timestamp : null;
    };

    const formatDateTime = (dateVal) => {
        const timestamp = getEventTimestamp(dateVal);
        if (timestamp === null) return 'Invalid date';

        return new Date(timestamp).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const renderEventDescription = (message) => {
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

    const getDateForInput = (dateVal) => {
        const timestamp = getEventTimestamp(dateVal);
        if (timestamp === null) return '';

        const value = new Date(timestamp);
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const getTimeForInput = (dateVal) => {
        const timestamp = getEventTimestamp(dateVal);
        if (timestamp === null) return '';

        const value = new Date(timestamp);
        const hours = String(value.getHours()).padStart(2, '0');
        const minutes = String(value.getMinutes()).padStart(2, '0');

        return `${hours}:${minutes}`;
    };

    /* ========================================
       EDIT MODAL CONTROLS
    ======================================== */
    const openEditModal = (clickEvent, selectedEvent) => {
        clickEvent.stopPropagation();
        setEditingEvent(selectedEvent);
        setEditName(selectedEvent.name || '');
        setEditPlace(selectedEvent.place || '');
        setEditDate(getDateForInput(selectedEvent.date));
        setEditTime(getTimeForInput(selectedEvent.date));
        setEditDescription(selectedEvent.description || '');
        setEditError('');
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        if (editLoading) return;
        setShowEditModal(false);
        setEditingEvent(null);
        setEditName('');
        setEditPlace('');
        setEditDate('');
        setEditTime('');
        setEditDescription('');
        setEditError('');
    };

    /* ========================================
       UPDATE EVENT HANDLER
    ======================================== */
    const handleUpdateEvent = async (event) => {
        event.preventDefault();
        if (!editingEvent) return;

        if (!editName.trim()) {
            setEditError('Event name is required.');
            return;
        }

        if (!editPlace.trim()) {
            setEditError('Location is required.');
            return;
        }

        if (!editDate || !editTime) {
            setEditError('Date and time are required.');
            return;
        }

        if (!editDescription.trim()) {
            setEditError('Event description is required.');
            return;
        }

        const eventDateTime = `${editDate}T${editTime}`;
        const selectedDate = new Date(eventDateTime);

        if (Number.isNaN(selectedDate.getTime())) {
            setEditError('Please provide a valid date and time.');
            return;
        }

        try {
            setEditLoading(true);
            setEditError('');

            const response = await updateEvent(
                communityId,
                editingEvent._id,
                {
                    name: editName.trim(),
                    place: editPlace.trim(),
                    date: eventDateTime,
                    description: editDescription.trim()
                }
            );

            const updatedEvent = response?.data?.event || response?.data;

            if (updatedEvent) {
                setEvents((previousEvents) =>
                    previousEvents.map((eventItem) =>
                        eventItem._id === updatedEvent._id ? updatedEvent : eventItem
                    )
                );
            }

            closeEditModal();
        } catch (err) {
            console.error('Error updating event:', err);
            setEditError(
                err?.response?.data?.message || 'Failed to update event.'
            );
        } finally {
            setEditLoading(false);
        }
    };

    /* ========================================
       DELETE EVENT HANDLER (MODAL TRIGGERED)
    ======================================== */
    const handleDeleteEvent = (eventId, eventName) => {
        setConfirmModal({
            isOpen: true,
            title: 'Are you sure?',
            message: (
                <>
                    Permanently delete{' '}
                    <span style={{ color: 'var(--neon-accent)' }}>
                        {eventName}
                    </span>{' '}
                    from the events? This action cannot be reversed.
                </>
            ),
            confirmLabel: 'Delete Event',
            isDanger: true,
            isLoading: false,
            onConfirm: async () => {
                try {
                    setConfirmModal((prev) => ({ ...prev, isLoading: true }));
                    await deleteEvent(communityId, eventId);
                    setEvents((prev) => prev.filter((item) => item._id !== eventId));
                    closeConfirmModal();
                } catch (err) {
                    console.error('Error deleting event:', err);
                    setError(err?.response?.data?.message || 'Failed to delete event.');
                    closeConfirmModal();
                }
            }
        });
    };

    /* ========================================
       SORT EVENTS (UPCOMING FIRST, NEAREST FIRST)
    ======================================== */
    const currentTime = Date.now();
    const sortedEvents = [...events].sort((a, b) => {
        const dateA = getEventTimestamp(a.date);
        const dateB = getEventTimestamp(b.date);

        if (dateA === null && dateB === null) return 0;
        if (dateA === null) return 1;
        if (dateB === null) return -1;

        const aUpcoming = dateA >= currentTime;
        const bUpcoming = dateB >= currentTime;

        if (aUpcoming && bUpcoming) return dateA - dateB;
        if (aUpcoming && !bUpcoming) return -1;
        if (!aUpcoming && bUpcoming) return 1;

        return dateB - dateA;
    });

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

    if (error && !community) {
        return (
            <main className="events-page" style={{ minHeight: '100vh' }}>
                <div className="events-container">
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
        <main className="events-page" style={{ minHeight: '100vh', position: 'relative' }}>
            <div className="events-container">

                {/* HEADER */}
                <header className="events-header">
                    <div>
                        <div className="workspace-badge-row">
                            <span className="community-role">
                                {community?.name || 'Community'}
                            </span>
                        </div>
                        <h1 style={{ textTransform: 'none' }}>Events</h1>
                        <p>Scroll down to see all events</p>
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

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                {/* EVENTS LIST */}
                <section className="events-feed-section">
                    {sortedEvents.length === 0 ? (
                        <div className="events-empty">
                            <h2>No events</h2>
                            <p>No events have been published in this community yet.</p>
                        </div>
                    ) : (
                        <div className="event-list">
                            {sortedEvents.map((eventItem) => {
                                const eventTimestamp = getEventTimestamp(eventItem.date);
                                const isPast = eventTimestamp !== null && eventTimestamp < currentTime;
                                const wasEdited =
                                    eventItem.updatedAt &&
                                    eventItem.createdAt &&
                                    new Date(eventItem.updatedAt).getTime() !==
                                    new Date(eventItem.createdAt).getTime();

                                return (
                                    <article
                                        key={eventItem._id}
                                        className={`event-card ${isPast ? 'past-event' : ''}`}
                                    >
                                        <div className="event-card-top">
                                            <div className="event-title-block">
                                                <h2 style={{ marginBottom: '10px', marginTop: '6px', textTransform: 'none', fontSize: '22px' }}>
                                                    {eventItem.name}
                                                </h2>
                                                <div className="event-details">
                                                    <span className="event-place-text">{eventItem.place}</span>
                                                    <span className="event-time-text">{formatDateTime(eventItem.date)}</span>
                                                    {isPast && <span className="event-badge-archived">Archived</span>}
                                                    {wasEdited && <span className="event-badge-modified">Modified</span>}
                                                </div>
                                            </div>

                                            {isManager && (
                                                <div className="event-card-actions" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        type="button"
                                                        className="button button-ghost button-small"
                                                        onClick={(e) => openEditModal(e, eventItem)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="button button-ghost button-small leave-action-btn"
                                                        onClick={() => handleDeleteEvent(eventItem._id, eventItem.name)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <p
                                            className="event-description"
                                            style={{ whiteSpace: 'pre-wrap' }}
                                        >
                                            {renderEventDescription(
                                                eventItem.description || 'No description provided.'
                                            )}
                                        </p>

                                        <div className="event-card-footer">
                                            <span style={{ textTransform: 'none' }}>
                                                {wasEdited ? (
                                                    <>
                                                        Modified by{' '}
                                                        <span style={{
                                                            color: 'var(--neon-accent)',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {eventItem.updatedBy?.username || 'System Administrator'}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        Scheduled by{' '}
                                                        <span style={{
                                                            color: 'var(--neon-accent)',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {eventItem.createdBy?.username || 'System Administrator'}
                                                        </span>
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {/* ========================================
                EDIT EVENT MODAL (INLINE STYLED)
            ======================================== */}
            {showEditModal && (
                <div
                    role="dialog"
                    aria-modal="true"
                    onClick={closeEditModal}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
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
                            maxWidth: '520px',
                            background: 'linear-gradient(145deg, #141416 0%, #0a0a0c 100%)',
                            border: '1px solid var(--border-light, #2f2f38)',
                            borderRadius: '12px',
                            padding: '28px',
                            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.9), 0 0 20px rgba(255, 51, 51, 0.08)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                    >
                        <div>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                                color: 'var(--text-primary, #ffffff)',
                                margin: 0,
                                textTransform: 'none'
                            }}>
                                Edit Event
                            </h2>
                            <p style={{
                                fontSize: '13px',
                                color: 'var(--text-secondary, #a1a1aa)',
                                marginTop: '6px',
                                marginBottom: 0
                            }}>
                                Update the event details below.
                            </p>
                        </div>

                        <form onSubmit={handleUpdateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label htmlFor="editName" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary, #a1a1aa)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Event Name
                                </label>
                                <input
                                    id="editName"
                                    type="text"
                                    placeholder="e.g. Team Meeting"
                                    value={editName}
                                    maxLength={120}
                                    onChange={(e) => setEditName(e.target.value)}
                                    disabled={editLoading}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        background: 'var(--input-bg, #080808)',
                                        border: '1px solid var(--border-base, #222222)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary, #ffffff)',
                                        fontSize: '13px',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label htmlFor="editPlace" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary, #a1a1aa)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Location
                                </label>
                                <input
                                    id="editPlace"
                                    type="text"
                                    placeholder="e.g. Main Conference Room"
                                    value={editPlace}
                                    maxLength={200}
                                    onChange={(e) => setEditPlace(e.target.value)}
                                    disabled={editLoading}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        background: 'var(--input-bg, #080808)',
                                        border: '1px solid var(--border-base, #222222)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary, #ffffff)',
                                        fontSize: '13px',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label htmlFor="editDate" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary, #a1a1aa)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Date
                                    </label>
                                    <input
                                        id="editDate"
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        disabled={editLoading}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            background: 'var(--input-bg, #080808)',
                                            border: '1px solid var(--border-base, #222222)',
                                            borderRadius: '6px',
                                            color: 'var(--text-primary, #ffffff)',
                                            fontSize: '13px',
                                            outline: 'none',
                                            colorScheme: 'dark'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label htmlFor="editTime" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary, #a1a1aa)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Time
                                    </label>
                                    <input
                                        id="editTime"
                                        type="time"
                                        value={editTime}
                                        onChange={(e) => setEditTime(e.target.value)}
                                        disabled={editLoading}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            background: 'var(--input-bg, #080808)',
                                            border: '1px solid var(--border-base, #222222)',
                                            borderRadius: '6px',
                                            color: 'var(--text-primary, #ffffff)',
                                            fontSize: '13px',
                                            outline: 'none',
                                            colorScheme: 'dark'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label htmlFor="editDescription" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary, #a1a1aa)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Description
                                </label>
                                <textarea
                                    id="editDescription"
                                    placeholder="Add event details and notes..."
                                    value={editDescription}
                                    maxLength={1000}
                                    rows={4}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    disabled={editLoading}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        background: 'var(--input-bg, #080808)',
                                        border: '1px solid var(--border-base, #222222)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary, #ffffff)',
                                        fontSize: '13px',
                                        outline: 'none',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            {editError && (
                                <div style={{
                                    padding: '10px 14px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(255, 51, 51, 0.1)',
                                    border: '1px solid rgba(255, 51, 51, 0.3)',
                                    color: 'var(--neon-accent, #ff3333)',
                                    fontSize: '12px'
                                }}>
                                    {editError}
                                </div>
                            )}

                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '10px',
                                marginTop: '8px'
                            }}>
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    disabled={editLoading}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        background: '#18181b',
                                        color: 'var(--text-secondary, #a1a1aa)',
                                        border: '1px solid var(--border-base, #27272a)',
                                        cursor: editLoading ? 'not-allowed' : 'pointer',
                                        opacity: editLoading ? 0.6 : 1
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    style={{
                                        padding: '8px 18px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        background: 'var(--neon-accent, #ff3333)',
                                        color: '#ffffff',
                                        border: 'none',
                                        boxShadow: '0 0 14px rgba(255, 51, 51, 0.4)',
                                        cursor: editLoading ? 'not-allowed' : 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {editLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================
                ACTION / DELETE CONFIRMATION MODAL (INLINE STYLED)
            ======================================== */}
            {confirmModal.isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    onClick={closeConfirmModal}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
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
                            background: 'linear-gradient(145deg, #141416 0%, #0a0a0c 100%)',
                            border: `1px solid ${confirmModal.isDanger ? 'rgba(255, 51, 51, 0.4)' : 'var(--border-light, #2f2f38)'}`,
                            borderRadius: '12px',
                            padding: '28px',
                            boxShadow: confirmModal.isDanger
                                ? '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 24px rgba(255, 51, 51, 0.15)'
                                : '0 20px 40px rgba(0, 0, 0, 0.8)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px'
                        }}
                    >
                        <div>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                                margin: 0,
                                color: confirmModal.isDanger ? 'var(--neon-accent, #ff3333)' : 'var(--text-primary, #ffffff)',
                                textTransform: 'none'
                            }}>
                                {confirmModal.title}
                            </h3>
                            <p style={{
                                fontSize: '13px',
                                lineHeight: 1.6,
                                color: 'var(--text-secondary, #a1a1aa)',
                                marginTop: '8px',
                                marginBottom: 0
                            }}>
                                {confirmModal.message}
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={closeConfirmModal}
                                disabled={confirmModal.isLoading}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    background: '#18181b',
                                    color: 'var(--text-secondary, #a1a1aa)',
                                    border: '1px solid var(--border-base, #27272a)',
                                    cursor: confirmModal.isLoading ? 'not-allowed' : 'pointer',
                                    opacity: confirmModal.isLoading ? 0.6 : 1
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => confirmModal.onConfirm && confirmModal.onConfirm()}
                                disabled={confirmModal.isLoading}
                                style={{
                                    padding: '8px 18px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    background: confirmModal.isDanger
                                        ? 'var(--neon-accent, #ff3333)'
                                        : 'var(--text-primary, #ffffff)',
                                    color: confirmModal.isDanger ? '#ffffff' : '#050505',
                                    border: 'none',
                                    boxShadow: confirmModal.isDanger
                                        ? '0 0 14px rgba(255, 51, 51, 0.4)'
                                        : 'none',
                                    cursor: confirmModal.isLoading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {confirmModal.isLoading ? 'Processing...' : confirmModal.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default Events;