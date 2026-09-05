import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
    getMembers,
    promoteMember,
    makeOwner,
    removeMember,
    demoteMember
} from '../services/communityService';

const ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MEMBER: 'member'
};

function Members() {
    const { communityId } = useParams();
    const navigate = useNavigate();

    /* =========================================
       CORE STATE
    ========================================= */
    const [members, setMembers] = useState([]);
    const [currentUserRole, setCurrentUserRole] = useState(ROLES.MEMBER);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [actionLoading, setActionLoading] = useState(false);
    const [actionMemberId, setActionMemberId] = useState('');

    /* =========================================
       MODAL STATE
    ========================================= */
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmLabel: 'Confirm',
        isDanger: false,
        onConfirm: null
    });

    const isOwner = currentUserRole === ROLES.OWNER;
    const isAdmin = currentUserRole === ROLES.ADMIN;

    const closeModal = () => {
        if (actionLoading) return;
        setModalConfig((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
    };

    /* =========================================
       HELPERS
    ========================================= */
    const formatJoinedDate = (date) => {
        if (!date) return 'Unknown Date';
        const value = new Date(date);
        if (Number.isNaN(value.getTime())) return 'Unknown Date';

        return value.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getMemberName = (member) => {
        return (
            member.user?.name ||
            member.user?.username ||
            member.user?.email ||
            'Anonymous User'
        );
    };

    const getMemberInitials = (name) => {
        return name.charAt(0).toUpperCase();
    };

    /* =========================================
       LOAD MEMBERS
    ========================================= */
    const loadMembers = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getMembers(communityId);
            setMembers(response?.data?.members || []);
            setCurrentUserRole(response?.data?.currentUserRole || ROLES.MEMBER);
        } catch (err) {
            console.error('Failed to load members:', err);
            setError(err.response?.data?.message || 'Failed to load members.');
        } finally {
            setLoading(false);
        }
    }, [communityId]);

    useEffect(() => {
        if (communityId) loadMembers();
    }, [communityId, loadMembers]);

    /* =========================================
       ACTION HANDLERS
    ========================================= */
    const handlePromote = (memberId, memberName) => {
        setModalConfig({
            isOpen: true,
            title: 'Promote Member',
            message: `Make ${memberName} an Administrator? They will be able to help manage the community.`,
            confirmLabel: 'Promote',
            isDanger: false,
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    setActionMemberId(memberId);
                    await promoteMember(communityId, memberId);
                    await loadMembers();
                    closeModal();
                } catch (err) {
                    setError(err.response?.data?.message || 'Failed to promote member.');
                } finally {
                    setActionLoading(false);
                    setActionMemberId('');
                }
            }
        });
    };

    const handleDemote = (memberId, memberName) => {
        setModalConfig({
            isOpen: true,
            title: 'Remove Administrator Role',
            message: `Remove the Administrator role from ${memberName}? They will become a regular member again.`,
            confirmLabel: 'Demote',
            isDanger: true,
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    setActionMemberId(memberId);
                    await demoteMember(communityId, memberId);
                    await loadMembers();
                    closeModal();
                } catch (err) {
                    setError(err.response?.data?.message || 'Failed to remove administrator role.');
                } finally {
                    setActionLoading(false);
                    setActionMemberId('');
                }
            }
        });
    };

    const handleMakeOwner = (memberId, memberName) => {
        setModalConfig({
            isOpen: true,
            title: 'Transfer Ownership',
            message: `Are you sure you want to make ${memberName} the community owner? Your account will become an Administrator.`,
            confirmLabel: 'Transfer Ownership',
            isDanger: true,
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    setActionMemberId(memberId);
                    await makeOwner(communityId, memberId);
                    await loadMembers();
                    setCurrentUserRole(ROLES.ADMIN);
                    closeModal();
                } catch (err) {
                    setError(err.response?.data?.message || 'Failed to transfer ownership.');
                } finally {
                    setActionLoading(false);
                    setActionMemberId('');
                }
            }
        });
    };

    const handleRemove = (memberId, memberName) => {
        setModalConfig({
            isOpen: true,
            title: 'Remove Member',
            message: `Are you sure you want to remove ${memberName} from this community? They will no longer have access to it.`,
            confirmLabel: 'Remove Member',
            isDanger: true,
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    setActionMemberId(memberId);
                    await removeMember(communityId, memberId);
                    setMembers((prev) => prev.filter((m) => m._id !== memberId));
                    closeModal();
                } catch (err) {
                    setError(err.response?.data?.message || 'Failed to remove member.');
                } finally {
                    setActionLoading(false);
                    setActionMemberId('');
                }
            }
        });
    };

    /* =========================================
       PERMISSIONS
    ========================================= */
    const canPromote = (member) => member.role === ROLES.MEMBER && (isOwner || isAdmin);
    const canDemote = (member) => member.role === ROLES.ADMIN && isOwner;
    const canMakeOwner = (member) => member.role !== ROLES.OWNER && isOwner;
    const canRemove = (member) => member.role !== ROLES.OWNER && isOwner;

    return (
        <main className="members-page" style={{ minHeight: '100vh', position: 'relative' }}>
            <div className="members-container">

                {/* =====================================
                    HEADER
                ====================================== */}
                <header className="members-header">
                    <div>
                        <button
                            type="button"
                            className="button button-ghost button-small"
                            onClick={() => navigate(`/community/${communityId}`)}
                            style={{ marginBottom: '16px' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            Community Dashboard
                        </button>

                        <h1 style={{
                            textTransform: 'none'
                        }}>Members</h1>
                    </div>

                    <div className="members-count-badge">
                        <strong>{members.length}</strong>
                        <span>Total Members</span>
                    </div>
                </header>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {/* =====================================
                    STATE HANDLING & LIST
                ====================================== */}
                {loading ? (
                    <div className="dashboard-loading-state">
                        <div className="spinner"></div>
                        <p>Loading members...</p>
                    </div>
                ) : members.length === 0 ? (
                    <div className="members-empty">
                        <h2>No Members Yet</h2>
                        <p>No members have joined this community yet.</p>
                    </div>
                ) : (
                    <section className="members-list">
                        {members.map((member) => {
                            const memberName = getMemberName(member);
                            const isProcessing = actionLoading && actionMemberId === member._id;

                            return (
                                <article className="member-card" key={member._id}>

                                    <div className="member-profile">
                                        <div className="member-avatar">
                                            {getMemberInitials(memberName)}
                                        </div>

                                        <div className="member-details">
                                            <div className="member-name-row" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginTop: '10px'
                                            }}>
                                                <h2 style={{
                                                    textTransform: 'none',
                                                    margin: 0,
                                                    lineHeight: 1
                                                }}>{memberName}</h2>

                                                <span className={`member-role-badge ${member.role}`}>
                                                    {member.role}
                                                </span>
                                            </div>

                                            <div className="member-meta">
                                                <span>{member.user?.email || 'No email available'}</span>
                                                <span className="meta-divider">•</span>
                                                <span>Joined {formatJoinedDate(member.joinedAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="member-actions">
                                        {canPromote(member) && (
                                            <button
                                                type="button"
                                                className="button button-ghost button-small"
                                                style={{ fontSize: '10px', minHeight: '34px' }}
                                                onClick={() => handlePromote(member._id, memberName)}
                                                disabled={isProcessing}
                                                title="Make Administrator"
                                            >
                                                {isProcessing ? <span className="spinner"></span> : 'Promote'}
                                            </button>
                                        )}

                                        {canDemote(member) && (
                                            <button
                                                type="button"
                                                className="button button-ghost button-small"
                                                style={{ fontSize: '10px', minHeight: '34px' }}
                                                onClick={() => handleDemote(member._id, memberName)}
                                                disabled={isProcessing}
                                                title="Remove Administrator role"
                                            >
                                                {isProcessing ? <span className="spinner"></span> : 'Demote'}
                                            </button>
                                        )}

                                        {canMakeOwner(member) && (
                                            <button
                                                type="button"
                                                className="button button-primary button-small"
                                                style={{ fontSize: '10px', minHeight: '34px' }}
                                                onClick={() => handleMakeOwner(member._id, memberName)}
                                                disabled={isProcessing}
                                                title="Make Owner"
                                            >
                                                {isProcessing ? <span className="spinner"></span> : 'Make Owner'}
                                            </button>
                                        )}

                                        {canRemove(member) && (
                                            <button
                                                type="button"
                                                className="button button-danger button-small"
                                                style={{ fontSize: '10px', minHeight: '34px' }}
                                                onClick={() => handleRemove(member._id, memberName)}
                                                disabled={isProcessing}
                                                title="Remove Member"
                                            >
                                                {isProcessing ? (
                                                    <span className="spinner"></span>
                                                ) : (
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                                    </svg>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                </article>
                            );
                        })}
                    </section>
                )}
            </div>

            {/* =========================================
                CUSTOM INLINE CONFIRMATION MODAL
            ========================================= */}
            {modalConfig.isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    onClick={closeModal}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.78)',
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
                            border: `1px solid ${modalConfig.isDanger ? 'rgba(255, 51, 51, 0.4)' : 'var(--border-light, #2f2f38)'}`,
                            borderRadius: '12px',
                            padding: '28px',
                            boxShadow: modalConfig.isDanger
                                ? '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 24px rgba(255, 51, 51, 0.15)'
                                : '0 20px 40px rgba(0, 0, 0, 0.8)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            animation: 'fadeInScale 0.18s ease-out'
                        }}
                    >
                        <div>
                            <h3
                                style={{
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    letterSpacing: '-0.02em',
                                    margin: 0,
                                    color: modalConfig.isDanger ? 'var(--neon-accent, #ff3333)' : 'var(--text-primary, #ffffff)',
                                    textTransform: 'none'
                                }}
                            >
                                {modalConfig.title}
                            </h3>
                            <p
                                style={{
                                    fontSize: '13px',
                                    lineHeight: 1.6,
                                    color: 'var(--text-secondary, #a1a1aa)',
                                    marginTop: '8px',
                                    marginBottom: 0
                                }}
                            >
                                {modalConfig.message}
                            </p>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '10px',
                                marginTop: '4px'
                            }}
                        >
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={actionLoading}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    background: '#18181b',
                                    color: 'var(--text-secondary, #a1a1aa)',
                                    border: '1px solid var(--border-base, #27272a)',
                                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                                    opacity: actionLoading ? 0.6 : 1,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => modalConfig.onConfirm && modalConfig.onConfirm()}
                                disabled={actionLoading}
                                style={{
                                    padding: '8px 18px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    background: modalConfig.isDanger
                                        ? 'var(--neon-accent, #ff3333)'
                                        : 'var(--text-primary, #ffffff)',
                                    color: modalConfig.isDanger ? '#ffffff' : '#050505',
                                    border: 'none',
                                    boxShadow: modalConfig.isDanger
                                        ? '0 0 14px rgba(255, 51, 51, 0.4)'
                                        : 'none',
                                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {actionLoading ? (
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
                                        Processing...
                                    </>
                                ) : (
                                    modalConfig.confirmLabel
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default Members;