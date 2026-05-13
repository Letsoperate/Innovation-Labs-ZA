import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { FadeIn } from "../components/Motion";
import { GithubLogo } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const r = await login(email, password);
    setLoading(false);
    if (r.ok) {
      toast.success("Welcome back");
      navigate("/");
    } else {
      setError(r.error);
    }
  };

  const onGitHubLogin = async () => {
    try {
      const { data } = await api.get("/auth/github");
      window.location.href = data.url;
    } catch {
      toast.error("GitHub login unavailable");
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-[calc(100vh-4rem)] flex items-center bg-grid">
      <div className="max-w-md mx-auto w-full px-4 sm:px-6">
        <FadeIn>
          <h1 className="font-heading font-black text-4xl tracking-tighter mt-6 text-center">Log in.</h1>
          <p className="text-muted-foreground text-center mt-2 text-sm mb-8">Continue with GitHub or use your email.</p>

          <form onSubmit={onSubmit} className="space-y-5 border border-border bg-card p-8 rounded-2xl" data-testid="login-form">
            <button type="button" onClick={onGitHubLogin} className="w-full flex items-center justify-center gap-3 h-12 border-2 border-border hover:border-[#24292e] transition-all rounded-full font-semibold text-sm bg-[#24292e] text-white hover:bg-[#1b1f23]">
              <GithubLogo size={22} weight="fill" /> Continue with GitHub
            </button>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {error && <div className="px-4 py-3 border border-destructive/40 bg-destructive/5 text-destructive text-sm rounded-xl">{error}</div>}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-full mt-2 h-11" data-testid="email-input" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-full mt-2 h-11" data-testid="password-input" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 rounded-full h-11" data-testid="login-submit">
              {loading ? "Logging in..." : "Log in"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              No account? <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link>
            </p>
          </form>
        </FadeIn>
      </div>
    </div>
  );
}
