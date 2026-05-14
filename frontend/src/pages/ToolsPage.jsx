import { useState } from "react";
import { FadeIn, Stagger, StaggerItem } from "../components/Motion";
import { Code, Robot, GraduationCap, ArrowSquareOut, MagnifyingGlass, YoutubeLogo, TwitterLogo } from "@phosphor-icons/react";

const DEV_TOOLS = [
  { name: "React", url: "https://react.dev", desc: "UI library by Meta", tags: ["framework","frontend"] },
  { name: "Next.js", url: "https://nextjs.org", desc: "React framework for production", tags: ["framework","fullstack"] },
  { name: "Vue.js", url: "https://vuejs.org", desc: "Progressive JS framework", tags: ["framework","frontend"] },
  { name: "Angular", url: "https://angular.io", desc: "Web framework by Google", tags: ["framework","frontend"] },
  { name: "Svelte", url: "https://svelte.dev", desc: "Cybernetically enhanced web apps", tags: ["framework","frontend"] },
  { name: "Astro", url: "https://astro.build", desc: "Content-driven web framework", tags: ["framework","static"] },
  { name: "Tailwind CSS", url: "https://tailwindcss.com", desc: "Utility-first CSS framework", tags: ["css","design"] },
  { name: "Node.js", url: "https://nodejs.org", desc: "JS runtime environment", tags: ["runtime","backend"] },
  { name: "Bun", url: "https://bun.sh", desc: "Fast all-in-one JS runtime", tags: ["runtime","tooling"] },
  { name: "TypeScript", url: "https://typescriptlang.org", desc: "Typed JS superset", tags: ["language","tooling"] },
  { name: "Python", url: "https://python.org", desc: "General purpose programming language", tags: ["language","backend"] },
  { name: "Go", url: "https://go.dev", desc: "Statically typed compiled language", tags: ["language","backend"] },
  { name: "Rust", url: "https://rust-lang.org", desc: "Safe systems programming language", tags: ["language","systems"] },
  { name: "Docker", url: "https://docker.com", desc: "Container platform", tags: ["devops","infrastructure"] },
  { name: "Kubernetes", url: "https://kubernetes.io", desc: "Container orchestration", tags: ["devops","infrastructure"] },
  { name: "Git", url: "https://git-scm.com", desc: "Version control system", tags: ["tooling","devops"] },
  { name: "PostgreSQL", url: "https://postgresql.org", desc: "Advanced relational database", tags: ["database","backend"] },
  { name: "MongoDB", url: "https://mongodb.com", desc: "Document database", tags: ["database","backend"] },
  { name: "Redis", url: "https://redis.io", desc: "In-memory data store", tags: ["database","caching"] },
  { name: "Prisma", url: "https://prisma.io", desc: "Next-gen ORM for Node/TS", tags: ["database","orm"] },
  { name: "GraphQL", url: "https://graphql.org", desc: "API query language", tags: ["api","backend"] },
  { name: "FastAPI", url: "https://fastapi.tiangolo.com", desc: "Modern Python web framework", tags: ["framework","python"] },
  { name: "Flutter", url: "https://flutter.dev", desc: "UI toolkit by Google", tags: ["framework","mobile"] },
  { name: "Figma", url: "https://figma.com", desc: "Collaborative design tool", tags: ["design","ui"] },
  { name: "VS Code", url: "https://code.visualstudio.com", desc: "Popular code editor", tags: ["editor","tooling"] },
  { name: "Vite", url: "https://vitejs.dev", desc: "Frontend build tool", tags: ["tooling","bundler"] },
];

