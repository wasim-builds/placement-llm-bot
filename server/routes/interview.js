import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { randomUUID } from 'crypto';
import { askLLM, transcribeAudio } from '../services/llmClient.js';
import db from '../services/database.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max for PDF
  },
});

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max for audio
  },
});

const router = express.Router();

// Simple in-memory session storage (resets on server restart)
const sessions = new Map();

const MAX_RESUME_CHARS = 12000;
const DEFAULT_CONTEXT =
  'You are a concise technical interviewer. Ask one question at a time, tailored to the candidate resume.';

function normalizeResumeText(text) {
  if (!text) return '';
  const collapsed = text.replace(/\s+/g, ' ').trim();
  return collapsed.slice(0, MAX_RESUME_CHARS);
}

async function summarizeResume(rawText) {
  const resume = normalizeResumeText(rawText);
  const prompt = `Summarize this resume for an interviewer in 6 short bullet points. Keep concise, avoid fluff. Resume: ${resume}`;
  const summary = await askLLM(prompt, DEFAULT_CONTEXT);
  return summary;
}

async function nextQuestion(session, answer) {
  const history = session.history
    .map((item, idx) => `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer || 'no answer provided'}`)
    .join('\n');

  const userPrompt = `Resume summary:\n${session.summary}\n\nPrior Q&A:\n${history}\n\nNew answer: ${answer}\n\nAsk exactly one follow-up question (<=40 words). If the conversation should end, reply with "End of interview." only.`;

  const question = await askLLM(userPrompt, DEFAULT_CONTEXT);
  return question;
}

// Upload resume and start interview
router.post('/resume', upload.single('resume'), async (req, res) => {
  try {
    const { jobId: rawJobId, applicationId: rawApplicationId } = req.body;

    if (!rawApplicationId) {
      return res.status(400).json({ error: 'Application ID is required' });
    }

    const applicationId = parseInt(rawApplicationId, 10);
    if (Number.isNaN(applicationId)) {
      return res.status(400).json({ error: 'Application ID must be a number' });
    }

    const jobId = rawJobId ? parseInt(rawJobId, 10) : null;

    const application = db.getApplicationById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (jobId && application.jobId !== jobId) {
      return res.status(400).json({ error: 'Application does not belong to the provided job' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF resumes are accepted' });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const summary = await summarizeResume(pdfData.text || '');

    const initialQuestion = await askLLM(
      `Resume summary:\n${summary}\n\nAsk the first interview question. Keep it role-appropriate, <=35 words.`,
      DEFAULT_CONTEXT
    );

    const sessionId = randomUUID();
    sessions.set(sessionId, {
      summary,
      jobId: jobId || application.jobId,
      applicationId,
      history: [
        {
          question: initialQuestion,
          answer: null,
        },
      ],
    });

    res.json({ sessionId, summary, question: initialQuestion });
  } catch (err) {
    console.error('Resume upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to process resume' });
  }
});

// Submit text answer
router.post('/answer', async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (!answer || answer.trim().length === 0) {
      return res.status(400).json({ error: 'Answer is required' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const lastIndex = session.history.length - 1;
    session.history[lastIndex].answer = answer;

    const question = await nextQuestion(session, answer);
    session.history.push({ question, answer: null });

    const done = question.trim().toLowerCase() === 'end of interview.';
    res.json({ question, done });
  } catch (err) {
    console.error('Answer error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate next question' });
  }
});

// Submit audio answer
router.post('/answer-audio', audioUpload.single('audio'), async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const allowed = ['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4'];
    if (req.file.mimetype && !allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Unsupported audio format. Use webm, ogg, mpeg, or mp4' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const transcript = await transcribeAudio(req.file.buffer, req.file.originalname || 'audio.webm');

    const lastIndex = session.history.length - 1;
    session.history[lastIndex].answer = transcript;

    const question = await nextQuestion(session, transcript);
    session.history.push({ question, answer: null });

    const done = question.trim().toLowerCase() === 'end of interview.';
    res.json({ question, done, transcript });
  } catch (err) {
    console.error('Audio answer error:', err);
    res.status(500).json({ error: err.message || 'Failed to transcribe or generate next question' });
  }
});

// Save interview result (scores/transcript) for a session
router.post('/result', async (req, res) => {
  try {
    const { sessionId, applicationId: rawApplicationId, jobId: rawJobId, transcript, scores, overallScore } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (!rawApplicationId) {
      return res.status(400).json({ error: 'Application ID is required' });
    }

    const applicationId = parseInt(rawApplicationId, 10);
    if (Number.isNaN(applicationId)) {
      return res.status(400).json({ error: 'Application ID must be a number' });
    }

    const jobId = rawJobId ? parseInt(rawJobId, 10) : null;

    const application = db.getApplicationById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (jobId && application.jobId !== jobId) {
      return res.status(400).json({ error: 'Application does not belong to the provided job' });
    }

    const session = sessions.get(sessionId);

    const transcriptText = transcript
      || (session?.history
        ? session.history
            .map((item, idx) => `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer || 'no answer provided'}`)
            .join('\n')
        : '');

    const result = db.createInterviewResult({
      applicationId,
      jobId: jobId || application.jobId,
      sessionId,
      scores: scores || {},
      transcript: transcriptText ? [transcriptText] : [],
      overallScore: typeof overallScore === 'number' ? overallScore : 0,
    });

    res.json({ message: 'Interview result saved', result });
  } catch (err) {
    console.error('Interview result error:', err);
    res.status(500).json({ error: err.message || 'Failed to save interview result' });
  }
});

// Repeat last question
router.get('/repeat/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  const lastQuestion = session.history.at(-1)?.question;
  res.json({ question: lastQuestion });
});

// Generate speech audio for question (TTS)
router.post('/tts', async (req, res) => {
  try {
    const { text, voice = 'nova' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Import generateSpeech function
    const { generateSpeech } = await import('../services/llmClient.js');

    const audioBuffer = await generateSpeech(text, voice);

    // Set headers for audio streaming
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
    });

    res.send(audioBuffer);
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate speech' });
  }
});

export default router;

