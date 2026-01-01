import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

export default function HRDashboard() {
    const [stats, setStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        pendingReviews: 0,
        shortlisted: 0
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchRecentApplications();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_BASE}/applications/stats/hr`);
            setStats(res.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchRecentApplications = async () => {
        try {
            const jobsRes = await axios.get(`${API_BASE}/jobs/hr/all`);
            const jobs = jobsRes.data;

            // Get applications for all jobs
            const allApplications = [];
            for (const job of jobs.slice(0, 3)) { // Get recent 3 jobs
                const appsRes = await axios.get(`${API_BASE}/applications/job/${job.id}`);
                const apps = appsRes.data.map(app => ({ ...app, job }));
                allApplications.push(...apps);
            }

            // Sort by date and take recent 5
            allApplications.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
            setRecentApplications(allApplications.slice(0, 5));
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'shortlisted': return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'interviewed': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
            case 'rejected': return 'text-red-400 bg-red-500/20 border-red-500/30';
            default: return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
        }
    };

    return (
        <div className="p-6 md:p-10 space-y-8">
            {/* Header */}
            <div className="space-y-2 animate-fade-in-down">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">
                    HR Dashboard
                </h1>
                <p className="text-slate-400 text-lg">
                    Manage jobs and review candidates
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="glass rounded-xl p-6 hover-lift card-interactive animate-fade-in-up glow-primary group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl icon-bounce group-hover:scale-110 transition-transform">
                            work
                        </span>
                    </div>
                    <p className="text-4xl font-bold text-white animate-scale-in">{stats.totalJobs}</p>
                    <p className="text-sm text-slate-400">Total Jobs</p>
                </div>

                <div className="glass rounded-xl p-6 hover-lift card-interactive animate-fade-in-up delay-100 glow-success group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="material-symbols-outlined text-green-500 text-3xl icon-pulse group-hover:scale-110 transition-transform">
                            check_circle
                        </span>
                    </div>
                    <p className="text-4xl font-bold text-white animate-scale-in delay-100">{stats.activeJobs}</p>
                    <p className="text-sm text-slate-400">Active Jobs</p>
                </div>

                <div className="glass rounded-xl p-6 hover-lift card-interactive animate-fade-in-up delay-200 glow-primary group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="material-symbols-outlined text-blue-500 text-3xl icon-rotate group-hover:scale-110 transition-transform">
                            description
                        </span>
                    </div>
                    <p className="text-4xl font-bold text-white animate-scale-in delay-200">{stats.totalApplications}</p>
                    <p className="text-sm text-slate-400">Applications</p>
                </div>

                <div className="glass rounded-xl p-6 hover-lift card-interactive animate-fade-in-up delay-300 glow-warning group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="material-symbols-outlined text-yellow-500 text-3xl icon-pulse group-hover:scale-110 transition-transform">
                            pending
                        </span>
                    </div>
                    <p className="text-4xl font-bold text-white animate-scale-in delay-300">{stats.pendingReviews}</p>
                    <p className="text-sm text-slate-400">Pending Reviews</p>
                </div>

                <div className="glass rounded-xl p-6 hover-lift card-interactive animate-fade-in-up delay-400 glow-success group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="material-symbols-outlined text-green-500 text-3xl icon-bounce group-hover:scale-110 transition-transform">
                            star
                        </span>
                    </div>
                    <p className="text-4xl font-bold text-white animate-scale-in delay-400">{stats.shortlisted}</p>
                    <p className="text-sm text-slate-400">Shortlisted</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up delay-500">
                <Link to="/hr/post-job">
                    <button className="w-full gradient-primary hover:gradient-primary-hover text-white font-bold py-6 px-8 rounded-xl glow-primary-strong hover-lift transition-smooth flex items-center justify-center gap-3 text-lg">
                        <span className="material-symbols-outlined text-3xl">add_circle</span>
                        Post New Job
                    </button>
                </Link>
                <Link to="/hr/jobs">
                    <button className="w-full glass-strong border-2 border-primary/30 hover:border-primary text-white font-bold py-6 px-8 rounded-xl hover-lift hover-glow transition-smooth flex items-center justify-center gap-3 text-lg">
                        <span className="material-symbols-outlined text-3xl">list_alt</span>
                        View All Jobs
                    </button>
                </Link>
            </div>

            {/* Recent Applications */}
            <div className="glass-strong rounded-xl p-6 animate-fade-in-up delay-600">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary icon-pulse">
                        recent_actors
                    </span>
                    Recent Applications
                </h2>

                {loading ? (
                    <div className="text-center py-8">
                        <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
                    </div>
                ) : recentApplications.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        No applications yet
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentApplications.map((app) => (
                            <div key={app.id} className="glass-light rounded-lg p-5 hover-lift transition-smooth group">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                                            {app.candidateName}
                                        </h3>
                                        <p className="text-sm text-slate-400">{app.candidateEmail}</p>
                                        <p className="text-sm text-primary mt-1">{app.job?.title}</p>
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full glass-light border ${getStatusColor(app.status)}`}>
                                        <span className="text-sm font-medium capitalize">{app.status.replace('_', ' ')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                    <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
                                    {app.interviewResult && (
                                        <span className="text-green-400">Score: {app.interviewResult.overallScore}%</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
