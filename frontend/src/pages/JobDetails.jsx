import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import axios from 'axios';

const API_BASE = 'http://localhost:5002/api';

export default function JobDetails() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { userEmail } = useRole();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [formData, setFormData] = useState({
        name: localStorage.getItem('userName') || '',
        email: userEmail,
        resume: null
    });

    useEffect(() => {
        fetchJob();
    }, [jobId]);

    const fetchJob = async () => {
        try {
            const res = await axios.get(`${API_BASE}/jobs/${jobId}`);
            setJob(res.data);
        } catch (error) {
            console.error('Error fetching job:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, resume: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.resume) {
            alert('Please upload your resume');
            return;
        }

        setApplying(true);
        try {
            const data = new FormData();
            data.append('jobId', jobId);
            data.append('candidateName', formData.name);
            data.append('candidateEmail', formData.email);
            data.append('resume', formData.resume);

            await axios.post(`${API_BASE}/applications`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Application submitted successfully!');
            navigate('/my-applications');
        } catch (error) {
            console.error('Error submitting application:', error);
            alert(error.response?.data?.error || 'Failed to submit application');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 md:p-10 flex items-center justify-center min-h-screen">
                <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="p-6 md:p-10">
                <div className="glass-strong rounded-xl p-12 text-center">
                    <span className="material-symbols-outlined text-slate-600 text-6xl mb-4 block">error</span>
                    <p className="text-slate-400 text-lg">Job not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="glass-strong rounded-xl p-8 animate-fade-in-down">
                <h1 className="text-4xl font-bold text-white mb-4">{job.title}</h1>
                <div className="flex flex-wrap gap-4 text-slate-400 mb-6">
                    {job.location && (
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined">location_on</span>
                            {job.location}
                        </span>
                    )}
                    {job.employmentType && (
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined">schedule</span>
                            {job.employmentType}
                        </span>
                    )}
                    {job.salary && (
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined">payments</span>
                            {job.salary}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setShowApplicationForm(true)}
                    className="w-full md:w-auto gradient-primary hover:gradient-primary-hover text-white font-bold py-4 px-8 rounded-lg glow-primary-strong hover-lift transition-smooth flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">send</span>
                    Apply Now
                </button>
            </div>

            {/* Description */}
            <div className="glass-strong rounded-xl p-8 animate-fade-in-up delay-100">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    Job Description
                </h2>
                <p className="text-slate-300 whitespace-pre-line">{job.description}</p>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
                <div className="glass-strong rounded-xl p-8 animate-fade-in-up delay-200">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">checklist</span>
                        Requirements
                    </h2>
                    <ul className="space-y-2">
                        {job.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-300">
                                <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                                {req}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
                <div className="glass-strong rounded-xl p-8 animate-fade-in-up delay-300">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">psychology</span>
                        Required Skills
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {job.skills.map((skill, i) => (
                            <span
                                key={i}
                                className="px-4 py-2 rounded-lg glass-light border border-primary/30 text-primary font-medium hover-lift transition-smooth"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Application Form Modal */}
            {showApplicationForm && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6" onClick={() => setShowApplicationForm(false)}>
                    <div className="max-w-2xl w-full glass-strong rounded-2xl p-8 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Apply for {job.title}</h2>
                            <button
                                onClick={() => setShowApplicationForm(false)}
                                className="w-10 h-10 rounded-lg glass-light hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-smooth flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-white font-medium mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-lg glass-light text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:glow-primary transition-smooth"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-medium mb-2">Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-lg glass-light text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:glow-primary transition-smooth"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-medium mb-2">Resume (PDF) *</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg glass-light text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:cursor-pointer hover:file:bg-blue-600 transition-smooth"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={applying}
                                className="w-full gradient-primary hover:gradient-primary-hover text-white font-bold py-4 px-8 rounded-lg glow-primary-strong hover-lift transition-smooth flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {applying ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">send</span>
                                        Submit Application
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
