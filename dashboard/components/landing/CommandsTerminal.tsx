'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

// ─── Data ─────────────────────────────────────────────────────────────────────
type Command = {
  name: string;
  usage: string;
  description: string;
  example: string;
};

type Category = {
  id: string;
  label: string;
  icon: React.ReactNode;
  commands: Command[];
};

const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" />
  </svg>
);
const IconTrending = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
const IconMusic = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </svg>
);
const IconGame = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 12h4M8 10v4M15 11h2M15 13h2" />
  </svg>
);

const CATEGORIES: Category[] = [
  {
    id: 'mod', label: 'Mod', icon: <IconShield />,
    commands: [
      { name: '/ban', usage: '/ban @user [reason]', description: 'Permanently bans a member from the server and DMs them the reason.', example: '/ban @annoyinguser disrupting vibes' },
      { name: '/kick', usage: '/kick @user [reason]', description: 'Removes a member from the server. They can rejoin with an invite.', example: '/kick @user being weird' },
      { name: '/mute', usage: '/mute @user [duration]', description: 'Timeout a member for a set duration. Accepts 10m, 1h, 1d etc.', example: '/mute @user 1h' },
      { name: '/warn', usage: '/warn @user [reason]', description: 'Issues a formal warning logged to that user\'s moderation case file.', example: '/warn @user final warning' },
      { name: '/warnings', usage: '/warnings @user', description: 'Displays all warnings on record for a given user.', example: '/warnings @user' },
      { name: '/purge', usage: '/purge [amount]', description: 'Bulk-deletes up to 100 messages from the current channel.', example: '/purge 50' },
    ],
  },
  {
    id: 'levels', label: 'Levels', icon: <IconTrending />,
    commands: [
      { name: '/rank', usage: '/rank [@user]', description: 'Displays a stylized rank card with XP, level, and server rank.', example: '/rank @pookie' },
      { name: '/leaderboard', usage: '/leaderboard [page]', description: 'Shows the top members by XP in a paginated embed.', example: '/leaderboard 2' },
      { name: '/givexp', usage: '/givexp @user [amount]', description: 'Admin command to manually grant XP to a member.', example: '/givexp @pookie 500' },
    ],
  },
  {
    id: 'music', label: 'Music', icon: <IconMusic />,
    commands: [
      { name: '/play', usage: '/play [query or URL]', description: 'Plays a track or playlist from YouTube, Spotify, or SoundCloud.', example: '/play lofi hip hop radio' },
      { name: '/skip', usage: '/skip', description: 'Skips the current track and plays the next in queue.', example: '/skip' },
      { name: '/queue', usage: '/queue [page]', description: 'Displays the current playback queue in a paginated embed.', example: '/queue' },
      { name: '/stop', usage: '/stop', description: 'Stops playback and clears the entire queue.', example: '/stop' },
    ],
  },
  {
    id: 'fun', label: 'Fun', icon: <IconGame />,
    commands: [
      { name: '/8ball', usage: '/8ball [question]', description: 'Consult the magic 8 ball for wisdom. Results may vary.', example: '/8ball will i ever finish my project' },
      { name: '/slap', usage: '/slap @user', description: 'Slap someone with an animated GIF. For comedic purposes only.', example: '/slap @user' },
      { name: '/hug', usage: '/hug @user', description: 'Send a warm virtual hug to someone who needs it.', example: '/hug @pookie' },
      { name: '/kiss', usage: '/kiss @user', description: 'Smooch. You know what this does.', example: '/kiss @crush' },
    ],
  },
];

