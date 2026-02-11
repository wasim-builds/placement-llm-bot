import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5002/api';

export default function HRJobsList() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await axios.get(`${API_BASE}/jobs/hr/all`);
            setJobs(res.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (jobId) => {
        if (!confirm('Are you sure you want to delete this job?')) return;

        try {
            await axios.delete(`${API_BASE}/jobs/${jobId}`);
            fetchJobs();
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Failed to delete job');
        }
    };

    const toggleStatus = async (job) => {
        try {
            const newStatus = job.status === 'active' ? 'closed' : 'active';
            await axios.put(`${API_BASE}/jobs/${job.id}`, { ...job, status: newStatus });
            fetchJobs();
        } catch (error) {
            console.error('Error updating job status:', error);
        }
    };

    return (
        <div className="p-6 md:p-10 space-y-8">
            <div className="flex items-center justify-between animate-fade-in-down">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">
                        My Job Postings
                    </h1>
                    <p className="text-slate-400 text-lg mt-2">
                        Manage all your job listings
                    </p>
                </div>
                <Link to="/hr/post-job">
                    <button className="gradient-primary hover:gradient-primary-hover text-white font-bold py-3 px-6 rounded-lg glow-primary hover-lift transition-smooth flex items-center gap-2">
                        <span className="material-symbols-outlined">add</span>
                        Post New Job
                    </button>
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                </div>
            ) : jobs.length === 0 ? (
                <div className="glass-strong rounded-xl p-12 text-center animate-fade-in-up">
                    <span className="material-symbols-outlined text-slate-600 text-6xl mb-4 block">work_off</span>
                    <p className="text-slate-400 text-lg mb-6">No jobs posted yet</p>
                    <Link to="/hr/post-job">
                        <button className="gradient-primary hover:gradient-primary-hover text-white font-bold py-3 px-8 rounded-lg glow-primary hover-lift transition-smooth">
                            Post Your First Job
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {jobs.map((job, index) => (
                        <div key={job.id} className={`glass-strong rounded-xl p-6 hover-lift card-interactive animate-fade-in-up delay-${index * 100}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-bold text-white">{job.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.status === 'active'
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                                            }`}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 line-clamp-2 mb-3">{job.description}</p>
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
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
                                </div>
                            </div>

                            <div className="flex items-center gap-6 mb-4 text-sm">
                                <div className="flex items-center gap-2 text-blue-400">
                                    <span className="material-symbols-outlined text-lg">description</span>
                                    <span>{job.applicationCount || 0} Applications</span>
                                </div>
                                <div className="flex items-center gap-2 text-yellow-400">
                                    <span className="material-symbols-outlined text-lg">pending</span>
                                    <span>{job.interviewedCount || 0} Interviewed</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-400">
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                    <span>{job.shortlistedCount || 0} Shortlisted</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Link to={`/hr/jobs/${job.id}/applications`} className="flex-1">
                                    <button className="w-full gradient-primary hover:gradient-primary-hover text-white font-medium py-3 px-4 rounded-lg hover-lift transition-smooth flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">group</span>
                                        View Applications
                                    </button>
                                </Link>
                                <Link to={`/hr/jobs/${job.id}/edit`}>
                                    <button className="glass-light border border-primary/30 hover:border-primary text-slate-300 hover:text-primary font-medium py-3 px-4 rounded-lg hover-glow transition-smooth flex items-center gap-2">
                                        <span className="material-symbols-outlined">edit</span>
                                        Edit
                                    </button>
                                </Link>
                                <button
                                    onClick={() => toggleStatus(job)}
                                    className="glass-light border border-slate-600 hover:border-yellow-500 text-slate-300 hover:text-yellow-400 font-medium py-3 px-4 rounded-lg hover-glow transition-smooth flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">
                                        {job.status === 'active' ? 'pause_circle' : 'play_circle'}
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleDelete(job.id)}
                                    className="glass-light border border-slate-600 hover:border-red-500 text-slate-300 hover:text-red-400 font-medium py-3 px-4 rounded-lg hover-glow transition-smooth flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
