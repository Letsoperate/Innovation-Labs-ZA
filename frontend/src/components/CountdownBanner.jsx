import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { Trophy, Timer } from "@phosphor-icons/react";

const COMPETITION_END = new Date("2026-05-31T23:59:59+02:00");

export default function CountdownBanner() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [ended, setEnded] = useState(false);
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = COMPETITION_END.getTime() - now.getTime();
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

  if (ended && winners.length === 0) return null;

  return (
    <div className={`border-b border-border ${ended ? "bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/30 dark:via-amber-950/20 dark:to-orange-950/30" : "bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-pink-950/30"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {!ended ? (
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
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <Trophy size={20} weight="fill" className="text-yellow-500" />
              <span className="font-heading font-bold text-lg">Competition Ended — Final Results</span>
            </div>
            <div className="flex items-center gap-3">
              {winners.map((w, i) => {
                const crownSrc = i === 0 ? "/crown-gold.svg" : i === 1 ? "/crown-silver.svg" : "/crown-bronze.svg";
                return (
                  <Link key={i} to={`/p/${w.slug}`} className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors">
                    <img src={crownSrc} alt="" className="w-5 h-5" />
                    <span className="font-semibold">{w.name}</span>
                    <span className="text-muted-foreground">by @{w.maker?.username}</span>
                  </Link>
                );
              })}
            </div>
            <Link to="/hall-of-fame" className="text-xs text-primary font-semibold hover:underline">
              View Hall of Fame
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
