import { Link } from "react-router-dom";
import { ArrowUp, ChatCircle, Eye, ArrowUpRight, Crown, Fire, Rocket, Star, Lightning, BookmarkSimple } from "@phosphor-icons/react";
import { Badge } from "./ui/badge";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import api, { fileUrl } from "../lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

const BADGE_ICONS = { crown: Crown, hot: Fire, rising: Lightning, new: Star, fast: Rocket };

const CROWN_STYLES = {
  1: { color: "#FFD700", glow: "0 0 24px rgba(255,215,0,0.6)", text: "#B8860B", bg: "from-yellow-400 via-amber-300 to-yellow-500", border: "border-yellow-400/50" },
  2: { color: "#C0C0C0", glow: "0 0 18px rgba(192,192,192,0.5)", text: "#6B7280", bg: "from-slate-300 via-gray-200 to-slate-400", border: "border-slate-300/50" },
  3: { color: "#CD7F32", glow: "0 0 14px rgba(205,127,50,0.4)", text: "#8B4513", bg: "from-amber-600 via-orange-400 to-amber-700", border: "border-amber-600/50" },
};

export default function ProjectCard({ project, rank, onUpdate }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [hasUp, setHasUp] = useState(!!project.has_upvoted);
  const [count, setCount] = useState(project.upvotes_count || 0);
  const [hasBookmark, setHasBookmark] = useState(!!project.has_bookmarked);
  const [bmBusy, setBmBusy] = useState(false);

  const upvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Sign in to upvote"); return; }
    if (busy) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/projects/${project.slug}/upvote`);
      setHasUp(data.upvoted);
      setCount(data.upvotes_count);
      onUpdate?.();
    } catch { toast.error("Failed to upvote"); }
    finally { setBusy(false); }
  };

  const bookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Sign in to bookmark"); return; }
    if (bmBusy) return;
    setBmBusy(true);
    try {
      const { data } = await api.post(`/projects/${project.slug}/bookmark`);
      setHasBookmark(data.bookmarked ?? !hasBookmark);
      onUpdate?.();
    } catch { toast.error("Failed to bookmark"); }
    finally { setBmBusy(false); }
  };

  const isTop3 = rank && rank <= 3;
  const crown = isTop3 ? CROWN_STYLES[rank] : null;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      data-testid={`project-card-${project.slug}`}
      className="relative"
    >
      {isTop3 && crown && (
        <img
          src={`/crown-${rank === 1 ? "gold" : rank === 2 ? "silver" : "bronze"}.svg`}
          alt=""
          className="absolute -top-5 -right-5 z-20 w-12 h-12 drop-shadow-xl pointer-events-none"
          style={{ filter: `drop-shadow(${crown.glow})` }}
        />
      )}

      <Link
        to={`/p/${project.slug}`}
        state={{ project }}
        className={`group relative block border rounded-2xl overflow-hidden bg-card hover:shadow-lg transition-all duration-300 p-4 ${
          isTop3 && crown ? crown.border : "border-border hover:border-foreground/30"
        }`}
        style={isTop3 && crown ? { boxShadow: crown.glow } : undefined}
      >
        <div className="flex gap-3">
          {rank !== undefined && !isTop3 && (
            <div className="flex-shrink-0 w-8 text-center flex flex-col items-center justify-center">
              <span className="font-heading font-black text-xl text-muted-foreground/20 leading-none">
                {String(rank).padStart(2, "0")}
              </span>
            </div>
          )}

          {isTop3 && (
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${crown.bg} flex items-center justify-center shadow-md self-center relative overflow-hidden`}>
              <Crown size={14} weight="fill" className="text-white drop-shadow z-10" />
              <span className="absolute -bottom-0.5 right-0.5 text-[7px] font-black text-white/80 z-10">#{rank}</span>
            </div>
          )}

          <div className="flex-shrink-0">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border bg-muted overflow-hidden ${isTop3 ? 'border-amber-500/20' : 'border-border'}`}>
              {project.cover_image_url ? (
                <img src={fileUrl(project.cover_image_url)} alt={project.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center font-heading font-black text-lg text-primary">
                  {project.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-sm sm:text-base transition-colors leading-snug flex items-center gap-1 text-foreground group-hover:text-primary">
                  <span className="truncate">{project.name}</span>
                  <ArrowUpRight size={13} weight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{project.tagline}</p>

                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {(project.badges || []).filter(b => b.type !== "crown").slice(0, 2).map((b, i) => {
                    const Icon = BADGE_ICONS[b.type];
                    return Icon ? (
                      <span key={i} className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${b.color} bg-current/5 border-current/20`}>
                        <Icon size={9} weight="fill" /> {b.label}
                      </span>
                    ) : null;
                  })}
                  {project.category && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm border border-border bg-secondary/50 text-muted-foreground font-medium">
                      {project.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye size={11} /> {project.views_count || 0}</span>
                  <span className="flex items-center gap-1"><ChatCircle size={11} /> {project.comments_count || 0}</span>
                  {project.maker?.username && (
                    <span className="hidden sm:inline text-[10px]">by @{project.maker.username}</span>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <button
                  onClick={upvote}
                  disabled={busy}
                  data-testid={`upvote-button-${project.slug}`}
                  className={`flex flex-col items-center justify-center w-12 h-14 sm:w-14 sm:h-16 rounded-xl border transition-all active:scale-95 ${
                    hasUp
                      ? "bg-primary border-primary text-white"
                      : "bg-background border-border text-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  <ArrowUp size={16} weight="bold" />
                  <span className="font-heading font-bold text-sm leading-none mt-0.5">{count}</span>
                </button>
                <button
                  onClick={bookmark}
                  disabled={bmBusy}
                  data-testid={`bookmark-button-${project.slug}`}
                  title={hasBookmark ? "Remove bookmark" : "Bookmark"}
                  className={`flex items-center justify-center w-12 h-9 sm:w-14 sm:h-10 rounded-xl border transition-all active:scale-95 ${
                    hasBookmark
                      ? "bg-amber-500 border-amber-500 text-white"
                      : "bg-background border-border text-muted-foreground hover:border-amber-500 hover:text-amber-500"
                  }`}
                >
                  <BookmarkSimple size={16} weight={hasBookmark ? "fill" : "bold"} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
