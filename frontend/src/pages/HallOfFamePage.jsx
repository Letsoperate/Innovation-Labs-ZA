import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { FadeIn } from "../components/Motion";
import { Trophy, Calendar, Clock, ArrowUp, Eye, ArrowRight } from "@phosphor-icons/react";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";

const crownSvgs = ["/crown-gold.svg", "/crown-silver.svg", "/crown-bronze.svg"];
const crownColors = [
  { from: "from-yellow-500", to: "to-amber-600", glow: "shadow-yellow-500/30", border: "border-yellow-400/40", bg: "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20" },
  { from: "from-slate-400", to: "to-gray-500", glow: "shadow-slate-400/20", border: "border-slate-300/40", bg: "bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/20" },
  { from: "from-amber-600", to: "to-orange-700", glow: "shadow-amber-600/20", border: "border-amber-500/40", bg: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20" },
];

export default function HallOfFamePage() {
  const [period, setPeriod] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/projects/leaderboard", { params: { period, limit: 3 } }).then((r) => { setProjects(r.data); setLoading(false); });
  }, [period]);

  const champions = [
    { label: "Product of the Day", icon: Calendar, color: "from-blue-500 to-cyan-500", p: projects[0] },
    { label: "Product of the Week", icon: Clock, color: "from-purple-500 to-pink-500", p: projects[1] },
    { label: "Product of the Month", icon: Trophy, color: "from-amber-500 to-orange-500", p: projects[2] },
  ];

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <img src="/crown-gold.svg" alt="" className="w-16 h-16 mx-auto mb-4 drop-shadow-lg" />
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Hall of Fame
            </h1>
            <p className="text-muted-foreground text-base mt-3 max-w-xl mx-auto">
              Immortalized. The champions who earned their place in Innovation Lab ZA history.
            </p>
            <div className="flex gap-2 justify-center mt-6">
              {[
                { key: "all", label: "All Time" },
                { key: "monthly", label: "Monthly" },
                { key: "weekly", label: "Weekly" },
              ].map((t) => (
                <button key={t.key} onClick={() => setPeriod(t.key)} className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                  period === t.key ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/40 text-muted-foreground"
                }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {loading ? (
          <div className="grid sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
          </div>
        ) : projects.length === 0 ? (
          <FadeIn>
            <div className="border border-dashed border-border rounded-2xl p-16 text-center text-muted-foreground">
              <Trophy size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-heading font-bold text-xl">No champions crowned yet</p>
              <p className="text-sm mt-2">Be the first to claim the throne.</p>
              <Link to="/submit"><Button className="mt-6 bg-primary hover:bg-primary/90 rounded-full">Submit your project</Button></Link>
            </div>
          </FadeIn>
        ) : (
          <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
            {champions.map((ch, i) => {
              const Icon = ch.icon;
              const champion = ch.p;
              const style = crownColors[i];
              return (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className={`relative group rounded-2xl border ${style.border} ${style.bg} overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${style.glow}`}>
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${ch.color}`} />
                    <div className={`absolute -top-8 left-1/2 -translate-x-1/2 z-10`}>
                      <img src={crownSvgs[i]} alt="" className="w-20 h-20 drop-shadow-xl" style={{ filter: `drop-shadow(0 4px 12px ${i === 0 ? "rgba(255,215,0,0.5)" : i === 1 ? "rgba(192,192,192,0.4)" : "rgba(205,127,50,0.3)"})` }} />
                    </div>
                    <div className="p-6 pt-14 text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-2 text-xs uppercase tracking-[0.15em] font-bold" style={{ color: i === 0 ? "#B8860B" : i === 1 ? "#6B7280" : "#8B4513" }}>
                        <Icon size={12} weight="fill" /> {ch.label}
                      </div>
                      {champion ? (
                        <Link to={`/p/${champion.slug}`} className="block">
                          <h3 className="font-heading font-black text-xl group-hover:text-primary transition-colors">{champion.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{champion.tagline}</p>
                          {champion.maker && (
                            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border/60">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">{champion.maker.name}</span>
                                <span>@{champion.maker.username}</span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/50"><ArrowUp size={12} weight="fill" className="text-primary" /> {champion.upvotes_count || 0}</span>
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/50"><Eye size={12} weight="fill" className="text-primary" /> {champion.views_count || 0}</span>
                          </div>
                          <div className="mt-4">
                            <span className="inline-flex items-center gap-1 text-xs text-primary font-semibold group-hover:underline">
                              View project <ArrowRight size={12} />
                            </span>
                          </div>
                        </Link>
                      ) : (
                        <p className="text-sm text-muted-foreground py-6">Awaiting champion...</p>
                      )}
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
