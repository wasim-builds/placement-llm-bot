import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

export default function JobListings() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await axios.get(`${API_BASE}/jobs?active=true`);
            setJobs(res.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 md:p-10 space-y-8">
            {/* Header */}
            <div className="space-y-4 animate-fade-in-down">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">
                    Browse Jobs
                </h1>
                <p className="text-slate-400 text-lg">
                    Find your next opportunity
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
                        placeholder="Search by title, skills, or description..."
                        className="w-full pl-12 pr-4 py-4 rounded-lg glass-light text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:glow-primary transition-smooth"
                    />
                </div>
            </div>

            {/* Jobs Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="glass-strong rounded-xl p-12 text-center">
                    <span className="material-symbols-outlined text-slate-600 text-6xl mb-4 block">work_off</span>
                    <p className="text-slate-400 text-lg">No jobs found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredJobs.map((job, index) => (
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
                                Posted {new Date(job.postedDate).toLocaleDateString()}
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
