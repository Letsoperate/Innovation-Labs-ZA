const HACKER_TOOLS = [
  { name: "React", slug: "react", url: "https://react.dev" },
  { name: "Vue.js", slug: "vuedotjs", url: "https://vuejs.org" },
  { name: "Angular", slug: "angular", url: "https://angular.io" },
  { name: "Svelte", slug: "svelte", url: "https://svelte.dev" },
  { name: "Next.js", slug: "nextdotjs", url: "https://nextjs.org" },
  { name: "Nuxt", slug: "nuxtdotjs", url: "https://nuxt.com" },
  { name: "Astro", slug: "astro", url: "https://astro.build" },
  { name: "Tailwind CSS", slug: "tailwindcss", url: "https://tailwindcss.com" },
  { name: "Bootstrap", slug: "bootstrap", url: "https://getbootstrap.com" },
  { name: "Node.js", slug: "nodedotjs", url: "https://nodejs.org" },
  { name: "Deno", slug: "deno", url: "https://deno.com" },
  { name: "Bun", slug: "bun", url: "https://bun.sh" },
  { name: "Python", slug: "python", url: "https://python.org" },
  { name: "Go", slug: "go", url: "https://go.dev" },
  { name: "Rust", slug: "rust", url: "https://rust-lang.org" },
  { name: "TypeScript", slug: "typescript", url: "https://typescriptlang.org" },
  { name: "GraphQL", slug: "graphql", url: "https://graphql.org" },
  { name: "Prisma", slug: "prisma", url: "https://prisma.io" },
  { name: "Docker", slug: "docker", url: "https://docker.com" },
  { name: "Kubernetes", slug: "kubernetes", url: "https://kubernetes.io" },
  { name: "MongoDB", slug: "mongodb", url: "https://mongodb.com" },
  { name: "PostgreSQL", slug: "postgresql", url: "https://postgresql.org" },
  { name: "Redis", slug: "redis", url: "https://redis.io" },
  { name: "SQLite", slug: "sqlite", url: "https://sqlite.org" },
  { name: "MySQL", slug: "mysql", url: "https://mysql.com" },
  { name: "Supabase", slug: "supabase", url: "https://supabase.com" },
  { name: "Firebase", slug: "firebase", url: "https://firebase.google.com" },
  { name: "Vite", slug: "vite", url: "https://vitejs.dev" },
  { name: "Webpack", slug: "webpack", url: "https://webpack.js.org" },
  { name: "ESLint", slug: "eslint", url: "https://eslint.org" },
  { name: "Prettier", slug: "prettier", url: "https://prettier.io" },
  { name: "Jest", slug: "jest", url: "https://jestjs.io" },
  { name: "Playwright", slug: "playwright", url: "https://playwright.dev" },
  { name: "Cypress", slug: "cypress", url: "https://cypress.io" },
  { name: "FastAPI", slug: "fastapi", url: "https://fastapi.tiangolo.com" },
  { name: "Express", slug: "express", url: "https://expressjs.com" },
  { name: "Django", slug: "django", url: "https://djangoproject.com" },
  { name: "Rails", slug: "rubyonrails", url: "https://rubyonrails.org" },
  { name: "Laravel", slug: "laravel", url: "https://laravel.com" },
  { name: "Flutter", slug: "flutter", url: "https://flutter.dev" },
  { name: "Three.js", slug: "threedotjs", url: "https://threejs.org" },
  { name: "D3.js", slug: "d3dotjs", url: "https://d3js.org" },
  { name: "Redux", slug: "redux", url: "https://redux.js.org" },
  { name: "Zod", slug: "zod", url: "https://zod.dev" },
  { name: "tRPC", slug: "trpc", url: "https://trpc.io" },
  { name: "Hono", slug: "hono", url: "https://hono.dev" },
  { name: "Git", slug: "git", url: "https://git-scm.com" },
  { name: "npm", slug: "npm", url: "https://npmjs.com" },
  { name: "Yarn", slug: "yarn", url: "https://yarnpkg.com" },
  { name: "pnpm", slug: "pnpm", url: "https://pnpm.io" },
  { name: "Linux", slug: "linux", url: "https://kernel.org" },
  { name: "Nginx", slug: "nginx", url: "https://nginx.org" },
  { name: "Electron", slug: "electron", url: "https://electronjs.org" },
  { name: "Tauri", slug: "tauri", url: "https://tauri.app" },
];

