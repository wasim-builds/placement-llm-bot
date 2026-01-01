import { Link } from 'react-router-dom';

export default function Dashboard() {
    return (
        <div className="p-6 md:p-10 space-y-8">
            {/* Welcome Header */}
            <div className="space-y-2 animate-fade-in-down">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">
                    Welcome Back, Alex! 👋
                </h1>
                <p className="text-slate-400 text-lg">
                    Ready for your next interview?
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Interviews */}
                <div className="glass rounded-xl p-6 hover-lift card-interactive animate-fade-in-up glow-primary group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl icon-bounce group-hover:scale-110 transition-transform">
                            video_camera_front
                        </span>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Total
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-bold text-white animate-scale-in delay-100">15</p>
                        <p className="text-sm text-slate-400">Interviews</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>

                {/* Completed */}
                <div className="glass rounded-xl p-6 hover-lift card-interactive animate-fade-in-up delay-100 glow-success group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="material-symbols-outlined text-green-500 text-3xl icon-pulse group-hover:scale-110 transition-transform">
                            check_circle
                        </span>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Completed
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-bold text-white animate-scale-in delay-200">12</p>
                        <p className="text-sm text-slate-400">Sessions</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>

                {/* Average Score */}
                <div className="glass rounded-xl p-6 hover-lift card-interactive animate-fade-in-up delay-200 glow-warning group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="material-symbols-outlined text-yellow-500 text-3xl icon-rotate group-hover:scale-110 transition-transform">
                            star
                        </span>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Avg Score
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-bold text-white animate-scale-in delay-300">85%</p>
                        <p className="text-sm text-slate-400">Performance</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
            </div>

            {/* Recent Interviews */}
            <div className="glass-strong rounded-xl p-6 animate-fade-in-up delay-300">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary icon-pulse">
                        history
                    </span>
                    Recent Interviews
                </h2>

                <div className="space-y-4">
                    {/* Interview 1 */}
                    <div className="glass-light rounded-lg p-5 hover-lift transition-smooth group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center glow-primary">
                                    <span className="material-symbols-outlined text-white text-2xl group-hover:scale-110 transition-transform">
                                        code
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                                        Technical Interview
                                    </h3>
                                    <p className="text-sm text-slate-400">December 30, 2024</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-light border border-green-500/30 glow-success">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow"></span>
                                <span className="text-sm font-medium text-green-400">92%</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-400 ml-15">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">schedule</span>
                                <span>25 minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">quiz</span>
                                <span>8/10 questions</span>
                            </div>
                        </div>
                    </div>

                    {/* Interview 2 */}
                    <div className="glass-light rounded-lg p-5 hover-lift transition-smooth group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg gradient-purple flex items-center justify-center glow-primary">
                                    <span className="material-symbols-outlined text-white text-2xl group-hover:scale-110 transition-transform">
                                        psychology
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                                        Behavioral Interview
                                    </h3>
                                    <p className="text-sm text-slate-400">December 28, 2024</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-light border border-yellow-500/30 glow-warning">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse-slow"></span>
                                <span className="text-sm font-medium text-yellow-400">78%</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-400 ml-15">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">schedule</span>
                                <span>18 minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">quiz</span>
                                <span>6/8 questions</span>
                            </div>
                        </div>
                    </div>

                    {/* Interview 3 */}
                    <div className="glass-light rounded-lg p-5 hover-lift transition-smooth group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center glow-primary">
                                    <span className="material-symbols-outlined text-white text-2xl group-hover:scale-110 transition-transform">
                                        groups
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                                        System Design Interview
                                    </h3>
                                    <p className="text-sm text-slate-400">December 26, 2024</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-light border border-green-500/30 glow-success">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow"></span>
                                <span className="text-sm font-medium text-green-400">88%</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-400 ml-15">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">schedule</span>
                                <span>32 minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">quiz</span>
                                <span>5/6 questions</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Link to="/results">
                    <button className="w-full mt-6 py-3 rounded-lg glass-light text-slate-300 hover:border-primary hover:text-primary hover-glow transition-smooth font-medium">
                        View All Interviews
                    </button>
                </Link>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up delay-400">
                <Link to="/interview">
                    <button className="w-full gradient-primary hover:gradient-primary-hover text-white font-bold py-6 px-8 rounded-xl glow-primary-strong hover-lift btn-ripple transition-smooth flex items-center justify-center gap-3 text-lg animate-glow-pulse">
                        <span className="material-symbols-outlined text-3xl icon-bounce">rocket_launch</span>
                        Start New Interview
                    </button>
                </Link>
                <Link to="/results">
                    <button className="w-full glass-strong border-2 border-primary/30 hover:border-primary text-white font-bold py-6 px-8 rounded-xl hover-lift hover-glow transition-smooth flex items-center justify-center gap-3 text-lg">
                        <span className="material-symbols-outlined text-3xl icon-pulse">bar_chart</span>
                        View All Results
                    </button>
                </Link>
            </div>
        </div>
    );
}
