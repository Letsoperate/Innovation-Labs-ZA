import { useEffect, useState } from "react";
import api from "../lib/api";
import Hero from "../components/Hero";
import Leaderboard from "../components/Leaderboard";
import ToolsMarquee from "../components/ToolsMarquee";
import ProjectCard from "../components/ProjectCard";
import { FadeIn, Stagger, StaggerItem } from "../components/Motion";
import { ArrowRight, Compass, Code, PaintBrush, Lightning, CurrencyDollar, Users, Cloud, DeviceMobile, GitBranch, Robot, Megaphone, Cube } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

const ICONS = {
  ai: Robot, "developer-tools": Code, productivity: Lightning, design: PaintBrush,
  marketing: Megaphone, fintech: CurrencyDollar, social: Users, saas: Cloud,
  mobile: DeviceMobile, "open-source": GitBranch,
};

export default function HomePage() {
  const [stats, setStats] = useState({ projects: 0, makers: 0, upvotes: 0, comments: 0 });
  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/stats").then((r) => setStats(r.data));
    api.get("/projects", { params: { sort: "recent", limit: 8 } }).then((r) => setRecent(r.data));
    api.get("/categories").then((r) => setCategories(r.data));
  }, []);

  return (
    <>
      <Hero stats={stats} />

      {/* Stats bar */}
      <div className="border-t border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <FadeIn>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1">
              {[
                { label: "Projects", value: stats.projects },
                { label: "Makers", value: stats.makers },
                { label: "Upvotes", value: stats.upvotes },
                { label: "Comments", value: stats.comments },
              ].map((s, i) => (
                <span key={s.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-heading font-bold text-sm text-foreground">{s.value.toLocaleString()}</span>
                  {s.label}
                  {i < 3 && <span className="text-border ml-6 hidden sm:inline">|</span>}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Developer tools marquee */}
      <ToolsMarquee />

      {/* Leaderboard */}
      <section className="relative py-20 lg:py-28 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Leaderboard defaultPeriod="all" limit={10} />
          </FadeIn>
        </div>
      </section>

      {/* Categories */}
      <section className="relative py-20 lg:py-28 bg-secondary/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary mb-3">
                  Explore
                </div>
                <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tighter">
                  Categories.
                </h2>
              </div>
              <Link to="/categories" className="text-sm font-medium hover:text-primary flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>

          <Stagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((cat) => {
              const Icon = ICONS[cat.slug] || Compass;
              return (
                <StaggerItem key={cat.slug}>
                  <Link
                    to={`/discover?category=${cat.slug}`}
                    data-testid={`category-${cat.slug}`}
                    className="group flex flex-col items-start gap-3 p-5 border border-border bg-card hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-200 h-full"
                  >
                    <div className="w-9 h-9 border border-current flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-colors">
                      <Icon size={18} weight="bold" />
                    </div>
                    <div className="font-heading font-semibold">{cat.name}</div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* Recent feed */}
      <section className="relative py-20 lg:py-28 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary mb-3">
                  Fresh drops
                </div>
                <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tighter">
                  Recently launched.
                </h2>
              </div>
              <Link to="/discover">
                <Button variant="outline" className="rounded-sm border-foreground/20 hover:bg-foreground hover:text-background">
                  Browse all
                </Button>
              </Link>
            </div>
          </FadeIn>

          <Stagger className="grid sm:grid-cols-2 gap-4">
            {recent.slice(0, 8).map((p) => (
              <StaggerItem key={p.id}>
                <ProjectCard project={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 lg:py-32 bg-foreground text-background overflow-hidden noise">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/20 text-xs uppercase tracking-[0.2em] font-semibold mb-8">
              <Lightning size={12} weight="fill" className="text-primary" />
              Free forever for makers
            </div>
            <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-7xl tracking-tighter leading-[0.95]">
              Your project deserves <br />
              <span className="text-primary">more than 24 hours</span> of attention.
            </h2>
            <p className="text-base sm:text-lg text-white/60 mt-8 max-w-2xl mx-auto">
              Innovation Lab ZA is built for sustained discovery. Get on the leaderboard, get found by the right
              community, and let your work compound over months — not minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              <Link to="/register">
                <Button
                  size="lg"
                  data-testid="cta-register"
                  className="bg-primary hover:bg-primary/90 text-white rounded-sm h-12 px-6"
                >
                  Create your maker profile
                </Button>
              </Link>
              <Link to="/discover">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-sm h-12 px-6 bg-transparent border-white/30 text-white hover:bg-white hover:text-foreground"
                >
                  Explore the feed
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
