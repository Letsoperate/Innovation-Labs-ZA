import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { FadeIn, Stagger, StaggerItem } from "../components/Motion";
import { Trophy, Calendar, Clock, Users, Lightning } from "@phosphor-icons/react";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";

export default function HallOfFamePage() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/projects/leaderboard", { params: { period: "all", limit: 10 } }).then((r) => { setWinners(r.data); setLoading(false); });
  }, []);

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-10">
            <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary mb-3">Hall of Fame</div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter">Makers who made history.</h1>
            <p className="text-muted-foreground text-base mt-3 max-w-2xl">Top-ranked projects and the makers behind them — immortalized on the leaderboard.</p>
          </div>
        </FadeIn>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
        ) : winners.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground">
            <p className="font-semibold">No winners yet</p>
            <p className="text-sm mt-1">Submit a project to claim the #1 spot.</p>
          </div>
        ) : (
          <Stagger className="space-y-3">
            {winners.map((p, i) => (
              <StaggerItem key={p.id || p._id}>
                <Link to={`/p/${p.slug}`} className="block border border-border rounded-2xl p-5 hover:border-foreground/30 transition-all group bg-card">
                  <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-heading font-black text-lg ${i === 0 ? "bg-yellow-100 text-yellow-600" : i === 1 ? "bg-slate-100 text-slate-500" : i === 2 ? "bg-amber-100 text-amber-700" : "bg-secondary/50 text-muted-foreground"}`}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-heading font-bold text-base group-hover:text-primary transition-colors truncate">{p.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{p.tagline}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Trophy size={12} weight="fill" className="text-yellow-500" /> Score: {p.score}</span>
                        {p.createdAt && <span className="flex items-center gap-1"><Clock size={12} /> {new Date(p.createdAt).toLocaleDateString()}</span>}
                        {p.maker?.username && <span>by @{p.maker.username}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
