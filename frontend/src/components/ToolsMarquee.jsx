const HACKER_TOOLS = [
  { name: "React", slug: "react", url: "https://react.dev", color: "61DAFB" },
  { name: "Vue.js", slug: "vuedotjs", url: "https://vuejs.org", color: "4FC08D" },
  { name: "Angular", slug: "angular", url: "https://angular.io", color: "DD0031" },
  { name: "Svelte", slug: "svelte", url: "https://svelte.dev", color: "FF3E00" },
  { name: "Next.js", slug: "nextdotjs", url: "https://nextjs.org", color: "000000" },
  { name: "Nuxt", slug: "nuxtdotjs", url: "https://nuxt.com", color: "00DC82" },
  { name: "Astro", slug: "astro", url: "https://astro.build", color: "FF5A03" },
  { name: "Tailwind CSS", slug: "tailwindcss", url: "https://tailwindcss.com", color: "06B6D4" },
  { name: "Bootstrap", slug: "bootstrap", url: "https://getbootstrap.com", color: "7952B3" },
  { name: "Node.js", slug: "nodedotjs", url: "https://nodejs.org", color: "339933" },
  { name: "Deno", slug: "deno", url: "https://deno.com", color: "000000" },
  { name: "Bun", slug: "bun", url: "https://bun.sh", color: "000000" },
  { name: "Python", slug: "python", url: "https://python.org", color: "3776AB" },
  { name: "Go", slug: "go", url: "https://go.dev", color: "00ADD8" },
  { name: "Rust", slug: "rust", url: "https://rust-lang.org", color: "000000" },
  { name: "TypeScript", slug: "typescript", url: "https://typescriptlang.org", color: "3178C6" },
  { name: "GraphQL", slug: "graphql", url: "https://graphql.org", color: "E10098" },
  { name: "Prisma", slug: "prisma", url: "https://prisma.io", color: "2D3748" },
  { name: "Docker", slug: "docker", url: "https://docker.com", color: "2496ED" },
  { name: "Kubernetes", slug: "kubernetes", url: "https://kubernetes.io", color: "326CE5" },
  { name: "MongoDB", slug: "mongodb", url: "https://mongodb.com", color: "47A248" },
  { name: "PostgreSQL", slug: "postgresql", url: "https://postgresql.org", color: "4169E1" },
  { name: "Redis", slug: "redis", url: "https://redis.io", color: "DC382D" },
  { name: "SQLite", slug: "sqlite", url: "https://sqlite.org", color: "003B57" },
  { name: "MySQL", slug: "mysql", url: "https://mysql.com", color: "4479A1" },
  { name: "Supabase", slug: "supabase", url: "https://supabase.com", color: "3FCF8E" },
  { name: "Firebase", slug: "firebase", url: "https://firebase.google.com", color: "FFCA28" },
  { name: "Vite", slug: "vite", url: "https://vitejs.dev", color: "646CFF" },
  { name: "Webpack", slug: "webpack", url: "https://webpack.js.org", color: "8DD6F9" },
  { name: "ESLint", slug: "eslint", url: "https://eslint.org", color: "4B32C3" },
  { name: "Prettier", slug: "prettier", url: "https://prettier.io", color: "F7B93E" },
  { name: "Jest", slug: "jest", url: "https://jestjs.io", color: "C21325" },
  { name: "Cypress", slug: "cypress", url: "https://cypress.io", color: "17202C" },
  { name: "FastAPI", slug: "fastapi", url: "https://fastapi.tiangolo.com", color: "009688" },
  { name: "Express", slug: "express", url: "https://expressjs.com", color: "000000" },
  { name: "Django", slug: "django", url: "https://djangoproject.com", color: "092E20" },
  { name: "Rails", slug: "rubyonrails", url: "https://rubyonrails.org", color: "CC0000" },
  { name: "Laravel", slug: "laravel", url: "https://laravel.com", color: "FF2D20" },
  { name: "Flutter", slug: "flutter", url: "https://flutter.dev", color: "02569B" },
  { name: "Three.js", slug: "threedotjs", url: "https://threejs.org", color: "000000" },
  { name: "D3.js", slug: "d3dotjs", url: "https://d3js.org", color: "F9A03C" },
  { name: "Redux", slug: "redux", url: "https://redux.js.org", color: "764ABC" },
  { name: "Zod", slug: "zod", url: "https://zod.dev", color: "3E67B1" },
  { name: "tRPC", slug: "trpc", url: "https://trpc.io", color: "2596BE" },
  { name: "Hono", slug: "hono", url: "https://hono.dev", color: "E36002" },
  { name: "Git", slug: "git", url: "https://git-scm.com", color: "F05032" },
  { name: "npm", slug: "npm", url: "https://npmjs.com", color: "CB3837" },
  { name: "Yarn", slug: "yarn", url: "https://yarnpkg.com", color: "2C8EBB" },
  { name: "pnpm", slug: "pnpm", url: "https://pnpm.io", color: "F69220" },
  { name: "Linux", slug: "linux", url: "https://kernel.org", color: "FCC624" },
  { name: "Nginx", slug: "nginx", url: "https://nginx.org", color: "009639" },
  { name: "Electron", slug: "electron", url: "https://electronjs.org", color: "47848F" },
  { name: "Tauri", slug: "tauri", url: "https://tauri.app", color: "FFC131" },
];

