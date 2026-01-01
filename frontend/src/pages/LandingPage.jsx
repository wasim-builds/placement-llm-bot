import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background-dark text-white">
            {/* Hero Section - Placeholder */}
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h1 className="text-5xl font-black mb-6">Welcome to Placement Prep AI</h1>
                <p className="text-xl text-slate-400 mb-8">Master your interview skills with AI-powered practice</p>
                <Link
                    to="/dashboard"
                    className="inline-block px-8 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-primary/30 transition-colors"
                >
                    Get Started
                </Link>
            </div>
        </div>
    );
}
