import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { FadeIn, Stagger, StaggerItem } from "../components/Motion";
import { Trophy, ArrowUp, Eye, Crown } from "@phosphor-icons/react";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";

const crownSvgs = ["/crown-gold.svg", "/crown-silver.svg", "/crown-bronze.svg"];

const rankStyles = [
  { border: "border-yellow-400", bg: "bg-gradient-to-b from-yellow-50 to-white", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700", label: "Gold" },
  { border: "border-slate-300", bg: "bg-gradient-to-b from-slate-50 to-white", text: "text-slate-600", badge: "bg-slate-100 text-slate-600", label: "Silver" },
  { border: "border-amber-500", bg: "bg-gradient-to-b from-amber-50 to-white", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", label: "Bronze" },
];

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
    <div className="pt-24 pb-20 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-200 bg-yellow-50 mb-5">
              <Trophy size={14} weight="fill" className="text-yellow-600" />
              <span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-yellow-700">Hall of Fame</span>
            </div>

            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter text-foreground mb-3">
              Champions of {titles}
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Celebrating the projects that earned their place at the top of the Innovation Lab ZA leaderboard.
            </p>

            <div className="flex gap-1.5 justify-center mt-6 bg-secondary/50 rounded-full p-1 inline-flex">
              {[
                { key: "all", label: "All Time" },
                { key: "monthly", label: "Monthly" },
                { key: "weekly", label: "Weekly" },
              ].map((t) => (
                <button key={t.key} onClick={() => setPeriod(t.key)} className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  period === t.key
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
          </div>
        ) : projects.length === 0 ? (
          <FadeIn>
            <div className="border border-dashed border-border rounded-2xl p-16 text-center">
              <Trophy size={48} className="mx-auto mb-4 text-muted-foreground/20" />
              <p className="font-heading font-bold text-xl text-muted-foreground">No champions yet</p>
              <p className="text-sm text-muted-foreground/60 mt-1 mb-6">Be the first to claim the crown.</p>
              <Link to="/submit"><Button className="rounded-full">Submit your project</Button></Link>
            </div>
          </FadeIn>
        ) : (
          <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {projects.map((p, i) => {
              const style = rankStyles[i];

              return (
                <StaggerItem key={p.id}>
                  <div className="relative pt-12">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
                      <img src={crownSvgs[i]} alt="" className={i === 0 ? "w-16 h-16" : "w-14 h-14"} />
                      <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-black px-1.5 py-0.5 rounded-full border bg-white ${style.border}`}>
                        #{i + 1}
                      </span>
                    </div>

                    <Link to={`/p/${p.slug}`} className={`group block rounded-2xl border-2 ${style.border} ${style.bg} hover:shadow-lg transition-all duration-300 overflow-hidden`}>
                      <div className="p-5 pt-4">
                        <div className={style.badge + " inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mb-3"}>
                          <Trophy size={10} weight="fill" /> {style.label}
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          {p.cover_image_url ? (
                            <img src={p.cover_image_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-border flex-shrink-0 bg-white" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-primary/5 border border-border flex items-center justify-center flex-shrink-0">
                              <span className="font-heading font-black text-xl text-primary/30">{p.name?.[0]}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-heading font-bold text-base group-hover:text-primary transition-colors truncate">{p.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.tagline}</p>
                          </div>
                        </div>

                        {p.maker && (
                          <div className="flex items-center gap-2 mb-3 text-xs py-2 px-3 rounded-lg bg-secondary/40">
                            <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                              {p.maker.name?.[0]}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">{p.maker.name}</p>
                              <p className="text-muted-foreground truncate">@{p.maker.username}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs">
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/60 font-medium">
                            <ArrowUp size={11} weight="fill" className="text-primary" /> {p.upvotes_count || 0}
                          </span>
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/60 font-medium text-muted-foreground">
                            <Eye size={11} weight="fill" /> {p.views_count || 0}
                          </span>
                        </div>

                        <p className="text-[10px] text-muted-foreground/50 mt-4 text-center">
                          Crowned {today}
                        </p>
                      </div>
                    </Link>
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
