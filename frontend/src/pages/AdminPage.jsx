import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { FadeIn } from "../components/Motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Shield, Trash, Plus, X } from "@phosphor-icons/react";

export default function AdminPage() {
  const { user, checked } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ projects: 0, makers: 0, upvotes: 0, comments: 0 });
  const [banners, setBanners] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!checked) return;
    if (!user || user.role !== "admin") { navigate("/", { replace: true }); return; }
    setReady(true);
    api.get("/stats").then((r) => setStats(r.data));
    api.get("/banners").then((r) => setBanners(r.data));
  }, [user, checked, navigate]);

  const createBanner = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/admin/banners", null, { params: newBanner });
      toast.success("Banner created");
      const { data } = await api.get("/banners");
      setBanners(data);
      setNewBanner({ image_url: "", caption: "", link_url: "", position: "top" });
    } catch { toast.error("Failed to create banner"); }
    finally { setSubmitting(false); }
  };

  const deleteBanner = async (id) => {
    try {
      await api.delete(`/admin/banners/${id}`);
      setBanners((prev) => prev.filter((b) => b._id !== id && b.id !== id));
      toast.success("Banner deleted");
    } catch { toast.error("Failed to delete banner"); }
  };

  if (!checked) {
    return <div className="pt-28 pb-20 text-center text-muted-foreground">Loading...</div>;
  }
  if (!user || user.role !== "admin") return null;

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex items-center gap-3 mb-10">
            <Shield size={28} weight="fill" className="text-primary" />
            <div>
              <h1 className="font-heading font-black text-3xl sm:text-4xl tracking-tighter">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage banners and view platform stats.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {[
              { label: "Projects", value: stats.projects },
              { label: "Makers", value: stats.makers },
              { label: "Upvotes", value: stats.upvotes },
              { label: "Comments", value: stats.comments },
            ].map((s) => (
              <div key={s.label} className="border border-border rounded-xl p-4 bg-card text-center">
                <div className="font-heading font-black text-2xl">{s.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 className="font-heading font-bold text-xl mb-4">Banners</h2>
          <form onSubmit={createBanner} className="border border-border rounded-xl p-5 bg-card mb-6 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Image URL</label>
                <Input value={newBanner.image_url} onChange={(e) => setNewBanner({ ...newBanner, image_url: e.target.value })} placeholder="https://..." className="rounded-sm mt-1" required />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Link URL</label>
                <Input value={newBanner.link_url} onChange={(e) => setNewBanner({ ...newBanner, link_url: e.target.value })} placeholder="https://..." className="rounded-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Caption</label>
                <Input value={newBanner.caption} onChange={(e) => setNewBanner({ ...newBanner, caption: e.target.value })} placeholder="Optional caption" className="rounded-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Position</label>
                <select value={newBanner.position} onChange={(e) => setNewBanner({ ...newBanner, position: e.target.value })} className="w-full h-9 px-3 border border-border rounded-sm text-sm bg-background mt-1">
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 rounded-sm gap-2">
              <Plus size={14} /> {submitting ? "Creating..." : "Add Banner"}
            </Button>
          </form>

          {banners.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8 border border-dashed border-border rounded-xl">No banners yet.</p>
          ) : (
            <div className="space-y-2">
              {banners.map((b) => (
                <div key={b._id || b.id} className="flex items-center gap-3 p-3 border border-border rounded-xl bg-card">
                  {b.imageUrl && <img src={b.imageUrl} alt={b.caption} className="w-16 h-10 object-cover rounded border border-border flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{b.caption || "No caption"}</p>
                    <p className="text-xs text-muted-foreground truncate">{b.position} · {b.linkUrl || "No link"}</p>
                  </div>
                  <button onClick={() => deleteBanner(b._id || b.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
