import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { FadeIn } from "../components/Motion";
import { Lightning } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
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

  return (
    <div className="pt-28 pb-20 min-h-[calc(100vh-4rem)] flex items-center bg-grid">
      <div className="max-w-md mx-auto w-full px-4 sm:px-6">
        <FadeIn>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-secondary/60 text-xs uppercase tracking-[0.2em] font-semibold">
              <Lightning size={12} weight="fill" className="text-primary" /> Welcome back
            </div>
            <h1 className="font-heading font-black text-4xl tracking-tighter mt-6">Log in.</h1>
          </div>

          <form onSubmit={onSubmit} className="space-y-5 border border-border bg-card p-8" data-testid="login-form">
            {error && <div className="px-4 py-3 border border-destructive/40 bg-destructive/5 text-destructive text-sm">{error}</div>}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-sm mt-2 h-11" data-testid="email-input" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-sm mt-2 h-11" data-testid="password-input" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 rounded-sm h-11" data-testid="login-submit">
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