const AI_AGENTS = [
  { name: "ChatGPT", maker: "OpenAI", url: "https://chatgpt.com", desc: "General AI assistant that helps with coding, writing, and analysis", yt: "https://youtube.com/@OpenAI", tw: "https://twitter.com/OpenAI" },
  { name: "Claude", maker: "Anthropic", url: "https://claude.ai", desc: "Helpful AI assistant for complex tasks and reasoning", yt: "https://youtube.com/@AnthropicAI", tw: "https://twitter.com/AnthropicAI" },
  { name: "Gemini", maker: "Google DeepMind", url: "https://gemini.google.com", desc: "Multimodal AI that understands text, images, and code", yt: "https://youtube.com/@GoogleDeepMind", tw: "https://twitter.com/GoogleDeepMind" },
  { name: "GitHub Copilot", maker: "GitHub/Microsoft", url: "https://github.com/features/copilot", desc: "AI pair programmer that codes alongside you in real-time", yt: "https://youtube.com/@GitHub", tw: "https://twitter.com/github" },
  { name: "Cline", maker: "Cline", url: "https://cline.bot", desc: "Autonomous coding agent in VS Code", tw: "" },
  { name: "Cody", maker: "Sourcegraph", url: "https://sourcegraph.com/cody", desc: "AI code assistant that knows your entire codebase", tw: "https://twitter.com/sourcegraph" },
  { name: "Cline", maker: "Cline", url: "https://cline.bot", desc: "Autonomous coding agent", tw: "" },
  { name: "Devin", maker: "Cognition Labs", url: "https://cognition.ai", desc: "Autonomous AI software engineer", tw: "https://twitter.com/cognition_labs" },
  { name: "Cursor", maker: "Anysphere", url: "https://cursor.sh", desc: "AI-first code editor with built-in agentic coding", tw: "https://twitter.com/cursor_ai" },
  { name: "Windsurf", maker: "Codeium", url: "https://codeium.com/windsurf", desc: "Agentic IDE with AI flow", tw: "https://twitter.com/codeiumdev" },
  { name: "Perplexity", maker: "Perplexity AI", url: "https://perplexity.ai", desc: "AI search engine with real-time research", yt: "", tw: "https://twitter.com/perplexity_ai" },
  { name: "Grok", maker: "xAI", url: "https://grok.com", desc: "Real-time AI with personality and humor", tw: "https://twitter.com/xai" },
  { name: "DeepSeek", maker: "DeepSeek", url: "https://deepseek.com", desc: "Open-source deep reasoning AI", tw: "https://twitter.com/deepseek_ai" },
  { name: "Mistral", maker: "Mistral AI", url: "https://mistral.ai", desc: "Efficient open-weight AI models", tw: "https://twitter.com/MistralAI" },
  { name: "Llama", maker: "Meta", url: "https://llama.meta.com", desc: "Open source AI models for everyone", yt: "https://youtube.com/@Meta", tw: "https://twitter.com/Meta" },
  { name: "Midjourney", maker: "Midjourney", url: "https://midjourney.com", desc: "Creative AI for image generation", tw: "https://twitter.com/midjourney" },
  { name: "Stable Diffusion", maker: "Stability AI", url: "https://stability.ai", desc: "Open source image generation", tw: "https://twitter.com/StabilityAI" },
  { name: "ElevenLabs", maker: "ElevenLabs", url: "https://elevenlabs.io", desc: "Voice AI that speaks like a human", yt: "https://youtube.com/@ElevenLabs", tw: "https://twitter.com/elevenlabsio" },
  { name: "NotebookLM", maker: "Google", url: "https://notebooklm.google.com", desc: "AI note-taking and research agent", tw: "" },
  { name: "Synthesia", maker: "Synthesia", url: "https://synthesia.io", desc: "AI video generation with avatars", tw: "https://twitter.com/synthesiaIO" },
  { name: "Jasper", maker: "Jasper", url: "https://jasper.ai", desc: "AI content creation agent", tw: "https://twitter.com/jasper" },
  { name: "Grammarly", maker: "Grammarly", url: "https://grammarly.com", desc: "AI writing assistant that edits alongside you", tw: "https://twitter.com/grammarly" },
  { name: "Otter.ai", maker: "Otter", url: "https://otter.ai", desc: "AI meeting assistant that takes notes", tw: "https://twitter.com/otter_ai" },
  { name: "Reclaim", maker: "Reclaim AI", url: "https://reclaim.ai", desc: "AI scheduling agent for your calendar", tw: "" },
  { name: "Notion AI", maker: "Notion", url: "https://notion.so", desc: "AI workspace agent integrated into Notion", tw: "https://twitter.com/notion" },
];