// ─── Discord Embed ─────────────────────────────────────────────────────────────
function DiscordEmbed({
  command,
  inputValue,
  executed,
  currentTime,
  embedRef,
}: {
  command: Command;
  inputValue: string;
  executed: boolean;
  currentTime: string;
  embedRef: React.RefObject<HTMLDivElement>;
}) {
  if (executed) {
    return (
      <div ref={embedRef} className="w-full max-w-[420px] bg-[#2B2D31] rounded-[4px] border-l-[3px] border-sakura-300 p-4 shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sakura-200 to-sakura-500 flex-shrink-0" />
          <span className="font-bold text-[13px] text-white">Looki</span>
          <span className="text-[10px] bg-[#5865F2] text-white px-1.5 py-0.5 rounded font-bold tracking-wide">BOT</span>
        </div>
        <p className="text-white font-bold text-[15px] mb-2">✓ Command executed</p>
        <div className="text-[13px] text-[#DBDEE1] space-y-1">
          <div>
            <span className="text-[#B5BAC1]">Input </span>
            <code className="bg-[#1E1F22] px-1.5 py-0.5 rounded text-sakura-300 font-dm-mono text-[12px]">
              {inputValue}
            </code>
          </div>
          <div><span className="text-[#B5BAC1]">Status </span>Action applied successfully.</div>
        </div>
        <div className="mt-4 pt-3 border-t border-[#3B3D44] text-[11px] text-[#72767D] flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-sakura-300" />
          <span suppressHydrationWarning>looki · Today at {currentTime}</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={embedRef} className="w-full max-w-[420px]">
      {/* Command reference card */}
      <div className="bg-[#2B2D31] rounded-[4px] border-l-[3px] border-[#404249] p-4 shadow-xl opacity-90">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded-full bg-[#3B3D44]" />
          <div className="h-3 w-14 bg-[#3B3D44] rounded" />
          <div className="h-3 w-6 bg-[#5865F2] rounded ml-1" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-28 bg-[#3B3D44] rounded" />
          <div className="h-3 w-full bg-[#3B3D44]/70 rounded" />
          <div className="h-3 w-4/5 bg-[#3B3D44]/70 rounded" />
        </div>
        <div className="mt-4 h-3 w-32 bg-[#3B3D44]/50 rounded" />
      </div>

      {/* Reference below */}
      <div className="mt-4 px-1 space-y-2.5">
        <div>
          <p className="font-dm-mono text-[10px] tracking-[0.25em] text-landing-text-4 mb-1 uppercase">Usage</p>
          <code className="font-dm-mono text-[13px] text-sakura-300 bg-surface/60 px-3 py-1.5 rounded-md border border-landing-1 block">
            {command.usage}
          </code>
        </div>
        <div>
          <p className="font-dm-mono text-[10px] tracking-[0.25em] text-landing-text-4 mb-1 uppercase">Description</p>
          <p className="font-syne text-[13px] text-landing-text-2 leading-relaxed">{command.description}</p>
        </div>
        <div>
          <p className="font-dm-mono text-[10px] tracking-[0.25em] text-landing-text-4 mb-1 uppercase">Example</p>
          <code className="font-dm-mono text-[12px] text-landing-text-3 italic">{command.example}</code>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CommandsTerminal() {
  const [activeTab, setActiveTab] = useState('mod');
  const [selectedCommand, setSelectedCommand] = useState<Command>(CATEGORIES[0].commands[0]);
  const [inputValue, setInputValue] = useState('');
  const [executed, setExecuted] = useState(false);
  const [hint, setHint] = useState('');
  const embedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const animateEmbed = useCallback(() => {
    if (!embedRef.current) return;
    gsap.fromTo(
      embedRef.current,
      { opacity: 0, y: 10, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: 'back.out(1.4)' }
    );
  }, []);

  // Animate embed when selected command changes (after React re-renders)
  useEffect(() => {
    setInputValue('');
    setExecuted(false);
    setHint('');
    const frame = requestAnimationFrame(animateEmbed);
    return () => cancelAnimationFrame(frame);
  }, [selectedCommand, animateEmbed]);

  const handleTabChange = (catId: string) => {
    if (catId === activeTab) return;
    setActiveTab(catId);
    const cat = CATEGORIES.find(c => c.id === catId)!;
    setSelectedCommand(cat.commands[0]);
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      setHint('Type a command above and press Enter');
      inputRef.current?.focus();
      return;
    }
    setExecuted(true);
    setHint('');
    requestAnimationFrame(animateEmbed);
  };

  const activeCategory = CATEGORIES.find(c => c.id === activeTab)!;

  return (
    <section id="commands" className="py-32 px-4 md:px-[60px] relative z-10">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="font-dm-mono text-[11px] tracking-[0.32em] text-landing-text-4 mb-8 flex items-center gap-4">
            <span>03</span>
            <span className="w-8 h-px bg-landing-2/50 inline-block" />
            <span>COMMANDS</span>
          </div>
        </motion.div>

        <motion.h2
          className="font-garamond text-[clamp(48px,7vw,96px)] font-light leading-[0.95] tracking-tight mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          every command,
          <br />
          <span className="italic text-sakura-300">one keystroke away ✦</span>
        </motion.h2>

        {/* Terminal */}
        <motion.div
          className="rounded-2xl border border-landing-1 overflow-hidden shadow-[0_0_80px_rgba(255,182,193,0.04)]"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Title bar */}
          <div className="bg-[#100E1A] px-5 py-3.5 flex items-center justify-between border-b border-landing-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <span className="font-dm-mono text-[11px] text-landing-text-4 tracking-widest">looki · terminal</span>
            <div className="w-14" />
          </div>

          <div className="flex flex-col md:flex-row" style={{ minHeight: 520 }}>

            {/* ── Left panel ── */}
            <div className="w-full md:w-[36%] border-r border-landing-0 bg-[#080610] flex flex-col font-dm-mono">

              {/* Category tabs */}
              <div className="flex border-b border-landing-0">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleTabChange(cat.id)}
                    className={`relative flex-1 px-3 py-3 text-[11px] flex items-center justify-center gap-1.5 transition-colors ${activeTab === cat.id
                        ? 'text-sakura-300 bg-sakura-300/8'
                        : 'text-landing-text-3 hover:text-landing-text-2 hover:bg-surface/30'
                      }`}
                  >
                    {activeTab === cat.id && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-sakura-300"
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                    <span className={activeTab === cat.id ? 'text-sakura-300' : 'text-landing-text-3'}>
                      {cat.icon}
                    </span>
                    <span className="hidden lg:inline tracking-[0.08em]">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Command list */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-0.5"
                  >
                    {activeCategory.commands.map(cmd => (
                      <button
                        key={cmd.name}
                        onClick={() => setSelectedCommand(cmd)}
                        className={`text-left px-3 py-2.5 rounded-lg text-[12px] transition-all flex items-center justify-between group ${selectedCommand.name === cmd.name
                            ? 'bg-sakura-300/10 text-sakura-300'
                            : 'text-landing-text-2 hover:bg-surface/40 hover:text-landing-text-1'
                          }`}
                      >
                        <span className="tracking-wide">{cmd.name}</span>
                        {selectedCommand.name === cmd.name && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-sakura-300 flex-shrink-0">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Input area */}
              <div className="p-4 border-t border-landing-0 bg-[#0A0812]">
                <p className="text-[10px] tracking-[0.2em] text-landing-text-4 uppercase mb-2.5">
                  Try it out
                </p>
                <div className="flex items-center gap-2 text-sakura-300">
                  <span className="text-landing-text-4 flex-shrink-0">›</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={e => { setInputValue(e.target.value); setHint(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder={selectedCommand.example}
                    className="bg-transparent outline-none w-full text-[13px] text-landing-text-1 placeholder-landing-text-4 font-dm-mono"
                    style={{ fontSize: 13 }}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <AnimatePresence>
                  {hint && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] text-sakura-300/60 mt-2 font-dm-mono"
                    >
                      ↑ {hint}
                    </motion.p>
                  )}
                </AnimatePresence>
                <button
                  onClick={handleSubmit}
                  className="mt-3 w-full py-1.5 rounded-md border border-sakura-300/20 text-[11px] tracking-[0.15em] text-sakura-300/70 font-dm-mono hover:bg-sakura-300/8 hover:text-sakura-300 hover:border-sakura-300/40 transition-all active:scale-[0.98]"
                >
                  ENTER ↵
                </button>
              </div>
            </div>

            {/* ── Right panel ── */}
            <div className="flex-1 bg-[#060508] p-8 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sakura-300/[0.03] to-transparent pointer-events-none" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedCommand.name}-${executed}`}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full flex items-center justify-center"
                >
                  <DiscordEmbed
                    command={selectedCommand}
                    inputValue={inputValue}
                    executed={executed}
                    currentTime={currentTime}
                    embedRef={embedRef}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}