import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { FadeIn, Stagger, StaggerItem } from "../components/Motion";
import { LinkSimple, Share, Copy, ArrowSquareOut, Users, Trophy, Star, SealCheck } from "@phosphor-icons/react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const BADGE_TIERS = [
  { name: "Starter", icon: Star, referrals: 1, color: "text-slate-500", bg: "bg-slate-100" },
  { name: "Bronze", icon: Users, referrals: 5, color: "text-amber-700", bg: "bg-amber-100" },
  { name: "Silver", icon: Trophy, referrals: 10, color: "text-slate-400", bg: "bg-slate-100" },
  { name: "Gold", icon: Trophy, referrals: 25, color: "text-yellow-500", bg: "bg-yellow-100" },
  { name: "Platinum", icon: SealCheck, referrals: 50, color: "text-blue-500", bg: "bg-blue-100" },
];

export default function AffiliatesPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, badge: "Starter" });
  const refLink = user ? `https://innovation-lab-za.vercel.app/register?ref=${user.username}` : "";
  const earnedBadge = BADGE_TIERS.filter((b) => stats.total >= b.referrals).pop() || BADGE_TIERS[0];

  const copyLink = () => {
    navigator.clipboard.writeText(refLink);
    toast.success("Referral link copied!");
  };

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-10">
            <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary mb-3">Affiliates</div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter">Share & earn badges.</h1>
            <p className="text-muted-foreground mt-3 max-w-xl">Share projects with your unique link. When people sign up through your referral, you earn badges and climb the ranks.</p>
          </div>
        </FadeIn>

        {user ? (
          <>
            <FadeIn delay={0.05}>
              <div className="border border-border rounded-2xl p-6 bg-card mb-6">
                <p className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-2">Your Referral Link</p>
                <div className="flex gap-2">
                  <input readOnly value={refLink} className="flex-1 h-11 px-4 border border-border rounded-xl bg-background text-sm font-mono" />
                  <button onClick={copyLink} className="h-11 px-4 border border-border rounded-xl hover:bg-secondary transition-colors"><Copy size={18} /></button>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="border border-border rounded-2xl p-6 bg-card mb-6">
                <p className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-4">Your Stats</p>
                <div className="flex gap-6">
                  <div><p className="font-heading font-black text-3xl">{stats.total}</p><p className="text-xs text-muted-foreground">Referrals</p></div>
                  <div><p className="font-heading font-black text-3xl flex items-center gap-2"><earnedBadge.icon size={24} weight="fill" className={earnedBadge.color} /> {earnedBadge.name}</p><p className="text-xs text-muted-foreground">Current Badge</p></div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <p className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-4">Badge Tiers</p>
              <Stagger className="space-y-2">
                {BADGE_TIERS.map((b) => {
                  const Icon = b.icon;
                  const unlocked = stats.total >= b.referrals;
                  return (
                    <StaggerItem key={b.name}>
                      <div className={`border rounded-2xl p-4 flex items-center gap-4 ${unlocked ? "border-border bg-card" : "border-dashed border-border/40 opacity-50"}`}>
                        <div className={`w-10 h-10 rounded-xl ${unlocked ? b.bg : "bg-secondary/30"} flex items-center justify-center`}>
                          <Icon size={20} weight="fill" className={unlocked ? b.color : "text-muted-foreground"} />
                        </div>
                        <div className="flex-1">
                          <p className="font-heading font-semibold text-sm">{b.name}</p>
                          <p className="text-xs text-muted-foreground">{b.referrals} referrals required</p>
                        </div>
                        <div className="text-xs font-bold">{unlocked ? "✅" : `${stats.total}/${b.referrals}`}</div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </FadeIn>
          </>
        ) : (
          <FadeIn>
            <div className="border border-dashed border-border rounded-2xl p-12 text-center">
              <LinkSimple size={32} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-semibold mb-1">Sign in to get your referral link</p>
              <p className="text-sm text-muted-foreground mb-4">Share projects and earn badges when people join through your link.</p>
              <Link to="/login"><Button className="bg-primary hover:bg-primary/90 rounded-full">Sign in</Button></Link>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