const STUDENT_BENEFITS = [
  { name: "GitHub Copilot", slug: "githubcopilot", url: "https://github.com/features/copilot", color: "000000" },
  { name: "GitHub Student Pack", slug: "github", url: "https://education.github.com/pack", color: "181717" },
  { name: "AWS Educate", slug: "amazonwebservices", url: "https://aws.amazon.com/education/awseducate", color: "232F3E" },
  { name: "Google Cloud", slug: "googlecloud", url: "https://cloud.google.com/edu", color: "4285F4" },
  { name: "DigitalOcean", slug: "digitalocean", url: "https://www.digitalocean.com/github-students", color: "0080FF" },
  { name: "MongoDB Atlas", slug: "mongodb", url: "https://www.mongodb.com/students", color: "47A248" },
  { name: "Vercel", slug: "vercel", url: "https://vercel.com", color: "000000" },
  { name: "Netlify", slug: "netlify", url: "https://netlify.com", color: "00C7B7" },
  { name: "Cloudflare", slug: "cloudflare", url: "https://cloudflare.com", color: "F38020" },
  { name: "Heroku", slug: "heroku", url: "https://heroku.com", color: "430098" },
  { name: "JetBrains", slug: "jetbrains", url: "https://www.jetbrains.com/community/education", color: "000000" },
  { name: "Figma", slug: "figma", url: "https://figma.com", color: "F24E1E" },
  { name: "Canva", slug: "canva", url: "https://canva.com/education", color: "00C4CC" },
  { name: "Notion", slug: "notion", url: "https://notion.so", color: "000000" },
  { name: "Postman", slug: "postman", url: "https://www.postman.com/student-program", color: "FF6C37" },
  { name: "Spotify", slug: "spotify", url: "https://spotify.com/student", color: "1DB954" },
  { name: "YouTube", slug: "youtube", url: "https://youtube.com/premium/student", color: "FF0000" },
  { name: "Apple", slug: "apple", url: "https://apple.com/us-edu/store", color: "000000" },
  { name: "Amazon", slug: "amazon", url: "https://amazon.com/prime/student", color: "FF9900" },
  { name: "CodeSandbox", slug: "codesandbox", url: "https://codesandbox.io", color: "000000" },
  { name: "Replit", slug: "replit", url: "https://replit.com", color: "F26207" },
  { name: "Autodesk", slug: "autodesk", url: "https://autodesk.com/education", color: "000000" },
  { name: "Unity", slug: "unity", url: "https://unity.com/products/unity-student", color: "000000" },
  { name: "Blender", slug: "blender", url: "https://blender.org", color: "F5792A" },
  { name: "Grammarly", slug: "grammarly", url: "https://grammarly.com/edu", color: "15C39A" },
  { name: "LinkedIn", slug: "linkedin", url: "https://www.linkedin.com/learning/students", color: "0A66C2" },
  { name: "Coursera", slug: "coursera", url: "https://coursera.org", color: "0056D2" },
  { name: "Udemy", slug: "udemy", url: "https://udemy.com", color: "A435F0" },
  { name: "GitLab", slug: "gitlab", url: "https://gitlab.com", color: "FC6D26" },
  { name: "Slack", slug: "slack", url: "https://slack.com", color: "4A154B" },
  { name: "Zoom", slug: "zoom", url: "https://zoom.us", color: "0B5CFF" },
  { name: "Airtable", slug: "airtable", url: "https://airtable.com", color: "18BFFF" },
  { name: "ClickUp", slug: "clickup", url: "https://clickup.com", color: "7B68EE" },
  { name: "Obsidian", slug: "obsidian", url: "https://obsidian.md", color: "7C3AED" },
  { name: "LeetCode", slug: "leetcode", url: "https://leetcode.com", color: "FFA116" },
  { name: "HackerRank", slug: "hackerrank", url: "https://hackerrank.com", color: "00EA64" },
  { name: "Kaggle", slug: "kaggle", url: "https://kaggle.com", color: "20BEFF" },
  { name: "Stripe", slug: "stripe", url: "https://stripe.com", color: "008CDD" },
  { name: "Namecheap", slug: "namecheap", url: "https://namecheap.com", color: "DE3723" },
  { name: "Docker", slug: "docker", url: "https://docker.com", color: "2496ED" },
  { name: "Loom", slug: "loom", url: "https://loom.com", color: "625DF5" },
  { name: "Linear", slug: "linear", url: "https://linear.app", color: "5E6AD2" },
  { name: "Railway", slug: "railway", url: "https://railway.app", color: "0B0D0E" },
  { name: "Miro", slug: "miro", url: "https://miro.com", color: "050038" },
  { name: "Todoist", slug: "todoist", url: "https://todoist.com", color: "E44332" },
  { name: "Evernote", slug: "evernote", url: "https://evernote.com", color: "00A82D" },
  { name: "Asana", slug: "asana", url: "https://asana.com", color: "F06A6A" },
  { name: "Perplexity", slug: "perplexity", url: "https://perplexity.ai", color: "1FB8CD" },
  { name: "GitKraken", slug: "gitkraken", url: "https://gitkraken.com", color: "179287" },
  { name: "Oracle", slug: "oracle", url: "https://oracle.com/cloud/free", color: "F80000" },
  { name: "Red Hat", slug: "redhat", url: "https://developers.redhat.com", color: "EE0000" },
  { name: "Nvidia", slug: "nvidia", url: "https://developer.nvidia.com", color: "76B900" },
  { name: "Hack The Box", slug: "hackthebox", url: "https://hackthebox.com", color: "9FEF00" },
  { name: "TryHackMe", slug: "tryhackme", url: "https://tryhackme.com", color: "212C42" },
  { name: "Coda", slug: "coda", url: "https://coda.io", color: "F46A54" },
  { name: "Raycast", slug: "raycast", url: "https://raycast.com", color: "FF6363" },
  { name: "Arc", slug: "arc", url: "https://arc.net", color: "FCBFBD" },
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
            <div className="w-6 h-6 flex items-center justify-center">
              <img
                src={`${process.env.REACT_APP_BACKEND_URL || "/_/backend"}/api/icon?slug=${tool.slug}&color=${tool.color}`}
                alt={tool.name}
                className="w-6 h-6"
                loading="eager"
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.querySelector('.fallback').style.display = 'inline'; }}
              />
              <span className="fallback hidden text-[8px] font-bold text-muted-foreground leading-tight text-center px-0.5">{tool.name.length > 5 ? tool.name.slice(0,4) : tool.name}</span>
            </div>
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
