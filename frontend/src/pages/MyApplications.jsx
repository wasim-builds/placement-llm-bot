import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

export default function MyApplications() {
    const { userEmail } = useRole();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userEmail) {
            fetchApplications();
        }
    }, [userEmail]);

    const fetchApplications = async () => {
        try {
            const res = await axios.get(`${API_BASE}/applications/candidate/${userEmail}`);
            setApplications(res.data);
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

    const canTakeInterview = (app) => {
        return app.status === 'pending' && !app.interviewResult;
    };

    return (
        <div className="p-6 md:p-10 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between animate-fade-in-down">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">
                        My Applications
                    </h1>
                    <p className="text-slate-400 text-lg mt-2">
                        Track your job applications
                    </p>
                </div>
                <Link to="/jobs">
                    <button className="gradient-primary hover:gradient-primary-hover text-white font-bold py-3 px-6 rounded-lg glow-primary hover-lift transition-smooth flex items-center gap-2">
                        <span className="material-symbols-outlined">search</span>
                        Browse Jobs
                    </button>
                </Link>
            </div>

            {/* Applications List */}
            {loading ? (
                <div className="text-center py-12">
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                </div>
            ) : applications.length === 0 ? (
                <div className="glass-strong rounded-xl p-12 text-center">
                    <span className="material-symbols-outlined text-slate-600 text-6xl mb-4 block">inbox</span>
                    <p className="text-slate-400 text-lg mb-6">No applications yet</p>
                    <Link to="/jobs">
                        <button className="gradient-primary hover:gradient-primary-hover text-white font-bold py-3 px-8 rounded-lg glow-primary hover-lift transition-smooth">
                            Browse Jobs
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {applications.map((app, index) => (
                        <div key={app.id} className={`glass-strong rounded-xl p-6 animate-fade-in-up delay-${index * 100}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-white mb-2">{app.job?.title}</h3>
                                    <p className="text-slate-400 line-clamp-2 mb-3">{app.job?.description}</p>
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                        {app.job?.location && (
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-lg">location_on</span>
                                                {app.job.location}
                                            </span>
                                        )}
                                        {app.job?.employmentType && (
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-lg">schedule</span>
                                                {app.job.employmentType}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-lg">calendar_today</span>
                                            Applied {new Date(app.appliedDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full glass-light border ${getStatusColor(app.status)}`}>
                                    <span className="text-sm font-medium capitalize">{app.status.replace('_', ' ')}</span>
                                </div>
                            </div>

                            {/* Interview Score */}
                            {app.interviewResult && (
                                <div className="glass-light rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">analytics</span>
                                            Interview Score
                                        </h4>
                                        <span className="text-3xl font-bold text-green-400">{app.interviewResult.overallScore}%</span>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3">
                                {canTakeInterview(app) && (
                                    <Link to={`/interview/${app.jobId}/${app.id}`} className="flex-1">
                                        <button className="w-full gradient-primary hover:gradient-primary-hover text-white font-bold py-3 px-6 rounded-lg glow-primary-strong hover-lift transition-smooth flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined">videocam</span>
                                            Take Interview
                                        </button>
                                    </Link>
                                )}

                                <Link to={`/jobs/${app.jobId}`}>
                                    <button className="glass-light border border-primary/30 hover:border-primary text-slate-300 hover:text-primary font-medium py-3 px-6 rounded-lg hover-glow transition-smooth flex items-center gap-2">
                                        <span className="material-symbols-outlined">visibility</span>
                                        View Job
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
