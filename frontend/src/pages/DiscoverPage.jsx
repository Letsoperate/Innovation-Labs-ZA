import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import ProjectCard from "../components/ProjectCard";
import { FadeIn, Stagger, StaggerItem } from "../components/Motion";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Skeleton } from "../components/ui/skeleton";

export default function DiscoverPage() {
  const [params, setParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const category = params.get("category") || "all";
  const sort = params.get("sort") || "trending";
  const [query, setQuery] = useState(params.get("q") || "");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/projects", { params: { category, sort, q: query || undefined, limit: 60 } });
      setProjects(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { api.get("/categories").then((r) => setCategories(r.data)); }, []);
  useEffect(() => { load(); }, [category, sort]);

  const onSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(params);
    if (query) p.set("q", query); else p.delete("q");
    setParams(p);
    load();
  };

  const setSort = (val) => {
    const p = new URLSearchParams(params);
    p.set("sort", val);
    setParams(p);
  };

  const setCategory = (slug) => {
    const p = new URLSearchParams(params);
    if (slug === "all") p.delete("category"); else p.set("category", slug);
    setParams(p);
  };

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-10">
            <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary mb-3">Discover</div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter">
              Find your next favorite tool.
            </h1>
            <p className="text-muted-foreground text-base mt-3 max-w-2xl">
              Browse projects from makers around the world. Filter by category, search by name, or sort
              by what's trending right now.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <form onSubmit={onSearch} className="relative flex-1">
              <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, tags, makers..."
                data-testid="discover-search-input"
                className="pl-10 h-12 rounded-sm bg-background border-border"
              />
            </form>
            <Tabs value={sort} onValueChange={setSort}>
              <TabsList className="bg-secondary rounded-sm p-1 h-12" data-testid="sort-tabs">
                <TabsTrigger value="trending" data-testid="sort-trending" className="rounded-sm data-[state=active]:bg-foreground data-[state=active]:text-background px-5">
                  Trending
                </TabsTrigger>
                <TabsTrigger value="recent" data-testid="sort-recent" className="rounded-sm data-[state=active]:bg-foreground data-[state=active]:text-background px-5">
                  Recent
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setCategory("all")}
              data-testid="filter-all"
              className={`px-4 py-1.5 text-sm font-medium border transition-colors rounded-sm ${
                category === "all" ? "bg-foreground text-background border-foreground" : "bg-background border-border hover:border-foreground/40"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setCategory(c.slug)}
                data-testid={`filter-${c.slug}`}
                className={`px-4 py-1.5 text-sm font-medium border transition-colors rounded-sm ${
                  category === c.slug ? "bg-foreground text-background border-foreground" : "bg-background border-border hover:border-foreground/40"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </FadeIn>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-none" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <FadeIn>
            <div className="border border-dashed border-border p-16 text-center text-muted-foreground">
              <p className="font-heading font-semibold text-lg">No projects found</p>
              <p className="text-sm mt-2">Try a different filter or search term.</p>
            </div>
          </FadeIn>
        ) : (
          <Stagger className="grid sm:grid-cols-2 gap-4" stagger={0.04}>
            {projects.map((p) => (
              <StaggerItem key={p.id}>
                <ProjectCard project={p} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
