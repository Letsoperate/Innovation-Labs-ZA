import { useEffect, useState, useCallback, useRef } from "react";
import api from "../lib/api";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import ProjectCard from "./ProjectCard";
import { Stagger, StaggerItem } from "./Motion";
import { Trophy } from "@phosphor-icons/react";
import { Skeleton } from "./ui/skeleton";

export default function Leaderboard({ defaultPeriod = "all", limit = 10, compact = false }) {
  const [period, setPeriod] = useState(defaultPeriod);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => { return () => { mounted.current = false; }; }, []);

  const load = useCallback(async (p, silent = false) => {
    if (!mounted.current) return;
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get(`/projects/leaderboard`, { params: { period: p, limit } });
      if (mounted.current) setProjects(data);
    } finally {
      if (!silent && mounted.current) setLoading(false);
    }
  }, [limit]);

  useEffect(() => { load(period); }, [period, load]);

  useEffect(() => {
    const iv = setInterval(() => load(period, true), 1000);
    return () => { clearInterval(iv); mounted.current = false; };
  }, [period, load]);

  return (
    <section className="relative" data-testid="leaderboard-section">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-primary mb-3">
            <Trophy size={14} weight="fill" /> The Leaderboard
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tighter">
            Top shipped projects.
          </h2>
          <p className="text-muted-foreground text-base mt-2 max-w-xl">
            Ranked by community engagement — upvotes, comments, and reach. Built by the indie hackers shipping right now.
          </p>
        </div>

        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="bg-secondary rounded-sm p-1 h-10" data-testid="leaderboard-period-tabs">
            <TabsTrigger value="all" data-testid="period-all" className="rounded-sm data-[state=active]:bg-foreground data-[state=active]:text-background px-4">
              All time
            </TabsTrigger>
            <TabsTrigger value="monthly" data-testid="period-monthly" className="rounded-sm data-[state=active]:bg-foreground data-[state=active]:text-background px-4">
              This month
            </TabsTrigger>
            <TabsTrigger value="weekly" data-testid="period-weekly" className="rounded-sm data-[state=active]:bg-foreground data-[state=active]:text-background px-4">
              This week
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-none" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center text-muted-foreground">
          No projects yet for this period. Be the first to ship.
        </div>
      ) : (
        <Stagger className="space-y-3" stagger={0.05}>
          {projects.map((p, i) => (
            <StaggerItem key={p.id}>
              <ProjectCard project={p} rank={i + 1} onUpdate={() => load(period)} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}
