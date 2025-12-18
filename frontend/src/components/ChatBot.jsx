import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api/interview';

export default function ChatBot() {
  const [resumeFile, setResumeFile] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [summary, setSummary] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Upload your resume (PDF), then start the voice interview.' },
  ]);
  const [input, setInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunksRef = useRef([]);

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
        { from: 'bot', text: 'Resume processed. Summary ready. Starting interview.' },
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
        setMessages((prev) => [...prev, { from: 'bot', text: 'Interview ended.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { from: 'bot', text: 'Error contacting server. Try again later.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sessionId) return alert('Upload resume and start the interview first.');
    sendAnswer(input);
  };

  const sendAudioAnswer = async (blob) => {
    if (!sessionId) return alert('Upload resume and start the interview first.');
    const formData = new FormData();
    formData.append('sessionId', sessionId);
    formData.append('audio', blob, 'answer.webm');

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/answer-audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const transcript = res.data.transcript || '[No transcript]';
      const nextQ = res.data.question;
      setCurrentQuestion(nextQ);
      setMessages((prev) => [...prev, { from: 'user', text: transcript }, { from: 'bot', text: nextQ }]);
      if (res.data.done) {
        setMessages((prev) => [...prev, { from: 'bot', text: 'Interview ended.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: 'Error transcribing audio. Try again or type your answer.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      if (!sessionId) return alert('Upload resume and start the interview first.');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        await sendAudioAnswer(blob);
        stream.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      mediaStreamRef.current = stream;
      setRecording(true);
    } catch (err) {
      console.error(err);
      alert('Could not start recording. Check mic permissions.');
    }
  };

  const stopRecording = () => {
    if (!recording) return;
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const repeatQuestion = async () => {
    if (!sessionId) return;
    try {
      const res = await axios.get(`${API_BASE}/repeat/${sessionId}`);
      const question = res.data.question;
      setCurrentQuestion(question);
      setMessages((prev) => [...prev, { from: 'bot', text: question }]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="upload-bar">
        <div>
          <input type="file" accept="application/pdf" onChange={handleResumeChange} />
          {resumeFile && <span className="file-pill">{resumeFile.name}</span>}
        </div>
        <button onClick={startInterview} disabled={loading}>
          {loading ? 'Processing…' : 'Upload & Start'}
        </button>
      </div>

      {summary && (
        <div className="summary-box">
          <div className="summary-title">Resume summary</div>
          <p>{summary}</p>
        </div>
      )}

      <div className="controls-bar">
        <button onClick={repeatQuestion} disabled={!sessionId}>Repeat question</button>
        <button onClick={() => speakOut(currentQuestion)} disabled={!currentQuestion}>
          Play question
        </button>
        <button onClick={recording ? stopRecording : startRecording} disabled={loading}>
          {recording ? 'Stop recording' : 'Record answer (voice)'}
        </button>
        {recording && <span className="recording-dot">● Recording</span>}
      </div>

      <div className="chat-container">
        <div className="chat-window">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.from === 'user' ? 'user' : 'bot'}`}>
              {m.text}
            </div>
          ))}
          {loading && <div className="msg bot">Thinking...</div>}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Speak or type your answer..."
          />
          <button type="submit" disabled={loading || !sessionId}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
