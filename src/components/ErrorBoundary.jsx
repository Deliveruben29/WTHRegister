import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '2rem',
                    margin: '2rem',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    color: 'black',
                    border: '2px solid red',
                    zIndex: 9999,
                    position: 'relative'
                }}>
                    <h1>Something went wrong.</h1>
                    <p>Please report this error.</p>
                    <pre style={{ color: 'red', overflow: 'auto', maxHeight: '200px' }}>
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <button onClick={() => window.location.reload()} style={{ padding: '1rem', marginTop: '1rem' }}>
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
