import { Link, useLocation } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

export default function Sidebar() {
    const location = useLocation();
    const { role, isHR, isCandidate, clearRole } = useRole();

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const handleSwitchRole = () => {
        clearRole();
        window.location.href = '/select-role';
    };

    return (
        <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111418] p-4 overflow-y-auto shrink-0">
            <div className="flex flex-col gap-4 h-full">
                {/* User Profile Snippet */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: 'url("https://api.dicebear.com/7.x/avataaars/svg?seed=Alex")' }}></div>
                    <div className="flex flex-col flex-1">
                        <h1 className="text-sm font-semibold">{localStorage.getItem('userName') || 'User'}</h1>
                        <p className="text-slate-500 dark:text-[#9dabb9] text-xs capitalize">{role || 'Guest'}</p>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-1">
                    {isHR ? (
                        <>
                            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">HR Portal</p>

                            <Link
                                to="/hr/dashboard"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive('/hr/dashboard')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    } transition-colors`}
                            >
                                <span className={`material-symbols-outlined ${isActive('/hr/dashboard') ? 'fill' : ''}`}>dashboard</span>
                                <span className="text-sm font-medium">Dashboard</span>
                            </Link>

                            <Link
                                to="/hr/post-job"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive('/hr/post-job')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    } transition-colors`}
                            >
                                <span className={`material-symbols-outlined ${isActive('/hr/post-job') ? 'fill' : ''}`}>add_circle</span>
                                <span className="text-sm font-medium">Post Job</span>
                            </Link>

                            <Link
                                to="/hr/jobs"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive('/hr/jobs')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    } transition-colors`}
                            >
                                <span className={`material-symbols-outlined ${isActive('/hr/jobs') ? 'fill' : ''}`}>work</span>
                                <span className="text-sm font-medium">My Jobs</span>
                            </Link>
                        </>
                    ) : isCandidate ? (
                        <>
                            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Candidate Portal</p>

                            <Link
                                to="/jobs"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive('/jobs')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    } transition-colors`}
                            >
                                <span className={`material-symbols-outlined ${isActive('/jobs') ? 'fill' : ''}`}>search</span>
                                <span className="text-sm font-medium">Browse Jobs</span>
                            </Link>

                            <Link
                                to="/my-applications"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive('/my-applications')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    } transition-colors`}
                            >
                                <span className={`material-symbols-outlined ${isActive('/my-applications') ? 'fill' : ''}`}>description</span>
                                <span className="text-sm font-medium">My Applications</span>
                            </Link>

                            <Link
                                to="/dashboard"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive('/dashboard')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    } transition-colors`}
                            >
                                <span className={`material-symbols-outlined ${isActive('/dashboard') ? 'fill' : ''}`}>dashboard</span>
                                <span className="text-sm font-medium">Practice Dashboard</span>
                            </Link>
                        </>
                    ) : (
                        <>
                            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>

                            <Link
                                to="/dashboard"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive('/dashboard')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    } transition-colors`}
                            >
                                <span className={`material-symbols-outlined ${isActive('/dashboard') ? 'fill' : ''}`}>dashboard</span>
                                <span className="text-sm font-medium">Dashboard</span>
                            </Link>
                        </>
                    )}

                    {/* Common Links for Candidates */}
                    {isCandidate && (
                        <>
                            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">Practice</p>

                            <Link
                                to="/preparation"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive('/preparation')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    } transition-colors`}
                            >
                                <span className={`material-symbols-outlined ${isActive('/preparation') ? 'fill' : ''}`}>school</span>
                                <span className="text-sm font-medium">Preparation Hub</span>
                            </Link>

                            <Link
                                to="/interview"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive('/interview')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    } transition-colors`}
                            >
                                <span className={`material-symbols-outlined ${isActive('/interview') ? 'fill' : ''}`}>videocam</span>
                                <span className="text-sm font-medium">Practice Interview</span>
                            </Link>

                            <Link
                                to="/results"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive('/results')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    } transition-colors`}
                            >
                                <span className={`material-symbols-outlined ${isActive('/results') ? 'fill' : ''}`}>analytics</span>
                                <span className="text-sm font-medium">Results</span>
                            </Link>
                        </>
                    )}

                    {/* Settings for all */}
                    {role && (
                        <>
                            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">Account</p>

                            <Link
                                to="/settings"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive('/settings')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    } transition-colors`}
                            >
                                <span className={`material-symbols-outlined ${isActive('/settings') ? 'fill' : ''}`}>settings</span>
                                <span className="text-sm font-medium">Settings</span>
                            </Link>

                            <button
                                onClick={handleSwitchRole}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                            >
                                <span className="material-symbols-outlined">swap_horiz</span>
                                <span className="text-sm font-medium">Switch Role</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Upgrade Banner */}
                <div className="mt-auto p-4 rounded-xl bg-gradient-to-br from-indigo-600 to-primary text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-yellow-300">star</span>
                        <span className="font-bold text-sm">Pro Features</span>
                    </div>
                    <p className="text-xs opacity-90 mb-3">Unlock unlimited AI mock interviews and detailed analysis.</p>
                    <button className="w-full py-1.5 px-3 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold backdrop-blur-sm transition-colors">
                        Upgrade Now
                    </button>
                </div>
            </div>
        </aside>
    );
}
