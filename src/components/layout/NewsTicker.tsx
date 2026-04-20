import { Zap } from "lucide-react";

const NEWS = [
  "New Phase: Earning Ecosystem is now LIVE! 🚀",
  "Refer your friends and earn rewards automatically. 💰",
  "Daily bug fixes and security updates deployed. 🛡️",
  "PDF & Excel exports added for better tracking. 📊",
  "Coming Soon: AI-powered diagnostic assistant! 🤖"
];

export function NewsTicker() {
  return (
    <div className="bg-primary/5 border-y border-primary/10 overflow-hidden py-2 hidden md:block">
      <div className="container mx-auto flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 animate-pulse">
          <Zap className="h-3 w-3" /> Live Updates
        </div>
        <div className="flex-1 overflow-hidden pointer-events-none">
          <div className="flex gap-24 animate-marquee whitespace-nowrap whitespace-nowrap hover:pause">
            {[...NEWS, ...NEWS].map((news, i) => (
              <span key={i} className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {news}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
