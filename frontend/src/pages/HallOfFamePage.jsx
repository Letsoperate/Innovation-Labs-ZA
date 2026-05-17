import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { FadeIn, Stagger, StaggerItem } from "../components/Motion";
import { Trophy, Calendar, Clock, ArrowUp, Eye } from "@phosphor-icons/react";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";

const crownSvgs = ["/crown-gold.svg", "/crown-silver.svg", "/crown-bronze.svg"];

export default function HallOfFamePage() {
  const [period, setPeriod] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/projects/leaderboard", { params: { period, limit: 3 } }).then((r) => { setProjects(r.data); setLoading(false); });
  }, [period]);

  const today = new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
  const titles = period === "weekly" ? "This Week" : period === "monthly" ? "This Month" : "All Time";

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <img src="/crown-gold.svg" alt="" className="w-14 h-14 mx-auto mb-3 drop-shadow-lg" />
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Hall of Fame
            </h1>
            <p className="text-muted-foreground text-sm mt-2">Champions crowned · {titles}</p>
            <div className="flex gap-2 justify-center mt-5">
              {[
                { key: "all", label: "All Time" },
                { key: "monthly", label: "Monthly" },
                { key: "weekly", label: "Weekly" },
              ].map((t) => (
                <button key={t.key} onClick={() => setPeriod(t.key)} className={`px-3 py-1.5 text-[11px] font-semibold rounded-full border transition-all ${
                  period === t.key ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/40 text-muted-foreground"
                }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-full sm:w-80 rounded-2xl" />)}
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
          <Stagger className="flex flex-col sm:flex-row items-stretch justify-center gap-4 lg:gap-6">
            {projects.map((p, i) => {
              const badges = [
                { bg: "from-yellow-500 to-amber-600", border: "border-yellow-400/40", shadow: "shadow-yellow-500/20", text: "text-yellow-600", label: "1st Place", icon: "🥇" },
                { bg: "from-slate-400 to-gray-500", border: "border-slate-300/40", shadow: "shadow-slate-400/15", text: "text-slate-500", label: "2nd Place", icon: "🥈" },
                { bg: "from-amber-600 to-orange-700", border: "border-amber-500/40", shadow: "shadow-amber-600/15", text: "text-amber-600", label: "3rd Place", icon: "🥉" },
              ];
              const b = badges[i];

              return (
                <StaggerItem key={p.id} className="w-full sm:w-80 flex-shrink-0">
                  <div className="relative pt-14">
                    {/* Crown outside the tile */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                      <img
                        src={crownSvgs[i]}
                        alt=""
                        className="w-16 h-16 drop-shadow-xl"
                        style={{ filter: `drop-shadow(0 3px 10px ${i === 0 ? "rgba(255,215,0,0.5)" : i === 1 ? "rgba(192,192,192,0.4)" : "rgba(205,127,50,0.3)"})` }}
                      />
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-background border border-border" style={{ color: i === 0 ? "#B8860B" : i === 1 ? "#6B7280" : "#8B4513" }}>
                        #{i + 1}
                      </span>
                    </div>

                    <Link to={`/p/${p.slug}`} className={`group relative block rounded-2xl border ${b.border} bg-card hover:shadow-xl ${b.shadow} transition-all duration-300 overflow-hidden`}>
                      <div className={`h-1.5 bg-gradient-to-r ${b.bg}`} />

                      <div className="p-5 pt-4">
                        <div className="flex items-center gap-3 mb-3">
                          {p.cover_image_url ? (
                            <img src={p.cover_image_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-border flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-heading font-black text-lg text-primary flex-shrink-0">
                              {p.name?.[0]}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-heading font-bold text-base group-hover:text-primary transition-colors truncate">{p.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.tagline}</p>
                          </div>
                        </div>

                        {p.maker && (
                          <div className="flex items-center gap-2 mb-3 text-xs">
                            <span className="font-semibold text-foreground">{p.maker.name}</span>
                            <span className="text-muted-foreground">@{p.maker.username}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/50"><ArrowUp size={12} weight="fill" className="text-primary" /> {p.upvotes_count}</span>
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/50"><Eye size={12} weight="fill" className="text-primary" /> {p.views_count}</span>
                        </div>

                        <div className="mt-4 text-center">
                          <span className={`text-[10px] uppercase tracking-[0.12em] font-bold ${b.text}`}>
                            {b.icon} {b.label}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <p className="text-center text-[10px] text-muted-foreground mt-2">
                      Crowned {today}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </div>
    </div>
  );
}
