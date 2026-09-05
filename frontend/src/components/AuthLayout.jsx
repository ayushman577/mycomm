import { Link } from 'react-router-dom';

function AuthLayout({ eyebrow, title, description, children, footer, alert, success }) {
    return (
        <main className="auth-page">
            <section className="auth-card">
                <Link className="brand" to="/">
                    <span className="brand-icon">M</span>
                    <span>MyComm<span style={{ color: 'var(--neon-accent)' }}>.</span></span>
                </Link>
                <div className="auth-heading">
                    <span className="eyebrow">{eyebrow}</span>
                    <h1>{title}</h1>
                    <p>{description}</p>
                </div>
                {alert && <div className="alert alert-error" role="alert">{alert}</div>}
                {success && <div className="alert alert-success" role="status">{success}</div>}
                {children}
                {footer && <div className="auth-footer">{footer}</div>}
            </section>
        </main>
    );
}

export default AuthLayout;