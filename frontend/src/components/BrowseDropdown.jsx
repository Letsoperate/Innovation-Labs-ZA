import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { CaretDown, Compass, SquaresFour, Lightbulb, Users, Monitor, ArrowsLeftRight, Trophy, Toolbox, Heart, Note, Envelope, CurrencyDollar, Handshake, LinkSimple, Question, Scales } from "@phosphor-icons/react";

const SECTIONS = [
  {
    heading: "Discover",
    items: [
      { icon: Compass, label: "All Projects", to: "/discover" },
      { icon: SquaresFour, label: "Categories", to: "/categories" },
      { icon: Lightbulb, label: "Browse by Topic", to: "/discover?sort=trending" },
      { icon: Users, label: "Builders", to: "/builders" },
    ],
  },
  {
    heading: "Tools",
    items: [
      { icon: Toolbox, label: "Tools", to: "/tools" },
      { icon: Monitor, label: "Platforms", to: "/discover?category=developer-tools" },
      { icon: Trophy, label: "Hall of Fame", to: "/hall-of-fame" },
      { icon: ArrowsLeftRight, label: "Alternatives", to: "/alternatives" },
    ],
  },
  {
    heading: "Community",
    items: [
      { icon: Heart, label: "Builders", to: "/builders" },
      { icon: Note, label: "Blog", to: "/blog" },
      { icon: Envelope, label: "Newsletter", to: "/newsletter" },
      { icon: Users, label: "Community", to: "/community" },
    ],
  },
  {
    heading: "More",
    items: [
      { icon: CurrencyDollar, label: "Pricing", to: "/pricing" },
      { icon: Handshake, label: "Partnerships", to: "/partnerships" },
      { icon: LinkSimple, label: "Affiliates", to: "/affiliates" },
      { icon: Question, label: "FAQ", to: "/faq" },
    ],
  },
];

export default function BrowseDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-full ${
          open ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Browse <CaretDown size={12} weight="bold" className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[720px] bg-card border border-border rounded-2xl shadow-2xl p-6 z-50">
          <div className="grid grid-cols-4 gap-6">
            {SECTIONS.map((section) => (
              <div key={section.heading}>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-3 px-1">
                  {section.heading}
                </h4>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                    >
                      <item.icon size={16} weight="bold" className="flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between px-1">
            <Link to="/rules" onClick={() => setOpen(false)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Scales size={13} /> Community Guidelines
            </Link>
            <Link to="/faq" onClick={() => setOpen(false)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Question size={13} /> FAQ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
