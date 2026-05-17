import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import BrowseDropdown from "./BrowseDropdown";
import { Button } from "./ui/button";
import { MagnifyingGlass, SignOut, User, List, X, BookmarkSimple, Rocket, CaretDown, Crown } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { fileUrl } from "../lib/api";
import api from "../lib/api";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [crownRank, setCrownRank] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    api.get("/projects/leaderboard?period=all&limit=10").then(({ data }) => {
      if (cancelled) return;
      for (let i = 0; i < Math.min(3, data.length); i++) {
        if (data[i].maker?.id === user.id) {
          setCrownRank(i + 1);
          return;
        }
      }
      setCrownRank(0);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id]);

  const initials = (user?.name || user?.username || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const crownColor = crownRank === 1 ? "#FFD700" : crownRank === 2 ? "#C0C0C0" : "#CD7F32";
  const crownGlow = crownRank === 1 ? "0 0 10px rgba(255,215,0,0.6)" : crownRank === 2 ? "0 0 8px rgba(192,192,192,0.5)" : "0 0 6px rgba(205,127,50,0.4)";

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-border/60" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" data-testid="logo-link">
          <img src="/logo.svg" alt="Innovation Lab ZA" className="h-8" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={({ isActive }) => `px-4 py-2 text-sm font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Home</NavLink>
          <BrowseDropdown />
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/discover")}
            data-testid="search-button"
            className="hidden sm:inline-flex rounded-full"
          >
            <MagnifyingGlass size={20} weight="bold" />
          </Button>

          {user ? (
            <div className="relative group">
              <button data-testid="user-menu-trigger" className="rounded-full transition-transform duration-200 group-hover:scale-105 relative">
                {crownRank > 0 && (
                  <Crown size={16} weight="fill" className="absolute -top-1.5 -right-1.5 z-10 drop-shadow" style={{ color: crownColor, filter: `drop-shadow(${crownGlow})` }} />
                )}
                <Avatar className="h-9 w-9 ring-1 ring-border rounded-full ring-offset-2 ring-offset-background">
                  <AvatarImage src={fileUrl(user.avatar_url)} alt={user.name} className="rounded-full" />
                  <AvatarFallback className="bg-foreground text-background font-semibold rounded-full">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
              <div className="absolute right-0 top-full mt-3 w-56 bg-card border border-border rounded-2xl shadow-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 origin-top-right">
                <div className="flex items-center gap-2 px-3 py-2">
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage src={fileUrl(user.avatar_url)} alt={user.name} className="rounded-full" />
                    <AvatarFallback className="bg-foreground text-background text-xs font-semibold rounded-full">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">@{user.username}</div>
                  </div>
                </div>
                <div className="h-px bg-border my-1" />
                <button onClick={() => { navigate(`/u/${user.username}`); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors text-left">
                  <User size={16} /> Profile
                </button>
                <button onClick={() => { navigate(`/u/${user.username}?tab=bookmarks`); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors text-left">
                  <BookmarkSimple size={16} /> Bookmarks
                </button>
                <button onClick={() => { navigate("/submit"); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50 font-semibold transition-colors text-left">
                  <Rocket size={16} weight="fill" className="text-orange-500" /> Submit Project
                </button>
                <div className="h-px bg-border my-1" />
                <button onClick={async () => { await logout(); navigate("/"); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors text-left">
                  <SignOut size={16} /> Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                data-testid="login-button"
                className="rounded-full"
              >
                Log in
              </Button>
              <Button
                onClick={() => navigate("/register")}
                data-testid="register-button"
                className="bg-primary hover:bg-primary/90 text-white rounded-full"
              >
                Get started
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden rounded-full"
            data-testid="mobile-menu-button"
          >
            {mobileOpen ? <X size={20} /> : <List size={20} />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass border-t border-border/60 px-4 py-4 flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <NavLink to="/" end onClick={() => setMobileOpen(false)} className={({isActive}) => `py-2 text-sm font-medium ${isActive ? "text-primary" : "text-foreground"}`}>Home</NavLink>
          <details className="group">
            <summary className="py-2 text-sm font-medium text-muted-foreground cursor-pointer list-none flex items-center gap-1">Browse <CaretDown size={12} className="group-open:rotate-180 transition-transform" /></summary>
            <div className="pl-4 mt-1 space-y-1 pb-2">
              <Link to="/discover" onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm text-muted-foreground hover:text-foreground">All Projects</Link>
              <Link to="/categories" onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm text-muted-foreground hover:text-foreground">Categories</Link>
              <Link to="/hall-of-fame" onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm text-muted-foreground hover:text-foreground">Hall of Fame</Link>
              <Link to="/tools" onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm text-muted-foreground hover:text-foreground">Tools</Link>
              <Link to="/builders" onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm text-muted-foreground hover:text-foreground">Builders</Link>
              <Link to="/blog" onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm text-muted-foreground hover:text-foreground">Blog</Link>
              <Link to="/faq" onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
              <Link to="/community" onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm text-muted-foreground hover:text-foreground">Community</Link>
            </div>
          </details>
          {user && (
            <>
              <NavLink to="/submit" onClick={() => setMobileOpen(false)} className="py-2 text-sm font-medium text-primary flex items-center gap-2">
                <Rocket size={16} weight="fill" /> Submit Project
              </NavLink>
              <NavLink to={`/u/${user.username}`} onClick={() => setMobileOpen(false)} className="py-2 text-sm font-medium text-foreground flex items-center gap-2">
                <User size={16} /> Profile
              </NavLink>
              <NavLink to={`/u/${user.username}?tab=bookmarks`} onClick={() => setMobileOpen(false)} className="py-2 text-sm font-medium text-foreground flex items-center gap-2">
                <BookmarkSimple size={16} /> Bookmarks
              </NavLink>
            </>
          )}
          {!user && (
            <div className="flex gap-2 pt-2 border-t border-border/60">
              <Button variant="outline" onClick={() => { setMobileOpen(false); navigate("/login"); }} className="flex-1 rounded-full">
                Log in
              </Button>
              <Button onClick={() => { setMobileOpen(false); navigate("/register"); }} className="flex-1 bg-primary hover:bg-primary/90 rounded-full">
                Get started
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
