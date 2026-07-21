import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Parse natural language commands into Android action steps
app.post('/api/agent/parse', async (req, res) => {
  try {
    const { command, context } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'Command prompt is required' });
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      console.warn('Gemini client initialization failed (likely missing key):', err.message);
      return res.status(403).json({
        error: 'API_KEY_MISSING',
        message: 'GEMINI_API_KEY is not configured in Secrets. Using fallback client-side heuristics.',
      });
    }

    const systemInstruction = `You are the brain of an Android AI Agent. Your job is to translate a user's natural language command into a structured sequence of actions that can be performed on a simulated Android phone.

The user is currently viewing the app: ${context || 'home'} on the screen. If the command involves "this" (like "send this" or "share this"), use this context to infer what they mean.

The simulated phone has the following apps available:
1. 'weather': View weather forecasts, search cities.
2. 'email': List emails, read emails, compose and send emails.
3. 'spotify': Browse and play tracks, play/pause music, control audio.
4. 'twitter': Browse Twitter feeds, like posts, reply to posts, create new posts.
5. 'maps': Search destinations, view directions and traffic, navigate.
6. 'settings': Toggle Wi-Fi, Bluetooth, Dark Mode, and Do Not Disturb (DND).
7. 'smart_home': Control devices: turn living room light on/off, change thermostat, lock/unlock front door.
8. 'messages': Send SMS/chats to contacts (like Sarah, John, Alex).

Available Actions:
- 'open_app': Open a specific app. Target must be the app name ('weather', 'email', 'spotify', 'twitter', 'maps', 'settings', 'smart_home', 'messages', 'home').
- 'tap': Click an element on the screen. Target is the element identifier. Examples:
  - In Weather: 'search_button', 'city_card'
  - In Email: 'compose_btn', 'send_btn', 'first_email'
  - In Spotify: 'play_button', 'next_button', 'track_row_1'
  - In Twitter: 'compose_tweet_btn', 'tweet_submit_btn', 'tweet_like_1', 'tweet_reply_1'
  - In Maps: 'search_destination_input', 'get_directions_btn', 'start_navigation_btn'
  - In Settings: 'toggle_dark_mode', 'toggle_wifi', 'toggle_bluetooth', 'toggle_dnd'
  - In Smart Home: 'toggle_living_room_light', 'thermostat_plus', 'thermostat_minus', 'toggle_front_door_lock'
  - In Messages: 'chat_with_sarah', 'chat_with_john', 'send_msg_btn'
- 'type': Type text into an active input field. Target is the input field, value is the text. Examples:
  - 'weather_search_input', 'email_recipient', 'email_subject', 'email_body', 'twitter_compose_text', 'twitter_reply_text', 'maps_search_input', 'messages_input_text'.
- 'wait': Pause execution (value is ms, e.g., '1200').
- 'read_content': Read text off the screen (target is element e.g. 'weather_degrees', 'maps_eta', 'latest_tweet').
- 'speak': Synthesize voice feedback or verbal notification. Value is the spoken feedback (e.g., 'Now playing summer lofi', 'Email sent to John').

Output format: You must return a JSON object with the strict properties specified. Do not include markdown wraps. Ensure the steps flow logically (e.g. open the app before tapping its inside elements).`;

    // Sanitize user input to prevent prompt injection
    const sanitizedCommand = command
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, ' ')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Translate the command enclosed in <command> tags into a sequence of agent steps:\n<command>${sanitizedCommand}</command>`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Brief, friendly summary of what the agent will accomplish.',
            },
            steps: {
              type: Type.ARRAY,
              description: 'The step-by-step physical actions to execute on the simulated device.',
              items: {
                type: Type.OBJECT,
                properties: {
                  action: {
                    type: Type.STRING,
                    description: 'One of: open_app, tap, type, scroll, wait, read_content, speak',
                  },
                  target: {
                    type: Type.STRING,
                    description: 'The visual element ID or app name targeted by the action.',
                  },
                  value: {
                    type: Type.STRING,
                    description: 'Optional content value such as text to type or wait duration.',
                  },
                  description: {
                    type: Type.STRING,
                    description: 'A friendly human-readable log describing what the agent is doing at this instant.',
                  },
                },
                required: ['action', 'target', 'description'],
              },
            },
          },
          required: ['summary', 'steps'],
        },
      },
    });

    const text = response.text || '{}';
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Agent translation failed:', error);
    res.status(500).json({ error: 'AGENT_ERROR', message: error.message });
  }
});

// Configure Vite or Serve Static Files
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
