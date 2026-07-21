import React, { useState, useEffect } from 'react';
import {
  Send,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  History,
  Trash2,
  Clock,
  Settings,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Mic,
  Save,
  Bookmark,
  X
} from 'lucide-react';
import { AgentRun, AgentStep } from '../types';
import { db, collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from '@/src/lib/firebase';

interface AgentControlPanelProps {
  inputCommand: string;
  setInputCommand: (cmd: string) => void;
  handleSubmitCommand: (e: React.FormEvent) => void;
  isLoading: boolean;
  activeRun: AgentRun | null;
  historyRuns: AgentRun[];
  handleSelectPreset: (presetCommand: string) => void;
  handleClearHistory: () => void;
  handleDeleteHistoryItem: (id: string) => void;
  agentSpeed: number;
  setAgentSpeed: (speed: number) => void;
  isFallbackActive: boolean;
}

const DEFAULT_TEMPLATES = [
  {
    title: '🌅 Start my workday routine',
    command: 'Start my workday routine: Check the weather in San Francisco, open my emails, and review my meeting schedule.',
    desc: 'Checks SF weather, drafts an email, and starts the day.',
  },
  {
    title: '📅 Prepare for a meeting',
    command: 'Prepare for a meeting: Turn on Do Not Disturb, mute Spotify, and open my latest email.',
    desc: 'DND ON, pause music, opens email.',
  },
  {
    title: '🚀 Social Broadcast',
    command: 'Open Twitter, post a tweet about "AI Agents are taking over", and play some chill lofi beats on Spotify.',
    desc: 'Tweets custom status and plays lofi in background.',
  },
  {
    title: '🚗 Commute Directions',
    command: 'Check directions from home to Office Headquarters, read ETA, and SMS Sarah that I am on my way.',
    desc: 'Routes maps traffic, starts nav, SMS Sarah ETA update.',
  },
  {
    title: '⛅ Weather Lookup',
    command: 'Open Weather app and search the weather in London.',
    desc: 'Retrieves current temp and forecast in London.',
  },
  {
    title: '🛋️ Smart Home Wind Down',
    command: 'Go to Settings, turn on Do Not Disturb, turn off the living room lights, and lock the front door.',
    desc: 'DND system mode active, lights OFF, Entry Lock locked.',
  },
];

export default function AgentControlPanel({
  inputCommand,
  setInputCommand,
  handleSubmitCommand,
  isLoading,
  activeRun,
  historyRuns,
  handleSelectPreset,
  handleClearHistory,
  handleDeleteHistoryItem,
  agentSpeed,
  setAgentSpeed,
  isFallbackActive,
}: AgentControlPanelProps) {
  const [isListening, setIsListening] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        setLoadingTemplates(true);
        const q = query(collection(db, 'templates'), orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // If empty, let's pre-populate Firestore with DEFAULT_TEMPLATES
          const initialTemplates = [];
          for (let i = 0; i < DEFAULT_TEMPLATES.length; i++) {
            const temp = DEFAULT_TEMPLATES[i];
            const docData = {
              title: temp.title,
              command: temp.command,
              desc: temp.desc,
              createdAt: new Date().getTime() + i, // ordered simple sorting
              isDefault: true
            };
            const docRef = await addDoc(collection(db, 'templates'), docData);
            initialTemplates.push({ id: docRef.id, ...docData });
          }
          setTemplates(initialTemplates);
        } else {
          const loaded: any[] = [];
          querySnapshot.forEach((doc) => {
            loaded.push({ id: doc.id, ...doc.data() });
          });
          setTemplates(loaded);
        }
      } catch (err) {
        console.error('Error loading from Firestore, falling back to localStorage/defaults', err);
        // Fallback to localStorage or DEFAULT_TEMPLATES
        try {
          const stored = localStorage.getItem('android_agent_templates');
          if (stored) {
            setTemplates(JSON.parse(stored));
          } else {
            setTemplates(DEFAULT_TEMPLATES);
          }
        } catch (e) {
          setTemplates(DEFAULT_TEMPLATES);
        }
      } finally {
        setLoadingTemplates(false);
      }
    }

    loadTemplates();
  }, []);

  const toggleListen = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    
    if (isListening) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setInputCommand(transcript);
    };
    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  };

  const saveTemplate = async () => {
    if (!inputCommand.trim()) return;
    const title = prompt('Enter a title for this new Task Template:', 'Custom Workflow');
    if (!title) return;

    const newTemp = {
      title: `📌 ${title}`,
      command: inputCommand,
      desc: 'Custom saved template.',
      createdAt: new Date().getTime(),
      isDefault: false
    };

    try {
      const docRef = await addDoc(collection(db, 'templates'), newTemp);
      setTemplates([...templates, { id: docRef.id, ...newTemp }]);
      // Backup to localStorage
      localStorage.setItem('android_agent_templates', JSON.stringify([...templates, { id: docRef.id, ...newTemp }]));
    } catch (err) {
      console.error('Error saving to Firestore:', err);
      // Local fallback
      const localTemp = { ...newTemp, id: 'local_' + Date.now() };
      const updated = [...templates, localTemp];
      setTemplates(updated);
      localStorage.setItem('android_agent_templates', JSON.stringify(updated));
    }
  };

  const deleteTemplate = async (idxToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this template?')) return;

    const templateToDelete = templates[idxToDelete];
    try {
      if (templateToDelete && templateToDelete.id && !String(templateToDelete.id).startsWith('local_')) {
        await deleteDoc(doc(db, 'templates', templateToDelete.id));
      }
      const updated = templates.filter((_, idx) => idx !== idxToDelete);
      setTemplates(updated);
      localStorage.setItem('android_agent_templates', JSON.stringify(updated));
    } catch (err) {
      console.error('Error deleting from Firestore:', err);
      const updated = templates.filter((_, idx) => idx !== idxToDelete);
      setTemplates(updated);
      localStorage.setItem('android_agent_templates', JSON.stringify(updated));
    }
  };

  const resetTemplates = async () => {
    if (!confirm('Reset to default templates library? This will delete all custom templates from Firestore and restore defaults.')) return;

    try {
      setLoadingTemplates(true);
      // Delete existing documents in firestore
      const querySnapshot = await getDocs(collection(db, 'templates'));
      for (const d of querySnapshot.docs) {
        await deleteDoc(doc(db, 'templates', d.id));
      }

      // Re-populate with defaults
      const initialTemplates = [];
      for (let i = 0; i < DEFAULT_TEMPLATES.length; i++) {
        const temp = DEFAULT_TEMPLATES[i];
        const docData = {
          title: temp.title,
          command: temp.command,
          desc: temp.desc,
          createdAt: new Date().getTime() + i,
          isDefault: true
        };
        const docRef = await addDoc(collection(db, 'templates'), docData);
        initialTemplates.push({ id: docRef.id, ...docData });
      }
      setTemplates(initialTemplates);
      localStorage.setItem('android_agent_templates', JSON.stringify(initialTemplates));
    } catch (err) {
      console.error('Error resetting Firestore templates, doing local reset:', err);
      setTemplates(DEFAULT_TEMPLATES);
      localStorage.setItem('android_agent_templates', JSON.stringify(DEFAULT_TEMPLATES));
    } finally {
      setLoadingTemplates(false);
    }
  };


  return (
    <div className="flex flex-col h-full space-y-4" id="control_panel_container">
      {/* Title block */}
      <header className="mb-4 flex justify-between items-end border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1 flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mr-2">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            Aura Control Center
          </h1>
          <p className="text-slate-500 text-xs">Seamless UI automation & agentic workflows</p>
        </div>
        <div className="flex gap-2">
          {isFallbackActive ? (
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider border border-amber-500/20 flex items-center space-x-1">
              <AlertCircle size={12} />
              <span>Local NLP: V1.0</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-500/20 flex items-center space-x-1">
              <ShieldCheck size={12} />
              <span>NLP Engine: V4.2</span>
            </span>
          )}
        </div>
      </header>

      {/* Main Form Input */}
      <div className="bg-[#15171C] rounded-3xl border border-white/5 p-5 shadow-2xl">
        <h3 className="text-xs font-bold text-slate-400 flex items-center space-x-1.5 mb-3 text-left uppercase tracking-widest">
          <Zap size={13} className="text-indigo-400" />
          <span>Issue Natural Language Instruction</span>
        </h3>

        <form onSubmit={handleSubmitCommand} className="flex space-x-2 relative">
          <input
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            disabled={isLoading || (activeRun?.status === 'running')}
            placeholder='Command Aura: "Check weather in Chicago, turn lights on..."'
            className="w-full h-14 bg-[#1A1D24] border border-white/10 rounded-2xl pl-4 pr-32 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 shadow-lg shadow-black/40 text-sm transition-all"
          />
          <div className="absolute right-2 top-2 flex space-x-1">
            <button
              type="button"
              onClick={toggleListen}
              disabled={isLoading || activeRun?.status === 'running'}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
              title="Dictate command"
            >
              <Mic size={16} />
            </button>
            <button
              type="button"
              onClick={saveTemplate}
              disabled={isLoading || !inputCommand.trim() || activeRun?.status === 'running'}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
              title="Save as Template"
            >
              <Save size={16} />
            </button>
            <button
              type="submit"
              disabled={isLoading || !inputCommand.trim() || activeRun?.status === 'running'}
              className="w-10 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-white/10 disabled:text-slate-500 text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={14} />
              )}
            </button>
          </div>
        </form>

        {isFallbackActive && (
          <p className="text-[9px] text-neutral-500 mt-2 text-left">
            💡 No Gemini API key detected. Using fast offline local keyword-matching heuristics. Add a <b>GEMINI_API_KEY</b> in AI Studio's Settings panel to run live server-side LLM parses.
          </p>
        )}
      </div>

      {/* Speed Diagnostics Slider */}
      <div className="bg-[#15171C] rounded-2xl border border-white/5 p-3 flex justify-between items-center text-xs">
        <span className="text-slate-400 font-medium">Simulation Delay:</span>
        <div className="flex space-x-2">
          {[
            { rate: 1, label: '1x Std' },
            { rate: 2, label: '2x Fast' },
            { rate: 4, label: '4x Turbo' },
          ].map((sp) => (
            <button
              key={sp.rate}
              onClick={() => setAgentSpeed(sp.rate)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono transition ${
                agentSpeed === sp.rate
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Run - Step Visualizer */}
      <div className="flex-1 min-h-[220px] bg-[#15171C] rounded-3xl border border-white/5 p-5 flex flex-col justify-between overflow-hidden shadow-2xl relative">
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <div className={`w-5 h-5 rounded-full border-2 border-indigo-500 ${activeRun?.status === 'running' ? 'border-t-transparent animate-spin' : ''}`}></div>
              </div>
              <div>
                <h2 className="text-sm font-medium text-white">Current Workflow</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Execution Queue</p>
              </div>
            </div>

            {activeRun && (
              <span className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-full border ${
                activeRun.status === 'running'
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 ring-1 ring-indigo-500/30'
                  : activeRun.status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-white/5 text-slate-400 border-white/10'
              }`}>
                {activeRun.status === 'running' ? 'PROCESSING' : activeRun.status}
              </span>
            )}
          </div>

          {/* Steps list viewport */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {!activeRun ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 text-slate-500">
                <Layers size={24} className="mb-3 text-slate-600 opacity-50" />
                <p className="text-sm font-medium text-slate-400">No active workflow</p>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed max-w-xs">Enter a command above or select a preset below to initiate an automated UI session.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5 text-left mb-4">
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">Target Objective</p>
                  <p className="text-sm font-medium text-slate-200 leading-relaxed">{activeRun.command}</p>
                </div>

                <div className="space-y-1.5">
                  {activeRun.steps.map((step, index) => {
                    const isCurrent = activeRun.currentStepIndex === index;
                    const isCompleted = index < activeRun.currentStepIndex;
                    const isRunning = isCurrent && activeRun.status === 'running';

                    return (
                      <div
                        key={step.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                          isRunning
                            ? 'bg-indigo-500/10 border border-indigo-500/20 ring-1 ring-indigo-500/30'
                            : isCompleted
                            ? 'bg-white/5 border border-white/5 opacity-80'
                            : 'bg-white/[0.02] border border-white/5 opacity-50'
                        }`}
                      >
                        {/* Bullet indicators */}
                        <div>
                          {isCompleted ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                          ) : isRunning ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                          )}
                        </div>

                        {/* Step Description details */}
                        <div className="flex-1 min-w-0 text-left">
                          <p className={`text-sm font-medium ${isRunning ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-400'}`}>
                            {step.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-slate-500">
                            <span className="font-bold text-indigo-400/80 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/10">{step.action.toUpperCase()}</span>
                            <span>Target: {step.target}</span>
                            {step.value && <span className="text-slate-400">"{step.value}"</span>}
                          </div>
                        </div>
                        
                        <span className={`text-[10px] font-mono font-bold uppercase ${
                          isRunning ? 'text-indigo-400' : isCompleted ? 'text-slate-600' : 'text-slate-700'
                        }`}>
                          {isRunning ? 'PROCESSING' : isCompleted ? 'DONE' : 'QUEUED'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preset Tasks Gallery */}
      <div className="bg-[#15171C] rounded-3xl border border-white/5 p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-left flex items-center gap-1.5">
            <Bookmark size={14} className="text-indigo-400" />
            <span>Task Templates</span>
          </h3>
          <button
            onClick={resetTemplates}
            className="text-[10px] text-slate-500 hover:text-indigo-400 font-mono flex items-center space-x-1 cursor-pointer transition-colors"
            title="Reset to default templates library"
          >
            <RotateCcw size={12} />
            <span>Reset Defaults</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
          {templates.map((p, idx) => (
            <div key={idx} className="relative group">
              <button
                onClick={() => handleSelectPreset(p.command)}
                disabled={isLoading || activeRun?.status === 'running'}
                className="w-full h-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 disabled:opacity-50 text-left transition duration-200 cursor-pointer flex flex-col justify-between pr-8"
              >
                <h4 className="text-xs font-semibold text-slate-200 truncate">{p.title}</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-1 line-clamp-2">{p.desc}</p>
              </button>
              <button
                onClick={(e) => deleteTemplate(idx, e)}
                disabled={isLoading || activeRun?.status === 'running'}
                className="absolute right-2 top-2 p-1 rounded-lg bg-black/40 hover:bg-red-500/20 hover:text-red-400 text-slate-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                title="Delete template"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* History Database Log */}
      <div className="bg-[#15171C] rounded-3xl border border-white/5 p-5 shadow-2xl flex flex-col max-h-[220px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-left">Execution History</h3>

          {historyRuns.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-[10px] text-slate-500 hover:text-red-400 font-mono flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Trash2 size={12} />
              <span>Clear Log</span>
            </button>
          )}
        </div>

        {/* History records */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {historyRuns.length === 0 ? (
            <div className="h-full py-4 flex flex-col justify-center items-center text-center text-slate-500">
              <Clock size={16} className="mb-2 opacity-50" />
              <p className="text-[11px]">No recent runs found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {historyRuns.map((hr) => (
                <div
                  key={hr.id}
                  className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-left"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs font-medium text-slate-300 truncate">{hr.command}</p>
                    <div className="flex items-center space-x-2 mt-1.5 text-[9px] font-mono text-slate-500">
                      <span>{hr.timestamp}</span>
                      <span>•</span>
                      <span className={hr.status === 'completed' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {hr.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteHistoryItem(hr.id)}
                    className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
