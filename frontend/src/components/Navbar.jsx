import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-[#283039] bg-white/50 dark:bg-[#111418]/80 backdrop-blur-sm px-6 py-3 h-16">
            <div className="flex items-center gap-3">
                <div className="size-8 text-primary flex items-center justify-center bg-primary/10 rounded-lg">
                    <span className="material-symbols-outlined text-[24px]">psychology_alt</span>
                </div>
                <h2 className="text-lg font-bold tracking-tight">Placement Prep AI</h2>
            </div>

            <div className="flex items-center gap-8">
                <nav className="hidden md:flex items-center gap-6">
                    <Link to="/dashboard" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium transition-colors">
                        Dashboard
                    </Link>
                    <Link to="/preparation" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium transition-colors">
                        Practice
                    </Link>
                    <Link to="/results" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium transition-colors">
                        Analytics
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <button className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <Link to="/settings" className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 ring-2 ring-slate-100 dark:ring-slate-700 cursor-pointer" style={{ backgroundImage: 'url("https://api.dicebear.com/7.x/avataaars/svg?seed=Alex")' }}></Link>
                </div>
            </div>
        </header>
    );
}
