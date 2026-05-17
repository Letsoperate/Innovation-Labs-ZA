import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { FadeIn } from "../components/Motion";
import { Trophy, ArrowUp, Eye } from "@phosphor-icons/react";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";

const crownSvgs = ["/crown-gold.svg", "/crown-silver.svg", "/crown-bronze.svg"];

const podiumStyles = [
  { glow: "rgba(255,215,0,0.4)", border: "border-yellow-400/60", bg: "bg-gradient-to-b from-yellow-500/10 to-transparent", rank: "1st", color: "#FFD700", emoji: "👑" },
  { glow: "rgba(192,192,192,0.3)", border: "border-slate-400/50", bg: "bg-gradient-to-b from-slate-400/10 to-transparent", rank: "2nd", color: "#C0C0C0", emoji: "⚡" },
  { glow: "rgba(205,127,50,0.25)", border: "border-amber-600/40", bg: "bg-gradient-to-b from-amber-600/10 to-transparent", rank: "3rd", color: "#CD7F32", emoji: "🔥" },
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

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0a0a14 0%, #13132b 50%, #0a0a14 100%)" }}>
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
        backgroundSize: "30px 30px",
      }} />

      <div className="relative pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/5 mb-6">
                <Trophy size={14} weight="fill" className="text-yellow-500" />
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-yellow-500/80">Hall of Fame</span>
              </div>

              <h1 className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl tracking-tighter mb-4" style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Champions
              </h1>
              <p className="text-white/30 text-base max-w-lg mx-auto">
                The legends who conquered the Innovation Lab ZA leaderboard and earned their place in history.
              </p>

              <div className="flex gap-2 justify-center mt-8">
                {[
                  { key: "all", label: "All Time" },
                  { key: "monthly", label: "Monthly" },
                  { key: "weekly", label: "Weekly" },
                ].map((t) => (
                  <button key={t.key} onClick={() => setPeriod(t.key)} className={`px-5 py-2 text-xs font-semibold rounded-full border transition-all duration-300 ${
                    period === t.key
                      ? "bg-white/10 border-white/20 text-white"
                      : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
                  }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-72 w-full rounded-2xl bg-white/5" />)}
            </div>
          ) : projects.length === 0 ? (
            <FadeIn>
              <div className="border border-dashed border-white/10 rounded-2xl p-20 text-center">
                <Trophy size={56} className="mx-auto mb-5 text-white/10" />
                <p className="font-heading font-bold text-2xl text-white/50">No champions yet</p>
                <p className="text-white/20 text-sm mt-2 mb-8">Be the first to claim the crown.</p>
                <Link to="/submit"><Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full px-8 py-5">Submit your project</Button></Link>
              </div>
            </FadeIn>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
              {[projects[1], projects[0], projects[2]].map((p, displayIndex) => {
                const actualIndex = displayIndex === 0 ? 1 : displayIndex === 1 ? 0 : 2;
                const style = podiumStyles[actualIndex];
                if (!p) return <div key={actualIndex} />;

                return (
                  <FadeIn key={p.id} delay={actualIndex * 0.15}>
                    <div
                      className="relative group"
                      style={{
                        marginTop: actualIndex === 0 ? "60px" : actualIndex === 1 ? "0px" : "40px",
                      }}
                    >
                      <div
                        className="absolute -inset-1 rounded-3xl opacity-50 group-hover:opacity-90 transition-opacity duration-500 blur-xl"
                        style={{ background: `radial-gradient(circle at center, ${style.color}33, transparent 70%)` }}
                      />

                      <div className={`relative rounded-2xl border ${style.border} ${style.bg} backdrop-blur-sm overflow-hidden transition-all duration-500 group-hover:scale-[1.02]`} style={{ boxShadow: `0 0 40px ${style.glow}` }}>
                        {/* Crown */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                          <img
                            src={crownSvgs[actualIndex]}
                            alt=""
                            className={actualIndex === 0 ? "w-20 h-20" : "w-16 h-16"}
                            style={{ filter: `drop-shadow(0 4px 15px ${style.glow})` }}
                          />
                        </div>

                        <div className="p-6 pt-16 text-center">
                          {p.cover_image_url ? (
                            <img src={p.cover_image_url} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10 mx-auto mb-4 shadow-lg" />
                          ) : (
                            <div className="w-20 h-20 rounded-2xl bg-white/5 border-2 border-white/10 flex items-center justify-center mx-auto mb-4">
                              <span className="font-heading font-black text-2xl text-white/20">{p.name?.[0]}</span>
                            </div>
                          )}

                          <span className="text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-0.5 rounded-full" style={{ color: style.color, background: `${style.color}15` }}>
                            {style.emoji} {style.rank} Place
                          </span>

                          <Link to={`/p/${p.slug}`} className="block mt-3">
                            <h3 className={`font-heading font-black text-lg lg:text-xl text-white group-hover:text-yellow-400 transition-colors`}>
                              {p.name}
                            </h3>
                          </Link>

                          <p className="text-white/30 text-xs mt-1 line-clamp-2 px-2">{p.tagline}</p>

                          {p.maker && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <p className="text-white/60 text-sm font-semibold">{p.maker.name}</p>
                              <p className="text-white/30 text-xs">@{p.maker.username}</p>
                            </div>
                          )}

                          <div className="flex justify-center gap-3 mt-4">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: `${style.color}15`, color: style.color }}>
                              <ArrowUp size={11} weight="fill" /> {p.upvotes_count || 0}
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50">
                              <Eye size={11} weight="fill" /> {p.views_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-center text-[11px] text-white/20 mt-3">
                        Crowned {today}
                      </p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
