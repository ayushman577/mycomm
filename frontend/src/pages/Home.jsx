import { Link } from 'react-router-dom';

function Home() {
    return (
        <main className="landing-page">
            <nav className="landing-nav">
                <Link className="brand" to="/">
                    <span className="brand-icon">M</span>
                    <span>MyComm<span style={{ color: 'var(--neon-accent)' }}>.</span></span>
                </Link>
                <div className="nav-actions">
                    <Link className="button button-ghost" to="/login">Sign In</Link>
                    <Link className="button button-primary button-small" to="/register">Get Started</Link>
                </div>
            </nav>
            
            <section className="hero">
                {/* <span className="eyebrow">Next-Generation Community Management</span> */}
                <h1>
                    Your community<br />
                    <em>reimagined!</em>
                </h1>
                <p>
                    Bring your people together in a focused space built for meaningful connections, easy collaboration, and simple community management.
                </p>
                <div className="hero-actions">
                    <Link className="button button-primary" to="/register">
                        Start Building 
                        {/* <span aria-hidden="true" style={{ marginLeft: '0px' }}>→</span> */}
                    </Link>
                    <Link className="button button-ghost" to="/login">
                        Access Dashboard
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default Home;