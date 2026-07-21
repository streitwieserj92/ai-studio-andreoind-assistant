import React, { useEffect, useRef } from 'react';
import { Terminal, Shield, RefreshCw } from 'lucide-react';

interface AdbTerminalProps {
  logs: string[];
  onClear: () => void;
}

export default function AdbTerminal({ logs, onClear }: AdbTerminalProps) {
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Automatically scroll terminal to bottom on new log additions
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="bg-[#15171C] border border-white/5 rounded-3xl p-5 flex flex-col h-full font-mono text-left shadow-2xl relative overflow-hidden" id="adb_terminal_container">
      {/* Glossy terminal shine overlay */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent"></div>

      {/* Header bar */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4 text-xs shrink-0">
        <div className="flex items-center space-x-2">
          <Terminal size={14} className="text-indigo-400 animate-pulse" />
          <span className="font-bold text-slate-300 tracking-wider">ADB SHELL VERBOSE</span>
          <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase">USB_CONNECTED</span>
        </div>
        
        <div className="flex items-center space-x-3 text-slate-500">
          <button
            onClick={onClear}
            className="hover:text-indigo-400 font-bold transition flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="flex-1 overflow-y-auto text-[11px] space-y-2 pr-2 leading-relaxed custom-scrollbar">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center text-slate-600 font-mono">
            <span>$ waiting for adb broadcast events...</span>
            <span className="text-[9px] text-slate-700 mt-2">Ready for input actions</span>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, idx) => {
              // Colorize specific log strings for beautiful developer vibes!
              let textColor = 'text-slate-400';
              if (log.startsWith('$ adb shell')) {
                textColor = 'text-sky-400 font-bold';
              } else if (log.startsWith('[Agent]')) {
                textColor = 'text-indigo-400 font-semibold';
              } else if (log.startsWith('[Success]')) {
                textColor = 'text-emerald-400 font-bold';
              } else if (log.startsWith('[Warning]') || log.includes('MISSING')) {
                textColor = 'text-amber-500 font-bold';
              } else if (log.startsWith('[Error]')) {
                textColor = 'text-rose-500 font-bold';
              } else if (log.startsWith('[Voice]')) {
                textColor = 'text-pink-400 font-semibold italic';
              }

              return (
                <div key={idx} className={`${textColor} break-all hover:bg-white/5 px-2 py-0.5 rounded transition-colors`}>
                  {log}
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>
        )}
      </div>

      {/* Terminal bottom footer */}
      <div className="pt-3 border-t border-white/5 mt-2 flex justify-between items-center text-[9px] text-slate-600 font-mono shrink-0">
        <span className="flex items-center"><Shield size={10} className="mr-1 text-indigo-500/50" /> Shell Ingress: SECURE_SANDBOX</span>
        <span>tty: /dev/pts/2</span>
      </div>
    </div>
  );
}
