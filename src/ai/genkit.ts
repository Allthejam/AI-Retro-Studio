import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.GOOGLE_GENAI_API_KEY ||
  'AIzaSyC1Va21n6QxGJCmDnW3YPQwSuOk7VRe81E';

export const ai = genkit({
  plugins: [googleAI({ apiKey })],
  model: 'googleai/gemini-2.5-flash',
});
