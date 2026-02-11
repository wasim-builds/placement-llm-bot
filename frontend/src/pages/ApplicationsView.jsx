import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer';

const API_BASE = 'http://localhost:5002/api';

export default function ApplicationsView() {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [selectedScores, setSelectedScores] = useState(null);

    useEffect(() => {
        fetchJobAndApplications();
    }, [jobId]);

    const fetchJobAndApplications = async () => {
        try {
            const [jobRes, appsRes] = await Promise.all([
                axios.get(`${API_BASE}/jobs/${jobId}`),
                axios.get(`${API_BASE}/applications/job/${jobId}`)
            ]);
            setJob(jobRes.data);
            setApplications(appsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (applicationId, status) => {
        try {
            await axios.put(`${API_BASE}/applications/${applicationId}/status`, { status });
            fetchJobAndApplications();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
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

    if (loading) {
        return (
            <div className="p-6 md:p-10 flex items-center justify-center min-h-screen">
                <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 space-y-8">
            {/* Header */}
            <div className="space-y-2 animate-fade-in-down">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">
                    {job?.title}
                </h1>
                <p className="text-slate-400 text-lg">
                    {applications.length} Application{applications.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Applications List */}
            {applications.length === 0 ? (
                <div className="glass-strong rounded-xl p-12 text-center">
                    <span className="material-symbols-outlined text-slate-600 text-6xl mb-4 block">inbox</span>
                    <p className="text-slate-400 text-lg">No applications yet</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {applications.map((app, index) => (
                        <div key={app.id} className={`glass-strong rounded-xl p-6 animate-fade-in-up delay-${index * 100}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-white mb-1">{app.candidateName}</h3>
                                    <p className="text-slate-400 mb-2">{app.candidateEmail}</p>
                                    <p className="text-sm text-slate-500">Applied: {new Date(app.appliedDate).toLocaleDateString()}</p>
                                </div>
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full glass-light border ${getStatusColor(app.status)}`}>
                                    <span className="text-sm font-medium capitalize">{app.status.replace('_', ' ')}</span>
                                </div>
                            </div>

                            {/* Interview Results */}
                            {app.interviewResult && (
                                <div className="glass-light rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">analytics</span>
                                            Interview Score
                                        </h4>
                                        <span className="text-3xl font-bold text-green-400">{app.interviewResult.overallScore}%</span>
                                    </div>
                                    {app.interviewResult.scores && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {Object.entries(app.interviewResult.scores).map(([key, value]) => (
                                                <div key={key} className="text-center">
                                                    <p className="text-2xl font-bold text-white">{value}%</p>
                                                    <p className="text-xs text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3">
                                <a
                                    href={`http://localhost:5002${app.resumeUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="glass-light border border-primary/30 hover:border-primary text-slate-300 hover:text-primary font-medium py-2 px-4 rounded-lg hover-glow transition-smooth flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">description</span>
                                    View Resume
                                </a>

                                {app.videoUrl && (
                                    <button
                                        onClick={() => setSelectedVideo(app.id)}
                                        className="gradient-primary hover:gradient-primary-hover text-white font-medium py-2 px-4 rounded-lg hover-lift transition-smooth flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">play_circle</span>
                                        Watch Interview
                                    </button>
                                )}

                                {app.interviewResult && (
                                    <button
                                        onClick={() => setSelectedScores(app.interviewResult)}
                                        className="glass-light border border-blue-500/30 hover:border-blue-500 text-slate-300 hover:text-blue-400 font-medium py-2 px-4 rounded-lg hover-glow transition-smooth flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">bar_chart</span>
                                        View Details
                                    </button>
                                )}

                                {app.status !== 'shortlisted' && (
                                    <button
                                        onClick={() => updateStatus(app.id, 'shortlisted')}
                                        className="glass-light border border-green-500/30 hover:border-green-500 text-slate-300 hover:text-green-400 font-medium py-2 px-4 rounded-lg hover-glow transition-smooth flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">check_circle</span>
                                        Shortlist
                                    </button>
                                )}

                                {app.status !== 'rejected' && (
                                    <button
                                        onClick={() => updateStatus(app.id, 'rejected')}
                                        className="glass-light border border-red-500/30 hover:border-red-500 text-slate-300 hover:text-red-400 font-medium py-2 px-4 rounded-lg hover-glow transition-smooth flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">cancel</span>
                                        Reject
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Video Player Modal */}
            {selectedVideo && (
                <VideoPlayer
                    applicationId={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}

            {/* Score Details Modal */}
            {selectedScores && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6" onClick={() => setSelectedScores(null)}>
                    <div className="max-w-2xl w-full glass-strong rounded-2xl p-8 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Interview Details</h2>
                            <button
                                onClick={() => setSelectedScores(null)}
                                className="w-10 h-10 rounded-lg glass-light hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-smooth flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="text-center p-6 glass-light rounded-xl">
                                <p className="text-slate-400 mb-2">Overall Score</p>
                                <p className="text-5xl font-bold text-green-400">{selectedScores.overallScore}%</p>
                            </div>
                            {selectedScores.scores && Object.entries(selectedScores.scores).map(([key, value]) => (
                                <div key={key} className="glass-light rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <span className="text-xl font-bold text-white">{value}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full gradient-primary transition-all duration-500"
                                            style={{ width: `${value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
