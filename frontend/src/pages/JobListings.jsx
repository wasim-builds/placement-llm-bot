import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_JOBS_URL, handleApiError } from '../config/api';
import { ListSkeleton } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export default function JobListings() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [employmentFilter, setEmploymentFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const toast = useToast();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`${API_JOBS_URL}?active=true`);
            setJobs(res.data);
        } catch (err) {
            const errorMsg = handleApiError(err, 'Failed to load jobs');
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        fetchJobs();
    };

    // Filter jobs
    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
            job.location?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEmployment =
            employmentFilter === 'all' ||
            job.employmentType?.toLowerCase() === employmentFilter.toLowerCase();

        return matchesSearch && matchesEmployment;
    });

    // Sort jobs
    const sortedJobs = [...filteredJobs].sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(b.postedDate) - new Date(a.postedDate);
            case 'title':
                return a.title.localeCompare(b.title);
            case 'salary':
                // Simple salary comparison (would need better parsing in production)
                return (b.salary || '').localeCompare(a.salary || '');
            default:
                return 0;
        }
    });

    // Get unique employment types for filter
    const employmentTypes = ['all', ...new Set(jobs.map(job => job.employmentType).filter(Boolean))];

    return (
        <div className="p-6 md:p-10 space-y-8">
            {/* Header */}
            <div className="space-y-4 animate-fade-in-down">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">
                    Browse Jobs
                </h1>
                <p className="text-slate-400 text-lg">
                    Find your next opportunity • {jobs.length} {jobs.length === 1 ? 'position' : 'positions'} available
                </p>

                {/* Search */}
                <div className="relative max-w-2xl">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by title, skills, location, or description..."
                        className="w-full pl-12 pr-4 py-4 rounded-lg glass-light text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:glow-primary transition-smooth"
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

                {/* Filters and Sort */}
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Employment Type Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Type:</span>
                        <div className="flex flex-wrap gap-2">
                            {employmentTypes.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setEmploymentFilter(type)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${employmentFilter === type
                                            ? 'bg-primary text-white glow-primary'
                                            : 'glass-light text-slate-300 hover:text-white hover:border-primary/50'
                                        }`}
                                >
                                    {type === 'all' ? 'All' : type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm text-slate-400">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 rounded-lg glass-light text-white focus:border-primary focus:outline-none transition-smooth cursor-pointer"
                        >
                            <option value="date">Latest First</option>
                            <option value="title">Title (A-Z)</option>
                            <option value="salary">Salary</option>
                        </select>
                    </div>
                </div>

                {/* Active Filters Summary */}
                {(searchTerm || employmentFilter !== 'all') && (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">
                            Showing {sortedJobs.length} of {jobs.length} jobs
                        </span>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setEmploymentFilter('all');
                            }}
                            className="text-primary hover:text-blue-400 transition-colors flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            {/* Jobs Grid */}
            {loading ? (
                <ListSkeleton count={5} />
            ) : error ? (
                <div className="glass-strong rounded-xl p-12 text-center space-y-4 animate-fade-in-up">
                    <span className="material-symbols-outlined text-red-500 text-6xl mb-4 block">error</span>
                    <h3 className="text-xl font-bold text-white">Failed to Load Jobs</h3>
                    <p className="text-slate-400">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="gradient-primary hover:gradient-primary-hover text-white font-bold py-3 px-6 rounded-lg glow-primary hover-lift transition-smooth inline-flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                        Retry
                    </button>
                </div>
            ) : sortedJobs.length === 0 ? (
                <div className="glass-strong rounded-xl p-12 text-center space-y-4 animate-fade-in-up">
                    <span className="material-symbols-outlined text-slate-600 text-6xl mb-4 block">work_off</span>
                    <h3 className="text-xl font-bold text-white">No Jobs Found</h3>
                    <p className="text-slate-400">
                        {searchTerm || employmentFilter !== 'all'
                            ? 'Try adjusting your filters or search terms'
                            : 'Check back later for new opportunities'}
                    </p>
                    {(searchTerm || employmentFilter !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setEmploymentFilter('all');
                            }}
                            className="glass-light text-slate-300 hover:text-white font-medium py-3 px-6 rounded-lg hover:border-primary transition-smooth inline-flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">filter_alt_off</span>
                            Clear All Filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sortedJobs.map((job, index) => (
                        <div key={job.id} className={`glass-strong rounded-xl p-6 hover-lift card-interactive animate-fade-in-up delay-${(index % 4) * 100} group`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors mb-2">
                                        {job.title}
                                    </h3>
                                    <p className="text-slate-400 line-clamp-3 mb-4">{job.description}</p>
                                </div>
                            </div>

                            {/* Job Details */}
                            <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-400">
                                {job.location && (
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-lg">location_on</span>
                                        {job.location}
                                    </span>
                                )}
                                {job.employmentType && (
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-lg">schedule</span>
                                        {job.employmentType}
                                    </span>
                                )}
                                {job.salary && (
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-lg">payments</span>
                                        {job.salary}
                                    </span>
                                )}
                            </div>

                            {/* Skills */}
                            {job.skills && job.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {job.skills.slice(0, 5).map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {job.skills.length > 5 && (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                                            +{job.skills.length - 5} more
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Posted Date */}
                            <p className="text-xs text-slate-500 mb-4">
                                Posted {new Date(job.postedDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </p>

                            {/* Apply Button */}
                            <Link to={`/jobs/${job.id}`} className="block">
                                <button className="w-full gradient-primary hover:gradient-primary-hover text-white font-bold py-3 px-6 rounded-lg glow-primary hover-lift transition-smooth flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">send</span>
                                    View & Apply
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
