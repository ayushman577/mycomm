function Button({ children, loading = false, ...props }) {
    return (
        <button className="button button-primary" {...props} disabled={loading || props.disabled}>
            {loading && <span className="spinner" aria-hidden="true" />}
            {loading ? 'Please wait...' : children}
        </button>
    );
}

export default Button;