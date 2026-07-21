# Android Agent Simulator (Aura Control Center)

An interactive, full-stack simulator for an Android AI Agent. This application translates natural language commands into step-by-step physical UI gestures, simulating autonomous task execution and ADB commands on a virtual smartphone interface.

## Features

- **Natural Language Parsing**: Translates user commands into structured execution steps using the Gemini API (with a local heuristic fallback for offline mode).
- **Contextual Awareness**: The agent understands the active foreground app context (e.g., "Share this" works differently depending on whether you are viewing Maps or Twitter).
- **Task Templates**: Save, use, and manage reusable task workflows. Task templates are persistently stored in Firebase Firestore.
- **Voice Commands**: Utilize browser-based Speech Recognition to dictate commands naturally.
- **Physical UI Simulation**: Visualizes the agent clicking, typing, and swiping on a simulated Android device, navigating various mockup apps (Weather, Spotify, Email, Smart Home, Twitter, Maps, Settings).
- **Execution Queue & Visualizer**: See the agent's planned steps in real-time, watching as they transition from queued to processing to completed.
- **Simulated ADB Terminal**: Live streaming of simulated Android Debug Bridge (ADB) commands and shell logs.
- **Sleek Aesthetic**: A modern, high-contrast dark theme utilizing elegant typography and glowing UI accents.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, TypeScript, Lucide React (Icons).
- **Backend**: Express, Node.js (bundled with esbuild).
- **AI/NLP**: Google Gemini API (`@google/genai`) for server-side intent parsing.
- **Database**: Firebase Firestore for persistent task template storage.

## Setup & Local Development

1. Ensure you have Node.js installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Create a `.env` file in the root directory and add your Gemini API Key.
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. The application will be accessible at `http://localhost:3000`.

## Architecture Overview

- **`src/App.tsx`**: The main dashboard layout coordinating the simulator, control panel, and terminal.
- **`src/components/PhoneSimulator.tsx`**: The Android device visualizer tracking screen states and gestures.
- **`src/components/AgentControlPanel.tsx`**: The command center for dispatching instructions, managing templates (connected to Firebase), and viewing execution queues.
- **`src/components/AdbTerminal.tsx`**: The terminal logging view.
- **`server.ts`**: The Express backend proxy handling secure Gemini API NLP processing.
- **`src/utils/fallbackParser.ts`**: Local heuristic parsing engine acting as a fallback when the Gemini API is unreachable or unconfigured.

## License

MIT
