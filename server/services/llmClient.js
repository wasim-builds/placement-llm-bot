import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

function makeClient(deployment) {
  return new OpenAI({
    apiKey: process.env.AZURE_OPENAI_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${deployment}`,
    defaultQuery: { 'api-version': '2024-08-01-preview' },
    defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY },
  });
}

const chatClient = makeClient(process.env.AZURE_OPENAI_DEPLOYMENT);
const whisperDeployment = process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT;
const whisperClient = whisperDeployment ? makeClient(whisperDeployment) : null;

export async function askLLM(
  message,
  context = 'You are a helpful interview-prep assistant.'
) {
  try {
    const completion = await chatClient.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT,
      messages: [
        { role: 'system', content: context },
        { role: 'user', content: message },
      ],
    });

    return completion.choices[0]?.message?.content ?? 'No response from model.';
  } catch (err) {
    console.error('askLLM Azure error:', err.response?.data || err.message || err);
    throw err;
  }
}

export async function transcribeAudio(buffer, filename = 'audio.webm') {
  if (!whisperClient) {
    throw new Error('AZURE_OPENAI_WHISPER_DEPLOYMENT is not configured');
  }
  try {
    const transcription = await whisperClient.audio.transcriptions.create({
      file: buffer,
      filename,
      model: whisperDeployment,
      response_format: 'text',
      language: 'en',
    });
    return typeof transcription === 'string' ? transcription : transcription.text || '';
  } catch (err) {
    console.error('transcribeAudio Azure error:', err.response?.data || err.message || err);
    throw err;
  }
}
