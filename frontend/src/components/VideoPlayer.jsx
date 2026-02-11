import { useState, useEffect, useRef } from 'react';

export default function VideoPlayer({ applicationId, onClose }) {
    const videoRef = useRef(null);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    const videoUrl = `http://localhost:5002/api/videos/${applicationId}`;

    const handleSpeedChange = (speed) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackSpeed(speed);
        }
    };

    const handleDownload = () => {
        window.open(`http://localhost:5002/api/videos/${applicationId}/download`, '_blank');
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6" onClick={onClose}>
            <div className="max-w-6xl w-full glass-strong rounded-2xl p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">play_circle</span>
                        Interview Recording
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-lg glass-light hover:bg-red-500/20 hover:border-red-500 text-slate-300 hover:text-red-400 transition-smooth flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Video Player */}
                <div className="relative bg-black rounded-xl overflow-hidden mb-4">
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        className="w-full"
                        style={{ maxHeight: '70vh' }}
                    >
                        Your browser does not support video playback.
                    </video>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">Playback Speed:</span>
                        {[0.5, 1, 1.5, 2].map(speed => (
                            <button
                                key={speed}
                                onClick={() => handleSpeedChange(speed)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-smooth ${playbackSpeed === speed
                                        ? 'gradient-primary text-white'
                                        : 'glass-light text-slate-300 hover:text-primary'
                                    }`}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleDownload}
                        className="glass-light border border-primary/30 hover:border-primary text-slate-300 hover:text-primary font-medium py-2 px-4 rounded-lg hover-glow transition-smooth flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">download</span>
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
}
