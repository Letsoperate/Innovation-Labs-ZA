const TOOLS = [
  { name: "React", slug: "react", url: "https://react.dev", color: "#61DAFB" },
  { name: "Vue.js", slug: "vuedotjs", url: "https://vuejs.org", color: "#4FC08D" },
  { name: "Angular", slug: "angular", url: "https://angular.io", color: "#DD0031" },
  { name: "Svelte", slug: "svelte", url: "https://svelte.dev", color: "#FF3E00" },
  { name: "Next.js", slug: "nextdotjs", url: "https://nextjs.org", color: "#000" },
  { name: "Nuxt", slug: "nuxtdotjs", url: "https://nuxt.com", color: "#00DC82" },
  { name: "Astro", slug: "astro", url: "https://astro.build", color: "#FF5A03" },
  { name: "Tailwind CSS", slug: "tailwindcss", url: "https://tailwindcss.com", color: "#06B6D4" },
  { name: "Bootstrap", slug: "bootstrap", url: "https://getbootstrap.com", color: "#7952B3" },
  { name: "Node.js", slug: "nodedotjs", url: "https://nodejs.org", color: "#339933" },
  { name: "Deno", slug: "deno", url: "https://deno.com", color: "#000" },
  { name: "Bun", slug: "bun", url: "https://bun.sh", color: "#000" },
  { name: "Python", slug: "python", url: "https://python.org", color: "#3776AB" },
  { name: "Go", slug: "go", url: "https://go.dev", color: "#00ADD8" },
  { name: "Rust", slug: "rust", url: "https://rust-lang.org", color: "#000" },
  { name: "TypeScript", slug: "typescript", url: "https://typescriptlang.org", color: "#3178C6" },
  { name: "GraphQL", slug: "graphql", url: "https://graphql.org", color: "#E10098" },
  { name: "Prisma", slug: "prisma", url: "https://prisma.io", color: "#2D3748" },
  { name: "Docker", slug: "docker", url: "https://docker.com", color: "#2496ED" },
  { name: "Kubernetes", slug: "kubernetes", url: "https://kubernetes.io", color: "#326CE5" },
  { name: "Vercel", slug: "vercel", url: "https://vercel.com", color: "#000" },
  { name: "Netlify", slug: "netlify", url: "https://netlify.com", color: "#00C7B7" },
  { name: "AWS", slug: "amazonwebservices", url: "https://aws.amazon.com", color: "#232F3E" },
  { name: "MongoDB", slug: "mongodb", url: "https://mongodb.com", color: "#47A248" },
  { name: "PostgreSQL", slug: "postgresql", url: "https://postgresql.org", color: "#4169E1" },
  { name: "Redis", slug: "redis", url: "https://redis.io", color: "#DC382D" },
  { name: "SQLite", slug: "sqlite", url: "https://sqlite.org", color: "#003B57" },
  { name: "MySQL", slug: "mysql", url: "https://mysql.com", color: "#4479A1" },
  { name: "Supabase", slug: "supabase", url: "https://supabase.com", color: "#3FCF8E" },
  { name: "Firebase", slug: "firebase", url: "https://firebase.google.com", color: "#FFCA28" },
  { name: "Figma", slug: "figma", url: "https://figma.com", color: "#F24E1E" },
  { name: "VS Code", slug: "visualstudiocode", url: "https://code.visualstudio.com", color: "#007ACC" },
  { name: "GitHub", slug: "github", url: "https://github.com", color: "#181717" },
  { name: "GitLab", slug: "gitlab", url: "https://gitlab.com", color: "#FC6D26" },
  { name: "Postman", slug: "postman", url: "https://postman.com", color: "#FF6C37" },
  { name: "Stripe", slug: "stripe", url: "https://stripe.com", color: "#008CDD" },
  { name: "Vite", slug: "vite", url: "https://vitejs.dev", color: "#646CFF" },
  { name: "ESLint", slug: "eslint", url: "https://eslint.org", color: "#4B32C3" },
  { name: "Prettier", slug: "prettier", url: "https://prettier.io", color: "#F7B93E" },
  { name: "Jest", slug: "jest", url: "https://jestjs.io", color: "#C21325" },
  { name: "Playwright", slug: "playwright", url: "https://playwright.dev", color: "#2EAD33" },
  { name: "Cypress", slug: "cypress", url: "https://cypress.io", color: "#17202C" },
  { name: "FastAPI", slug: "fastapi", url: "https://fastapi.tiangolo.com", color: "#009688" },
  { name: "Express", slug: "express", url: "https://expressjs.com", color: "#000" },
  { name: "Django", slug: "django", url: "https://djangoproject.com", color: "#092E20" },
  { name: "Rails", slug: "rubyonrails", url: "https://rubyonrails.org", color: "#CC0000" },
  { name: "Laravel", slug: "laravel", url: "https://laravel.com", color: "#FF2D20" },
  { name: "Flutter", slug: "flutter", url: "https://flutter.dev", color: "#02569B" },
  { name: "Electron", slug: "electron", url: "https://electronjs.org", color: "#47848F" },
  { name: "Tauri", slug: "tauri", url: "https://tauri.app", color: "#FFC131" },
  { name: "Three.js", slug: "threedotjs", url: "https://threejs.org", color: "#000" },
  { name: "D3.js", slug: "d3dotjs", url: "https://d3js.org", color: "#F9A03C" },
  { name: "Redux", slug: "redux", url: "https://redux.js.org", color: "#764ABC" },
  { name: "Zod", slug: "zod", url: "https://zod.dev", color: "#3E67B1" },
  { name: "tRPC", slug: "trpc", url: "https://trpc.io", color: "#2596BE" },
  { name: "Hono", slug: "hono", url: "https://hono.dev", color: "#E36002" },
  { name: "Nginx", slug: "nginx", url: "https://nginx.org", color: "#009639" },
  { name: "Cloudflare", slug: "cloudflare", url: "https://cloudflare.com", color: "#F38020" },
  { name: "Linux", slug: "linux", url: "https://kernel.org", color: "#FCC624" },
  { name: "Git", slug: "git", url: "https://git-scm.com", color: "#F05032" },
  { name: "npm", slug: "npm", url: "https://npmjs.com", color: "#CB3837" },
  { name: "Yarn", slug: "yarn", url: "https://yarnpkg.com", color: "#2C8EBB" },
  { name: "pnpm", slug: "pnpm", url: "https://pnpm.io", color: "#F69220" },
  { name: "Webpack", slug: "webpack", url: "https://webpack.js.org", color: "#8DD6F9" },
];

export default function ToolsMarquee() {
  return (
    <div className="relative overflow-hidden border-t border-border py-3 bg-background">
      <div className="marquee-track flex gap-3 items-center">
        {[...TOOLS, ...TOOLS].map((tool, i) => (
          <a
            key={i}
            href={tool.url}
            target="_blank"
            rel="noreferrer"
            title={tool.name}
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 border border-border/40 hover:border-foreground/30 hover:bg-secondary/30 transition-colors"
          >
            <img
              src={`https://cdn.simpleicons.org/${tool.slug}/000000/ffffff`}
              alt={tool.name}
              className="w-5 h-5"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </a>
        ))}
      </div>
      <style>{`
        .marquee-track {
          animation: marquee 120s linear infinite;
          width: max-content;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
