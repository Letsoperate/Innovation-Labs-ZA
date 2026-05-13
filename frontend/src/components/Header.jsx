import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Lightning, MagnifyingGlass, Plus, SignOut, User, List, X, BookmarkSimple, Rocket } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { fileUrl } from "../lib/api";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials = (user?.name || user?.username || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

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
          {[
            { to: "/", label: "Home" },
            { to: "/discover", label: "Discover" },
            { to: "/leaderboard", label: "Leaderboard" },
            { to: "/categories", label: "Categories" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="user-menu-trigger" className="rounded-full">
                  <Avatar className="h-9 w-9 ring-1 ring-border rounded-full">
                    <AvatarImage src={fileUrl(user.avatar_url)} alt={user.name} className="rounded-full" />
                    <AvatarFallback className="bg-foreground text-background font-semibold rounded-full">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 rounded-full">
                      <AvatarImage src={fileUrl(user.avatar_url)} alt={user.name} className="rounded-full" />
                      <AvatarFallback className="bg-foreground text-background text-xs font-semibold rounded-full">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground font-normal">@{user.username}</div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(`/u/${user.username}`)} data-testid="menu-profile" className="rounded-lg">
                  <User size={16} className="mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/u/${user.username}?tab=bookmarks`)} data-testid="menu-bookmarks" className="rounded-lg">
                  <BookmarkSimple size={16} className="mr-2" /> Bookmarks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/submit")} data-testid="menu-submit" className="rounded-lg">
                  <Rocket size={16} className="mr-2" /> Submit Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => { await logout(); navigate("/"); }} data-testid="menu-logout" className="rounded-lg">
                  <SignOut size={16} className="mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                className="bg-primary hover:bg-primary/90 text-white rounded-full gap-1"
              >
                <Lightning size={16} weight="fill" /> Get started
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
        <div className="md:hidden glass border-t border-border/60 px-4 py-4 flex flex-col gap-2">
          {[
            { to: "/", label: "Home" },
            { to: "/discover", label: "Discover" },
            { to: "/leaderboard", label: "Leaderboard" },
            { to: "/categories", label: "Categories" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `py-2 text-sm font-medium ${isActive ? "text-primary" : "text-foreground"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
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
