import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { FadeIn, Stagger, StaggerItem } from "../components/Motion";
import { Trophy, Users, ArrowRight } from "@phosphor-icons/react";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";

export default function BuildersPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/projects", { params: { sort: "trending", limit: 50 } }).then((r) => { setProjects(r.data); setLoading(false); });
  }, []);

  const uniqueMakers = projects.reduce((acc, p) => {
    if (p.maker && !acc.find((m) => m.id === p.maker.id)) acc.push(p.maker);
    return acc;
  }, []);

  const winnerProjects = projects.filter((p) => p.badges?.some((b) => b.type === "crown"));

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-10">
            <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary mb-3">Builders</div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter">Meet the makers.</h1>
            <p className="text-muted-foreground mt-3 max-w-xl">The indie hackers and students building on Innovation Lab ZA.</p>
          </div>
        </FadeIn>

        {winnerProjects.length > 0 && (
          <FadeIn delay={0.05}>
            <div className="mb-10">
              <div className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <Trophy size={12} weight="fill" className="text-yellow-500" /> Competition Winners
              </div>
              <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {winnerProjects.map((p) => (
                  <StaggerItem key={p.id || p._id}>
                    <Link to={`/p/${p.slug}`} className="block border border-border rounded-2xl p-4 hover:border-foreground/30 transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-xl">{p.badges?.find((b) => b.type === "crown")?.label === "RANK #1" ? "🥇" : p.badges?.find((b) => b.type === "crown")?.label === "RANK #2" ? "🥈" : "🥉"}</div>
                        <div>
                          <p className="font-heading font-bold text-sm">{p.name}</p>
                          {p.maker?.username && <p className="text-xs text-muted-foreground">by @{p.maker.username}</p>}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{p.tagline}</p>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.1}>
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            <Users size={12} /> Active Makers
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          ) : uniqueMakers.length === 0 ? (
            <div className="border border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground">
              <p className="font-semibold">No makers yet</p>
              <p className="text-sm mt-1">Be the first to submit a project.</p>
              <Link to="/submit" className="inline-flex items-center gap-1 text-primary text-sm mt-4 font-medium hover:underline">Submit your project <ArrowRight size={14} /></Link>
            </div>
          ) : (
            <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {uniqueMakers.map((maker) => (
                <StaggerItem key={maker.id || maker._id}>
                  <Link to={`/u/${maker.username}`} className="block border border-border rounded-2xl p-4 hover:border-foreground/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-heading font-bold text-sm text-primary">
                        {(maker.name || maker.username || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading font-semibold text-sm truncate">{maker.name || maker.username}</p>
                        <p className="text-xs text-muted-foreground">@{maker.username}</p>
                      </div>
                    </div>
                    {maker.bio && <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{maker.bio}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className="text-[10px] px-2 py-0 rounded-full border-border text-muted-foreground">{maker.role}</Badge>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}
          <div className="mt-6 text-center">
            <Link to="/register" className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline">Create your maker profile <ArrowRight size={14} /></Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
