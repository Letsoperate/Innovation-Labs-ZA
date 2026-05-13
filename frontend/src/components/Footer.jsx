import { Link } from "react-router-dom";
import { GithubLogo, TwitterLogo, Heart } from "@phosphor-icons/react";

export default function Footer() {
  return (
    <footer className="bg-[#09090B] text-white relative overflow-hidden noise" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center font-heading font-black text-lg">
                L
              </div>
              <span className="font-heading font-black text-xl tracking-tight">LaunchLoop</span>
            </div>
            <p className="text-white/60 text-sm max-w-sm leading-relaxed">
              The product discovery platform built for indie hackers. Ship in public, get
              long-term visibility, and connect with the makers who matter.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-9 h-9 border border-white/15 hover:border-primary hover:text-primary transition-colors flex items-center justify-center">
                <TwitterLogo size={18} weight="bold" />
              </a>
              <a href="#" className="w-9 h-9 border border-white/15 hover:border-primary hover:text-primary transition-colors flex items-center justify-center">
                <GithubLogo size={18} weight="bold" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/40 mb-5">Discover</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/discover" className="text-white/70 hover:text-white">Browse</Link></li>
              <li><Link to="/leaderboard" className="text-white/70 hover:text-white">Leaderboard</Link></li>
              <li><Link to="/categories" className="text-white/70 hover:text-white">Categories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/40 mb-5">Makers</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/submit" className="text-white/70 hover:text-white">Submit project</Link></li>
              <li><Link to="/register" className="text-white/70 hover:text-white">Create account</Link></li>
              <li><Link to="/login" className="text-white/70 hover:text-white">Log in</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/40 mb-5">About</h4>
            <ul className="space-y-3 text-sm">
              <li><a className="text-white/70 hover:text-white" href="#">Manifesto</a></li>
              <li><a className="text-white/70 hover:text-white" href="#">Pricing</a></li>
              <li><a className="text-white/70 hover:text-white" href="#">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-white/40 text-xs">© 2026 LaunchLoop. Built for makers, by makers.</p>
          <p className="text-white/40 text-xs flex items-center gap-1">
            Made with <Heart size={12} weight="fill" className="text-primary" /> for the indie hacker community.
          </p>
        </div>
      </div>
    </footer>
  );
}
