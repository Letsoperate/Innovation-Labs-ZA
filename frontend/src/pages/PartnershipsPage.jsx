import { FadeIn, Stagger, StaggerItem } from "../components/Motion";
import { Handshake, Star, Users, ArrowSquareOut } from "@phosphor-icons/react";

const PARTNERS = [
  { name: "Vercel", url: "https://vercel.com", logo: "V", desc: "Cloud platform for frontend deployments", color: "bg-black" },
  { name: "Convex", url: "https://convex.dev", logo: "C", desc: "Reactive backend for full-stack apps", color: "bg-blue-600" },
  { name: "PlanetScale", url: "https://planetscale.com", logo: "P", desc: "Serverless MySQL platform", color: "bg-black" },
  { name: "GitHub", url: "https://github.com/Letsoperate", logo: "G", desc: "Code hosting and collaboration", color: "bg-gray-900" },
  { name: "Unsplash", url: "https://unsplash.com", logo: "U", desc: "Free image source for project covers", color: "bg-gray-800" },
  { name: "Simple Icons", url: "https://simpleicons.org", logo: "S", desc: "Free SVG icons for brands", color: "bg-gray-700" },
  { name: "Phosphor Icons", url: "https://phosphoricons.com", logo: "P", desc: "Flexible icon library", color: "bg-emerald-600" },
  { name: "South Africa Tech", url: "#", logo: "ZA", desc: "Supporting local innovation ecosystems", color: "bg-green-700" },
];

export default function PartnershipsPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-10">
            <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary mb-3">Partners</div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter">Our partners.</h1>
            <p className="text-muted-foreground mt-3 max-w-xl">Organizations and platforms that power the Innovation Lab ZA ecosystem.</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PARTNERS.map((p, i) => (
              <StaggerItem key={i}>
                <a href={p.url} target="_blank" rel="noreferrer" className="block border border-border rounded-2xl p-5 hover:border-foreground/30 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${p.color} flex items-center justify-center text-white font-heading font-bold text-sm`}>
                      {p.logo}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-semibold text-sm group-hover:text-primary transition-colors">{p.name}</h3>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Visit <ArrowSquareOut size={10} />
                  </div>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-12 p-6 sm:p-8 border border-dashed border-border rounded-2xl text-center bg-secondary/20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-card text-xs uppercase tracking-[0.15em] font-semibold rounded-full mb-4">
              <Handshake size={12} /> Sponsor a competition
            </div>
            <p className="font-heading font-bold text-xl mb-2">We're looking for sponsors.</p>
            <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto">
              We organize <strong>hackathons</strong>, <strong>AI vibe coding competitions</strong>, <strong>skills development challenges</strong>, and <strong>student encouragement programs</strong> for the South African maker community. 
              Your sponsorship helps us provide prizes, cloud credits, mentorship, and resources to hundreds of participants.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4 text-xs text-muted-foreground">
              <span className="px-3 py-1 border border-border rounded-full">🏆 Hackathons</span>
              <span className="px-3 py-1 border border-border rounded-full">🤖 AI Coding</span>
              <span className="px-3 py-1 border border-border rounded-full">📚 Skills Development</span>
              <span className="px-3 py-1 border border-border rounded-full">🎓 Student Programs</span>
            </div>
            <a href="mailto:admin@innovationlabza.dev" className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">Become a sponsor</a>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
