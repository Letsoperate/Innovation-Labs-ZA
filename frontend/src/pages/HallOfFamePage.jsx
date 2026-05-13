import { FadeIn, Stagger, StaggerItem } from "../components/Motion";
import { Trophy, Calendar, Users, ArrowSquareOut, Clock, MapPin } from "@phosphor-icons/react";
import { Button } from "../components/ui/button";

const EVENTS = [
  {
    type: "upcoming",
    title: "Innovation Lab ZA Hackathon 2026",
    subtitle: "Build the future of African tech",
    date: "July 15-17, 2026",
    location: "Johannesburg, ZA + Virtual",
    description: "A 48-hour hackathon focused on fintech, edtech, and agritech solutions. Open to all students and indie makers across South Africa. $10,000 in prizes + cloud credits.",
    href: "https://innovation-lab-za.vercel.app",
    color: "from-blue-600 to-indigo-600",
  },
  {
    type: "winner",
    title: "DeployDash — Hall of Fame Inductee",
    subtitle: "#1 Project · May 2026",
    date: "Inducted May 13, 2026",
    maker: "Demo Maker",
    description: "One-click deployment platform that took the #1 spot with 211 upvotes and 1,450 views. Built with Go and React, DeployDash simplifies cloud deployment for indie hackers.",
    href: "https://innovation-lab-za.vercel.app",
    color: "from-yellow-600 to-amber-600",
  },
  {
    type: "winner",
    title: "TaxTroll — Hall of Fame Inductee",
    subtitle: "#2 Project · May 2026",
    date: "Inducted May 13, 2026",
    maker: "Demo Maker",
    description: "AI-powered tax assistant for freelancers that simplifies the tax filing process. Built with Python and React, handling 165 upvotes and 1,120 views.",
    href: "https://innovation-lab-za.vercel.app",
    color: "from-slate-500 to-gray-500",
  },
  {
    type: "update",
    title: "Platform Launch — Innovation Lab ZA",
    subtitle: "Community Update",
    date: "May 13, 2026",
    description: "Innovation Lab ZA is officially live! Submit your projects, climb the leaderboard, and connect with the South African maker community. Features include leaderboard rankings, live website previews, threaded comments, bookmarks, GitHub OAuth, and a student benefits directory.",
    href: "https://innovation-lab-za.vercel.app",
    color: "from-green-600 to-emerald-600",
  },
  {
    type: "upcoming",
    title: "Student Builders Challenge",
    subtitle: "Monthly competition for student makers",
    date: "Starts June 1, 2026",
    location: "Virtual",
    description: "Monthly themed challenges for student developers. Build and ship a project in 30 days. Winners receive cloud credits, mentorship sessions, and Hall of Fame induction. All participants get access to the student benefits program.",
    href: "https://innovation-lab-za.vercel.app",
    color: "from-purple-600 to-violet-600",
  },
];

const TYPE_ICONS = { upcoming: Calendar, winner: Trophy, update: Users };
const TYPE_LABELS = { upcoming: "Upcoming", winner: "Hall of Fame", update: "Update" };

export default function HallOfFamePage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-secondary/60 text-xs uppercase tracking-[0.2em] font-semibold rounded-full mb-6">
              <Trophy size={12} weight="fill" className="text-yellow-500" /> Hall of Fame
            </div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter">
              Celebrating Makers.
            </h1>
            <p className="text-muted-foreground text-base mt-4 max-w-2xl mx-auto">
              Hackathon announcements, winner showcases, and community updates — everything that moves the Innovation Lab ZA ecosystem forward.
            </p>
          </div>
        </FadeIn>

        <Stagger className="space-y-6">
          {EVENTS.map((event, i) => {
            const Icon = TYPE_ICONS[event.type];
            return (
              <StaggerItem key={i}>
                <div className="relative group overflow-hidden border border-border rounded-2xl bg-card hover:shadow-lg transition-all duration-300">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${event.color}`} />
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${event.color} flex items-center justify-center shadow-lg`}>
                          <Icon size={24} weight="fill" className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className={`text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${event.color} text-white`}>
                            {TYPE_LABELS[event.type]}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={12} /> {event.date}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin size={12} /> {event.location}
                            </span>
                          )}
                        </div>
                        <h2 className="font-heading font-bold text-xl sm:text-2xl tracking-tight">{event.title}</h2>
                        <p className="text-sm text-primary font-medium mt-0.5">{event.subtitle}</p>
                        {event.maker && (
                          <p className="text-xs text-muted-foreground mt-1">by @{event.maker}</p>
                        )}
                        <p className="text-muted-foreground text-sm mt-4 leading-relaxed">{event.description}</p>
                        {event.href && (
                          <a href={event.href} target="_blank" rel="noreferrer" className="inline-flex mt-4">
                            <Button variant="outline" className="rounded-full gap-2 text-sm">
                              Learn more <ArrowSquareOut size={14} />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        <FadeIn delay={0.3}>
          <div className="mt-16 p-8 sm:p-10 border border-dashed border-border rounded-2xl text-center bg-secondary/20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-card text-xs uppercase tracking-[0.2em] font-semibold rounded-full mb-4">
              <Users size={12} weight="fill" className="text-primary" /> Get involved
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl tracking-tighter mb-3">
              Want to host a hackathon?
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-6">
              Partner with Innovation Lab ZA to host your next hackathon. Reach thousands of indie makers and students across South Africa.
            </p>
            <a href="mailto:admin@innovationlabza.dev">
              <Button className="bg-primary hover:bg-primary/90 rounded-full gap-2">
                Contact us
              </Button>
            </a>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
