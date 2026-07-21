import React, { useState, useEffect, useRef } from 'react';
import PhoneSimulator from './components/PhoneSimulator';
import AgentControlPanel from './components/AgentControlPanel';
import AdbTerminal from './components/AdbTerminal';
import {
  AndroidApp,
  Email,
  Tweet,
  ChatThread,
  DeviceState,
  SystemSettings,
  AgentRun,
  AgentStep,
} from './types';
import { parseCommandLocally } from './utils/fallbackParser';

// Initial Mock data for various phone apps
const INITIAL_EMAILS: Email[] = [
  {
    id: 'email-1',
    sender: 'boss@company.com',
    subject: 'Quarterly Sync & Work Status',
    body: 'Good morning! Please send over your daily progress notes. I need to compile them for the executive briefing today.',
    date: '8:30 AM',
    read: false,
  },
  {
    id: 'email-2',
    sender: 'google-cloud@gcp.com',
    subject: 'Google Cloud Run Service Active',
    body: 'Your service has been successfully deployed to Cloud Run and is now listening on Port 3000. Resource consumption is low.',
    date: 'Yesterday',
    read: true,
  },
  {
    id: 'email-3',
    sender: 'news@techcrunch.com',
    subject: 'The Rise of Physical UI AI Agents',
    body: 'Recent breakthroughs in multi-modal LLMs have enabled autonomous web and mobile agents that can navigate visual touch displays seamlessly.',
    date: 'July 18',
    read: true,
  },
];

const INITIAL_TWEETS: Tweet[] = [
  {
    id: 'tweet-1',
    user: 'AI Explorer',
    handle: 'aiexplorer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
    text: 'Automated AI Agents are completely changing how we interact with mobile apps. Rather than manually clicking through 5 different menus, just write natural commands and let the agent click the display pixels. 🤖🚀',
    likes: 42,
    isLiked: false,
    repliesCount: 1,
    replies: [
      { user: 'tech_enthusiast', text: 'This is incredible! Can we hook this up to adb?', date: '10m ago' },
    ],
  },
  {
    id: 'tweet-2',
    user: 'Google AI Studio',
    handle: 'google_ai_studio',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80',
    text: 'Build and deploy fully functional web apps in seconds with Gemini 3.5 Flash and full-stack containers. Secrets are injected securely and ready to run!',
    likes: 128,
    isLiked: false,
    repliesCount: 0,
    replies: [],
  },
];

const INITIAL_CHATS: ChatThread[] = [
  {
    id: 'chat-sarah',
    contactName: 'Sarah',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
    unread: true,
    messages: [
      { id: 'm1', sender: 'contact', text: 'Hey, are you coming to the tech sync later?', timestamp: '9:15 AM' },
      { id: 'm2', sender: 'user', text: 'Yeah, just finishing up some autonomous agent workflows.', timestamp: '9:20 AM' },
      { id: 'm3', sender: 'contact', text: 'Let me know once you are on your way!', timestamp: '9:22 AM' },
    ],
  },
  {
    id: 'chat-john',
    contactName: 'John',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
    unread: false,
    messages: [
      { id: 'j1', sender: 'contact', text: 'Did you turn on the server lights?', timestamp: 'Yesterday' },
      { id: 'j2', sender: 'user', text: 'Yes, setting them through the smart home hub now.', timestamp: 'Yesterday' },
    ],
  },
];

