import React from 'react';

function CommunityCard({
    name = "Unnamed Community",
    description = "No description provided for this community.",
    code = "------",
    role = "Member",
    onClick
}) {
    return (
        <button 
            className="community-card" 
            onClick={onClick}
            type="button"
            aria-label={`Open ${name} dashboard`}
        >
            <div className="community-card-header">
                <div className="community-title-wrap">
                    <div className="community-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                            <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                            <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                            <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                        </svg>
                    </div>
                    <h3>{name}</h3>
                </div>

                <span className={`community-role ${role.toLowerCase()}`}>
                    {role}
                </span>
            </div>

            <p className="community-description">
                {description}
            </p>

            <div className="community-card-footer">
                <div className="community-code">
                    <span className="code-label">Access Code</span>
                    <strong className="code-value">{code}</strong>
                </div>
                
                <div className="community-action">
                    <span>Enter</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </button>
    );
}

export default CommunityCard;