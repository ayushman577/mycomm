import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function NotFound({ 
    statusCode = '404', 
    title = 'Page not found', 
    description = "The route you're looking for doesn't exist, has been relocated, or the request was malformed." 
}) {
    const navigate = useNavigate();
    const [isPrimaryHovered, setIsPrimaryHovered] = useState(false);
    const [isGhostHovered, setIsGhostHovered] = useState(false);

    return (
        <main
            style={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--bg-base, #050505)',
                backgroundImage: 'var(--bg-gradient, radial-gradient(circle at 50% 0%, #1a1a24 0%, #050505 60%, #000000 100%))',
                backgroundAttachment: 'fixed',
                padding: '24px',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Subtle background ambient neon glow */}
            <div
                style={{
                    position: 'absolute',
                    top: '20%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '320px',
                    height: '320px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 51, 51, 0.12) 0%, rgba(0, 0, 0, 0) 70%)',
                    filter: 'blur(40px)',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />

            {/* Central Card Container */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: '520px',
                    width: '100%',
                    background: 'linear-gradient(145deg, #121216 0%, #08080a 100%)',
                    border: '1px solid var(--border-light, #23252e)',
                    borderRadius: '16px',
                    padding: '48px 36px',
                    textAlign: 'center',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(255, 51, 51, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxSizing: 'border-box'
                }}
            >
                {/* Top Neon Status Pill */}
                

                {/* Massive Bricolage Headline Code */}
                <div
                    style={{
                        fontFamily: "var(--font-head, 'Bricolage Grotesque', sans-serif)",
                        fontSize: 'clamp(72px, 12vw, 110px)',
                        fontWeight: 650,
                        lineHeight: 0.9,
                        letterSpacing: '-0.025em',
                        color: 'var(--neon-accent, #ff3333)',
                        textShadow: 'var(--neon-glow, 0 0 16px rgba(255, 51, 51, 0.45), 0 0 32px rgba(255, 51, 51, 0.2))',
                        marginBottom: '14px',
                        userSelect: 'none'
                    }}
                >
                    {statusCode}
                </div>

                {/* Heading */}
                <h1
                    style={{
                        fontFamily: "var(--font-head, 'Bricolage Grotesque', sans-serif)",
                        fontSize: '24px',
                        fontWeight: 700,
                        letterSpacing: '-0.03em',
                        color: 'var(--text-primary, #ffffff)',
                        margin: '0 0 12px 0',
                        textTransform: 'none'
                    }}
                >
                    {title}
                </h1>

                {/* Description */}
                <p
                    style={{
                        fontFamily: "var(--font-body, 'Geist', sans-serif)",
                        color: 'var(--text-secondary, #a1a1aa)',
                        fontSize: '14px',
                        lineHeight: 1.6,
                        margin: '0 0 32px 0',
                        maxWidth: '400px'
                    }}
                >
                    {description}
                </p>

                {/* Action Controls */}
                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        width: '100%',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}
                >
                    {/* Return Back Button */}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        onMouseEnter={() => setIsGhostHovered(true)}
                        onMouseLeave={() => setIsGhostHovered(false)}
                        style={{
                            flex: 1,
                            minWidth: '140px',
                            padding: '12px 18px',
                            borderRadius: '8px',
                            border: `1px solid ${isGhostHovered ? '#3f4252' : '#23252d'}`,
                            background: isGhostHovered ? '#14151a' : 'transparent',
                            color: isGhostHovered ? '#ffffff' : '#d1d5db',
                            fontSize: '13px',
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease',
                            fontFamily: "var(--font-body, 'Geist', sans-serif)"
                        }}
                    >
                        <span style={{ fontSize: '15px', lineHeight: 1 }}>←</span>
                        Go Back
                    </button>

                    {/* Return Home Button */}
                    <Link
                        to="/"
                        onMouseEnter={() => setIsPrimaryHovered(true)}
                        onMouseLeave={() => setIsPrimaryHovered(false)}
                        style={{
                            flex: 1,
                            minWidth: '140px',
                            padding: '12px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'var(--neon-accent, #ff3333)',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: isPrimaryHovered
                                ? '0 0 20px rgba(255, 51, 51, 0.6)'
                                : '0 0 14px rgba(255, 51, 51, 0.35)',
                            transform: isPrimaryHovered ? 'translateY(-1px)' : 'none',
                            transition: 'all 0.2s ease',
                            fontFamily: "var(--font-body, 'Geist', sans-serif)"
                        }}
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default NotFound;