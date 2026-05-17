import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { Trophy, Timer, X } from "@phosphor-icons/react";

const COMPETITION_DURATION_MINUTES = 3;
const crownSvgs = ["/crown-gold.svg", "/crown-silver.svg", "/crown-bronze.svg"];

export default function CountdownBanner() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [ended, setEnded] = useState(false);
  const [winners, setWinners] = useState([]);
  const [endTime, setEndTime] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const end = new Date(Date.now() + COMPETITION_DURATION_MINUTES * 60 * 1000);
    setEndTime(end);
    const tick = () => {
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) {
        setEnded(true);
        api.get("/projects/leaderboard", { params: { period: "all", limit: 3 } }).then((r) => setWinners(r.data)).catch(() => {});
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!endTime) return null;
  if (ended && winners.length === 0) return null;
  if (ended && dismissed) return null;

  if (ended) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <style>{`
          @keyframes winner-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
        `}</style>

        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400" />

        <button onClick={() => setDismissed(true)} className="absolute top-6 right-6 z-10 w-9 h-9 flex items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors">
          <X size={18} />
        </button>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <img src="/crown-gold.svg" alt="" className="w-20 h-20 mx-auto mb-5" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700 text-[11px] font-semibold uppercase tracking-wider mb-3">
            <Trophy size={12} weight="fill" /> Competition Ended
          </div>

          <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter text-foreground mb-2">
            The champions have been crowned
          </h1>
          <p className="text-muted-foreground mb-10">Congratulations to the winners.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {winners.map((w, i) => (
              <Link key={i} to={`/p/${w.slug}`} className="group" onClick={() => setDismissed(true)}>
                <div style={{
                  animation: `winner-float ${2.5 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}>
                  <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 group-hover:shadow-lg ${
                    i === 0 ? "border-yellow-400 bg-gradient-to-b from-yellow-50 to-white" :
                    i === 1 ? "border-slate-300 bg-gradient-to-b from-slate-50 to-white" :
                    "border-amber-500 bg-gradient-to-b from-amber-50 to-white"
                  }`}>
                    <img src={crownSvgs[i]} alt="" className="w-14 h-14 mx-auto -mt-11 mb-3" />
                    <span className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-0.5 rounded-full ${
                      i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-700"
                    }`}>
                      {i === 0 ? "1st" : i === 1 ? "2nd" : "3rd"} Place
                    </span>
                    <h3 className="font-heading font-black text-lg mt-2 text-foreground group-hover:text-primary transition-colors">{w.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{w.tagline}</p>
                    {w.maker && (
                      <div className="mt-4 pt-4 border-t border-border/60">
                        <p className="text-sm font-semibold">{w.maker.name}</p>
                        <p className="text-xs text-muted-foreground">@{w.maker.username}</p>
                      </div>
                    )}
                    <div className="flex justify-center gap-2 mt-3 text-xs font-medium">
                      <span className="px-2.5 py-1 rounded-full bg-secondary/60">⬆ {w.upvotes_count || 0}</span>
                      <span className="px-2.5 py-1 rounded-full bg-secondary/60 text-muted-foreground">👁 {w.views_count || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link to="/hall-of-fame" onClick={() => setDismissed(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              <Trophy size={14} /> View Hall of Fame
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-pink-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Timer size={16} weight="fill" className="text-primary" />
            Competition ends in
          </span>
          <div className="flex items-center gap-3">
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Minutes" },
              { value: timeLeft.seconds, label: "Seconds" },
            ].map((u, i) => (
              <span key={u.label} className="flex items-center gap-1">
                <span className="font-heading font-black text-lg tabular-nums bg-foreground text-background px-2 py-0.5 rounded-md">
                  {String(u.value).padStart(2, "0")}
                </span>
                <span className="text-xs text-muted-foreground">{u.label}</span>
                {i < 3 && <span className="text-border">:</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