const STUDENT_TOOLS = [
  { name: "GitHub Student Pack", url: "https://education.github.com/pack", desc: "Free dev tools + credits" },
  { name: "GitHub Copilot", url: "https://github.com/features/copilot", desc: "AI coding assistant (free for students)" },
  { name: "AWS Educate", url: "https://aws.amazon.com/education/awseducate", desc: "Free AWS credits + training" },
  { name: "Google Cloud Credits", url: "https://cloud.google.com/edu", desc: "$300 free cloud credits" },
  { name: "Microsoft Azure", url: "https://azure.microsoft.com/free/students", desc: "$100 Azure credits" },
  { name: "MongoDB Atlas", url: "https://mongodb.com/students", desc: "Free cloud database" },
  { name: "Vercel Pro", url: "https://vercel.com", desc: "Free Pro features for students" },
  { name: "Netlify", url: "https://netlify.com", desc: "Enhanced free limits" },
  { name: "DigitalOcean", url: "https://digitalocean.com", desc: "$50 free credits" },
  { name: "Heroku", url: "https://heroku.com", desc: "Free cloud deployment" },
  { name: "JetBrains IDEs", url: "https://jetbrains.com/community/education", desc: "Free professional IDEs" },
  { name: "Figma", url: "https://figma.com/education", desc: "Free design tool for education" },
  { name: "Canva", url: "https://canva.com/education", desc: "Canva for Education (free)" },
  { name: "Notion", url: "https://notion.so", desc: "Free workspace for students" },
  { name: "Postman", url: "https://postman.com/student-program", desc: "API platform for students" },
  { name: "Spotify Student", url: "https://spotify.com/student", desc: "Premium at half price" },
  { name: "YouTube Premium", url: "https://youtube.com/premium/student", desc: "Student discount" },
  { name: "Amazon Prime Student", url: "https://amazon.com/prime/student", desc: "Student membership" },
  { name: "Replit", url: "https://replit.com", desc: "Online IDE with student perks" },
  { name: "Unity Student", url: "https://unity.com/products/unity-student", desc: "Free Unity license" },
  { name: "Blender", url: "https://blender.org", desc: "Free 3D creation suite" },
  { name: "Grammarly EDU", url: "https://grammarly.com/edu", desc: "Free writing assistant" },
  { name: "LinkedIn Learning", url: "https://linkedin.com/learning/students", desc: "Free courses with student email" },
  { name: "Coursera", url: "https://coursera.org", desc: "Financial aid available" },
  { name: "Udemy", url: "https://udemy.com", desc: "Free courses for students" },
  { name: "LeetCode", url: "https://leetcode.com", desc: "Student discounts available" },
  { name: "HackerRank", url: "https://hackerrank.com", desc: "Free certification courses" },
  { name: "Kaggle", url: "https://kaggle.com", desc: "Free datasets + GPUs" },
  { name: "Namecheap", url: "https://namecheap.com", desc: "Free domain + SSL" },
  { name: "Slack Education", url: "https://slack.com", desc: "Free education plan" },
  { name: "Zoom Education", url: "https://zoom.us", desc: "Free education benefits" },
  { name: "Miro Education", url: "https://miro.com", desc: "Free education plan" },
  { name: "ClickUp Education", url: "https://clickup.com", desc: "Free education workspace" },
  { name: "Todoist Pro", url: "https://todoist.com", desc: "Free for students" },
  { name: "Evernote", url: "https://evernote.com", desc: "Student discount" },
  { name: "Asana", url: "https://asana.com", desc: "Student access" },
  { name: "Obsidian", url: "https://obsidian.md", desc: "Free for students" },
  { name: "Perplexity Pro", url: "https://perplexity.ai", desc: "Free Pro for students" },
  { name: "Raycast", url: "https://raycast.com", desc: "Student discount" },
  { name: "Loom Education", url: "https://loom.com", desc: "Free education plan" },
  { name: "GitKraken", url: "https://gitkraken.com", desc: "Student pack" },
  { name: "Icebreakers", url: "https://icebreakers.com", desc: "Networking for students" },
  { name: "Notion", url: "https://notion.so", desc: "Free Education Plus plan" },
  { name: "Apple Education", url: "https://apple.com/us-edu/store", desc: "Student pricing on devices" },
];

const TABS = [
  { id: "dev", label: "Dev Tools", icon: Code },
  { id: "ai", label: "AI Agents", icon: Robot },
  { id: "student", label: "Student Benefits", icon: GraduationCap },
];

export default function ToolsPage() {
  const [tab, setTab] = useState("dev");
  const [search, setSearch] = useState("");

  const activeTab = TABS.find((t) => t.id === tab);
  const list = tab === "dev" ? DEV_TOOLS : tab === "ai" ? AI_AGENTS : STUDENT_TOOLS;
  const filtered = list.filter((i) => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-8">
            <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary mb-3">Tools Directory</div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter">Everything you need.</h1>
            <p className="text-muted-foreground mt-3 max-w-xl">Curated tools, AI models, and student benefits for the modern maker.</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${tab === t.id ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/40"}`}>
                  <Icon size={16} weight={tab === t.id ? "fill" : "bold"} /> {t.label}
                </button>
              );
            })}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="relative mb-8">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${activeTab?.label}...`} className="w-full h-11 pl-10 pr-4 border border-border rounded-full bg-background text-sm focus:outline-none focus:border-foreground/40 transition-colors" />
          </div>
        </FadeIn>

        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item, i) => (
            <StaggerItem key={i}>
              <a href={item.url} target="_blank" rel="noreferrer" className="block border border-border rounded-2xl p-4 hover:border-foreground/30 hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-heading font-bold text-sm group-hover:text-primary transition-colors truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.maker || item.desc}</p>
                  </div>
                  <ArrowSquareOut size={14} className="flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                {item.desc && !item.maker && <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground/70">{item.desc}</p>}
                {item.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 border border-border rounded-full text-muted-foreground">{t}</span>)}
                  </div>
                )}
                {item.yt || item.tw ? (
                  <div className="flex gap-2 mt-2">
                    {item.yt && <a href={item.yt} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-red-500 hover:underline flex items-center gap-1"><YoutubeLogo size={12} weight="fill" /> YouTube</a>}
                    {item.tw && <a href={item.tw} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-blue-400 hover:underline flex items-center gap-1"><TwitterLogo size={12} weight="fill" /> X</a>}
                  </div>
                ) : null}
              </a>
            </StaggerItem>
          ))}
        </Stagger>

        {filtered.length === 0 && (
          <div className="border border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground">
            <p className="font-semibold">No tools found</p>
            <p className="text-sm mt-1">Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
