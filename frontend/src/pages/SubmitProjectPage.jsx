import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { formatApiErrorDetail } from "../lib/api";
import { FadeIn } from "../components/Motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { UploadSimple, X, Plus, Rocket } from "@phosphor-icons/react";

const CATEGORIES = [
  { slug: "ai", name: "AI & ML" },
  { slug: "developer-tools", name: "Developer Tools" },
  { slug: "productivity", name: "Productivity" },
  { slug: "design", name: "Design" },
  { slug: "marketing", name: "Marketing" },
  { slug: "fintech", name: "Fintech" },
  { slug: "social", name: "Social" },
  { slug: "saas", name: "SaaS" },
  { slug: "mobile", name: "Mobile" },
  { slug: "open-source", name: "Open Source" },
];

export default function SubmitProjectPage() {
  const { user, checked } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    website_url: "",
    github_url: "",
    category: "",
    tags: "",
    tech_stack: "",
    cover_image_url: "",
    screenshots: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (checked && !user) {
    navigate("/login");
    return null;
  }

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      update("screenshots", [...(form.screenshots || []), data.url]);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        tech_stack: form.tech_stack.split(",").map((t) => t.trim()).filter(Boolean),
        screenshots: JSON.stringify(form.screenshots),
      };
      const { data } = await api.post("/projects", payload);
      toast.success("Project submitted!");
      navigate(`/p/${data.slug}`);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = step === 1 ? form.name && form.tagline && form.category : step === 2 ? form.description && form.website_url : true;

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-10">
            <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary mb-3 flex items-center gap-2">
              <Rocket size={14} weight="fill" /> Submit
            </div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter">Ship it.</h1>
            <p className="text-muted-foreground mt-2">Add your project to the loop.</p>
          </div>

          <div className="flex gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 transition-colors ${s <= step ? "bg-primary" : "bg-border"}`}
                data-testid={`step-indicator-${s}`}
              />
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-6 border border-border p-6 sm:p-10 bg-card">
            {step === 1 && (
              <>
                <h2 className="font-heading font-bold text-xl mb-4">Basics</h2>
                <div>
                  <Label htmlFor="name">Project name *</Label>
                  <Input id="name" data-testid="input-name" value={form.name} onChange={(e) => update("name", e.target.value)} className="rounded-sm mt-2" placeholder="Synthwave Notes" />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline * <span className="text-muted-foreground">(max 80 chars)</span></Label>
                  <Input id="tagline" data-testid="input-tagline" maxLength={80} value={form.tagline} onChange={(e) => update("tagline", e.target.value)} className="rounded-sm mt-2" placeholder="Markdown notes with a retro twist" />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select value={form.category} onValueChange={(v) => update("category", v)}>
                    <SelectTrigger data-testid="select-category" className="rounded-sm mt-2 h-10"><SelectValue placeholder="Pick a category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug} data-testid={`option-${c.slug}`}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="font-heading font-bold text-xl mb-4">Details</h2>
                <div>
                  <Label htmlFor="desc">Description *</Label>
                  <Textarea id="desc" data-testid="input-description" rows={6} value={form.description} onChange={(e) => update("description", e.target.value)} className="rounded-sm mt-2" placeholder="Tell the community what your project does, who it's for, and what makes it special." />
                </div>
                <div>
                  <Label htmlFor="web">Website URL *</Label>
                  <Input id="web" type="url" data-testid="input-website" value={form.website_url} onChange={(e) => update("website_url", e.target.value)} className="rounded-sm mt-2" placeholder="https://your-project.com" />
                </div>
                <div>
                  <Label htmlFor="gh">GitHub URL</Label>
                  <Input id="gh" type="url" data-testid="input-github" value={form.github_url} onChange={(e) => update("github_url", e.target.value)} className="rounded-sm mt-2" placeholder="https://github.com/user/repo" />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="font-heading font-bold text-xl mb-4">Final touches</h2>
                <div>
                  <Label>Screenshots</Label>
                  <p className="text-xs text-muted-foreground mb-2">Upload one or more screenshots of your deployed project.</p>
                  <div className="space-y-3">
                    {(form.screenshots || []).map((s, i) => (
                      <div key={i} className="relative inline-block">
                        <img src={s.startsWith("/api") ? process.env.REACT_APP_BACKEND_URL + s : s} alt="" className="max-h-48 mx-auto border border-border" />
                        <button type="button" onClick={() => update("screenshots", form.screenshots.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground flex items-center justify-center rounded-full text-xs"><X size={10} weight="bold" /></button>
                      </div>
                    ))}
                    <div className="border border-dashed border-border p-6 text-center bg-secondary/30">
                      <UploadSimple size={28} className="mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">PNG, JPG, WebP up to 5MB each</p>
                      <input id="upload" type="file" accept="image/*" onChange={onUpload} className="hidden" data-testid="upload-input" />
                      <label htmlFor="upload" className="inline-block mt-3 px-4 py-2 border border-foreground/20 text-sm font-medium cursor-pointer hover:bg-foreground hover:text-background transition-colors rounded-sm">
                        {uploading ? "Uploading..." : "Choose file"}
                      </label>
                    </div>
                  </div>
                </div>
                    ) : (
                      <>
                        <UploadSimple size={28} className="mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">PNG, JPG, WebP up to 5MB</p>
                        <input id="upload" type="file" accept="image/*" onChange={onUpload} className="hidden" data-testid="upload-input" />
                        <label htmlFor="upload" className="inline-block mt-3 px-4 py-2 border border-foreground/20 text-sm font-medium cursor-pointer hover:bg-foreground hover:text-background transition-colors">
                          {uploading ? "Uploading..." : "Choose file"}
                        </label>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">Tags <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
                  <Input id="tags" data-testid="input-tags" value={form.tags} onChange={(e) => update("tags", e.target.value)} className="rounded-sm mt-2" placeholder="notes, markdown, productivity" />
                </div>
                <div>
                  <Label htmlFor="tech">Tech stack <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
                  <Input id="tech" data-testid="input-tech" value={form.tech_stack} onChange={(e) => update("tech_stack", e.target.value)} className="rounded-sm mt-2" placeholder="React, FastAPI, MongoDB" />
                </div>
              </>
            )}

            <div className="flex justify-between pt-6 border-t border-border">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)} data-testid="prev-step-button" className="rounded-sm">
                  Back
                </Button>
              ) : <div />}
              {step < 3 ? (
                <Button type="button" disabled={!canNext} onClick={() => setStep(step + 1)} data-testid="next-step-button" className="bg-primary hover:bg-primary/90 rounded-sm">
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={submitting} data-testid="submit-button" className="bg-primary hover:bg-primary/90 rounded-sm gap-2">
                  <Plus size={16} weight="bold" /> {submitting ? "Submitting..." : "Submit project"}
                </Button>
              )}
            </div>
          </form>
        </FadeIn>
      </div>
    </div>
  );
}
