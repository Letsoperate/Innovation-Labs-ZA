import { Link } from "react-router-dom";
import { GithubLogo, TwitterLogo } from "@phosphor-icons/react";

export default function Footer() {
  return (
    <footer className="bg-[#09090B] text-white relative overflow-hidden noise" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
                <img src="/logo.svg" alt="Innovation Lab ZA" className="h-7 invert" />
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
          <div>
            <p className="text-white/50 text-xs">© {new Date().getFullYear()} Innovation Lab ZA. All rights reserved.</p>
            <p className="text-white/30 text-[11px] mt-1">
              Built for makers, by makers — empowering South African innovation.
            </p>
          </div>
          <a href="https://github.com/Letsoperate" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
            <GithubLogo size={14} weight="fill" /> We're open for collab → Letsoperate
          </a>
        </div>
      </div>
    </footer>
  );
}
