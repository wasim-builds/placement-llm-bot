# Placement LLM Bot

Placement prep assistant with a Vite/React frontend and an Express backend powered by Azure OpenAI. Upload a resume (PDF), chat, and run mock interviews (text or audio) in one place.

## Requirements
- Node.js 18+
- npm
- Azure OpenAI resource with chat and (optional) Whisper deployments

## Setup
1) Install server deps at repo root:
```sh
npm install
```
2) Install frontend deps:
```sh
cd frontend
npm install
```
3) Create `.env` in the repo root:
```
AZURE_OPENAI_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=chat-deployment-name
AZURE_OPENAI_WHISPER_DEPLOYMENT=whisper-deployment-name   # optional, needed for audio answers
PORT=5001                                                 # optional
```

## Run
- Start backend (default http://localhost:5001):
```sh
npm start
```
- Start frontend dev server (default http://localhost:5173):
```sh
cd frontend
npm run dev
```

## API overview
- `POST /api/chat` — `{ message, context? }` → `{ reply }`
- `POST /api/interview/resume` — `form-data` with `resume` (PDF) → `{ sessionId, summary, question }`
- `POST /api/interview/answer` — `{ sessionId, answer }` → `{ question, done }`
- `POST /api/interview/answer-audio` — `form-data` with `sessionId`, `audio` → `{ transcript, question, done }`
- `GET /api/interview/repeat/:sessionId` — last asked question

## Notes
- Sessions are kept in-memory; swap for a persistent store in production.
- Resume text is trimmed to 12k chars to control prompt size.
- Audio Q&A requires Whisper deployment configuration.
