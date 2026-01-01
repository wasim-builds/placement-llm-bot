import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

export default function JobPostingForm() {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const isEdit = !!jobId;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        skills: '',
        location: '',
        salary: '',
        employmentType: 'Full-time',
        deadline: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const jobData = {
                ...formData,
                requirements: formData.requirements.split('\n').filter(r => r.trim()),
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
            };

            if (isEdit) {
                await axios.put(`${API_BASE}/jobs/${jobId}`, jobData);
            } else {
                await axios.post(`${API_BASE}/jobs`, jobData);
            }

            navigate('/hr/jobs');
        } catch (error) {
            console.error('Error saving job:', error);
            alert('Failed to save job posting');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto">
            <div className="space-y-2 mb-8 animate-fade-in-down">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">
                    {isEdit ? 'Edit Job Posting' : 'Post New Job'}
                </h1>
                <p className="text-slate-400 text-lg">
                    Fill in the details below
                </p>
            </div>

            <form onSubmit={handleSubmit} className="glass-strong rounded-xl p-8 space-y-6 animate-fade-in-up">
                <div>
                    <label className="block text-white font-medium mb-2">Job Title *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Senior Software Engineer"
                        className="w-full px-4 py-3 rounded-lg glass-light text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:glow-primary transition-smooth"
                    />
                </div>

                <div>
                    <label className="block text-white font-medium mb-2">Job Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="6"
                        placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                        className="w-full px-4 py-3 rounded-lg glass-light text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:glow-primary transition-smooth resize-none"
                    />
                </div>

                <div>
                    <label className="block text-white font-medium mb-2">Requirements (one per line)</label>
                    <textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        rows="5"
                        placeholder="5+ years of experience&#10;Bachelor's degree in Computer Science&#10;Strong problem-solving skills"
                        className="w-full px-4 py-3 rounded-lg glass-light text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:glow-primary transition-smooth resize-none"
                    />
                </div>

                <div>
                    <label className="block text-white font-medium mb-2">Required Skills (comma-separated)</label>
                    <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="React, Node.js, MongoDB, AWS"
                        className="w-full px-4 py-3 rounded-lg glass-light text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:glow-primary transition-smooth"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-white font-medium mb-2">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g., Remote, New York, Hybrid"
                            className="w-full px-4 py-3 rounded-lg glass-light text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:glow-primary transition-smooth"
                        />
                    </div>

                    <div>
                        <label className="block text-white font-medium mb-2">Salary Range</label>
                        <input
                            type="text"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            placeholder="e.g., $100k - $150k"
                            className="w-full px-4 py-3 rounded-lg glass-light text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:glow-primary transition-smooth"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-white font-medium mb-2">Employment Type</label>
                        <select
                            name="employmentType"
                            value={formData.employmentType}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg glass-light text-white focus:border-primary focus:outline-none focus:glow-primary transition-smooth cursor-pointer"
                        >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-white font-medium mb-2">Application Deadline</label>
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg glass-light text-white focus:border-primary focus:outline-none focus:glow-primary transition-smooth"
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 gradient-primary hover:gradient-primary-hover text-white font-bold py-4 px-8 rounded-lg glow-primary-strong hover-lift transition-smooth flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">check_circle</span>
                                {isEdit ? 'Update Job' : 'Post Job'}
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/hr/jobs')}
                        className="px-8 py-4 rounded-lg glass-light border border-slate-600 text-slate-300 hover:border-primary hover:text-primary hover-glow transition-smooth font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
