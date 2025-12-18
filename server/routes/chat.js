import express from 'express';
import { askLLM } from '../services/llmClient.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }
    const reply = await askLLM(message, context);
    res.json({ reply });
  } catch (err) {
    console.error('Route error:', err);
    res.status(500).json({
      error: err.message || 'Something went wrong',
    });
  }
});


export default router;
