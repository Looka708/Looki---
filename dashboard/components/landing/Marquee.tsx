'use client';

export default function Marquee() {
  const text = "✦ 50,000+ SERVERS  ·  2M+ MEMBERS  ·  100M+ COMMANDS RUN  ·  99.9% UPTIME  ·  FREE FOREVER  ·  MADE WITH ♡  ·  ";
  
  // Format the text to make ✦ and · pink
  const formatText = (content: string) => {
    return content.split('').map((char, index) => {
      if (char === '✦' || char === '·' || char === '♡') {
        return <span key={index} className="text-sakura-300">{char}</span>;
      }
      return <span key={index}>{char}</span>;
    });
  };

  return (
    <div className="w-full bg-[rgba(255,182,193,0.04)] border-y border-landing-1 py-5 overflow-hidden flex cursor-none hover:bg-[rgba(255,182,193,0.06)] transition-colors">
      <style dangerouslySetInnerHTML={{ __html: `
        .marquee-content {
          animation: marquee 40s linear infinite;
        }
        .marquee-container:hover .marquee-content {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
      <div className="marquee-container flex w-[200%]">
        <div className="marquee-content flex gap-4 w-1/2 whitespace-nowrap font-dm-mono text-[12px] tracking-[0.2em] text-landing-text-3">
          <span className="mx-2">{formatText(text)}</span>
          <span className="mx-2">{formatText(text)}</span>
          <span className="mx-2">{formatText(text)}</span>
        </div>
        <div className="marquee-content flex gap-4 w-1/2 whitespace-nowrap font-dm-mono text-[12px] tracking-[0.2em] text-landing-text-3">
           <span className="mx-2">{formatText(text)}</span>
           <span className="mx-2">{formatText(text)}</span>
           <span className="mx-2">{formatText(text)}</span>
        </div>
      </div>
    </div>
  );
}
