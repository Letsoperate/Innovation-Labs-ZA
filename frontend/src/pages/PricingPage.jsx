import { FadeIn } from "../components/Motion";
import { CurrencyDollar, Globe, Users, Handshake } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function PricingPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-secondary/60 text-xs uppercase tracking-[0.15em] font-semibold rounded-full mb-4">
              <Globe size={12} /> Free & Open Source
            </div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter">Free for everyone.</h1>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Innovation Lab ZA is and always will be <strong className="text-foreground">completely free</strong> for makers, students, and the indie hacker community. No paywalls. No hidden fees. No limits.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="border border-border rounded-2xl p-8 bg-card mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Users size={20} weight="fill" className="text-green-500" />
              </div>
              <h2 className="font-heading font-bold text-xl">For Makers</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Submit projects, get upvoted, rank on the leaderboard, comment — all <strong>free</strong>. No hidden fees. No paywalls. Just build and get discovered.
            </p>
          </div>
          <div className="border border-border rounded-2xl p-8 bg-card mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Globe size={20} weight="fill" className="text-blue-500" />
              </div>
              <h2 className="font-heading font-bold text-xl">Open Source Platform</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Built in the open for the community. Anyone can contribute, suggest features, or fork the project. Transparency and collaboration are at our core.
            </p>
          </div>
          <div className="border border-border rounded-2xl p-8 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Handshake size={20} weight="fill" className="text-primary" />
              </div>
              <h2 className="font-heading font-bold text-xl">For Sponsors</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Interested in sponsoring a hackathon or featured placement? We're open for collaborations. Reach out at <a href="mailto:admin@innovationlabza.dev" className="text-primary hover:underline">admin@innovationlabza.dev</a> for partnership opportunities.
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
