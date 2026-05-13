import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { FadeIn, Stagger, StaggerItem } from "../components/Motion";
import { ArrowRight, Code, PaintBrush, Lightning, CurrencyDollar, Users, Cloud, DeviceMobile, GitBranch, Robot, Megaphone, Compass } from "@phosphor-icons/react";

const ICONS = {
  ai: Robot, "developer-tools": Code, productivity: Lightning, design: PaintBrush,
  marketing: Megaphone, fintech: CurrencyDollar, social: Users, saas: Cloud,
  mobile: DeviceMobile, "open-source": GitBranch,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data));
  }, []);

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-12">
            <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary mb-3">Browse by</div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter">
              Categories.
            </h1>
            <p className="text-muted-foreground text-base mt-3 max-w-2xl">
              From AI to dev tools to design — pick a category to dive into.
            </p>
          </div>
        </FadeIn>

        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = ICONS[cat.slug] || Compass;
            return (
              <StaggerItem key={cat.slug}>
                <Link
                  to={`/discover?category=${cat.slug}`}
                  data-testid={`category-card-${cat.slug}`}
                  className="group block p-6 border border-border bg-card hover:bg-foreground hover:text-background hover:border-foreground transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 border border-current flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white">
                      <Icon size={22} weight="bold" />
                    </div>
                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-heading font-bold text-xl mt-6">{cat.name}</h3>
                  <p className="text-sm opacity-60 mt-1">Explore {cat.name.toLowerCase()} projects</p>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </div>
  );
}
