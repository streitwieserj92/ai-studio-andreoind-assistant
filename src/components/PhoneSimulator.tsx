import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Wifi,
  Battery,
  CloudSun,
  Mail,
  Music,
  Twitter,
  MapPin,
  Settings as SettingsIcon,
  Home as HomeIcon,
  MessageSquare,
  Search,
  Plus,
  Send,
  Play,
  Pause,
  SkipForward,
  ChevronLeft,
  Lightbulb,
  Lock,
  Unlock,
  Volume2,
  ThumbsUp,
  User,
  Compass,
  CornerDownRight,
  Sun,
  CloudRain,
  Sliders,
} from 'lucide-react';
import {
  AndroidApp,
  Email,
  Tweet,
  ChatThread,
  DeviceState,
  SystemSettings,
  AgentStep,
} from '../types';

interface PhoneSimulatorProps {
  currentApp: AndroidApp;
  setCurrentApp: (app: AndroidApp) => void;
  deviceState: DeviceState;
  setDeviceState: React.Dispatch<React.SetStateAction<DeviceState>>;
  systemSettings: SystemSettings;
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
  weatherCity: string;
  setWeatherCity: (city: string) => void;
  spotifyIsPlaying: boolean;
  setSpotifyIsPlaying: (playing: boolean) => void;
  emails: Email[];
  setEmails: React.Dispatch<React.SetStateAction<Email[]>>;
  tweets: Tweet[];
  setTweets: React.Dispatch<React.SetStateAction<Tweet[]>>;
  chats: ChatThread[];
  setChats: React.Dispatch<React.SetStateAction<ChatThread[]>>;
  activeStep: AgentStep | null;
  cursorTarget: { x: number; y: number } | null;
  cursorTapped: boolean;
  emailRecipient: string;
  setEmailRecipient: (val: string) => void;
  emailSubject: string;
  setEmailSubject: (val: string) => void;
  emailBody: string;
  setEmailBody: (val: string) => void;
  emailComposeOpen: boolean;
  setEmailComposeOpen: (open: boolean) => void;
  twitterComposeText: string;
  setTwitterComposeText: (val: string) => void;
  twitterComposeOpen: boolean;
  setTwitterComposeOpen: (open: boolean) => void;
  twitterReplyText: string;
  setTwitterReplyText: (val: string) => void;
  twitterReplyTargetId: string | null;
  setTwitterReplyTargetId: (val: string | null) => void;
  mapsSearchInput: string;
  setMapsSearchInput: (val: string) => void;
  mapsDirectionsActive: boolean;
  setMapsDirectionsActive: (active: boolean) => void;
  mapsNavigationActive: boolean;
  setMapsNavigationActive: (active: boolean) => void;
  messagesInputText: string;
  setMessagesInputText: (val: string) => void;
  activeChatId: string | null;
  setActiveChatId: (val: string | null) => void;
  weatherSearchInput: string;
  setWeatherSearchInput: (val: string) => void;
}

