import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { FadeIn, Stagger, StaggerItem } from "../components/Motion";
import { Trophy, Calendar, Clock, ArrowRight, Eye, ArrowUp } from "@phosphor-icons/react";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";

export default function HallOfFamePage() {
  const [period, setPeriod] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ projects: 0, makers: 0 });

  useEffect(() => {
    setLoading(true);
    api.get("/projects/leaderboard", { params: { period, limit: 20 } }).then((r) => { setProjects(r.data); setLoading(false); });
    api.get("/stats").then((r) => setStats(r.data));
  }, [period]);

  const top3 = projects.slice(0, 3);
  const champions = [
    { label: "Product of the Day", icon: Calendar, color: "from-blue-500 to-cyan-500", p: projects[0] },
    { label: "Product of the Week", icon: Clock, color: "from-purple-500 to-pink-500", p: projects[1] },
    { label: "Product of the Month", icon: Trophy, color: "from-amber-500 to-orange-500", p: projects[2] },
  ];

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-secondary/60 text-xs uppercase tracking-[0.15em] font-semibold rounded-full mb-4">
              <Trophy size={12} weight="fill" className="text-yellow-500" /> Hall of Fame
            </div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter">
              Celebrate legendary products.
            </h1>
            <p className="text-muted-foreground text-base mt-3 max-w-2xl mx-auto">
              Browse daily, weekly, and monthly champions that earned their place in the Innovation Lab ZA Hall of Fame.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {champions.map((ch) => {
              const Icon = ch.icon;
              const champion = ch.p;
              return (
                <div key={ch.label} className="border border-border rounded-2xl p-5 bg-card relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${ch.color}`} />
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-3">
                    <Icon size={12} weight="fill" /> {ch.label}
                  </div>
                  {loading ? (
                    <Skeleton className="h-16 w-full rounded-xl" />
                  ) : champion ? (
                    <Link to={`/p/${champion.slug}`} className="block group">
                      <p className="font-heading font-bold text-lg group-hover:text-primary transition-colors">{champion.name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{champion.tagline}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><ArrowUp size={12} /> {champion.upvotes_count || 0}</span>
                        <span className="flex items-center gap-1"><Eye size={12} /> {champion.views_count || 0}</span>
                        {champion.maker?.username && <span>by @{champion.maker.username}</span>}
                      </div>
                    </Link>
                  ) : (
                    <p className="text-sm text-muted-foreground">No champion yet</p>
                  )}
                </div>
              );
            })}
          </div>
        </FadeIn>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-1">Leaderboard</div>
              <h2 className="font-heading font-bold text-2xl">Top ranked projects.</h2>
            </div>
            <div className="flex gap-2">
              {[
                { key: "all", label: "All Time" },
                { key: "monthly", label: "Monthly" },
                { key: "weekly", label: "Weekly" },
              ].map((t) => (
                <button key={t.key} onClick={() => setPeriod(t.key)} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${period === t.key ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/40"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div>
          ) : projects.length === 0 ? (
            <div className="border border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground">
              <Trophy size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No projects yet</p>
              <p className="text-sm mt-1">Submit a project to claim the #1 spot.</p>
              <Link to="/submit"><Button className="mt-4 bg-primary hover:bg-primary/90 rounded-full">Submit your project</Button></Link>
            </div>
          ) : (
            <Stagger className="space-y-2">
              {projects.slice(0, 10).map((p, i) => (
                <StaggerItem key={p.id || p._id}>
                  <Link to={`/p/${p.slug}`} className="block border border-border rounded-2xl p-4 hover:border-foreground/30 transition-all group bg-card">
                    <div className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-heading font-black text-sm ${i === 0 ? "bg-yellow-100 text-yellow-600" : i === 1 ? "bg-slate-100 text-slate-500" : i === 2 ? "bg-amber-100 text-amber-700" : "bg-secondary/50 text-muted-foreground"}`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-semibold text-sm group-hover:text-primary transition-colors truncate">{p.name}</h3>
                          {p.badges?.filter(b => b.type !== "crown").slice(0, 2).map((b, bi) => (
                            <span key={bi} className="text-[9px] px-1.5 py-0.5 rounded-full border font-semibold" style={{ borderColor: `${b.color || '#888'}30`, color: b.color || '#888' }}>{b.label}</span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{p.tagline}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                        <span className="flex items-center gap-1"><ArrowUp size={12} /> {p.upvotes_count || 0}</span>
                        <span className="flex items-center gap-1"><Eye size={12} /> {p.views_count || 0}</span>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}

          {projects.length > 10 && (
            <div className="text-center mt-6">
              <Link to="/leaderboard"><Button variant="outline" className="rounded-full gap-2">View full leaderboard <ArrowRight size={14} /></Button></Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
