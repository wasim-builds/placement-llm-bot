import { Component } from 'react';

// Error boundary component to catch React errors gracefully
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleReportIssue = () => {
        const errorDetails = `
Error: ${this.state.error?.toString()}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
        `.trim();

        // In production, this could send to an error tracking service
        console.log('Error Report:', errorDetails);
        alert('Error details have been logged. Please contact support if the issue persists.');
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-6">
                    <div className="glass-strong rounded-xl p-8 max-w-2xl w-full space-y-6 animate-fade-in-up">
                        {/* Error Icon */}
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center glow-danger">
                                <span className="material-symbols-outlined text-red-500 text-5xl">
                                    error
                                </span>
                            </div>
                        </div>

                        {/* Error Message */}
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold text-white">
                                Oops! Something went wrong
                            </h1>
                            <p className="text-slate-400 text-lg">
                                We encountered an unexpected error. Don't worry, your data is safe.
                            </p>
                        </div>

                        {/* Error Details (Development) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="glass-light rounded-lg p-4 space-y-2">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Error Details (Development Only)
                                </p>
                                <pre className="text-xs text-red-400 overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                </pre>
                                {this.state.error.stack && (
                                    <pre className="text-xs text-slate-500 overflow-auto max-h-40">
                                        {this.state.error.stack}
                                    </pre>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={this.handleReload}
                                className="flex-1 gradient-primary hover:gradient-primary-hover text-white font-bold py-3 px-6 rounded-lg glow-primary hover-lift transition-smooth flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">refresh</span>
                                Reload Page
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="flex-1 glass-strong border-2 border-primary/30 hover:border-primary text-white font-bold py-3 px-6 rounded-lg hover-lift hover-glow transition-smooth flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">home</span>
                                Go Home
                            </button>
                            <button
                                onClick={this.handleReportIssue}
                                className="flex-1 glass-light text-slate-300 hover:text-white font-medium py-3 px-6 rounded-lg hover:border-slate-600 transition-smooth flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">bug_report</span>
                                Report Issue
                            </button>
                        </div>

                        {/* Help Text */}
                        <p className="text-center text-sm text-slate-500">
                            If this problem persists, try clearing your browser cache or contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
