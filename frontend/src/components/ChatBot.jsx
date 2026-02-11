import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5002/api/interview';

export default function ChatBot() {
  const [resumeFile, setResumeFile] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [summary, setSummary] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: '👋 Welcome! Upload your resume (PDF) to start your AI-powered video interview.' },
  ]);
  const [input, setInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunksRef = useRef([]);
  const webcamRef = useRef(null);
  const webcamStreamRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!currentQuestion) return;
    speakOut(currentQuestion);
  }, [currentQuestion]);

  const speakOut = (text) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    setResumeFile(file || null);
  };

  const startInterview = async () => {
    if (!resumeFile) return alert('Please select a PDF resume first.');
    const formData = new FormData();
    formData.append('resume', resumeFile);
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSessionId(res.data.sessionId);
      setSummary(res.data.summary);
      const firstQuestion = res.data.question;
      setCurrentQuestion(firstQuestion);
      setMessages([
        { from: 'bot', text: '✅ Resume processed successfully!' },
        { from: 'bot', text: firstQuestion },
      ]);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const sendAnswer = async (answerText) => {
    const trimmed = answerText.trim();
    if (!trimmed || !sessionId) return;
    const newMessages = [...messages, { from: 'user', text: trimmed }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/answer`, {
        sessionId,
        answer: trimmed,
      });
      const nextQ = res.data.question;
      setCurrentQuestion(nextQ);
      setMessages([...newMessages, { from: 'bot', text: nextQ }]);
      if (res.data.done) {
        setMessages((prev) => [...prev, { from: 'bot', text: '🎉 Interview completed!' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { from: 'bot', text: '❌ Error contacting server. Try again later.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendAnswer(input);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await submitAudio(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (!recording) return;
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const submitAudio = async (blob) => {
    if (!sessionId) return;
    const formData = new FormData();
    formData.append('audio', blob, 'answer.webm');
    formData.append('sessionId', sessionId);
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/answer-audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const transcript = res.data.transcript || '(transcription unavailable)';
      const nextQ = res.data.question;
      setCurrentQuestion(nextQ);
      setMessages((prev) => [
        ...prev,
        { from: 'user', text: `🎤 ${transcript}` },
        { from: 'bot', text: nextQ },
      ]);
      if (res.data.done) {
        setMessages((prev) => [...prev, { from: 'bot', text: '🎉 Interview completed!' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: '❌ Error processing audio. Try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleWebcam = async () => {
    if (webcamEnabled) {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
        webcamStreamRef.current = null;
      }
      setWebcamEnabled(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
        }
        webcamStreamRef.current = stream;
        setWebcamEnabled(true);
      } catch (err) {
        console.error('Webcam error:', err);
        alert('Could not access webcam. Please check permissions.');
      }
    }
  };

  const repeatQuestion = async () => {
    if (!sessionId) return;
    try {
      const res = await axios.get(`${API_BASE}/repeat/${sessionId}`);
      const question = res.data.question;
      setCurrentQuestion(question);
      setMessages((prev) => [...prev, { from: 'bot', text: `🔁 ${question}` }]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Webcam Preview */}
      <div className="relative w-full aspect-video bg-[#1c2127] rounded-xl border border-[#3b4754] shadow-2xl overflow-hidden">
        {webcamEnabled ? (
          <>
            <video ref={webcamRef} autoPlay muted className="w-full h-full object-cover" />
            <button
              onClick={toggleWebcam}
              className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">videocam_off</span>
              Disable Camera
            </button>
            {/* Live indicator */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-white text-xs font-medium">LIVE</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1c2127] to-[#283039]">
            <div className="text-center">
              <span className="material-symbols-outlined text-[#9dabb9] text-6xl mb-4 block">videocam</span>
              <p className="text-[#9dabb9] mb-4">Enable camera for video interview experience</p>
              <button
                onClick={toggleWebcam}
                className="px-6 py-3 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold transition-all shadow-[0_0_15px_rgba(19,127,236,0.4)] flex items-center gap-2 mx-auto"
              >
                <span className="material-symbols-outlined">videocam</span>
                Enable Camera
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border-2 border-dashed border-[#3b4754] bg-[#1c2127] hover:border-primary/50 transition-colors">
        <div className="flex-1">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleResumeChange}
            className="block w-full text-sm text-[#9dabb9] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-blue-600 file:cursor-pointer file:transition-colors"
          />
          {resumeFile && (
            <div className="mt-2 flex items-center gap-2 text-sm text-primary">
              <span className="material-symbols-outlined text-lg">description</span>
              <span className="font-medium">{resumeFile.name}</span>
            </div>
          )}
        </div>
        <button
          onClick={startInterview}
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold transition-all shadow-[0_0_15px_rgba(19,127,236,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Processing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">rocket_launch</span>
              Upload & Start
            </>
          )}
        </button>
      </div>

      {/* Resume Summary */}
      {summary && (
        <div className="p-4 rounded-xl border border-[#3b4754] bg-[#1c2127]">
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined">description</span>
            Resume Summary
          </h3>
          <p className="text-[#9dabb9] text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={repeatQuestion}
          disabled={!sessionId}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#3b4754] bg-[#1c2127] text-white hover:bg-[#283039] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-lg">replay</span>
          Repeat
        </button>
        <button
          onClick={() => speakOut(currentQuestion)}
          disabled={!currentQuestion}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#3b4754] bg-[#1c2127] text-white hover:bg-[#283039] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-lg">volume_up</span>
          Play
        </button>
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${recording
              ? 'border-red-500 bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'border-[#3b4754] bg-[#1c2127] text-white hover:bg-[#283039]'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <span className="material-symbols-outlined text-lg">{recording ? 'stop_circle' : 'mic'}</span>
          {recording ? 'Stop Recording' : 'Record'}
        </button>
        {recording && (
          <div className="flex items-center gap-2 px-3 py-2 text-red-400 text-sm font-medium animate-pulse">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            Recording...
          </div>
        )}
      </div>

      {/* Chat Container */}
      <div className="flex flex-col bg-[#1c2127] border border-[#3b4754] rounded-xl overflow-hidden shadow-lg h-[500px]">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed ${m.from === 'user'
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-[#283039] text-[#e2e8f0] rounded-bl-sm border border-[#3b4754]'
                }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#283039] text-[#9dabb9] px-4 py-3 rounded-xl rounded-bl-sm border border-[#3b4754] flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-[#3b4754] bg-[#111418] flex">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer or use voice recording..."
            className="flex-1 px-4 py-4 bg-transparent border-none outline-none text-white placeholder-[#9dabb9] text-sm"
          />
          <button
            type="submit"
            disabled={loading || !sessionId}
            className="px-6 bg-primary hover:bg-blue-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
