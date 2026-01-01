import express from 'express';
import { askLLM } from '../services/llmClient.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const reply = await askLLM(message, context);
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({
      error: err.message || 'Something went wrong',
    });
  }
});

export default router;