const TARGET_COORDINATES: Record<string, { x: number; y: number }> = {
  app_weather: { x: 18, y: 38 },
  app_email: { x: 43, y: 38 },
  app_spotify: { x: 68, y: 38 },
  app_twitter: { x: 92, y: 38 },
  app_maps: { x: 18, y: 55 },
  app_settings: { x: 43, y: 55 },
  app_smart_home: { x: 68, y: 55 },
  app_messages: { x: 92, y: 55 },
  search_button: { x: 86, y: 13 },
  weather_search_input: { x: 45, y: 13 },
  compose_btn: { x: 88, y: 6 },
  email_recipient: { x: 50, y: 35 },
  email_subject: { x: 50, y: 45 },
  email_body: { x: 50, y: 60 },
  send_btn: { x: 84, y: 15 },
  track_row_1: { x: 50, y: 78 },
  play_button: { x: 50, y: 63 },
  compose_tweet_btn: { x: 88, y: 6 },
  twitter_compose_text: { x: 50, y: 50 },
  tweet_submit_btn: { x: 84, y: 15 },
  tweet_like_1: { x: 20, y: 36 },
  tweet_reply_1: { x: 40, y: 36 },
  maps_search_input: { x: 50, y: 13 },
  get_directions_btn: { x: 50, y: 88 },
  start_navigation_btn: { x: 50, y: 88 },
  toggle_wifi: { x: 84, y: 16 },
  toggle_bluetooth: { x: 84, y: 29 },
  toggle_dark_mode: { x: 84, y: 47 },
  toggle_dnd: { x: 84, y: 60 },
  toggle_living_room_light: { x: 28, y: 22 },
  toggle_front_door_lock: { x: 72, y: 22 },
  thermostat_minus: { x: 28, y: 50 },
  thermostat_plus: { x: 72, y: 50 },
  chat_with_sarah: { x: 50, y: 18 },
  chat_with_john: { x: 50, y: 32 },
  messages_input_text: { x: 45, y: 92 },
  send_msg_btn: { x: 90, y: 92 },
};

