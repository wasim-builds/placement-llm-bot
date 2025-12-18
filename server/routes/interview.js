import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { randomUUID } from 'crypto';
import { askLLM, transcribeAudio } from '../services/llmClient.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// In-memory session store for MVP. Replace with Redis/DB for production.
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

router.post('/resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'resume file is required' });
    }
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF resumes are accepted for now.' });
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
      history: [
        {
          question: initialQuestion,
          answer: null,
        },
      ],
    });

    res.json({ sessionId, summary, question: initialQuestion });
  } catch (err) {
    console.error('resume upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to process resume' });
  }
});

router.post('/answer', async (req, res) => {
  try {
    const { sessionId, answer } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });
    if (!answer) return res.status(400).json({ error: 'answer is required' });

    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const lastIndex = session.history.length - 1;
    session.history[lastIndex].answer = answer;

    const question = await nextQuestion(session, answer);
    session.history.push({ question, answer: null });

    const done = question.trim().toLowerCase() === 'end of interview.';
    res.json({ question, done });
  } catch (err) {
    console.error('answer route error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate next question' });
  }
});

router.post('/answer-audio', upload.single('audio'), async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });
    if (!req.file) return res.status(400).json({ error: 'audio file is required' });

    const allowed = ['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4'];
    if (req.file.mimetype && !allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Unsupported audio type. Use webm/ogg/mpeg.' });
    }

    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const transcript = await transcribeAudio(req.file.buffer, req.file.originalname || 'audio.webm');

    const lastIndex = session.history.length - 1;
    session.history[lastIndex].answer = transcript;

    const question = await nextQuestion(session, transcript);
    session.history.push({ question, answer: null });

    const done = question.trim().toLowerCase() === 'end of interview.';
    res.json({ question, done, transcript });
  } catch (err) {
    console.error('answer-audio route error:', err);
    res.status(500).json({ error: err.message || 'Failed to transcribe or generate next question' });
  }
});

router.get('/repeat/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  const lastQuestion = session.history.at(-1)?.question;
  res.json({ question: lastQuestion });
});

export default router;
