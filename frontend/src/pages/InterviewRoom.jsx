import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SilenceDetector from '../services/silenceDetector';
import VideoRecorder from '../services/videoRecorder';

const API_BASE = 'http://localhost:5001/api/interview';

export default function InterviewRoom() {
    // Interview state
    const [interviewState, setInterviewState] = useState('setup'); // setup | active | completed
    const [sessionId, setSessionId] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeSummary, setResumeSummary] = useState('');

    // Question state
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [questionNumber, setQuestionNumber] = useState(0);
    const [messages, setMessages] = useState([]);

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [silenceCountdown, setSilenceCountdown] = useState(null);
    const [loading, setLoading] = useState(false);

    // Media refs
    const webcamRef = useRef(null);
    const webcamStreamRef = useRef(null);
    const audioStreamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Service refs
    const silenceDetectorRef = useRef(null);
    const videoRecorderRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAllMedia();
        };
    }, []);

    // Auto-speak questions using AI voice
    useEffect(() => {
        if (currentQuestion && interviewState === 'active') {
            speakQuestion(currentQuestion);
        }
    }, [currentQuestion, interviewState]);

    /**
     * Generate and play AI voice for questions
     */
    const speakQuestion = async (text) => {
        try {
            // Request AI-generated audio from backend
            const response = await axios.post(`${API_BASE}/tts`, {
                text,
                voice: 'nova' // Options: alloy, echo, fable, onyx, nova, shimmer
            }, {
                responseType: 'blob'
            });

            // Create audio URL from blob
            const audioBlob = response.data;
            const audioUrl = URL.createObjectURL(audioBlob);

            // Create and play audio element
            const audio = new Audio(audioUrl);

            // Start recording after audio finishes
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl); // Cleanup
                setTimeout(() => {
                    startVoiceRecording();
                }, 500);
            };

            audio.onerror = (err) => {
                console.error('Audio playback error:', err);
                // Fallback to browser TTS
                speakQuestionFallback(text);
            };

            audio.play();
        } catch (err) {
            console.error('Failed to generate AI voice:', err);
            // Fallback to browser TTS
            speakQuestionFallback(text);
        }
    };

    /**
     * Fallback to browser Text-to-Speech
     */
    const speakQuestionFallback = (text) => {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;

        utterance.onend = () => {
            setTimeout(() => {
                startVoiceRecording();
            }, 500);
        };

        window.speechSynthesis.speak(utterance);
    };

    /**
     * Handle resume file selection
     */
    const handleResumeChange = (e) => {
        const file = e.target.files?.[0];
        setResumeFile(file || null);
    };

    /**
     * Start the interview process
     */
    const startInterview = async () => {
        if (!resumeFile) {
            alert('Please select a PDF resume first.');
            return;
        }

        setLoading(true);

        try {
            // 1. Upload resume and get first question
            const formData = new FormData();
            formData.append('resume', resumeFile);

            const res = await axios.post(`${API_BASE}/resume`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSessionId(res.data.sessionId);
            setResumeSummary(res.data.summary);
            setCurrentQuestion(res.data.question);
            setQuestionNumber(1);
            setMessages([
                { from: 'bot', text: res.data.question }
            ]);

            // 2. Activate webcam and microphone
            await activateMedia();

            // 3. Change state to active
            setInterviewState('active');

        } catch (err) {
            console.error('Failed to start interview:', err);
            alert(err.response?.data?.error || 'Failed to start interview');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Activate webcam and microphone
     */
    const activateMedia = async () => {
        try {
            // Get webcam stream
            const videoStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

            webcamStreamRef.current = videoStream;
            if (webcamRef.current) {
                webcamRef.current.srcObject = videoStream;
            }

            // Start video recording
            videoRecorderRef.current = new VideoRecorder(videoStream);
            videoRecorderRef.current.start();

            // Get audio stream (separate for better control)
            const audioStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });

            audioStreamRef.current = audioStream;

            // Start silence detection
            silenceDetectorRef.current = new SilenceDetector(
                audioStream,
                handleSilenceDetected,
                handleSpeechDetected,
                10000 // 10 seconds
            );
            silenceDetectorRef.current.start();

            console.log('Media activated successfully');
        } catch (err) {
            console.error('Failed to activate media:', err);
            alert('Could not access camera/microphone. Please check permissions.');
            throw err;
        }
    };

    /**
     * Start voice recording
     */
    const startVoiceRecording = () => {
        if (!audioStreamRef.current || isRecording) return;

        try {
            const recorder = new MediaRecorder(audioStreamRef.current);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = async () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await submitAudioAnswer(blob);
            };

            recorder.start();
            setIsRecording(true);
            console.log('Voice recording started');
        } catch (err) {
            console.error('Failed to start voice recording:', err);
        }
    };

    /**
     * Stop voice recording
     */
    const stopVoiceRecording = () => {
        if (!isRecording || !mediaRecorderRef.current) return;

        mediaRecorderRef.current.stop();
        setIsRecording(false);
        console.log('Voice recording stopped');
    };

    /**
     * Handle silence detected (10 seconds passed)
     */
    const handleSilenceDetected = () => {
        console.log('Silence detected - auto-skipping');

        // Stop recording and submit skip
        stopVoiceRecording();
        setSilenceCountdown(null);

        // Submit empty answer
        submitSkipAnswer();
    };

    /**
     * Handle speech detected (user started speaking)
     */
    const handleSpeechDetected = () => {
        console.log('Speech detected');
        setSilenceCountdown(null);
    };

    /**
     * Update countdown timer display
     */
    useEffect(() => {
        if (interviewState !== 'active' || !silenceDetectorRef.current) return;

        // Update countdown every 100ms
        countdownIntervalRef.current = setInterval(() => {
            const remaining = silenceDetectorRef.current.getRemainingSeconds();

            if (remaining < 10) {
                setSilenceCountdown(remaining);
            } else {
                setSilenceCountdown(null);
            }
        }, 100);

        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
        };
    }, [interviewState]);

    /**
     * Submit audio answer to backend
     */
    const submitAudioAnswer = async (audioBlob) => {
        if (!sessionId) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'answer.webm');
            formData.append('sessionId', sessionId);

            const res = await axios.post(`${API_BASE}/answer-audio`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const transcript = res.data.transcript || '(transcription unavailable)';
            const nextQuestion = res.data.question;
            const isDone = res.data.done;

            // Update messages
            setMessages(prev => [
                ...prev,
                { from: 'user', text: transcript },
                { from: 'bot', text: nextQuestion }
            ]);

            if (isDone) {
                endInterview();
            } else {
                setCurrentQuestion(nextQuestion);
                setQuestionNumber(prev => prev + 1);
            }
        } catch (err) {
            console.error('Failed to submit audio answer:', err);
            alert('Failed to process your answer. Please try again.');
            // Retry recording
            startVoiceRecording();
        } finally {
            setLoading(false);
        }
    };

    /**
     * Submit skip answer (when auto-skip triggered)
     */
    const submitSkipAnswer = async () => {
        if (!sessionId) return;

        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE}/answer`, {
                sessionId,
                answer: 'No answer provided (skipped due to silence)',
            });

            const nextQuestion = res.data.question;
            const isDone = res.data.done;

            setMessages(prev => [
                ...prev,
                { from: 'user', text: '⏭️ Skipped (no answer)' },
                { from: 'bot', text: nextQuestion }
            ]);

            if (isDone) {
                endInterview();
            } else {
                setCurrentQuestion(nextQuestion);
                setQuestionNumber(prev => prev + 1);
            }
        } catch (err) {
            console.error('Failed to submit skip:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * End the interview
     */
    const endInterview = async () => {
        console.log('Ending interview...');

        // Stop all recordings
        stopVoiceRecording();

        // Stop video recording and download
        if (videoRecorderRef.current) {
            try {
                const videoBlob = await videoRecorderRef.current.stop();
                VideoRecorder.downloadVideo(videoBlob, `interview-${sessionId}.webm`);
            } catch (err) {
                console.error('Failed to save video:', err);
            }
        }

        // Stop all media
        stopAllMedia();

        setInterviewState('completed');
        setMessages(prev => [
            ...prev,
            { from: 'bot', text: '🎉 Interview completed! Your video has been downloaded.' }
        ]);
    };

    /**
     * Stop all media streams and services
     */
    const stopAllMedia = () => {
        // Stop silence detector
        if (silenceDetectorRef.current) {
            silenceDetectorRef.current.stop();
            silenceDetectorRef.current = null;
        }

        // Stop audio stream
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
            audioStreamRef.current = null;
        }

        // Stop webcam stream
        if (webcamStreamRef.current) {
            webcamStreamRef.current.getTracks().forEach(track => track.stop());
            webcamStreamRef.current = null;
        }

        // Clear countdown interval
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
    };

    /**
     * Reset and start new interview
     */
    const resetInterview = () => {
        stopAllMedia();
        setInterviewState('setup');
        setSessionId('');
        setResumeFile(null);
        setResumeSummary('');
        setCurrentQuestion('');
        setQuestionNumber(0);
        setMessages([]);
        setIsRecording(false);
        setSilenceCountdown(null);
        setLoading(false);
    };

    // Render setup screen
    if (interviewState === 'setup') {
        return (
            <div className="p-6 md:p-10 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                        AI Voice Interview
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Upload your resume to begin your automated voice interview experience
                    </p>
                </div>

                <div className="bg-[#1c2127] border border-[#3b4754] rounded-xl p-8 shadow-2xl">
                    <div className="space-y-6">
                        {/* Instructions */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                            <h3 className="text-primary font-bold mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined">info</span>
                                How it works
                            </h3>
                            <ul className="text-slate-300 text-sm space-y-2 ml-6 list-disc">
                                <li>Upload your resume (PDF format)</li>
                                <li>Grant camera and microphone permissions</li>
                                <li>Answer questions using your voice only</li>
                                <li>Questions auto-skip after 10 seconds of silence</li>
                                <li>Your interview will be recorded for review</li>
                            </ul>
                        </div>

                        {/* Resume Upload */}
                        <div>
                            <label className="block text-white font-medium mb-3">
                                Upload Resume (PDF)
                            </label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleResumeChange}
                                className="block w-full text-sm text-[#9dabb9] file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-blue-600 file:cursor-pointer file:transition-colors"
                            />
                            {resumeFile && (
                                <div className="mt-3 flex items-center gap-2 text-primary">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    <span className="font-medium">{resumeFile.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={startInterview}
                            disabled={!resumeFile || loading}
                            className="w-full py-4 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(19,127,236,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    Starting Interview...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">rocket_launch</span>
                                    Start Interview
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Render active interview screen
    return (
        <div className="h-screen flex flex-col bg-[#111418]">
            {/* Header */}
            <div className="bg-[#1c2127] border-b border-[#3b4754] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-white font-bold">RECORDING</span>
                    </div>
                    <div className="text-slate-400">|</div>
                    <div className="text-white">
                        Question <span className="text-primary font-bold">{questionNumber}</span>
                    </div>
                </div>

                <button
                    onClick={endInterview}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">stop_circle</span>
                    End Interview
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative overflow-hidden">
                {/* Webcam Preview */}
                <video
                    ref={webcamRef}
                    autoPlay
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Question Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-8">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-white text-2xl md:text-3xl font-medium leading-relaxed mb-4">
                            {currentQuestion}
                        </p>

                        {/* Countdown Timer */}
                        {silenceCountdown !== null && silenceCountdown < 10 && (
                            <div className="flex items-center gap-3 text-yellow-400 animate-pulse">
                                <span className="material-symbols-outlined text-3xl">timer</span>
                                <span className="text-2xl font-bold">
                                    Auto-skip in {silenceCountdown}s
                                </span>
                            </div>
                        )}

                        {/* Loading Indicator */}
                        {loading && (
                            <div className="flex items-center gap-3 text-primary">
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                <span className="text-lg">Processing your answer...</span>
                            </div>
                        )}

                        {/* Recording Indicator */}
                        {isRecording && !loading && (
                            <div className="flex items-center gap-3 text-green-400">
                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-lg font-medium">Listening...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Interview Completed Screen */}
            {interviewState === 'completed' && (
                <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-6">
                    <div className="text-center max-w-2xl">
                        <span className="material-symbols-outlined text-primary text-8xl mb-6 block">
                            check_circle
                        </span>
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Interview Completed!
                        </h2>
                        <p className="text-slate-300 text-lg mb-8">
                            Your interview recording has been saved. Thank you for participating!
                        </p>
                        <button
                            onClick={resetInterview}
                            className="px-8 py-4 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(19,127,236,0.4)] flex items-center gap-3 mx-auto"
                        >
                            <span className="material-symbols-outlined">refresh</span>
                            Start New Interview
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
