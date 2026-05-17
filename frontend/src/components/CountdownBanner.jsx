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
      <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: "radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1a 60%, #000 100%)" }}>
        <style>{`
          @keyframes winner-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          @keyframes confetti-fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
        `}</style>

        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} style={{
            position: "absolute", top: "-10px",
            left: `${Math.random() * 100}%`,
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 12}px`,
            background: ["#FFD700","#C0C0C0","#CD7F32","#FF6B6B","#4ECDC4","#45B7D1"][Math.floor(Math.random() * 6)],
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `confetti-fall ${2 + Math.random() * 4}s linear ${Math.random() * 2}s infinite`,
          }} />
        ))}

        <button onClick={() => setDismissed(true)} className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <img src="/crown-gold.svg" alt="" className="w-24 h-24 mx-auto mb-6 drop-shadow-2xl" style={{ filter: "drop-shadow(0 0 30px rgba(255,215,0,0.6))" }} />

          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-2" style={{ background: "linear-gradient(135deg, #FFD700, #FFA500, #FFD700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Competition Ended
          </h1>
          <p className="text-white/50 text-lg mb-12">The champions have been crowned.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {winners.map((w, i) => (
              <Link key={i} to={`/p/${w.slug}`} className="group" onClick={() => setDismissed(true)}>
                <div style={{
                  animation: `winner-float ${2.5 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}>
                  <div className={`relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-500 group-hover:scale-105 ${
                    i === 0 ? "bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20 hover:shadow-[0_0_40px_rgba(255,215,0,0.3)]" :
                    i === 1 ? "bg-slate-400/10 border-slate-400/30 hover:bg-slate-400/20 hover:shadow-[0_0_30px_rgba(192,192,192,0.2)]" :
                    "bg-amber-600/10 border-amber-600/30 hover:bg-amber-600/20 hover:shadow-[0_0_25px_rgba(205,127,50,0.2)]"
                  }`}>
                    <img src={crownSvgs[i]} alt="" className="w-16 h-16 mx-auto -mt-12 mb-4 drop-shadow-xl" />
                    <div className="text-xs uppercase tracking-[0.2em] font-bold mb-2" style={{ color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : "#CD7F32" }}>
                      {i === 0 ? "1st Place" : i === 1 ? "2nd Place" : "3rd Place"}
                    </div>
                    <h3 className="font-heading font-black text-xl text-white group-hover:text-yellow-400 transition-colors">{w.name}</h3>
                    <p className="text-white/50 text-sm mt-1 line-clamp-2">{w.tagline}</p>
                    {w.maker && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-sm text-white/70 font-semibold">{w.maker.name}</p>
                        <p className="text-xs text-white/40">@{w.maker.username}</p>
                      </div>
                    )}
                    <div className="flex justify-center gap-4 mt-3 text-xs text-white/50">
                      <span>⬆ {w.upvotes_count || 0}</span>
                      <span>👁 {w.views_count || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <Link to="/hall-of-fame" onClick={() => setDismissed(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors border border-white/20">
              <Trophy size={16} /> View Hall of Fame
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
