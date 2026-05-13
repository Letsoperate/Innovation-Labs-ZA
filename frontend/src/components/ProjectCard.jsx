import { Link } from "react-router-dom";
import { ArrowUp, ChatCircle, Eye, ArrowUpRight, Crown, Fire, Rocket, Star, Lightning } from "@phosphor-icons/react";
import { Badge } from "./ui/badge";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import api, { fileUrl } from "../lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

const BADGE_ICONS = { crown: Crown, hot: Fire, rising: Lightning, new: Star, fast: Rocket };

const CROWN_STYLES = {
  1: { color: "#FFD700", glow: "0 0 20px rgba(255,215,0,0.5)", text: "#B8860B", bg: "from-yellow-400 via-amber-300 to-yellow-500", border: "border-yellow-400/50" },
  2: { color: "#C0C0C0", glow: "0 0 15px rgba(192,192,192,0.4)", text: "#6B7280", bg: "from-slate-300 via-gray-200 to-slate-400", border: "border-slate-300/50" },
  3: { color: "#CD7F32", glow: "0 0 12px rgba(205,127,50,0.35)", text: "#8B4513", bg: "from-amber-600 via-orange-400 to-amber-700", border: "border-amber-600/50" },
};

export default function ProjectCard({ project, rank, onUpdate }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [hasUp, setHasUp] = useState(!!project.has_upvoted);
  const [count, setCount] = useState(project.upvotes_count || 0);

  const upvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Sign in to upvote"); return; }
    if (busy) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/projects/${project.id}/upvote`);
      setHasUp(data.upvoted);
      setCount(data.upvotes_count);
      onUpdate?.();
    } catch { toast.error("Failed to upvote"); }
    finally { setBusy(false); }
  };

  const isTop3 = rank <= 3;
  const crown = CROWN_STYLES[rank];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      data-testid={`project-card-${project.slug}`}
    >
      <Link
        to={`/p/${project.slug}`}
        state={{ project }}
        className={`group relative block border bg-card hover:shadow-lg transition-all duration-300 p-5 ${
          isTop3 && crown ? `${crown.border} shadow-[${crown.glow}]` : "border-border hover:border-foreground/30"
        }`}
        style={isTop3 && crown ? { boxShadow: crown.glow } : undefined}
      >
        {isTop3 && crown && (
          <div className="absolute -top-3 -right-3 z-10">
            <div className="relative">
              <Crown size={28} weight="fill" className="drop-shadow-lg" style={{ color: crown.color }}>
                <animateTransform attributeName="transform" type="rotate" values="0 14 14;-5 14 14;3 14 14;0 14 14" dur="2s" repeatCount="indefinite" />
              </Crown>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-background border border-border/60 text-[9px] font-black tracking-wider" style={{ color: crown.text }}>
                #{rank}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-5">
          {rank !== undefined && !isTop3 && (
            <div className="flex-shrink-0 w-10 text-center flex flex-col items-center justify-center">
              <div className="font-heading font-black text-2xl text-muted-foreground/25 leading-none">
                {String(rank).padStart(2, "0")}
              </div>
            </div>
          )}

          {isTop3 && (
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-10">
              <div className={`relative w-8 h-8 rounded-lg bg-gradient-to-br ${crown.bg} flex items-center justify-center shadow-lg`}>
                <Crown size={16} weight="fill" className="text-white drop-shadow" />
                <div className="absolute inset-0 rounded-lg bg-white/20 shimmer" />
              </div>
            </div>
          )}

          <div className="flex-shrink-0">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 border bg-muted overflow-hidden ${isTop3 ? 'border-amber-500/30' : 'border-border'}`}>
              {project.cover_image_url ? (
                <img src={fileUrl(project.cover_image_url)} alt={project.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center font-heading font-black text-2xl text-primary">
                  {project.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className={`font-heading font-bold text-lg sm:text-xl transition-colors leading-tight flex items-center gap-1.5 ${
                  isTop3 ? 'bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent' : 'text-foreground group-hover:text-primary'
                }`}>
                  <span className="truncate">{project.name}</span>
                  <ArrowUpRight size={16} weight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.tagline}</p>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {(project.badges || []).map((b, i) => {
                    const Icon = BADGE_ICONS[b.type];
                    return Icon ? (
                      <span key={i} className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.color} bg-current/5 border-current/20`}>
                        <Icon size={10} weight="fill" /> {b.label}
                      </span>
                    ) : null;
                  })}
                  {project.category && (
                    <Badge variant="outline" className="rounded-sm text-xs border-border bg-secondary/50">
                      {project.category}
                    </Badge>
                  )}
                  {(project.tags || []).slice(0, 2).map((t) => (
                    <Badge key={t} variant="outline" className="rounded-sm text-xs border-border bg-transparent text-muted-foreground">
                      {t}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye size={14} /> {project.views_count || 0}</span>
                  <span className="flex items-center gap-1"><ChatCircle size={14} /> {project.comments_count || 0}</span>
                  {project.maker?.username && (
                    <span className="hidden sm:inline">by @{project.maker.username}</span>
                  )}
                </div>
              </div>

              <button
                onClick={upvote}
                disabled={busy}
                data-testid={`upvote-button-${project.slug}`}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 sm:w-16 sm:h-20 border transition-all active:scale-95 ${
                  hasUp
                    ? "bg-primary border-primary text-white"
                    : "bg-background border-border text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                <ArrowUp size={18} weight="bold" />
                <span className="font-heading font-bold text-base sm:text-lg leading-none mt-1">{count}</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        .shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </motion.div>
  );
}
