import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleClearData = () => {
        localStorage.clear();
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: '#0f172a',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: '#f1f5f9', fontFamily: 'system-ui, sans-serif'
                }}>
                    <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Something went wrong</h1>
                    <p style={{ color: '#94a3b8', marginBottom: '32px' }}>The application encountered an unexpected error.</p>
                    <button
                        onClick={this.handleClearData}
                        style={{
                            background: '#38bdf8', color: '#0f172a', border: 'none',
                            padding: '12px 24px', borderRadius: '8px', fontSize: '16px',
                            fontWeight: 'bold', cursor: 'pointer'
                        }}
                    >
                        Clear Data & Reload
                    </button>
                    <p style={{ marginTop: '20px', fontSize: '12px', color: '#64748b' }}>
                        This will reset your local settings and login.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
