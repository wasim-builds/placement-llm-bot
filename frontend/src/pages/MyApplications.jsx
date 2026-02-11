import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_APPLICATIONS_URL, handleApiError } from '../config/api';
import { ListSkeleton } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export default function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const toast = useToast();

    // Get user email from localStorage (in production, this would come from auth)
    const userEmail = localStorage.getItem('userEmail') || 'candidate@example.com';

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`${API_APPLICATIONS_URL}/candidate/${encodeURIComponent(userEmail)}`);
            setApplications(res.data);
        } catch (err) {
            const errorMsg = handleApiError(err, 'Failed to load applications');
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        fetchApplications();
    };

    // Filter applications
    const filteredApplications = applications.filter(app => {
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        const matchesSearch =
            app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.candidateName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Sort applications
    const sortedApplications = [...filteredApplications].sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(b.appliedDate) - new Date(a.appliedDate);
            case 'status':
                return a.status.localeCompare(b.status);
            case 'job':
                return (a.jobTitle || '').localeCompare(b.jobTitle || '');
            default:
                return 0;
        }
    });

    // Status tabs
    const statusTabs = [
        { key: 'all', label: 'All', count: applications.length },
        { key: 'pending', label: 'Pending', count: applications.filter(a => a.status === 'pending').length },
        { key: 'interview_scheduled', label: 'Scheduled', count: applications.filter(a => a.status === 'interview_scheduled').length },
        { key: 'interviewed', label: 'Interviewed', count: applications.filter(a => a.status === 'interviewed').length },
        { key: 'shortlisted', label: 'Shortlisted', count: applications.filter(a => a.status === 'shortlisted').length },
        { key: 'rejected', label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { class: 'status-pending', icon: 'schedule', label: 'Pending Review' },
            interview_scheduled: { class: 'status-interview-scheduled', icon: 'event', label: 'Interview Scheduled' },
            interviewed: { class: 'status-interviewed', icon: 'check_circle', label: 'Interviewed' },
            shortlisted: { class: 'status-shortlisted', icon: 'star', label: 'Shortlisted' },
            rejected: { class: 'status-rejected', icon: 'cancel', label: 'Not Selected' },
        };
        const config = statusMap[status] || statusMap.pending;
        return (
            <span className={`status-badge ${config.class} flex items-center gap-1`}>
                <span className="material-symbols-outlined text-xs">{config.icon}</span>
                {config.label}
            </span>
        );
    };

    return (
        <div className="p-6 md:p-10 space-y-8">
            {/* Header */}
            <div className="space-y-4 animate-fade-in-down">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">
                    My Applications
                </h1>
                <p className="text-slate-400 text-lg">
                    Track your job applications • {applications.length} total {applications.length === 1 ? 'application' : 'applications'}
                </p>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2 animate-fade-in-up">
                {statusTabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setStatusFilter(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth flex items-center gap-2 ${statusFilter === tab.key
                                ? 'bg-primary text-white glow-primary'
                                : 'glass-light text-slate-300 hover:text-white hover:border-primary/50'
                            }`}
                    >
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusFilter === tab.key ? 'bg-white/20' : 'bg-slate-700'
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col md:flex-row gap-4 animate-fade-in-up delay-100">
                {/* Search */}
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by job title..."
                        className="w-full pl-12 pr-4 py-3 rounded-lg glass-light text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:glow-primary transition-smooth"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Sort:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-3 rounded-lg glass-light text-white focus:border-primary focus:outline-none transition-smooth cursor-pointer"
                    >
                        <option value="date">Latest First</option>
                        <option value="status">Status</option>
                        <option value="job">Job Title</option>
                    </select>
                </div>
            </div>

            {/* Applications List */}
            {loading ? (
                <ListSkeleton count={5} />
            ) : error ? (
                <div className="glass-strong rounded-xl p-12 text-center space-y-4 animate-fade-in-up">
                    <span className="material-symbols-outlined text-red-500 text-6xl mb-4 block">error</span>
                    <h3 className="text-xl font-bold text-white">Failed to Load Applications</h3>
                    <p className="text-slate-400">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="gradient-primary hover:gradient-primary-hover text-white font-bold py-3 px-6 rounded-lg glow-primary hover-lift transition-smooth inline-flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                        Retry
                    </button>
                </div>
            ) : sortedApplications.length === 0 ? (
                <div className="glass-strong rounded-xl p-12 text-center space-y-4 animate-fade-in-up">
                    <span className="material-symbols-outlined text-slate-600 text-6xl mb-4 block">
                        {statusFilter !== 'all' || searchTerm ? 'filter_alt_off' : 'description'}
                    </span>
                    <h3 className="text-xl font-bold text-white">
                        {statusFilter !== 'all' || searchTerm ? 'No Applications Found' : 'No Applications Yet'}
                    </h3>
                    <p className="text-slate-400">
                        {statusFilter !== 'all' || searchTerm
                            ? 'Try adjusting your filters or search terms'
                            : 'Start applying to jobs to see them here'}
                    </p>
                    {statusFilter !== 'all' || searchTerm ? (
                        <button
                            onClick={() => {
                                setStatusFilter('all');
                                setSearchTerm('');
                            }}
                            className="glass-light text-slate-300 hover:text-white font-medium py-3 px-6 rounded-lg hover:border-primary transition-smooth inline-flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">filter_alt_off</span>
                            Clear Filters
                        </button>
                    ) : (
                        <Link to="/jobs">
                            <button className="gradient-primary hover:gradient-primary-hover text-white font-bold py-3 px-6 rounded-lg glow-primary hover-lift transition-smooth inline-flex items-center gap-2">
                                <span className="material-symbols-outlined">search</span>
                                Browse Jobs
                            </button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedApplications.map((app, index) => (
                        <div
                            key={app.id}
                            className={`glass-strong rounded-xl p-6 hover-lift transition-smooth animate-fade-in-up delay-${(index % 5) * 50} group`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center glow-primary">
                                            <span className="material-symbols-outlined text-white text-2xl">work</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                                                {app.jobTitle || `Job #${app.jobId}`}
                                            </h3>
                                            <p className="text-sm text-slate-400">
                                                Applied {new Date(app.appliedDate).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {getStatusBadge(app.status)}
                            </div>

                            {/* Application Details */}
                            <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-lg">person</span>
                                    {app.candidateName}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-lg">email</span>
                                    {app.candidateEmail}
                                </span>
                                {app.resumeUrl && (
                                    <a
                                        href={app.resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-primary hover:text-blue-400 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">description</span>
                                        View Resume
                                    </a>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Link to={`/jobs/${app.jobId}`} className="flex-1">
                                    <button className="w-full glass-light text-slate-300 hover:text-white font-medium py-2 px-4 rounded-lg hover:border-primary transition-smooth flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-sm">visibility</span>
                                        View Job
                                    </button>
                                </Link>
                                {app.status === 'interview_scheduled' && (
                                    <Link to={`/interview/${app.jobId}/${app.id}`} className="flex-1">
                                        <button className="w-full gradient-primary hover:gradient-primary-hover text-white font-bold py-2 px-4 rounded-lg glow-primary hover-lift transition-smooth flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-sm">videocam</span>
                                            Start Interview
                                        </button>
                                    </Link>
                                )}
                                {app.videoUrl && (
                                    <a href={app.videoUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                                        <button className="w-full glass-light text-primary hover:text-blue-400 font-medium py-2 px-4 rounded-lg hover:border-primary transition-smooth flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-sm">play_circle</span>
                                            Watch Interview
                                        </button>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Results Summary */}
            {!loading && !error && sortedApplications.length > 0 && (
                <div className="text-center text-sm text-slate-500">
                    Showing {sortedApplications.length} of {applications.length} applications
                </div>
            )}
        </div>
    );
}
