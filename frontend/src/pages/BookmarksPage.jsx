import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { FadeIn, Stagger, StaggerItem } from "../components/Motion";
import { BookmarkSimple, ArrowRight } from "@phosphor-icons/react";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import ProjectCard from "../components/ProjectCard";

export default function BookmarksPage() {
  const { user, checked } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checked && !user) { navigate("/login"); return; }
    if (!checked || !user) return;
    api.get("/bookmarks").then((r) => { setProjects(r.data); setLoading(false); });
  }, [user, checked, navigate]);

  if (!checked) return <div className="min-h-screen" />;
  if (!user) return null;

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex items-center gap-3 mb-10">
            <BookmarkSimple size={28} weight="fill" className="text-amber-500" />
            <div>
              <h1 className="font-heading font-black text-3xl sm:text-4xl tracking-tighter">Your Bookmarks</h1>
              <p className="text-muted-foreground text-sm mt-1">Projects you've saved for later.</p>
            </div>
          </div>
        </FadeIn>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
        ) : projects.length === 0 ? (
          <FadeIn>
            <div className="border border-dashed border-border rounded-2xl p-16 text-center">
              <BookmarkSimple size={40} className="mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-semibold text-muted-foreground">No bookmarks yet</p>
              <p className="text-sm text-muted-foreground/60 mt-1 mb-4">Bookmark projects to find them here later.</p>
              <Link to="/discover"><Button className="rounded-full">Discover projects</Button></Link>
            </div>
          </FadeIn>
        ) : (
          <Stagger className="space-y-3">
            {projects.map((p) => (
              <StaggerItem key={p.id}>
                <ProjectCard project={p} onUpdate={() => api.get("/bookmarks").then((r) => setProjects(r.data))} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
