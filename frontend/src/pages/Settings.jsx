import { useState } from 'react';

export default function Settings() {
    const [silenceTimeout, setSilenceTimeout] = useState(10);
    const [aiVoice, setAiVoice] = useState('nova');
    const [autoRecord, setAutoRecord] = useState(true);
    const [theme, setTheme] = useState('dark');
    const [language, setLanguage] = useState('english');

    const handleSave = () => {
        // Save settings logic here
        alert('Settings saved successfully!');
    };

    const handleReset = () => {
        setSilenceTimeout(10);
        setAiVoice('nova');
        setAutoRecord(true);
        setTheme('dark');
        setLanguage('english');
    };

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-4xl">
            {/* Header */}
            <div className="space-y-2 animate-fade-in-down">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">
                    Settings
                </h1>
                <p className="text-slate-400 text-lg">
                    Manage your profile and preferences
                </p>
            </div>

            {/* Profile Section */}
            <div className="glass-strong rounded-xl p-6 animate-fade-in-up hover-lift transition-smooth">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary icon-pulse">
                        person
                    </span>
                    Profile Information
                </h2>

                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-white text-4xl font-bold glow-primary hover-scale transition-smooth">
                            AM
                        </div>
                        <button className="mt-3 w-full px-4 py-2 rounded-lg glass-light text-sm text-slate-300 hover:border-primary hover:text-primary hover-glow transition-smooth">
                            Upload
                        </button>
                    </div>

                    {/* Profile Details */}
                    <div className="flex-1 space-y-4">
                        <div className="animate-fade-in-up delay-100">
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                defaultValue="Alex Morgan"
                                className="w-full px-4 py-3 rounded-lg glass-light text-white focus:border-primary focus:outline-none focus:glow-primary transition-smooth"
                            />
                        </div>
                        <div className="animate-fade-in-up delay-200">
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                defaultValue="alex@example.com"
                                className="w-full px-4 py-3 rounded-lg glass-light text-white focus:border-primary focus:outline-none focus:glow-primary transition-smooth"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Interview Preferences */}
            <div className="glass-strong rounded-xl p-6 animate-fade-in-up delay-100 hover-lift transition-smooth">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary icon-bounce">
                        tune
                    </span>
                    Interview Preferences
                </h2>

                <div className="space-y-6">
                    {/* Silence Timeout */}
                    <div className="animate-fade-in-up delay-200">
                        <label className="block text-sm font-medium text-white mb-3">
                            Silence Timeout
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="5"
                                max="30"
                                step="5"
                                value={silenceTimeout}
                                onChange={(e) => setSilenceTimeout(Number(e.target.value))}
                                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #137fec 0%, #137fec ${((silenceTimeout - 5) / 25) * 100}%, #3b4754 ${((silenceTimeout - 5) / 25) * 100}%, #3b4754 100%)`
                                }}
                            />
                            <div className="w-20 px-3 py-2 rounded-lg glass-light text-white text-center font-medium glow-primary">
                                {silenceTimeout}s
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">
                            Auto-skip question after this many seconds of silence
                        </p>
                    </div>

                    {/* AI Voice */}
                    <div className="animate-fade-in-up delay-300">
                        <label className="block text-sm font-medium text-white mb-3">
                            AI Voice
                        </label>
                        <select
                            value={aiVoice}
                            onChange={(e) => setAiVoice(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg glass-light text-white focus:border-primary focus:outline-none focus:glow-primary transition-smooth cursor-pointer"
                        >
                            <option value="nova">Nova (Conversational)</option>
                            <option value="alloy">Alloy (Neutral)</option>
                            <option value="echo">Echo (Professional)</option>
                            <option value="fable">Fable (Warm)</option>
                            <option value="onyx">Onyx (Authoritative)</option>
                            <option value="shimmer">Shimmer (Energetic)</option>
                        </select>
                        <p className="text-sm text-slate-400 mt-2">
                            Voice used by AI interviewer
                        </p>
                    </div>

                    {/* Auto-record */}
                    <div className="flex items-center justify-between animate-fade-in-up delay-400">
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">
                                Auto-record Interviews
                            </label>
                            <p className="text-sm text-slate-400">
                                Automatically record video during interviews
                            </p>
                        </div>
                        <button
                            onClick={() => setAutoRecord(!autoRecord)}
                            className={`relative w-14 h-7 rounded-full transition-all ${autoRecord ? 'gradient-primary glow-primary' : 'bg-[#3b4754]'
                                }`}
                        >
                            <div
                                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${autoRecord ? 'translate-x-7' : ''
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <div className="glass-strong rounded-xl p-6 animate-fade-in-up delay-200 hover-lift transition-smooth">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary icon-rotate">
                        palette
                    </span>
                    Appearance
                </h2>

                <div className="space-y-6">
                    {/* Theme */}
                    <div className="animate-fade-in-up delay-300">
                        <label className="block text-sm font-medium text-white mb-3">
                            Theme
                        </label>
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg glass-light text-white focus:border-primary focus:outline-none focus:glow-primary transition-smooth cursor-pointer"
                        >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                            <option value="auto">Auto (System)</option>
                        </select>
                    </div>

                    {/* Language */}
                    <div className="animate-fade-in-up delay-400">
                        <label className="block text-sm font-medium text-white mb-3">
                            Language
                        </label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg glass-light text-white focus:border-primary focus:outline-none focus:glow-primary transition-smooth cursor-pointer"
                        >
                            <option value="english">English</option>
                            <option value="spanish">Spanish</option>
                            <option value="french">French</option>
                            <option value="german">German</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 animate-fade-in-up delay-500">
                <button
                    onClick={handleSave}
                    className="flex-1 gradient-primary hover:gradient-primary-hover text-white font-bold py-4 px-8 rounded-xl glow-primary-strong hover-lift btn-ripple transition-smooth flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">save</span>
                    Save Changes
                </button>
                <button
                    onClick={handleReset}
                    className="px-8 py-4 rounded-xl glass-light border-2 border-red-500/30 text-slate-300 hover:border-red-500 hover:text-red-400 hover-glow transition-smooth font-bold flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">refresh</span>
                    Reset to Default
                </button>
            </div>
        </div>
    );
}
