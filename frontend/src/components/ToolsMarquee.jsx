const TOOLS = [
  { name: "React", color: "#61DAFB" }, { name: "Vue", color: "#4FC08D" },
  { name: "Angular", color: "#DD0031" }, { name: "Svelte", color: "#FF3E00" },
  { name: "Next.js", color: "#000" }, { name: "Nuxt", color: "#00DC82" },
  { name: "Astro", color: "#FF5A03" }, { name: "Remix", color: "#121212" },
  { name: "Tailwind CSS", color: "#06B6D4" }, { name: "Bootstrap", color: "#7952B3" },
  { name: "shadcn/ui", color: "#000" }, { name: "Material UI", color: "#007FFF" },
  { name: "Node.js", color: "#339933" }, { name: "Deno", color: "#000" },
  { name: "Bun", color: "#FBF0DF" }, { name: "Python", color: "#3776AB" },
  { name: "Go", color: "#00ADD8" }, { name: "Rust", color: "#000" },
  { name: "TypeScript", color: "#3178C6" }, { name: "JavaScript", color: "#F7DF1E" },
  { name: "GraphQL", color: "#E10098" }, { name: "tRPC", color: "#2596BE" },
  { name: "Prisma", color: "#2D3748" }, { name: "Drizzle", color: "#C5F74F" },
  { name: "Docker", color: "#2496ED" }, { name: "Kubernetes", color: "#326CE5" },
  { name: "Vercel", color: "#000" }, { name: "Netlify", color: "#00C7B7" },
  { name: "AWS", color: "#FF9900" }, { name: "GCP", color: "#4285F4" },
  { name: "MongoDB", color: "#47A248" }, { name: "PostgreSQL", color: "#4169E1" },
  { name: "Redis", color: "#DC382D" }, { name: "SQLite", color: "#003B57" },
  { name: "MySQL", color: "#4479A1" }, { name: "Supabase", color: "#3ECF8E" },
  { name: "Firebase", color: "#FFCA28" }, { name: "PlanetScale", color: "#000" },
  { name: "Figma", color: "#F24E1E" }, { name: "VS Code", color: "#007ACC" },
  { name: "GitHub", color: "#181717" }, { name: "GitLab", color: "#FC6D26" },
  { name: "Postman", color: "#FF6C37" }, { name: "Stripe", color: "#008CDD" },
  { name: "Clerk", color: "#6C47FF" }, { name: "Auth0", color: "#EB5424" },
  { name: "Vite", color: "#646CFF" }, { name: "Webpack", color: "#8DD6F9" },
  { name: "ESLint", color: "#4B32C3" }, { name: "Prettier", color: "#F7B93E" },
  { name: "Jest", color: "#C21325" }, { name: "Vitest", color: "#6E9F18" },
  { name: "Playwright", color: "#2EAD33" }, { name: "Cypress", color: "#17202C" },
  { name: "FastAPI", color: "#009688" }, { name: "Express", color: "#000" },
  { name: "Flask", color: "#000" }, { name: "Django", color: "#092E20" },
  { name: "Rails", color: "#CC0000" }, { name: "Laravel", color: "#FF2D20" },
  { name: "Flutter", color: "#02569B" }, { name: "React Native", color: "#61DAFB" },
  { name: "Expo", color: "#000020" }, { name: "Electron", color: "#47848F" },
  { name: "Tauri", color: "#FFC131" }, { name: "Framer Motion", color: "#0055FF" },
  { name: "Three.js", color: "#000" }, { name: "D3.js", color: "#F9A03C" },
  { name: "Zustand", color: "#443E38" }, { name: "Redux", color: "#764ABC" },
  { name: "TanStack", color: "#FF4154" }, { name: "Zod", color: "#3E67B1" },
  { name: "tRPC", color: "#2596BE" }, { name: "Hono", color: "#E36002" },
];

export default function ToolsMarquee() {
  return (
    <div className="relative overflow-hidden border-t border-border py-4 bg-background">
      <div className="marquee-track flex gap-2">
        {[...TOOLS, ...TOOLS].map((tool, i) => (
          <span
            key={i}
            className="flex-shrink-0 px-3 py-1.5 border border-border text-xs font-semibold whitespace-nowrap transition-colors hover:border-foreground/40"
            style={{ backgroundColor: tool.color + "12", borderColor: tool.color + "30", color: tool.color }}
          >
            {tool.name}
          </span>
        ))}
      </div>
      <style>{`
        .marquee-track {
          animation: marquee 90s linear infinite;
          width: max-content;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
