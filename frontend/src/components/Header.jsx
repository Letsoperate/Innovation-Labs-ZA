import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Lightning, MagnifyingGlass, Plus, SignOut, User, List, X } from "@phosphor-icons/react";
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
            className="hidden sm:inline-flex"
          >
            <MagnifyingGlass size={20} weight="bold" />
          </Button>

          {user ? (
            <>
              <Button
                onClick={() => navigate("/submit")}
                data-testid="submit-project-button"
                className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-white rounded-sm gap-1"
              >
                <Plus size={16} weight="bold" /> Submit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button data-testid="user-menu-trigger" className="rounded-full">
                    <Avatar className="h-9 w-9 ring-1 ring-border">
                      <AvatarImage src={fileUrl(user.avatar_url)} alt={user.name} />
                      <AvatarFallback className="bg-foreground text-background font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-sm">
                  <DropdownMenuLabel>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs text-muted-foreground font-normal">@{user.username}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`/u/${user.username}`)} data-testid="menu-profile">
                    <User size={16} className="mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/submit")} data-testid="menu-submit">
                    <Plus size={16} className="mr-2" /> Submit Project
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await logout(); navigate("/"); }} data-testid="menu-logout">
                    <SignOut size={16} className="mr-2" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                data-testid="login-button"
                className="rounded-sm"
              >
                Log in
              </Button>
              <Button
                onClick={() => navigate("/register")}
                data-testid="register-button"
                className="bg-primary hover:bg-primary/90 text-white rounded-sm gap-1"
              >
                <Lightning size={16} weight="fill" /> Get started
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden"
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
          {!user && (
            <div className="flex gap-2 pt-2 border-t border-border/60">
              <Button variant="outline" onClick={() => { setMobileOpen(false); navigate("/login"); }} className="flex-1 rounded-sm">
                Log in
              </Button>
              <Button onClick={() => { setMobileOpen(false); navigate("/register"); }} className="flex-1 bg-primary hover:bg-primary/90 rounded-sm">
                Get started
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
