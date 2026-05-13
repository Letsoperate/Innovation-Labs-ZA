import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { FadeIn } from "../components/Motion";
import { Rocket } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const r = await register(form);
    setLoading(false);
    if (r.ok) {
      toast.success("Account created");
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
              <Rocket size={12} weight="fill" className="text-primary" /> Join the loop
            </div>
            <h1 className="font-heading font-black text-4xl tracking-tighter mt-6">Create account.</h1>
            <p className="text-muted-foreground mt-2 text-sm">Build your maker profile in seconds.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5 border border-border bg-card p-8" data-testid="register-form">
            {error && <div className="px-4 py-3 border border-destructive/40 bg-destructive/5 text-destructive text-sm">{error}</div>}
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={form.name} onChange={(e) => update("name", e.target.value)} className="rounded-sm mt-2 h-11" data-testid="name-input" />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" required value={form.username} onChange={(e) => update("username", e.target.value.toLowerCase())} className="rounded-sm mt-2 h-11" data-testid="username-input" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className="rounded-sm mt-2 h-11" data-testid="email-input" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)} className="rounded-sm mt-2 h-11" data-testid="password-input" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 rounded-sm h-11" data-testid="register-submit">
              {loading ? "Creating..." : "Create account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
            </p>
          </form>
        </FadeIn>
      </div>
    </div>
  );
}
