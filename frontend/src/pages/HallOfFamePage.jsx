import { FadeIn, Stagger, StaggerItem } from "../components/Motion";
import { Trophy, Calendar, Users, ArrowSquareOut, Clock, MapPin, Lightning } from "@phosphor-icons/react";
import { Button } from "../components/ui/button";

const EVENTS = [
  {
    type: "upcoming",
    title: "Innovation Lab ZA Hackathon 2026",
    subtitle: "Build the future of African tech",
    date: "July 15-17, 2026",
    location: "Johannesburg, ZA + Virtual",
    description: "A 48-hour hackathon focused on fintech, edtech, and agritech solutions. Open to all students and indie makers across South Africa. $10,000 in prizes + cloud credits.",
  },
  {
    type: "winner",
    title: "DeployDash — Hall of Fame Inductee",
    subtitle: "#1 Project on the Leaderboard",
    date: "Inducted May 2026",
    maker: "Demo Maker",
    description: "One-click deployment platform that took the #1 spot with 211 upvotes and 1,450 views. Built with Go and React, DeployDash simplifies cloud deployment for indie hackers.",
  },
  {
    type: "winner",
    title: "TaxTroll — Hall of Fame Inductee",
    subtitle: "#2 Project on the Leaderboard",
    date: "Inducted May 2026",
    maker: "Demo Maker",
    description: "AI-powered tax assistant for freelancers that simplifies the tax filing process. Built with Python and React, handling 165 upvotes and 1,120 views.",
  },
  {
    type: "update",
    title: "Platform Launch — Innovation Lab ZA",
    subtitle: "Community Update",
    date: "May 2026",
    description: "Innovation Lab ZA is officially live! Submit your projects, climb the leaderboard, and connect with the South African maker community.",
  },
  {
    type: "upcoming",
    title: "Student Builders Challenge",
    subtitle: "Monthly competition for student makers",
    date: "Starts June 1, 2026",
    location: "Virtual",
    description: "Monthly themed challenges for student developers. Build and ship a project in 30 days. Winners receive cloud credits and mentorship sessions.",
  },
];

const TYPE_META = {
  upcoming: { icon: Calendar, label: "Upcoming", color: "text-blue-500 border-blue-500/30 bg-blue-500/5" },
  winner: { icon: Trophy, label: "Hall of Fame", color: "text-yellow-500 border-yellow-500/30 bg-yellow-500/5" },
  update: { icon: Lightning, label: "Update", color: "text-green-500 border-green-500/30 bg-green-500/5" },
};

export default function HallOfFamePage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-10">
            <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary mb-3">Hall of Fame</div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter">
              Celebrating Makers.
            </h1>
            <p className="text-muted-foreground text-base mt-3 max-w-2xl">
              Hackathon announcements, winner showcases, and community updates.
            </p>
          </div>
        </FadeIn>

        <Stagger className="space-y-4">
          {EVENTS.map((event, i) => {
            const meta = TYPE_META[event.type];
            const Icon = meta.icon;
            return (
              <StaggerItem key={i}>
                <div className="border border-border bg-card p-5 sm:p-6 hover:border-foreground/20 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 border rounded-sm flex items-center justify-center ${meta.color}`}>
                      <Icon size={20} weight="fill" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-0.5 border rounded-sm ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={11} /> {event.date}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin size={11} /> {event.location}
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading font-bold text-lg tracking-tight">{event.title}</h3>
                      <p className="text-sm text-primary font-medium mt-0.5">{event.subtitle}</p>
                      {event.maker && <p className="text-xs text-muted-foreground mt-0.5">by @{event.maker}</p>}
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        <FadeIn delay={0.3}>
          <div className="mt-8 p-6 border border-dashed border-border text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-secondary/60 text-xs uppercase tracking-[0.15em] font-semibold mb-4">
              <Users size={12} weight="fill" className="text-primary" /> Get involved
            </div>
            <p className="font-heading font-bold text-lg mb-1">Want to host a hackathon?</p>
            <p className="text-sm text-muted-foreground mb-4">Partner with Innovation Lab ZA to reach thousands of makers across South Africa.</p>
            <a href="mailto:admin@innovationlabza.dev">
              <Button className="bg-primary hover:bg-primary/90 rounded-sm gap-2">
                Contact us
              </Button>
            </a>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
