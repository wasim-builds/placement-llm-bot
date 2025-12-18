import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat.js';
import interviewRouter from './routes/interview.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRouter);
app.use('/api/interview', interviewRouter);

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`LLM chatbot server running on port ${port}`);
});
