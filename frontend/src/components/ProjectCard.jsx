import { Link } from "react-router-dom";
import { ArrowUp, ChatCircle, Eye, ArrowUpRight } from "@phosphor-icons/react";
import { Badge } from "./ui/badge";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import api, { fileUrl } from "../lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ProjectCard({ project, rank, onUpdate }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [hasUp, setHasUp] = useState(!!project.has_upvoted);
  const [count, setCount] = useState(project.upvotes_count || 0);

  const upvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Sign in to upvote");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/projects/${project.id}/upvote`);
      setHasUp(data.upvoted);
      setCount(data.upvotes_count);
      onUpdate?.();
    } catch {
      toast.error("Failed to upvote");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      data-testid={`project-card-${project.slug}`}
    >
      <Link
        to={`/p/${project.slug}`}
        className="group relative block border border-border bg-card hover:border-foreground/30 hover:shadow-lg transition-all duration-300 p-5"
      >
        <div className="flex gap-5">
          {rank !== undefined && (
            <div className="flex-shrink-0 w-10 text-center">
              <div className="font-heading font-black text-2xl text-muted-foreground/40 leading-none">
                {String(rank).padStart(2, "0")}
              </div>
            </div>
          )}

          <div className="flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border border-border bg-muted overflow-hidden">
              {project.cover_image_url ? (
                <img
                  src={fileUrl(project.cover_image_url)}
                  alt={project.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
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
                <h3 className="font-heading font-bold text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors leading-tight flex items-center gap-1.5">
                  <span className="truncate">{project.name}</span>
                  <ArrowUpRight
                    size={16}
                    weight="bold"
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  />
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.tagline}</p>

                <div className="flex flex-wrap items-center gap-2 mt-3">
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
    </motion.div>
  );
}
