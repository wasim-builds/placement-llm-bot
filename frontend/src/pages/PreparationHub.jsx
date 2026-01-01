import { useState, useEffect } from 'react';

export default function PreparationHub() {
    const [animateProgress, setAnimateProgress] = useState(false);

    useEffect(() => {
        // Trigger progress bar animations after component mounts
        setTimeout(() => setAnimateProgress(true), 300);
    }, []);

    const topics = [
        {
            id: 1,
            title: 'Data Structures & Algorithms',
            icon: 'code_blocks',
            progress: 60,
            color: 'primary',
            gradient: 'from-blue-500 to-cyan-500',
            lessons: 12,
            completed: 7
        },
        {
            id: 2,
            title: 'Communication Skills',
            icon: 'forum',
            progress: 40,
            color: 'purple',
            gradient: 'from-purple-500 to-pink-500',
            lessons: 8,
            completed: 3
        },
        {
            id: 3,
            title: 'System Design',
            icon: 'account_tree',
            progress: 25,
            color: 'blue',
            gradient: 'from-indigo-500 to-blue-500',
            lessons: 10,
            completed: 2
        },
        {
            id: 4,
            title: 'Behavioral Questions',
            icon: 'psychology',
            progress: 80,
            color: 'green',
            gradient: 'from-green-500 to-emerald-500',
            lessons: 15,
            completed: 12
        }
    ];

    const categories = [
        { name: 'Common Questions', icon: 'help', count: 50, gradient: 'from-blue-500 to-cyan-500' },
        { name: 'Technical Topics', icon: 'terminal', count: 35, gradient: 'from-purple-500 to-pink-500' },
        { name: 'Behavioral Tips', icon: 'lightbulb', count: 25, gradient: 'from-orange-500 to-yellow-500' }
    ];

    const getProgressColor = (progress) => {
        if (progress >= 75) return 'gradient-success';
        if (progress >= 50) return 'gradient-warning';
        return 'gradient-primary';
    };

    return (
        <div className="p-6 md:p-10 space-y-8">
            {/* Header */}
            <div className="space-y-2 animate-fade-in-down">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">
                    Preparation Hub
                </h1>
                <p className="text-slate-400 text-lg">
                    Practice sets and learning resources
                </p>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                    <div
                        key={index}
                        className={`glass-strong rounded-xl p-6 hover-lift card-interactive cursor-pointer group animate-fade-in-up delay-${(index + 1) * 100}`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center glow-primary`}>
                                <span className="material-symbols-outlined text-white text-2xl group-hover:scale-110 icon-bounce transition-transform">
                                    {category.icon}
                                </span>
                            </div>
                            <span className="px-3 py-1 rounded-full glass-light border border-primary/30 text-primary text-sm font-bold glow-primary">
                                {category.count}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                            {category.name}
                        </h3>
                    </div>
                ))}
            </div>

            {/* Recommended Topics */}
            <div className="glass-strong rounded-xl p-6 animate-fade-in-up delay-300">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary icon-pulse">
                        school
                    </span>
                    Recommended Topics
                </h2>

                <div className="space-y-4">
                    {topics.map((topic, index) => (
                        <div
                            key={topic.id}
                            className={`glass-light rounded-lg p-5 hover-lift card-interactive group animate-fade-in-up delay-${(index + 3) * 100}`}
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${topic.gradient} flex items-center justify-center flex-shrink-0 glow-primary hover-scale transition-smooth`}>
                                    <span className="material-symbols-outlined text-white text-2xl">
                                        {topic.icon}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors mb-1">
                                        {topic.title}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {topic.completed} of {topic.lessons} lessons completed
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-white">{topic.progress}%</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-[#3b4754] rounded-full overflow-hidden mb-4">
                                <div
                                    className={`h-full ${getProgressColor(topic.progress)} transition-all duration-1000 ease-out`}
                                    style={{
                                        width: animateProgress ? `${topic.progress}%` : '0%',
                                        transitionDelay: `${(index + 3) * 200}ms`
                                    }}
                                />
                            </div>

                            {/* Action Button */}
                            <button className="w-full px-4 py-3 rounded-lg gradient-primary hover:gradient-primary-hover text-white font-medium transition-smooth hover-lift flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">
                                    {topic.progress > 0 ? 'play_arrow' : 'rocket_launch'}
                                </span>
                                {topic.progress > 0 ? 'Continue Learning' : 'Start Practice'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Practice Sets */}
            <div className="glass-strong rounded-xl p-6 animate-fade-in-up delay-400">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary icon-bounce">
                        quiz
                    </span>
                    Practice Sets
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-6 rounded-lg glass-light border-2 border-green-500/30 hover:border-green-500 hover-lift transition-smooth group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center glow-success">
                                <span className="material-symbols-outlined text-white text-2xl group-hover:scale-110 transition-transform">
                                    trending_up
                                </span>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-green-500/30 text-green-300 text-xs font-bold">
                                EASY
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                            Beginner
                        </h3>
                        <p className="text-sm text-slate-400">20 questions</p>
                    </button>

                    <button className="p-6 rounded-lg glass-light border-2 border-yellow-500/30 hover:border-yellow-500 hover-lift transition-smooth group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center glow-warning">
                                <span className="material-symbols-outlined text-white text-2xl group-hover:scale-110 transition-transform">
                                    show_chart
                                </span>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-yellow-500/30 text-yellow-300 text-xs font-bold">
                                MEDIUM
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                            Intermediate
                        </h3>
                        <p className="text-sm text-slate-400">35 questions</p>
                    </button>

                    <button className="p-6 rounded-lg glass-light border-2 border-red-500/30 hover:border-red-500 hover-lift transition-smooth group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center glow-danger">
                                <span className="material-symbols-outlined text-white text-2xl group-hover:scale-110 transition-transform">
                                    local_fire_department
                                </span>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-red-500/30 text-red-300 text-xs font-bold">
                                HARD
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                            Advanced
                        </h3>
                        <p className="text-sm text-slate-400">25 questions</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