export default function PhoneSimulator({
  currentApp,
  setCurrentApp,
  deviceState,
  setDeviceState,
  systemSettings,
  setSystemSettings,
  weatherCity,
  setWeatherCity,
  spotifyIsPlaying,
  setSpotifyIsPlaying,
  emails,
  setEmails,
  tweets,
  setTweets,
  chats,
  setChats,
  activeStep,
  cursorTarget,
  cursorTapped,
  emailRecipient,
  setEmailRecipient,
  emailSubject,
  setEmailSubject,
  emailBody,
  setEmailBody,
  emailComposeOpen,
  setEmailComposeOpen,
  twitterComposeText,
  setTwitterComposeText,
  twitterComposeOpen,
  setTwitterComposeOpen,
  twitterReplyText,
  setTwitterReplyText,
  twitterReplyTargetId,
  setTwitterReplyTargetId,
  mapsSearchInput,
  setMapsSearchInput,
  mapsDirectionsActive,
  setMapsDirectionsActive,
  mapsNavigationActive,
  setMapsNavigationActive,
  messagesInputText,
  setMessagesInputText,
  activeChatId,
  setActiveChatId,
  weatherSearchInput,
  setWeatherSearchInput,
}: PhoneSimulatorProps) {
  const [timeStr, setTimeStr] = useState('12:00 PM');
  const mapNavTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [mapCarProgress, setMapCarProgress] = useState(0);

  // Maintain actual system clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const mins = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setTimeStr(`${hours}:${mins} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  // Map Navigation Animation
  useEffect(() => {
    if (mapsNavigationActive) {
      setMapCarProgress(0);
      mapNavTimerRef.current = setInterval(() => {
        setMapCarProgress((prev) => {
          if (prev >= 100) {
            return 0; // Loop or stay at end
          }
          return prev + 2;
        });
      }, 200);
    } else {
      if (mapNavTimerRef.current) clearInterval(mapNavTimerRef.current);
      setMapCarProgress(0);
    }
    return () => {
      if (mapNavTimerRef.current) clearInterval(mapNavTimerRef.current);
    };
  }, [mapsNavigationActive]);

  // Handle local state modifiers
  const handleLikeTweet = (id: string) => {
    setTweets((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            likes: t.isLiked ? t.likes - 1 : t.likes + 1,
            isLiked: !t.isLiked,
          };
        }
        return t;
      })
    );
  };

  const handlePostTweet = () => {
    if (!twitterComposeText.trim()) return;
    const newTweet: Tweet = {
      id: `tweet-${Date.now()}`,
      user: 'AI Assistant',
      handle: 'android_agent',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80',
      text: twitterComposeText,
      likes: 0,
      isLiked: false,
      repliesCount: 0,
      replies: [],
    };
    setTweets([newTweet, ...tweets]);
    setTwitterComposeText('');
    setTwitterComposeOpen(false);
  };

  const handleReplyTweet = () => {
    if (!twitterReplyText.trim() || !twitterReplyTargetId) return;
    setTweets((prev) =>
      prev.map((t) => {
        if (t.id === twitterReplyTargetId) {
          return {
            ...t,
            repliesCount: t.repliesCount + 1,
            replies: [
              ...t.replies,
              {
                user: 'android_agent',
                text: twitterReplyText,
                date: 'Just now',
              },
            ],
          };
        }
        return t;
      })
    );
    setTwitterReplyText('');
    setTwitterReplyTargetId(null);
  };

  const handleSendEmail = () => {
    if (!emailRecipient.trim()) return;
    const newEmail: Email = {
      id: `email-${Date.now()}`,
      sender: emailRecipient,
      subject: emailSubject || '(No Subject)',
      body: emailBody || '(No Body)',
      date: 'Just now',
      read: true,
    };
    setEmails([newEmail, ...emails]);
    setEmailRecipient('');
    setEmailSubject('');
    setEmailBody('');
    setEmailComposeOpen(false);
  };

  const handleSendMessage = () => {
    if (!messagesInputText.trim() || !activeChatId) return;
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
                text: messagesInputText,
                timestamp: 'Now',
              },
            ],
          };
        }
        return c;
      })
    );
    setMessagesInputText('');

    // Trigger a mock automated response from the contact after a delay
    const chatContact = chats.find((ch) => ch.id === activeChatId)?.contactName;
    setTimeout(() => {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id === activeChatId) {
            return {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: `msg-reply-${Date.now()}`,
                  sender: 'contact',
                  text: `Sounds good! I received your automated update. Let me know what the Agent does next!`,
                  timestamp: 'Now',
                },
              ],
            };
          }
          return c;
        })
      );
    }, 2000);
  };

  return (
    <div className="relative flex justify-center items-center py-6 h-full select-none" id="phone_wrapper">
      {/* Outer Phone Bezel Frame */}
      <div className="relative bg-[#0F1115] border-[6px] border-[#1A1D24] rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 w-[330px] h-[670px] flex flex-col justify-between overflow-hidden ring-1 ring-white/5">
        
        {/* Notch Speaker and Camera */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-50 flex items-center space-x-2 bg-[#0A0B0D] px-4 py-1.5 rounded-full w-28 h-6 border border-white/5 shadow-sm">
          <div className="w-1.5 h-1.5 bg-slate-800 rounded-full animate-pulse"></div>
          <div className="w-10 h-1 bg-slate-900 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-indigo-900/50 overflow-hidden relative">
            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-indigo-500 rounded-full opacity-60"></div>
          </div>
        </div>

        {/* Inner LCD screen area */}
        <div className="relative flex-1 bg-[#0A0B0D] rounded-[2.5rem] flex flex-col overflow-hidden text-slate-200 ring-1 ring-white/10" id="phone_screen">
          
          {/* Status Bar */}
          <div className="h-7 px-6 pt-1 flex justify-between items-center bg-transparent z-40 text-xs font-medium">
            <span className="text-neutral-300 tracking-tight">{timeStr}</span>
            <div className="flex items-center space-x-1.5 text-neutral-300">
              {systemSettings.wifi ? (
                <Wifi size={13} className="text-emerald-400" />
              ) : (
                <Wifi size={13} className="opacity-30" />
              )}
              {systemSettings.bluetooth && <span className="text-[9px] bg-sky-900/50 text-sky-400 px-1 rounded border border-sky-800/20">BT</span>}
              {systemSettings.dnd && <span className="text-[9px] bg-amber-950/50 text-amber-500 px-1 rounded border border-amber-800/20">DND</span>}
              <Battery size={13} className="text-neutral-400" />
            </div>
          </div>

          {/* Core App Screens Container */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <AnimatePresence mode="wait">
              
              {/* launcher/home SCREEN */}
              {currentApp === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex flex-col px-4 justify-between pb-8 bg-gradient-to-tr from-indigo-950 via-slate-950 to-neutral-950"
                  id="screen_home"
                >
                  {/* Decorative Cosmic Orb Wallpaper element */}
                  <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-900/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-16 -right-16 w-64 h-64 bg-indigo-900/10 rounded-full blur-3xl"></div>

                  {/* Date and Assistant Widget */}
                  <div className="mt-6 flex flex-col items-center">
                    <span className="text-3xl font-light text-neutral-100 tracking-tight">
                      {timeStr.split(' ')[0]}
                    </span>
                    <span className="text-[11px] uppercase tracking-widest text-indigo-300 mt-1 font-mono">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>

                    {/* Smart Agent Pill */}
                    <div className="w-full mt-6 bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center space-x-2 backdrop-blur-md">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                        A
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[10px] text-indigo-200 font-medium">Android Intelligent Agent</p>
                        <p className="text-[9px] text-neutral-400 truncate">
                          {activeStep ? activeStep.description : 'Listening for natural commands...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4x2 App Grid */}
                  <div className="grid grid-cols-4 gap-y-5 gap-x-2 my-auto px-1">
                    {[
                      { id: 'weather', name: 'Weather', icon: CloudSun, bg: 'from-amber-500 to-orange-600', selId: 'app_weather' },
                      { id: 'email', name: 'Email', icon: Mail, bg: 'from-red-500 to-rose-600', selId: 'app_email' },
                      { id: 'spotify', name: 'Spotify', icon: Music, bg: 'from-emerald-500 to-green-600', selId: 'app_spotify' },
                      { id: 'twitter', name: 'Twitter', icon: Twitter, bg: 'from-sky-500 to-blue-600', selId: 'app_twitter' },
                      { id: 'maps', name: 'Maps', icon: MapPin, bg: 'from-teal-500 to-cyan-600', selId: 'app_maps' },
                      { id: 'settings', name: 'Settings', icon: SettingsIcon, bg: 'from-zinc-500 to-slate-600', selId: 'app_settings' },
                      { id: 'smart_home', name: 'Smart Home', icon: HomeIcon, bg: 'from-indigo-500 to-violet-600', selId: 'app_smart_home' },
                      { id: 'messages', name: 'Messages', icon: MessageSquare, bg: 'from-pink-500 to-purple-600', selId: 'app_messages' },
                    ].map((app) => (
                      <button
                        key={app.id}
                        id={app.selId}
                        onClick={() => setCurrentApp(app.id as AndroidApp)}
                        className="flex flex-col items-center group transition active:scale-95"
                      >
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${app.bg} flex items-center justify-center shadow-lg shadow-black/30 group-hover:brightness-110`}>
                          <app.icon size={22} className="text-white" />
                        </div>
                        <span className="text-[10px] text-neutral-300 mt-1.5 font-medium truncate w-full text-center">
                          {app.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Hotseat Launcher bar */}
                  <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-2.5 flex justify-around items-center backdrop-blur-md">
                    <button onClick={() => setCurrentApp('messages')} className="p-1 text-pink-400"><MessageSquare size={20} /></button>
                    <button onClick={() => setCurrentApp('maps')} className="p-1 text-teal-400"><MapPin size={20} /></button>
                    <button onClick={() => setCurrentApp('spotify')} className="p-1 text-emerald-400"><Music size={20} /></button>
                    <button onClick={() => setCurrentApp('email')} className="p-1 text-rose-400"><Mail size={20} /></button>
                  </div>
                </motion.div>
              )}

              {/* WEATHER SCREEN */}
              {currentApp === 'weather' && (
                <motion.div
                  key="weather"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col bg-slate-900"
                  id="screen_weather"
                >
                  <div className="p-4 flex items-center space-x-1 border-b border-white/5 bg-slate-950/40">
                    <button onClick={() => setCurrentApp('home')} className="text-neutral-400"><ChevronLeft size={18} /></button>
                    <span className="text-xs font-semibold text-neutral-300">Weather Forecast</span>
                  </div>

                  {/* Search bar inside Weather */}
                  <div className="px-4 pt-3 pb-1">
                    <div className="flex space-x-1">
                      <div className="relative flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1 flex items-center">
                        <Search size={12} className="text-neutral-500 mr-2" />
                        <input
                          type="text"
                          id="weather_search_input"
                          value={weatherSearchInput}
                          onChange={(e) => setWeatherSearchInput(e.target.value)}
                          placeholder="Search City..."
                          className="bg-transparent text-xs w-full focus:outline-none text-white placeholder-neutral-500"
                        />
                      </div>
                      <button
                        id="search_button"
                        onClick={() => {
                          if (weatherSearchInput.trim()) {
                            setWeatherCity(weatherSearchInput);
                          }
                        }}
                        className="bg-sky-600 hover:bg-sky-700 active:scale-95 text-white px-2.5 py-1 rounded-xl text-[10px] font-semibold"
                      >
                        Find
                      </button>
                    </div>
                  </div>

                  {/* Weather Body */}
                  <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col justify-between">
                    <div className="text-center py-4 bg-sky-950/20 rounded-2xl border border-sky-900/10 p-4">
                      <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider font-mono">Current Location</h3>
                      <h2 className="text-xl font-bold text-white mt-1">{weatherCity}</h2>
                      
                      <div className="flex items-center justify-center my-4">
                        <Sun size={52} className="text-amber-400 animate-spin-slow mr-4" />
                        <div className="text-left">
                          <span id="weather_degrees" className="text-4xl font-extrabold text-white">68°F</span>
                          <p className="text-[11px] text-neutral-400 font-medium">Mostly Sunny & Calm</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-[9px] text-neutral-400">
                        <div>
                          <p className="font-mono">HUMIDITY</p>
                          <p className="font-bold text-white text-xs mt-0.5">42%</p>
                        </div>
                        <div>
                          <p className="font-mono">WIND</p>
                          <p className="font-bold text-white text-xs mt-0.5">8 mph NW</p>
                        </div>
                        <div>
                          <p className="font-mono">RAIN RISK</p>
                          <p className="font-bold text-white text-xs mt-0.5">10%</p>
                        </div>
                      </div>
                    </div>

                    {/* Hourly/Daily Forecasts list */}
                    <div className="mt-4">
                      <p className="text-[10px] font-semibold text-neutral-400 font-mono tracking-wider uppercase mb-2">5-Day Forecast</p>
                      <div className="space-y-2">
                        {[
                          { day: 'Mon', temp: '68° / 52°', icon: Sun, text: 'Sunny', color: 'text-amber-400' },
                          { day: 'Tue', temp: '70° / 55°', icon: Sun, text: 'Clear Sky', color: 'text-amber-400' },
                          { day: 'Wed', temp: '64° / 50°', icon: CloudSun, text: 'Partly Cloud', color: 'text-sky-300' },
                          { day: 'Thu', temp: '61° / 48°', icon: CloudRain, text: 'Light Showers', color: 'text-blue-400' },
                          { day: 'Fri', temp: '67° / 51°', icon: Sun, text: 'Sunny', color: 'text-amber-400' },
                        ].map((d, idx) => (
                          <div key={idx} className="bg-slate-950/40 rounded-xl p-2.5 flex justify-between items-center border border-white/5 text-xs">
                            <span className="font-semibold text-neutral-300 w-10">{d.day}</span>
                            <div className="flex items-center space-x-1.5 flex-1 justify-center">
                              <d.icon size={14} className={d.color} />
                              <span className="text-[10px] text-neutral-400">{d.text}</span>
                            </div>
                            <span className="font-mono text-[10px] text-white font-medium">{d.temp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* EMAIL SCREEN */}
              {currentApp === 'email' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col bg-zinc-950"
                  id="screen_email"
                >
                  <div className="p-4 flex items-center justify-between border-b border-white/5 bg-zinc-900/40">
                    <div className="flex items-center space-x-1">
                      <button onClick={() => setCurrentApp('home')} className="text-neutral-400"><ChevronLeft size={18} /></button>
                      <span className="text-xs font-semibold text-neutral-300">Inbox</span>
                    </div>
                    <button
                      id="compose_btn"
                      onClick={() => setEmailComposeOpen(true)}
                      className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white p-1 rounded-lg"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Email feed list */}
                  <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                    {emails.map((e) => (
                      <div
                        key={e.id}
                        className={`p-3 rounded-xl border transition cursor-pointer text-left ${e.read ? 'bg-zinc-900/40 border-zinc-800/40' : 'bg-rose-950/10 border-rose-900/20'}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-semibold text-rose-300 truncate w-36">{e.sender}</span>
                          <span className="text-[9px] text-neutral-500 font-mono">{e.date}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1 truncate">{e.subject}</h4>
                        <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">{e.body}</p>
                      </div>
                    ))}
                  </div>

                  {/* Compose Drawer Overlay */}
                  {emailComposeOpen && (
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      className="absolute bottom-0 left-0 right-0 bg-neutral-900 border-t border-zinc-800 rounded-t-3xl p-4 flex flex-col h-[75%] z-50 shadow-xl"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                        <span className="text-xs font-bold text-rose-400">Compose Draft</span>
                        <div className="flex space-x-2">
                          <button
                            id="send_btn"
                            onClick={handleSendEmail}
                            className="bg-rose-500 text-white p-1 rounded-lg hover:bg-rose-600"
                          >
                            <Send size={12} />
                          </button>
                          <button
                            onClick={() => setEmailComposeOpen(false)}
                            className="text-neutral-500 hover:text-white text-xs px-2 py-0.5 rounded border border-neutral-800"
                          >
                            Close
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 mt-3 flex-1 flex flex-col">
                        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-1.5">
                          <span className="text-[10px] text-neutral-400 font-mono w-10">To:</span>
                          <input
                            type="text"
                            id="email_recipient"
                            value={emailRecipient}
                            onChange={(e) => setEmailRecipient(e.target.value)}
                            placeholder="recipient@mail.com"
                            className="bg-transparent text-xs w-full focus:outline-none text-white"
                          />
                        </div>
                        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-1.5">
                          <span className="text-[10px] text-neutral-400 font-mono w-10">Subject:</span>
                          <input
                            type="text"
                            id="email_subject"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            placeholder="Enter Subject..."
                            className="bg-transparent text-xs w-full focus:outline-none text-white"
                          />
                        </div>
                        <textarea
                          id="email_body"
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          placeholder="Type your message details..."
                          className="bg-transparent text-xs w-full flex-1 focus:outline-none text-white resize-none mt-2 leading-relaxed"
                        ></textarea>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* SPOTIFY SCREEN */}
              {currentApp === 'spotify' && (
                <motion.div
                  key="spotify"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col bg-zinc-950 text-neutral-200"
                  id="screen_spotify"
                >
                  <div className="p-4 flex items-center space-x-1 border-b border-white/5 bg-zinc-900/40">
                    <button onClick={() => setCurrentApp('home')} className="text-neutral-400"><ChevronLeft size={18} /></button>
                    <span className="text-xs font-semibold text-emerald-400">Spotify Music</span>
                  </div>

                  {/* Player area */}
                  <div className="flex-1 p-4 flex flex-col justify-around text-center">
                    <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                      {/* CD Disk Vinyl style */}
                      <motion.div
                        animate={{ rotate: spotifyIsPlaying ? 360 : 0 }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                        className="w-28 h-28 bg-gradient-to-tr from-zinc-800 via-neutral-900 to-zinc-800 rounded-full flex items-center justify-center shadow-lg relative border-4 border-zinc-800"
                      >
                        {/* Audio Wave lines visualizer */}
                        <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none">
                          <div className="w-16 h-16 rounded-full border border-zinc-700/50 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full border border-zinc-600/50 flex items-center justify-center bg-black">
                              <div className="w-2 h-2 bg-neutral-900 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                        {/* Album Cover inside */}
                        <div className="w-14 h-14 rounded-full bg-emerald-950 flex items-center justify-center overflow-hidden z-10 border border-emerald-500/20">
                          <Music className="text-emerald-400" size={24} />
                        </div>
                      </motion.div>

                      {/* Moving pulse indicators when active */}
                      {spotifyIsPlaying && (
                        <div className="absolute top-0 inset-0 flex justify-center items-center pointer-events-none">
                          <div className="w-32 h-32 border border-emerald-500/30 rounded-full animate-ping absolute"></div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">Chill Lofi Beats</h3>
                      <p className="text-[10px] text-neutral-400 mt-1">Instrumental Focus Radio</p>
                    </div>

                    {/* Waveform Visualizer */}
                    <div className="h-6 flex items-center justify-center space-x-1 px-8">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((bar) => (
                        <motion.div
                          key={bar}
                          animate={spotifyIsPlaying ? { height: [4, 18, 4] } : { height: 4 }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: bar * 0.05,
                            ease: 'easeInOut',
                          }}
                          className="w-1 bg-emerald-500 rounded-full"
                        ></motion.div>
                      ))}
                    </div>

                    {/* Progress Slider bar */}
                    <div className="px-6">
                      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          animate={spotifyIsPlaying ? { width: ['0%', '100%'] } : {}}
                          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                          className="h-full bg-emerald-500"
                        ></motion.div>
                      </div>
                      <div className="flex justify-between text-[8px] text-neutral-500 font-mono mt-1">
                        <span>0:45</span>
                        <span>3:00</span>
                      </div>
                    </div>

                    {/* Play controls */}
                    <div className="flex justify-center items-center space-x-6">
                      <button className="text-neutral-500 hover:text-white transition"><SkipForward size={16} className="rotate-180" /></button>
                      <button
                        id="play_button"
                        onClick={() => setSpotifyIsPlaying(!spotifyIsPlaying)}
                        className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 flex items-center justify-center shadow-lg text-black"
                      >
                        {spotifyIsPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                      </button>
                      <button className="text-neutral-500 hover:text-white transition"><SkipForward size={16} /></button>
                    </div>
                  </div>

                  {/* Playlist selection list */}
                  <div className="bg-zinc-900/60 p-3 rounded-t-3xl border-t border-zinc-800 text-left">
                    <p className="text-[9px] font-semibold text-neutral-500 font-mono tracking-widest uppercase mb-2 px-1">Selected Tracks</p>
                    <div className="space-y-1">
                      {[
                        { id: 'track_row_1', title: 'Chill Lofi Beats', artist: 'Focus Radio', active: true },
                        { id: 'track_row_2', title: 'Ambient Synth Wave', artist: 'Cosmic Slate', active: false },
                        { id: 'track_row_3', title: 'Morning Productivity', artist: 'Zen Forest', active: false },
                      ].map((t) => (
                        <div
                          key={t.id}
                          id={t.id}
                          onClick={() => setSpotifyIsPlaying(true)}
                          className={`flex justify-between items-center p-2 rounded-xl border text-xs cursor-pointer ${t.active ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-transparent border-transparent'}`}
                        >
                          <div>
                            <p className={`font-bold ${t.active ? 'text-emerald-400' : 'text-white'}`}>{t.title}</p>
                            <p className="text-[9px] text-neutral-400 mt-0.5">{t.artist}</p>
                          </div>
                          <span className="text-[10px] text-neutral-500 font-mono">3:00</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TWITTER SCREEN */}
              {currentApp === 'twitter' && (
                <motion.div
                  key="twitter"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col bg-slate-950 text-neutral-200"
                  id="screen_twitter"
                >
                  <div className="p-4 flex items-center justify-between border-b border-white/5 bg-slate-900/40">
                    <div className="flex items-center space-x-1">
                      <button onClick={() => setCurrentApp('home')} className="text-neutral-400"><ChevronLeft size={18} /></button>
                      <span className="text-xs font-semibold text-sky-400">Twitter Feed</span>
                    </div>
                    <button
                      id="compose_tweet_btn"
                      onClick={() => setTwitterComposeOpen(true)}
                      className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white p-1 rounded-full"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Twitter Feed */}
                  <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
                    {tweets.map((t, idx) => (
                      <div key={t.id} className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/40 text-left">
                        <div className="flex items-center space-x-2">
                          <img src={t.avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
                          <div>
                            <p className="text-[10px] font-bold text-white">{t.user}</p>
                            <p className="text-[8px] text-neutral-400">@{t.handle}</p>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-200 mt-2 leading-relaxed">{t.text}</p>
                        
                        {/* Feed interactions */}
                        <div className="flex items-center space-x-6 mt-3 pt-2.5 border-t border-slate-800/40 text-[9px] text-neutral-400 font-mono">
                          <button
                            id={`tweet_like_${idx + 1}`}
                            onClick={() => handleLikeTweet(t.id)}
                            className={`flex items-center space-x-1.5 transition ${t.isLiked ? 'text-rose-500' : 'hover:text-white'}`}
                          >
                            <ThumbsUp size={11} fill={t.isLiked ? 'currentColor' : 'none'} />
                            <span>{t.likes}</span>
                          </button>
                          <button
                            id={`tweet_reply_${idx + 1}`}
                            onClick={() => {
                              setTwitterReplyTargetId(t.id);
                            }}
                            className="flex items-center space-x-1.5 hover:text-sky-400 transition"
                          >
                            <MessageSquare size={11} />
                            <span>{t.repliesCount}</span>
                          </button>
                        </div>

                        {/* Thread Replies List inside */}
                        {t.replies.length > 0 && (
                          <div className="mt-2.5 space-y-1.5 pt-2 border-t border-slate-800/20 bg-slate-950/20 p-2 rounded-xl">
                            {t.replies.map((rep, rIdx) => (
                              <div key={rIdx} className="text-[10px]">
                                <span className="font-bold text-sky-400">@{rep.user}</span>: <span className="text-neutral-300">{rep.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Compose Tweet Box Overlay */}
                  {twitterComposeOpen && (
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-4 flex flex-col h-[60%] z-50 shadow-xl"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="text-xs font-bold text-sky-400">New Tweet</span>
                        <div className="flex space-x-2">
                          <button
                            id="tweet_submit_btn"
                            onClick={handlePostTweet}
                            className="bg-sky-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold hover:bg-sky-600"
                          >
                            Post
                          </button>
                          <button
                            onClick={() => setTwitterComposeOpen(false)}
                            className="text-neutral-500 hover:text-white text-xs px-2 py-0.5 rounded border border-neutral-800"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex-1 flex flex-col">
                        <textarea
                          id="twitter_compose_text"
                          value={twitterComposeText}
                          onChange={(e) => setTwitterComposeText(e.target.value)}
                          placeholder="What is happening on Android agent scene?!"
                          className="bg-transparent text-xs w-full flex-1 focus:outline-none text-white resize-none leading-relaxed"
                          maxLength={280}
                        ></textarea>
                        <div className="text-[9px] text-neutral-500 text-right font-mono mt-1">
                          {twitterComposeText.length} / 280
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Reply Dialog Overlay */}
                  {twitterReplyTargetId && (
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-4 flex flex-col h-[50%] z-50 shadow-xl"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="text-xs font-bold text-sky-400">Reply to Tweet</span>
                        <div className="flex space-x-2">
                          <button
                            id="tweet_reply_submit_btn"
                            onClick={handleReplyTweet}
                            className="bg-sky-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold hover:bg-sky-600"
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => setTwitterReplyTargetId(null)}
                            className="text-neutral-500 hover:text-white text-xs px-2 py-0.5 rounded border border-neutral-800"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex-1 flex flex-col">
                        <textarea
                          id="twitter_reply_text"
                          value={twitterReplyText}
                          onChange={(e) => setTwitterReplyText(e.target.value)}
                          placeholder="Post your reply..."
                          className="bg-transparent text-xs w-full flex-1 focus:outline-none text-white resize-none leading-relaxed"
                          maxLength={140}
                        ></textarea>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* MAPS SCREEN */}
              {currentApp === 'maps' && (
                <motion.div
                  key="maps"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col bg-zinc-900"
                  id="screen_maps"
                >
                  <div className="p-4 flex items-center space-x-1 border-b border-white/5 bg-zinc-950/40 z-10">
                    <button onClick={() => setCurrentApp('home')} className="text-neutral-400"><ChevronLeft size={18} /></button>
                    <span className="text-xs font-semibold text-teal-400">Maps Navigator</span>
                  </div>

                  {/* Map Canvas - beautiful styled vector design using SVG! */}
                  <div className="flex-1 relative overflow-hidden bg-[#1f2937]">
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      {/* Parks / Green areas */}
                      <rect x="15" y="30" width="80" height="90" rx="10" fill="#064e3b" opacity="0.3" />
                      <rect x="190" y="220" width="100" height="130" rx="15" fill="#064e3b" opacity="0.3" />
                      
                      {/* River */}
                      <path d="M -20,280 C 80,260 140,320 340,300" fill="none" stroke="#1e3a8a" strokeWidth="18" strokeLinecap="round" opacity="0.4" />
                      
                      {/* Secondary Roads Grid */}
                      <line x1="50" y1="0" x2="50" y2="400" stroke="#374151" strokeWidth="4" />
                      <line x1="160" y1="0" x2="160" y2="400" stroke="#374151" strokeWidth="4" />
                      <line x1="270" y1="0" x2="270" y2="400" stroke="#374151" strokeWidth="4" />
                      <line x1="0" y1="100" x2="320" y2="100" stroke="#374151" strokeWidth="4" />
                      <line x1="0" y1="210" x2="320" y2="210" stroke="#374151" strokeWidth="4" />
                      <line x1="0" y1="320" x2="320" y2="320" stroke="#374151" strokeWidth="4" />

                      {/* The Main Commute Highway Path */}
                      <path
                        id="highway-path"
                        d="M 50,100 L 160,100 L 160,210 L 270,210 L 270,320"
                        fill="none"
                        stroke="#4b5563"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Navigation directions overlay line */}
                      {mapsNavigationActive && (
                        <path
                          d="M 50,100 L 160,100 L 160,210 L 270,210 L 270,320"
                          fill="none"
                          stroke="#14b8a6"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray="8 4"
                          className="animate-dash"
                        />
                      )}

                      {/* Starting Marker: Home */}
                      <circle cx="50" cy="100" r="8" fill="#111827" stroke="#10b981" strokeWidth="2.5" />
                      <circle cx="50" cy="100" r="3" fill="#10b981" />

                      {/* Ending Marker: Office */}
                      <circle cx="270" cy="320" r="8" fill="#111827" stroke="#f43f5e" strokeWidth="2.5" />
                      <circle cx="270" cy="320" r="3" fill="#f43f5e" />

                      {/* Navigating Car cursor */}
                      {mapsNavigationActive && (
                        <motion.circle
                          cx={
                            mapCarProgress < 30
                              ? 50 + (mapCarProgress / 30) * 110
                              : mapCarProgress < 60
                              ? 160
                              : mapCarProgress < 85
                              ? 160 + ((mapCarProgress - 60) / 25) * 110
                              : 270
                          }
                          cy={
                            mapCarProgress < 30
                              ? 100
                              : mapCarProgress < 60
                              ? 100 + ((mapCarProgress - 30) / 30) * 110
                              : mapCarProgress < 85
                              ? 210
                              : 210 + ((mapCarProgress - 85) / 15) * 110
                          }
                          r="6"
                          fill="#14b8a6"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          shadow-lg="true"
                        />
                      )}
                    </svg>

                    {/* Floating HUD controls */}
                    <div className="absolute top-3 left-3 right-3 space-y-2 z-10">
                      <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-2.5 flex items-center shadow-lg backdrop-blur">
                        <Search size={12} className="text-teal-400 mr-2" />
                        <input
                          type="text"
                          id="maps_search_input"
                          value={mapsSearchInput}
                          onChange={(e) => setMapsSearchInput(e.target.value)}
                          placeholder="Search directions..."
                          className="bg-transparent text-[11px] text-white w-full focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Navigation HUD summary popup */}
                    {mapsDirectionsActive && (
                      <div className="absolute bottom-4 left-3 right-3 bg-zinc-950/95 border border-teal-900/35 rounded-2xl p-3 shadow-2xl backdrop-blur-md">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <div>
                            <p className="text-[9px] font-mono text-neutral-400 tracking-wider">COMMUTE ETA</p>
                            <span id="maps_eta" className="text-lg font-extrabold text-white">25 mins</span>
                            <span className="text-[10px] text-teal-400 font-bold ml-1.5">(12.4 mi)</span>
                          </div>
                          <div className="bg-teal-950/50 text-teal-400 text-[9px] font-bold px-2 py-0.5 rounded border border-teal-900/30">
                            Clear Route
                          </div>
                        </div>

                        <p className="text-[10px] text-neutral-300 mt-2 flex items-center">
                          <CornerDownRight size={11} className="text-teal-400 mr-1.5 shrink-0" />
                          Via AI Boulevard & Hwy 101. No congestion reported.
                        </p>

                        {!mapsNavigationActive ? (
                          <button
                            id="start_navigation_btn"
                            onClick={() => setMapsNavigationActive(true)}
                            className="w-full mt-3 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                          >
                            <Compass size={13} className="animate-spin-slow" />
                            <span>Start Navigation</span>
                          </button>
                        ) : (
                          <div className="w-full mt-3 bg-emerald-950/20 text-emerald-400 text-xs font-bold py-1.5 rounded-xl text-center border border-emerald-900/40">
                            ● Live Navigation Running
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pre-directions routing trigger HUD */}
                    {!mapsDirectionsActive && (
                      <div className="absolute bottom-4 left-3 right-3 bg-zinc-950/90 border border-zinc-800 rounded-2xl p-3 shadow-lg">
                        <p className="text-[10px] text-neutral-400 text-center font-medium">Search a destination or select a route preset to generate directions.</p>
                        <button
                          id="get_directions_btn"
                          onClick={() => setMapsDirectionsActive(true)}
                          className="w-full mt-2.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white py-1.5 rounded-xl text-[10px] font-bold"
                        >
                          Calculate Commute Presets
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* SETTINGS SCREEN */}
              {currentApp === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col bg-neutral-950 text-neutral-200"
                  id="screen_settings"
                >
                  <div className="p-4 flex items-center space-x-1 border-b border-zinc-800 bg-zinc-900/40">
                    <button onClick={() => setCurrentApp('home')} className="text-neutral-400"><ChevronLeft size={18} /></button>
                    <span className="text-xs font-semibold text-neutral-300">System Settings</span>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-left">
                    <p className="text-[9px] font-semibold text-neutral-500 font-mono tracking-widest uppercase px-1">Network & Devices</p>
                    
                    {/* Toggle row: Wi-Fi */}
                    <div className="bg-zinc-900/40 rounded-2xl p-3.5 border border-zinc-800/40 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-white">Wireless Wi-Fi</h4>
                        <p className="text-[9px] text-neutral-400 mt-0.5">{systemSettings.wifi ? 'Connected to "GCP_Secure"' : 'Disconnected'}</p>
                      </div>
                      <button
                        id="toggle_wifi"
                        onClick={() => setSystemSettings((prev) => ({ ...prev, wifi: !prev.wifi }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${systemSettings.wifi ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${systemSettings.wifi ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </button>
                    </div>

                    {/* Toggle row: Bluetooth */}
                    <div className="bg-zinc-900/40 rounded-2xl p-3.5 border border-zinc-800/40 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-white">Bluetooth Link</h4>
                        <p className="text-[9px] text-neutral-400 mt-0.5">{systemSettings.bluetooth ? 'Active & scanning...' : 'Inactive'}</p>
                      </div>
                      <button
                        id="toggle_bluetooth"
                        onClick={() => setSystemSettings((prev) => ({ ...prev, bluetooth: !prev.bluetooth }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${systemSettings.bluetooth ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${systemSettings.bluetooth ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </button>
                    </div>

                    <p className="text-[9px] font-semibold text-neutral-500 font-mono tracking-widest uppercase px-1 pt-2">Personalization</p>

                    {/* Toggle row: Dark Mode */}
                    <div className="bg-zinc-900/40 rounded-2xl p-3.5 border border-zinc-800/40 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-white">Dark Theme Rendering</h4>
                        <p className="text-[9px] text-neutral-400 mt-0.5">High-contrast slate black</p>
                      </div>
                      <button
                        id="toggle_dark_mode"
                        onClick={() => setSystemSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${systemSettings.darkMode ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${systemSettings.darkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </button>
                    </div>

                    {/* Toggle row: Do Not Disturb */}
                    <div className="bg-zinc-900/40 rounded-2xl p-3.5 border border-zinc-800/40 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-white">Do Not Disturb</h4>
                        <p className="text-[9px] text-neutral-400 mt-0.5">Mute all banners & ringers</p>
                      </div>
                      <button
                        id="toggle_dnd"
                        onClick={() => setSystemSettings((prev) => ({ ...prev, dnd: !prev.dnd }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${systemSettings.dnd ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${systemSettings.dnd ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </button>
                    </div>

                    {/* Agent diagnostics speed */}
                    <div className="bg-zinc-900/40 rounded-2xl p-3.5 border border-zinc-800/40 text-xs text-left">
                      <h4 className="text-xs font-bold text-white flex items-center"><Sliders size={13} className="text-teal-400 mr-1.5" /> Agent execution rate</h4>
                      <p className="text-[9px] text-neutral-400 mt-1">This throttles action delays to audit animations step-by-step.</p>
                      <div className="grid grid-cols-3 gap-2 mt-3 text-center text-[10px] font-bold">
                        <div className="p-1.5 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">Normal</div>
                        <div className="p-1.5 bg-neutral-800 text-neutral-400 rounded-xl">2x Fast</div>
                        <div className="p-1.5 bg-neutral-800 text-neutral-400 rounded-xl">4x Turbo</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SMART HOME SCREEN */}
              {currentApp === 'smart_home' && (
                <motion.div
                  key="smart_home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col bg-neutral-950 text-neutral-200"
                  id="screen_smart_home"
                >
                  <div className="p-4 flex items-center space-x-1 border-b border-zinc-800 bg-zinc-900/40">
                    <button onClick={() => setCurrentApp('home')} className="text-neutral-400"><ChevronLeft size={18} /></button>
                    <span className="text-xs font-semibold text-neutral-300">Smart Home Hub</span>
                  </div>

                  {/* Bento Grid Devices control */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <p className="text-[9px] font-semibold text-neutral-500 font-mono tracking-widest uppercase text-left px-1">Living Room Devices</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      
                      {/* Device 1: Bulb */}
                      <div
                        id="toggle_living_room_light"
                        onClick={() =>
                          setDeviceState((prev) => ({
                            ...prev,
                            livingRoomLight: { ...prev.livingRoomLight, on: !prev.livingRoomLight.on },
                          }))
                        }
                        className={`p-4 rounded-3xl border text-left flex flex-col justify-between h-28 cursor-pointer transition ${
                          deviceState.livingRoomLight.on
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-zinc-900/40 border-zinc-800/40 text-neutral-400'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <Lightbulb size={24} className={deviceState.livingRoomLight.on ? 'animate-pulse' : ''} />
                          <span className="text-[9px] font-bold font-mono uppercase bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                            {deviceState.livingRoomLight.on ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white truncate">Main Light</h4>
                          <p className="text-[8px] text-neutral-400 mt-0.5 font-medium">Living Room Ceiling</p>
                        </div>
                      </div>

                      {/* Device 2: Deadbolt Lock */}
                      <div
                        id="toggle_front_door_lock"
                        onClick={() =>
                          setDeviceState((prev) => ({
                            ...prev,
                            frontDoorLock: { locked: !prev.frontDoorLock.locked },
                          }))
                        }
                        className={`p-4 rounded-3xl border text-left flex flex-col justify-between h-28 cursor-pointer transition ${
                          deviceState.frontDoorLock.locked
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          {deviceState.frontDoorLock.locked ? <Lock size={22} /> : <Unlock size={22} />}
                          <span className={`text-[9px] font-bold font-mono uppercase bg-white/5 px-2 py-0.5 rounded-full border border-white/5`}>
                            {deviceState.frontDoorLock.locked ? 'LOCKED' : 'OPEN'}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white truncate">Front Door Lock</h4>
                          <p className="text-[8px] text-neutral-400 mt-0.5 font-medium">Entry Deadbolt</p>
                        </div>
                      </div>
                    </div>

                    {/* Thermostat block */}
                    <div className="bg-zinc-900/40 rounded-3xl p-4 border border-zinc-800/40 text-left">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h4 className="text-xs font-bold text-white">Smart Thermostat</h4>
                          <p className="text-[8px] text-neutral-400 font-medium mt-0.5">Zone A Climate Controller</p>
                        </div>
                        <span className="text-2xl font-extrabold text-teal-400 font-mono">{deviceState.thermostat.temp}°F</span>
                      </div>

                      <div className="flex justify-around items-center pt-2 border-t border-zinc-800/40 mt-1">
                        <button
                          id="thermostat_minus"
                          onClick={() =>
                            setDeviceState((prev) => ({
                              ...prev,
                              thermostat: { temp: Math.max(60, prev.thermostat.temp - 1) },
                            }))
                          }
                          className="w-10 h-10 rounded-2xl bg-zinc-800 text-white font-bold text-lg hover:bg-zinc-700 active:scale-90 flex items-center justify-center border border-zinc-700"
                        >
                          -
                        </button>
                        <span className="text-[10px] text-neutral-400 font-mono tracking-wider">TEMP VALUE</span>
                        <button
                          id="thermostat_plus"
                          onClick={() =>
                            setDeviceState((prev) => ({
                              ...prev,
                              thermostat: { temp: Math.min(85, prev.thermostat.temp + 1) },
                            }))
                          }
                          className="w-10 h-10 rounded-2xl bg-zinc-800 text-white font-bold text-lg hover:bg-zinc-700 active:scale-90 flex items-center justify-center border border-zinc-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MESSAGES SCREEN */}
              {currentApp === 'messages' && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col bg-zinc-950 text-neutral-200"
                  id="screen_messages"
                >
                  <div className="p-4 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/40">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          if (activeChatId) {
                            setActiveChatId(null);
                          } else {
                            setCurrentApp('home');
                          }
                        }}
                        className="text-neutral-400"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="text-xs font-semibold text-neutral-300">
                        {activeChatId ? chats.find((c) => c.id === activeChatId)?.contactName : 'Messages'}
                      </span>
                    </div>
                  </div>

                  {/* Active chat screen or Chat list screen */}
                  {!activeChatId ? (
                    // Threads List
                    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                      {chats.map((c) => (
                        <div
                          key={c.id}
                          id={`chat_with_${c.contactName.toLowerCase()}`}
                          onClick={() => {
                            setActiveChatId(c.id);
                            // Mark read
                            setChats((prev) => prev.map((ch) => (ch.id === c.id ? { ...ch, unread: false } : ch)));
                          }}
                          className={`p-3 rounded-2xl border transition text-left cursor-pointer flex items-center space-x-3 ${
                            c.unread ? 'bg-pink-950/10 border-pink-900/20' : 'bg-zinc-900/40 border-zinc-800/40'
                          }`}
                        >
                          <img src={c.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-bold text-white truncate">{c.contactName}</h4>
                              <span className="text-[8px] text-neutral-500 font-mono">10:45 AM</span>
                            </div>
                            <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                              {c.messages[c.messages.length - 1]?.text || 'No messages'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Full Active chat message history list
                    <div className="flex-1 flex flex-col justify-between overflow-hidden bg-zinc-950">
                      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                        {chats
                          .find((c) => c.id === activeChatId)
                          ?.messages.map((m) => (
                            <div
                              key={m.id}
                              className={`flex max-w-[80%] flex-col text-xs p-2.5 rounded-2xl ${
                                m.sender === 'user'
                                  ? 'bg-pink-600 text-white rounded-br-none ml-auto'
                                  : 'bg-zinc-800 text-zinc-100 rounded-bl-none mr-auto'
                              }`}
                            >
                              <p className="leading-relaxed">{m.text}</p>
                              <span className="text-[7px] text-neutral-400 text-right mt-1 font-mono">{m.timestamp}</span>
                            </div>
                          ))}
                      </div>

                      {/* Chat Input Box bottom */}
                      <div className="p-3 border-t border-zinc-800 bg-neutral-900 flex space-x-2">
                        <div className="relative flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1 flex items-center">
                          <input
                            type="text"
                            id="messages_input_text"
                            value={messagesInputText}
                            onChange={(e) => setMessagesInputText(e.target.value)}
                            placeholder="Type SMS..."
                            className="bg-transparent text-xs w-full focus:outline-none text-white placeholder-neutral-500"
                          />
                        </div>
                        <button
                          id="send_msg_btn"
                          onClick={handleSendMessage}
                          className="bg-pink-500 hover:bg-pink-600 active:scale-95 text-white p-2 rounded-xl transition"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Swipe-up navigation pill bar at absolute bottom */}
          <div className="h-6 flex justify-center items-center bg-transparent z-40 border-t border-white/5">
            <button
              onClick={() => setCurrentApp('home')}
              className="w-16 h-1 bg-neutral-600 rounded-full active:bg-white transition"
              id="swipe_home_bar"
            ></button>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* THE SEAMLESS PHYSICAL TAP CURSOR - glides dynamically over phone LCD */}
          {cursorTarget && (
            <motion.div
              animate={{
                left: `${cursorTarget.x}%`,
                top: `${cursorTarget.y}%`,
              }}
              transition={{
                type: 'spring',
                stiffness: 120,
                damping: 18,
              }}
              className="absolute w-6 h-6 rounded-full bg-red-500/35 border-2 border-red-500 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
            >
              {/* Tap Ripple Ring pulse */}
              {cursorTapped && (
                <div className="absolute w-12 h-12 rounded-full border border-red-500/80 animate-ping"></div>
              )}
              {/* Core visual pointer */}
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow shadow-black"></div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
