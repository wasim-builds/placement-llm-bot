import { useState, useEffect } from 'react';

export default function Results() {
    const [filter, setFilter] = useState('all');
    const [timeRange, setTimeRange] = useState('all-time');
    const [animateProgress, setAnimateProgress] = useState(false);

    useEffect(() => {
        // Trigger progress bar animations after component mounts
        setTimeout(() => setAnimateProgress(true), 300);
    }, []);

    const results = [
        {
            id: 1,
            type: 'Technical Interview',
            date: 'December 30, 2024',
            score: 92,
            duration: '25 minutes',
            questions: { answered: 8, total: 10 },
            breakdown: {
                communication: 85,
                technical: 95,
                problemSolving: 90
            },
            icon: 'code',
            color: 'primary',
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            id: 2,
            type: 'Behavioral Interview',
            date: 'December 28, 2024',
            score: 78,
            duration: '18 minutes',
            questions: { answered: 6, total: 8 },
            breakdown: {
                communication: 82,
                leadership: 75,
                teamwork: 77
            },
            icon: 'psychology',
            color: 'purple',
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            id: 3,
            type: 'System Design Interview',
            date: 'December 26, 2024',
            score: 88,
            duration: '32 minutes',
            questions: { answered: 5, total: 6 },
            breakdown: {
                architecture: 90,
                scalability: 85,
                tradeoffs: 89
            },
            icon: 'account_tree',
            color: 'blue',
            gradient: 'from-indigo-500 to-blue-500'
        }
    ];

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-400 bg-green-500/20 border-green-500/30';
        if (score >= 75) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
        return 'text-red-400 bg-red-500/20 border-red-500/30';
    };

    const getProgressBarColor = (score) => {
        if (score >= 90) return 'gradient-success';
        if (score >= 75) return 'gradient-warning';
        return 'gradient-danger';
    };

    return (
        <div className="p-6 md:p-10 space-y-8">
            {/* Header */}
            <div className="space-y-2 animate-fade-in-down">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">
                    Interview Results
                </h1>
                <p className="text-slate-400 text-lg">
                    Your interview analysis and feedback
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 animate-fade-in-up">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg glass-light text-white focus:border-primary focus:outline-none focus:glow-primary transition-smooth cursor-pointer"
                >
                    <option value="all">All Types</option>
                    <option value="technical">Technical</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="system-design">System Design</option>
                </select>

                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 rounded-lg glass-light text-white focus:border-primary focus:outline-none focus:glow-primary transition-smooth cursor-pointer"
                >
                    <option value="all-time">All Time</option>
                    <option value="this-week">This Week</option>
                    <option value="this-month">This Month</option>
                    <option value="last-3-months">Last 3 Months</option>
                </select>
            </div>

            {/* Results List */}
            <div className="space-y-6">
                {results.map((result, index) => (
                    <div
                        key={result.id}
                        className={`glass-strong rounded-xl p-6 hover-lift card-interactive animate-fade-in-up delay-${(index + 1) * 100}`}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${result.gradient} flex items-center justify-center glow-primary hover-scale transition-smooth`}>
                                    <span className="material-symbols-outlined text-white text-3xl">
                                        {result.icon}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{result.type}</h3>
                                    <p className="text-sm text-slate-400">{result.date}</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full glass-light border ${getScoreColor(result.score)} glow-primary animate-scale-in delay-${(index + 1) * 100}`}>
                                <span className="text-2xl font-bold">{result.score}%</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 mb-6 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined">schedule</span>
                                <span>{result.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined">quiz</span>
                                <span>{result.questions.answered}/{result.questions.total} questions</span>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-4 mb-6">
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">analytics</span>
                                Performance Breakdown
                            </h4>
                            {Object.entries(result.breakdown).map(([category, score]) => (
                                <div key={category}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-300 capitalize">
                                            {category.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <span className="text-sm font-semibold text-white">{score}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-[#3b4754] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getProgressBarColor(score)} transition-all duration-1000 ease-out`}
                                            style={{
                                                width: animateProgress ? `${score}%` : '0%',
                                                transitionDelay: `${(index + 1) * 200}ms`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button className="flex-1 px-4 py-3 rounded-lg gradient-primary hover:gradient-primary-hover text-white font-medium transition-smooth hover-lift flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">visibility</span>
                                View Details
                            </button>
                            <button className="flex-1 px-4 py-3 rounded-lg glass-light border border-primary/30 text-slate-300 hover:border-primary hover:text-primary hover-glow transition-smooth font-medium flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">play_circle</span>
                                Watch Recording
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More */}
            <button className="w-full py-4 rounded-lg glass-strong border-2 border-primary/30 text-slate-300 hover:border-primary hover:text-primary hover-glow transition-smooth font-bold animate-fade-in-up delay-400">
                Load More Results
            </button>
        </div>
    );
}
