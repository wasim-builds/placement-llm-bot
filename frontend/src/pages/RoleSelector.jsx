import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

export default function RoleSelector() {
    const navigate = useNavigate();
    const { setUserRole, setEmail } = useRole();
    const [selectedRole, setSelectedRole] = useState(null);
    const [email, setEmailInput] = useState('');
    const [name, setName] = useState('');

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
    };

    const handleContinue = () => {
        if (!selectedRole || !email || !name) {
            alert('Please fill in all fields');
            return;
        }

        setUserRole(selectedRole);
        setEmail(email);
        localStorage.setItem('userName', name);

        // Navigate to appropriate dashboard
        if (selectedRole === 'hr') {
            navigate('/hr/dashboard');
        } else {
            navigate('/jobs');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#111418] to-[#0a0e27] flex items-center justify-center p-6">
            {/* Ambient glow effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>

            <div className="max-w-4xl w-full glass-strong rounded-2xl p-8 md:p-12 relative z-10 animate-fade-in-up">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">
                        Welcome to Placement Prep AI
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Select your role to get started
                    </p>
                </div>

                {/* Role Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* HR Card */}
                    <button
                        onClick={() => handleRoleSelect('hr')}
                        className={`p-8 rounded-xl transition-all duration-300 ${
                            selectedRole === 'hr'
                                ? 'glass-strong border-2 border-primary glow-primary scale-105'
                                : 'glass-light hover:glass-strong hover-lift'
                        }`}
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                                selectedRole === 'hr' ? 'gradient-primary glow-primary' : 'bg-slate-700'
                            }`}>
                                <span className="material-symbols-outlined text-white text-4xl">
                                    business_center
                                </span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">HR / Recruiter</h3>
                                <p className="text-slate-400 text-sm">
                                    Post jobs, review candidates, and manage interviews
                                </p>
                            </div>
                            {selectedRole === 'hr' && (
                                <span className="material-symbols-outlined text-primary text-3xl animate-scale-in">
                                    check_circle
                                </span>
                            )}
                        </div>
                    </button>

                    {/* Candidate Card */}
                    <button
                        onClick={() => handleRoleSelect('candidate')}
                        className={`p-8 rounded-xl transition-all duration-300 ${
                            selectedRole === 'candidate'
                                ? 'glass-strong border-2 border-primary glow-primary scale-105'
                                : 'glass-light hover:glass-strong hover-lift'
                        }`}
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                                selectedRole === 'candidate' ? 'gradient-primary glow-primary' : 'bg-slate-700'
                            }`}>
                                <span className="material-symbols-outlined text-white text-4xl">
                                    person_search
                                </span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Candidate</h3>
                                <p className="text-slate-400 text-sm">
                                    Browse jobs, apply, and take AI interviews
                                </p>
                            </div>
                            {selectedRole === 'candidate' && (
                                <span className="material-symbols-outlined text-primary text-3xl animate-scale-in">
                                    check_circle
                                </span>
                            )}
                        </div>
                    </button>
                </div>

                {/* User Details Form */}
                {selectedRole && (
                    <div className="space-y-4 animate-fade-in-up">
                        <div>
                            <label className="block text-white font-medium mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-3 rounded-lg glass-light text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:glow-primary transition-smooth"
                            />
                        </div>
                        <div>
                            <label className="block text-white font-medium mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmailInput(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 rounded-lg glass-light text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:glow-primary transition-smooth"
                            />
                        </div>
                    </div>
                )}

                {/* Continue Button */}
                {selectedRole && (
                    <button
                        onClick={handleContinue}
                        className="w-full mt-8 py-4 rounded-lg gradient-primary hover:gradient-primary-hover text-white font-bold text-lg glow-primary-strong hover-lift transition-smooth flex items-center justify-center gap-3 animate-fade-in-up"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                        Continue as {selectedRole === 'hr' ? 'HR' : 'Candidate'}
                    </button>
                )}
            </div>
        </div>
    );
}
