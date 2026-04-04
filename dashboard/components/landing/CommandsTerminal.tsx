'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const CATEGORIES = [
  { id: 'mod', icon: '🛡️', label: 'Mod', commands: ['ban~', 'kick~', 'mute~', 'warn~', 'warnings~', 'purge~'] },
  { id: 'levels', icon: '📈', label: 'Levels', commands: ['rank~', 'leaderboard~', 'givexp~'] },
  { id: 'music', icon: '🎵', label: 'Music', commands: ['play~', 'skip~', 'queue~', 'stop~'] },
  { id: 'fun', icon: '🎮', label: 'Fun', commands: ['8ball~', 'slap~', 'hug~', 'kiss~'] },
];

export default function CommandsTerminal() {
  const [activeTab, setActiveTab] = useState('mod');
  const [selectedCommand, setSelectedCommand] = useState('ban~');
  const [inputValue, setInputValue] = useState('');
  const [typedOutput, setTypedOutput] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);

  const activeCategory = CATEGORIES.find(c => c.id === activeTab);

  useEffect(() => {
    // Reset state when command changes
    setInputValue('');
    setTypedOutput(false);
    
    // Animate embed entry
    if (embedRef.current) {
      gsap.fromTo(embedRef.current,
        { scale: 0.95, opacity: 0, y: 10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" }
      );
    }
  }, [selectedCommand]);

  const handleSimulateSubmit = () => {
    if (!inputValue.trim()) return;
    setTypedOutput(true);
    
    if (embedRef.current) {
      gsap.fromTo(embedRef.current,
        { scale: 0.95, opacity: 0, y: 10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" }
      );
    }
  };

  const [currentTime, setCurrentTime] = useState<string | null>(null);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
  }, []);

  return (
    <section id="commands" className="py-32 px-4 md:px-[60px] relative z-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-16">
          <h2 className="font-garamond text-[clamp(48px,7vw,96px)] font-light leading-[0.95] tracking-tight">
            every command,<br/>
            <span className="italic text-sakura-300">one keystroke away ✦</span>
          </h2>
        </div>

        <div className="terminal-mockup shadow-[0_0_80px_rgba(255,182,193,0.05)]">
          {/* Header */}
          <div className="bg-[#100E1A] p-[14px_20px] flex items-center justify-between border-b border-landing-0">
             <div className="flex items-center gap-[8px]">
               <div className="w-[12px] h-[12px] rounded-full bg-[#FF5F57]"></div>
               <div className="w-[12px] h-[12px] rounded-full bg-[#FFBD2E]"></div>
               <div className="w-[12px] h-[12px] rounded-full bg-[#28C840]"></div>
             </div>
             <div className="font-dm-mono text-[12px] text-landing-text-3 opacity-50">looki~ terminal</div>
             <div className="w-[40px]"></div> {/* Spacer */}
          </div>

          <div className="flex flex-col md:flex-row h-auto md:h-[500px] min-h-[500px] md:min-h-0">
             {/* Left Panel */}
             <div className="w-full md:w-[35%] border-r border-landing-0 bg-[#080610] flex flex-col font-dm-mono">
                {/* Tabs */}
                <div className="flex flex-wrap border-b border-landing-0">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => { setActiveTab(cat.id); setSelectedCommand(cat.commands[0]); }}
                      className={`px-4 py-3 text-[12px] flex items-center gap-2 transition-colors border-b-2 ${activeTab === cat.id ? 'bg-sakura-300/10 text-sakura-300 border-sakura-300' : 'border-transparent text-landing-text-3 hover:text-landing-text-2'}`}
                    >
                      <span>{cat.icon}</span> <span className="hidden lg:inline">{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Command List */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
                  {activeCategory?.commands.map(cmd => (
                    <button 
                      key={cmd}
                      onClick={() => setSelectedCommand(cmd)}
                      className={`text-left px-4 py-2 rounded text-[13px] transition-colors flex items-center justify-between ${selectedCommand === cmd ? 'bg-sakura-300/10 text-sakura-300' : 'text-landing-text-2 hover:bg-surface/50'}`}
                    >
                      {cmd}
                      {selectedCommand === cmd && <span className="text-sakura-300 text-[10px]">◄──</span>}
                    </button>
                  ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-landing-0 bg-[#0A0812]">
                  <div className="text-[11px] text-landing-text-4 mb-2">&gt; Try typing a command:</div>
                  <div className="flex items-center gap-2 text-sakura-300">
                    <span>{'>'}</span>
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSimulateSubmit()}
                      placeholder={`e.g. ${selectedCommand} @user`}
                      className="bg-transparent outline-none w-full text-landing-text-1 placeholder-landing-text-4"
                    />
                  </div>
                </div>
             </div>

             {/* Right Panel (Mock Embed) */}
             <div className="w-full md:w-[65%] bg-[#060508] p-8 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-sakura-300/5 to-transparent pointer-events-none"></div>
                
                {typedOutput ? (
                   <div ref={embedRef} className="w-full max-w-[400px] bg-[#2B2D31] rounded-[4px] border-l-4 border-sakura-300 p-4 shadow-xl z-10">
                     <div className="flex items-center gap-2 mb-3">
                       <div className="w-6 h-6 rounded-full bg-sakura-200"></div>
                       <span className="font-bold text-[14px] text-white">Looki ✦</span>
                       <span className="text-[11px] text-[#949BA4] bg-[#5865F2] px-1 rounded text-white font-bold tracking-wide">BOT</span>
                     </div>
                     <h3 className="text-white font-bold text-[16px] mb-2">{inputValue.split(' ')[0]} executed</h3>
                     <div className="text-[14px] text-[#DBDEE1]">
                        Success! You ran the command: 
                        <code className="bg-[#1E1F22] px-1 py-0.5 rounded ml-1 text-sakura-300">{inputValue}</code>
                     </div>
                     <div className="mt-4 text-[11px] text-[#949BA4] flex items-center gap-1">
                       <span>✦ looki~ • made with ♡</span>
                       <span>• Today at {currentTime ?? '...'}</span>
                     </div>
                   </div>
                ) : (
                  <div ref={embedRef} className="w-full max-w-[400px] bg-[#2B2D31] rounded-[4px] border-l-4 border-landing-2 p-4 shadow-xl z-10 opacity-70">
                    <div className="flex items-center gap-2 mb-3">
                       <div className="w-6 h-6 rounded-full bg-landing-mist"></div>
                       <div className="h-4 w-16 bg-landing-mist rounded"></div>
                    </div>
                    <div className="h-5 w-32 bg-landing-mist rounded mb-2"></div>
                    <div className="h-4 w-full bg-landing-mist rounded mb-1"></div>
                    <div className="h-4 w-3/4 bg-landing-mist rounded mb-4"></div>
                    <div className="h-3 w-40 bg-landing-mist rounded"></div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