const STUDENT_BENEFITS = [
  { name: "GitHub Copilot", slug: "githubcopilot", url: "https://github.com/features/copilot" },
  { name: "GitHub Student Pack", slug: "github", url: "https://education.github.com/pack" },
  { name: "AWS Educate", slug: "amazonwebservices", url: "https://aws.amazon.com/education/awseducate" },
  { name: "Google Cloud", slug: "googlecloud", url: "https://cloud.google.com/edu" },
  { name: "DigitalOcean", slug: "digitalocean", url: "https://www.digitalocean.com/github-students" },
  { name: "MongoDB Atlas", slug: "mongodb", url: "https://www.mongodb.com/students" },
  { name: "Vercel", slug: "vercel", url: "https://vercel.com" },
  { name: "Netlify", slug: "netlify", url: "https://netlify.com" },
  { name: "Cloudflare", slug: "cloudflare", url: "https://cloudflare.com" },
  { name: "Heroku", slug: "heroku", url: "https://heroku.com" },
  { name: "JetBrains", slug: "jetbrains", url: "https://www.jetbrains.com/community/education" },
  { name: "Figma", slug: "figma", url: "https://figma.com" },
  { name: "Canva", slug: "canva", url: "https://canva.com/education" },
  { name: "Notion", slug: "notion", url: "https://notion.so" },
  { name: "Postman", slug: "postman", url: "https://www.postman.com/student-program" },
  { name: "Spotify", slug: "spotify", url: "https://spotify.com/student" },
  { name: "YouTube", slug: "youtube", url: "https://youtube.com/premium/student" },
  { name: "Apple", slug: "apple", url: "https://apple.com/us-edu/store" },
  { name: "Amazon", slug: "amazon", url: "https://amazon.com/prime/student" },
  { name: "VS Code", slug: "visualstudiocode", url: "https://code.visualstudio.com" },
  { name: "Replit", slug: "replit", url: "https://replit.com" },
  { name: "Autodesk", slug: "autodesk", url: "https://autodesk.com/education" },
  { name: "Unity", slug: "unity", url: "https://unity.com/products/unity-student" },
  { name: "Blender", slug: "blender", url: "https://blender.org" },
  { name: "Grammarly", slug: "grammarly", url: "https://grammarly.com/edu" },
  { name: "LinkedIn", slug: "linkedin", url: "https://www.linkedin.com/learning/students" },
  { name: "Coursera", slug: "coursera", url: "https://coursera.org" },
  { name: "Udemy", slug: "udemy", url: "https://udemy.com" },
  { name: "GitLab", slug: "gitlab", url: "https://gitlab.com" },
  { name: "Slack", slug: "slack", url: "https://slack.com" },
  { name: "Zoom", slug: "zoom", url: "https://zoom.us" },
  { name: "Airtable", slug: "airtable", url: "https://airtable.com" },
  { name: "ClickUp", slug: "clickup", url: "https://clickup.com" },
  { name: "Obsidian", slug: "obsidian", url: "https://obsidian.md" },
  { name: "LeetCode", slug: "leetcode", url: "https://leetcode.com" },
  { name: "HackerRank", slug: "hackerrank", url: "https://hackerrank.com" },
  { name: "Kaggle", slug: "kaggle", url: "https://kaggle.com" },
  { name: "Stripe", slug: "stripe", url: "https://stripe.com" },
  { name: "Namecheap", slug: "namecheap", url: "https://namecheap.com" },
  { name: "Docker", slug: "docker", url: "https://docker.com" },
  { name: "Loom", slug: "loom", url: "https://loom.com" },
  { name: "Linear", slug: "linear", url: "https://linear.app" },
  { name: "Railway", slug: "railway", url: "https://railway.app" },
  { name: "Miro", slug: "miro", url: "https://miro.com" },
  { name: "Todoist", slug: "todoist", url: "https://todoist.com" },
  { name: "Evernote", slug: "evernote", url: "https://evernote.com" },
  { name: "Asana", slug: "asana", url: "https://asana.com" },
  { name: "Perplexity", slug: "perplexity", url: "https://perplexity.ai" },
  { name: "GitKraken", slug: "gitkraken", url: "https://gitkraken.com" },
  { name: "Oracle", slug: "oracle", url: "https://oracle.com/cloud/free" },
  { name: "Red Hat", slug: "redhat", url: "https://developers.redhat.com" },
  { name: "Nvidia", slug: "nvidia", url: "https://developer.nvidia.com" },
  { name: "Hack The Box", slug: "hackthebox", url: "https://hackthebox.com" },
  { name: "TryHackMe", slug: "tryhackme", url: "https://tryhackme.com" },
  { name: "Coda", slug: "coda", url: "https://coda.io" },
  { name: "Raycast", slug: "raycast", url: "https://raycast.com" },
  { name: "Arc", slug: "arc", url: "https://arc.net" },
];

function MarqueeRow({ tools, reverse }) {
  return (
    <div className="relative overflow-hidden py-2">
      <div
        className="marquee-row flex gap-2 items-center"
        style={{ animationDirection: reverse ? "reverse" : "normal" }}
      >
        {[...tools, ...tools, ...tools].map((tool, i) => (
          <a
            key={i}
            href={tool.url}
            target="_blank"
            rel="noreferrer"
            title={tool.name}
            className="flex-shrink-0 flex items-center justify-center w-12 h-12 border border-border/30 hover:border-foreground/40 hover:bg-secondary/40 transition-colors rounded-md"
          >
            <img
              src={`https://unpkg.com/simple-icons@13.21.0/icons/${tool.slug}.svg`}
              alt={tool.name}
              className="w-6 h-6"
              loading="eager"
            />
          </a>
        ))}
      </div>
      <style>{`
        .marquee-row {
          animation: marquee 80s linear infinite;
          width: max-content;
        }
        .marquee-row:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
      `}</style>
    </div>
  );
}

export default function ToolsMarquee() {
  return (
    <div className="border-t border-border bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted-foreground py-2 text-center">
            Hacker Tools
          </p>
        </div>
        <MarqueeRow tools={HACKER_TOOLS} />
      </div>
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-green-600 py-2 text-center">
            Student Benefits
          </p>
        </div>
        <MarqueeRow tools={STUDENT_BENEFITS} reverse />
      </div>
    </div>
  );
}