export default function App() {
  // Mobile app logical state trackers
  const [currentApp, setCurrentApp] = useState<AndroidApp>('home');
  const [deviceState, setDeviceState] = useState<DeviceState>({
    livingRoomLight: { on: false, brightness: 75 },
    thermostat: { temp: 72 },
    frontDoorLock: { locked: true },
  });
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    darkMode: true,
    wifi: true,
    bluetooth: false,
    dnd: false,
  });

  const [weatherCity, setWeatherCity] = useState('San Francisco');
  const [spotifyIsPlaying, setSpotifyIsPlaying] = useState(false);
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
  const [tweets, setTweets] = useState<Tweet[]>(INITIAL_TWEETS);
  const [chats, setChats] = useState<ChatThread[]>(INITIAL_CHATS);

  // Simulated internal App Inputs
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailComposeOpen, setEmailComposeOpen] = useState(false);

  const [twitterComposeText, setTwitterComposeText] = useState('');
  const [twitterComposeOpen, setTwitterComposeOpen] = useState(false);
  const [twitterReplyText, setTwitterReplyText] = useState('');
  const [twitterReplyTargetId, setTwitterReplyTargetId] = useState<string | null>(null);

  const [mapsSearchInput, setMapsSearchInput] = useState('');
  const [mapsDirectionsActive, setMapsDirectionsActive] = useState(false);
  const [mapsNavigationActive, setMapsNavigationActive] = useState(false);

  const [messagesInputText, setMessagesInputText] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const [weatherSearchInput, setWeatherSearchInput] = useState('');

  // Agent Compiler & Execution states
  const [inputCommand, setInputCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeRun, setActiveRun] = useState<AgentRun | null>(null);
  const [historyRuns, setHistoryRuns] = useState<AgentRun[]>([]);
  const [adbLogs, setAdbLogs] = useState<string[]>([]);
  const [cursorTarget, setCursorTarget] = useState<{ x: number; y: number } | null>(null);
  const [cursorTapped, setCursorTapped] = useState(false);
  const [agentSpeed, setAgentSpeed] = useState<number>(1); // 1 = 1x, 2 = 2x, 4 = 4x
  const [isFallbackActive, setIsFallbackActive] = useState(false);

  // Sync references to avoid stale states during async intervals
  const agentSpeedRef = useRef(agentSpeed);
  useEffect(() => {
    agentSpeedRef.current = agentSpeed;
  }, [agentSpeed]);

  // Load execution history from localStorage on start
  useEffect(() => {
    try {
      const stored = localStorage.getItem('android_agent_history');
      if (stored) {
        setHistoryRuns(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history from localStorage:', e);
    }

    // Add boot logs to terminal
    appendLog('$ adb devices');
    appendLog('List of devices attached');
    appendLog('emulator-5554\tdevice');
    appendLog('$ adb shell getprop ro.build.version.release');
    appendLog('15 (Android Vanilla Ice Cream)');
    appendLog('$ adb shell am broadcast -a android.intent.action.BOOT_COMPLETED');
    appendLog('Broadcasting: Intent { act=android.intent.action.BOOT_COMPLETED }');
    appendLog('[Success] Device booted and bound to emulator link.');
  }, []);

  const appendLog = (log: string) => {
    setAdbLogs((prev) => [...prev, log]);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('android_agent_history');
    setHistoryRuns([]);
    appendLog('$ rm -rf /data/system/users/0/agent_history.db');
    appendLog('[Success] Execution log cleared.');
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistoryRuns((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      localStorage.setItem('android_agent_history', JSON.stringify(updated));
      return updated;
    });
    appendLog(`$ sqlite3 /data/system/users/0/agent_history.db "DELETE FROM runs WHERE id='${id}'"`);
  };

  // Speaks feedback verbalizations safely
  const speakVerbalOutput = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        // Cancel ongoing speak to avoid overlapping
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('Speech synthesis not allowed or supported:', err);
    }
  };

  // Form submit command or preset select orchestrator
  const handleSubmitCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim() || isLoading) return;
    await processCommand(inputCommand);
  };

  const handleSelectPreset = async (presetCommand: string) => {
    setInputCommand(presetCommand);
    await processCommand(presetCommand);
  };

  const processCommand = async (commandText: string) => {
    setIsLoading(true);
    setIsFallbackActive(false);
    appendLog(`\n$ [Agent] Received task compile request...`);
    appendLog(`[Agent] Natural Instruction: "${commandText}"`);
    appendLog(`[Agent] Current App Context: "${currentApp}"`);
    appendLog(`[Agent] Querying server-side model for action graph...`);

    try {
      const response = await fetch('/api/agent/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: commandText, context: currentApp }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('API_KEY_MISSING');
        } else {
          throw new Error('API_FAIL');
        }
      }

      const parsed = await response.json();
      appendLog(`[Success] Server model responded successfully. Compiling action steps...`);
      startAgentExecution(commandText, parsed.steps);
    } catch (err: any) {
      if (err.message === 'API_KEY_MISSING') {
        appendLog(`[Warning] Google Gemini API Key is missing from Secrets.`);
      } else {
        appendLog(`[Warning] Server parsing error. Network or API is unresponsive.`);
      }
      appendLog(`[Agent] Booting local heuristic NLP compiler...`);
      setIsFallbackActive(true);

      const localResult = parseCommandLocally(commandText, currentApp);
      appendLog(`[Success] Locally resolved ${localResult.steps.length} actions successfully.`);
      startAgentExecution(commandText, localResult.steps);
    } finally {
      setIsLoading(false);
    }
  };

  // Starts the interactive visual runner
  const startAgentExecution = (command: string, steps: AgentStep[]) => {
    const run: AgentRun = {
      id: Math.random().toString(36).substring(2, 9),
      command,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'running',
      steps,
      currentStepIndex: 0,
    };
    setActiveRun(run);
  };

  // core automated runner sequential event loop handler!
  useEffect(() => {
    if (!activeRun || activeRun.status !== 'running') return;

    const currentIndex = activeRun.currentStepIndex;
    if (currentIndex >= activeRun.steps.length) {
      // Loop is complete!
      const finalRun = { ...activeRun, status: 'completed' as const };
      setActiveRun(finalRun);
      
      // Save to local storage
      setHistoryRuns((prev) => {
        const updated = [finalRun, ...prev].slice(0, 30);
        localStorage.setItem('android_agent_history', JSON.stringify(updated));
        return updated;
      });

      setCursorTarget(null);
      appendLog(`\n[Success] Task automation completed successfully!`);
      return;
    }

    const step = activeRun.steps[currentIndex];
    
    // Mark step running
    setActiveRun((prev) => {
      if (!prev) return null;
      const updatedSteps = prev.steps.map((s, sIdx) =>
        sIdx === currentIndex ? { ...s, status: 'running' as const } : s
      );
      return { ...prev, steps: updatedSteps };
    });

    const runStep = async () => {
      const speedFactor = agentSpeedRef.current;
      const stepTarget = step.target;

      // 1. Physical Cursor Movement Navigation
      if (TARGET_COORDINATES[stepTarget]) {
        const coords = TARGET_COORDINATES[stepTarget];
        setCursorTarget(coords);
        appendLog(`$ adb shell uiautomator dump /sdcard/window_dump.xml`);
        appendLog(`[Agent] Found Node ID "${stepTarget}" at display coordinate [${coords.x}%, ${coords.y}%]`);
        
        // Wait for cursor flight animation
        await new Promise((res) => setTimeout(res, 1000 / speedFactor));
        
        // Brief Finger Tap animation ripple
        setCursorTapped(true);
        await new Promise((res) => setTimeout(res, 200 / speedFactor));
        setCursorTapped(false);
      }

      // 2. Perform Physical State modification based on action
      switch (step.action) {
        case 'open_app':
          appendLog(`$ adb shell am start -n com.android.${stepTarget}/.MainActivity`);
          setCurrentApp(stepTarget as AndroidApp);
          break;

        case 'tap':
          appendLog(`$ adb shell input tap ${TARGET_COORDINATES[stepTarget]?.x || 100} ${TARGET_COORDINATES[stepTarget]?.y || 100}`);
          
          // Apply internal app state toggles
          if (stepTarget === 'toggle_dark_mode') {
            setSystemSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }));
          } else if (stepTarget === 'toggle_wifi') {
            setSystemSettings((prev) => ({ ...prev, wifi: !prev.wifi }));
          } else if (stepTarget === 'toggle_bluetooth') {
            setSystemSettings((prev) => ({ ...prev, bluetooth: !prev.bluetooth }));
          } else if (stepTarget === 'toggle_dnd') {
            setSystemSettings((prev) => ({ ...prev, dnd: !prev.dnd }));
          } else if (stepTarget === 'toggle_living_room_light') {
            setDeviceState((prev) => ({
              ...prev,
              livingRoomLight: { ...prev.livingRoomLight, on: !prev.livingRoomLight.on },
            }));
          } else if (stepTarget === 'toggle_front_door_lock') {
            setDeviceState((prev) => ({
              ...prev,
              frontDoorLock: { locked: !prev.frontDoorLock.locked },
            }));
          } else if (stepTarget === 'thermostat_plus') {
            setDeviceState((prev) => ({
              ...prev,
              thermostat: { temp: Math.min(85, prev.thermostat.temp + 1) },
            }));
          } else if (stepTarget === 'thermostat_minus') {
            setDeviceState((prev) => ({
              ...prev,
              thermostat: { temp: Math.max(60, prev.thermostat.temp - 1) },
            }));
          } else if (stepTarget === 'compose_btn') {
            setEmailComposeOpen(true);
          } else if (stepTarget === 'send_btn') {
            // Add draft to emails list
            const newEmail: Email = {
              id: `email-${Date.now()}`,
              sender: emailRecipient || 'boss@company.com',
              subject: emailSubject || '(No Subject)',
              body: emailBody || '(No Body)',
              date: 'Just now',
              read: true,
            };
            setEmails((prev) => [newEmail, ...prev]);
            setEmailRecipient('');
            setEmailSubject('');
            setEmailBody('');
            setEmailComposeOpen(false);
          } else if (stepTarget === 'play_button') {
            setSpotifyIsPlaying((prev) => !prev);
          } else if (stepTarget === 'track_row_1') {
            setSpotifyIsPlaying(true);
          } else if (stepTarget === 'compose_tweet_btn') {
            setTwitterComposeOpen(true);
          } else if (stepTarget === 'tweet_submit_btn') {
            const newTweet: Tweet = {
              id: `tweet-${Date.now()}`,
              user: 'AI Assistant',
              handle: 'android_agent',
              avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80',
              text: twitterComposeText || 'Autonomous android agents are the future!',
              likes: 0,
              isLiked: false,
              repliesCount: 0,
              replies: [],
            };
            setTweets((prev) => [newTweet, ...prev]);
            setTwitterComposeText('');
            setTwitterComposeOpen(false);
          } else if (stepTarget === 'tweet_like_1') {
            setTweets((prev) =>
              prev.map((t, index) => {
                if (index === 0) {
                  return { ...t, likes: t.isLiked ? t.likes - 1 : t.likes + 1, isLiked: !t.isLiked };
                }
                return t;
              })
            );
          } else if (stepTarget === 'tweet_reply_1') {
            setTwitterReplyTargetId(tweets[0]?.id || 'tweet-1');
          } else if (stepTarget === 'get_directions_btn') {
            setMapsDirectionsActive(true);
          } else if (stepTarget === 'start_navigation_btn') {
            setMapsNavigationActive(true);
          } else if (stepTarget === 'chat_with_sarah') {
            setActiveChatId('chat-sarah');
            setChats((prev) => prev.map((c) => (c.id === 'chat-sarah' ? { ...c, unread: false } : c)));
          } else if (stepTarget === 'chat_with_john') {
            setActiveChatId('chat-john');
            setChats((prev) => prev.map((c) => (c.id === 'chat-john' ? { ...c, unread: false } : c)));
          } else if (stepTarget === 'send_msg_btn') {
            if (activeChatId) {
              setChats((prev) =>
                prev.map((c) => {
                  if (c.id === activeChatId) {
                    return {
                      ...c,
                      messages: [
                        ...c.messages,
                        {
                          id: `msg-${Date.now()}`,
                          sender: 'user',
                          text: messagesInputText || 'SMS Alert dispatch',
                          timestamp: 'Now',
                        },
                      ],
                    };
                  }
                  return c;
                })
              );
              setMessagesInputText('');
            }
          } else if (stepTarget === 'search_button') {
            if (weatherSearchInput.trim()) {
              setWeatherCity(weatherSearchInput);
            }
          }
          break;

        case 'type':
          const textToType = step.value || '';
          appendLog(`[Agent] Simulating keyboard hardware entry on Node "${stepTarget}"`);

          // Visual letter-by-letter typing emulator
          for (let i = 1; i <= textToType.length; i++) {
            const partial = textToType.substring(0, i);
            if (stepTarget === 'email_recipient') {
              setEmailRecipient(partial);
            } else if (stepTarget === 'email_subject') {
              setEmailSubject(partial);
            } else if (stepTarget === 'email_body') {
              setEmailBody(partial);
            } else if (stepTarget === 'twitter_compose_text') {
              setTwitterComposeText(partial);
            } else if (stepTarget === 'twitter_reply_text') {
              setTwitterReplyText(partial);
            } else if (stepTarget === 'maps_search_input') {
              setMapsSearchInput(partial);
            } else if (stepTarget === 'messages_input_text') {
              setMessagesInputText(partial);
            } else if (stepTarget === 'weather_search_input') {
              setWeatherSearchInput(partial);
            }
            // Delay per typed character
            await new Promise((res) => setTimeout(res, 50 / speedFactor));
          }
          appendLog(`$ adb shell input text '${textToType.replace(/'/g, "'\\''")}'`);
          break;

        case 'wait':
          const waitDuration = parseInt(step.value || '1000', 10);
          appendLog(`$ adb shell sleep ${(waitDuration / 1000).toFixed(1)}s`);
          await new Promise((res) => setTimeout(res, waitDuration / speedFactor));
          break;

        case 'read_content':
          appendLog(`$ adb shell screencap -p /sdcard/screencap.png`);
          appendLog(`[Agent] Capturing screenshot...`);
          await new Promise((res) => setTimeout(res, 400 / speedFactor));
          appendLog(`[Agent] Extracting visual characters from screen bounding box...`);
          if (stepTarget === 'weather_degrees') {
            appendLog(`[Agent] Read values on screen: "${weatherCity} forecast temperature: 68°F Sunny"`);
          } else if (stepTarget === 'maps_eta') {
            appendLog(`[Agent] Read values on screen: "Optimal commute route ETA is 25 minutes (12.4 mi)"`);
          } else {
            appendLog(`[Agent] Read values on screen: "Successfully verified UI content elements."`);
          }
          break;

        case 'speak':
          const speechVal = step.value || '';
          appendLog(`[Voice] speaking verbal notification: "${speechVal}"`);
          speakVerbalOutput(speechVal);
          await new Promise((res) => setTimeout(res, 500 / speedFactor));
          break;
      }

      // Mark step completed and advance index
      setActiveRun((prev) => {
        if (!prev) return null;
        const updatedSteps = prev.steps.map((s, sIdx) =>
          sIdx === currentIndex ? { ...s, status: 'completed' as const } : s
        );
        return {
          ...prev,
          steps: updatedSteps,
          currentStepIndex: currentIndex + 1,
        };
      });
    };

    runStep();
  }, [activeRun]);

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-slate-200 font-sans flex flex-col justify-between select-none overflow-hidden">
      
      {/* Decorative top ambient color blur */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main body dashboard wrapper */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        
        {/* Left Side: Agent Controls Panel */}
        <div className="lg:col-span-4 flex flex-col h-full justify-between order-2 lg:order-1" id="dashboard_controls">
          <AgentControlPanel
            inputCommand={inputCommand}
            setInputCommand={setInputCommand}
            handleSubmitCommand={handleSubmitCommand}
            isLoading={isLoading}
            activeRun={activeRun}
            historyRuns={historyRuns}
            handleSelectPreset={handleSelectPreset}
            handleClearHistory={handleClearHistory}
            handleDeleteHistoryItem={handleDeleteHistoryItem}
            agentSpeed={agentSpeed}
            setAgentSpeed={setAgentSpeed}
            isFallbackActive={isFallbackActive}
          />
        </div>

        {/* Center: Device Simulator container */}
        <div className="lg:col-span-4 flex flex-col justify-center items-center order-1 lg:order-2" id="dashboard_simulator">
          <PhoneSimulator
            currentApp={currentApp}
            setCurrentApp={setCurrentApp}
            deviceState={deviceState}
            setDeviceState={setDeviceState}
            systemSettings={systemSettings}
            setSystemSettings={setSystemSettings}
            weatherCity={weatherCity}
            setWeatherCity={setWeatherCity}
            spotifyIsPlaying={spotifyIsPlaying}
            setSpotifyIsPlaying={setSpotifyIsPlaying}
            emails={emails}
            setEmails={setEmails}
            tweets={tweets}
            setTweets={setTweets}
            chats={chats}
            setChats={setChats}
            activeStep={activeRun && activeRun.status === 'running' ? activeRun.steps[activeRun.currentStepIndex] || null : null}
            cursorTarget={cursorTarget}
            cursorTapped={cursorTapped}
            emailRecipient={emailRecipient}
            setEmailRecipient={setEmailRecipient}
            emailSubject={emailSubject}
            setEmailSubject={setEmailSubject}
            emailBody={emailBody}
            setEmailBody={setEmailBody}
            emailComposeOpen={emailComposeOpen}
            setEmailComposeOpen={setEmailComposeOpen}
            twitterComposeText={twitterComposeText}
            setTwitterComposeText={setTwitterComposeText}
            twitterComposeOpen={twitterComposeOpen}
            setTwitterComposeOpen={setTwitterComposeOpen}
            twitterReplyText={twitterReplyText}
            setTwitterReplyText={setTwitterReplyText}
            twitterReplyTargetId={twitterReplyTargetId}
            setTwitterReplyTargetId={setTwitterReplyTargetId}
            mapsSearchInput={mapsSearchInput}
            setMapsSearchInput={setMapsSearchInput}
            mapsDirectionsActive={mapsDirectionsActive}
            setMapsDirectionsActive={setMapsDirectionsActive}
            mapsNavigationActive={mapsNavigationActive}
            setMapsNavigationActive={setMapsNavigationActive}
            messagesInputText={messagesInputText}
            setMessagesInputText={setMessagesInputText}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
            weatherSearchInput={weatherSearchInput}
            setWeatherSearchInput={setWeatherSearchInput}
          />
        </div>

        {/* Right Side: Interactive Shell Logs Console */}
        <div className="lg:col-span-4 flex flex-col h-full justify-between order-3 lg:order-3" id="dashboard_terminal">
          <AdbTerminal logs={adbLogs} onClear={() => setAdbLogs([])} />
        </div>
      </div>

      {/* Humble Elegant footer */}
      <div className="py-4 border-t border-white/5 text-[10px] text-slate-500 font-mono flex justify-center items-center space-x-2 bg-[#0A0B0D]">
        <span>© 2026 Android AI Agent Emulator</span>
        <span>•</span>
        <span>Made with Gemini Pro & Google Cloud Run</span>
      </div>
    </div>
  );
}
