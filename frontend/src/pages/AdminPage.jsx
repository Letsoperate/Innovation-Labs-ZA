import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import api from "../lib/api";
import { FadeIn } from "../components/Motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Shield, Trash, Plus, Clock, Users, FolderOpen, ImageSquare, CaretDown } from "@phosphor-icons/react";

export default function AdminPage() {
  const { user, checked } = useAuth();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({ projects: 0, makers: 0, upvotes: 0, comments: 0 });
  const [banners, setBanners] = useState([]);
  const [newBanner, setNewBanner] = useState({ image_url: "", caption: "", link_url: "", position: "top" });
  const [submitting, setSubmitting] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [deadlineInput, setDeadlineInput] = useState("");
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!checked || !user || user.role !== "admin") return;
    api.get("/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/banners").then((r) => setBanners(r.data)).catch(() => {});
    api.get("/admin/competition-deadline").then((r) => { setDeadline(r.data.deadline || ""); setDeadlineInput(r.data.deadline || ""); }).catch(() => {});
  }, [user, checked]);

  const loadUsers = () => api.get("/admin/users").then((r) => setUsers(r.data)).catch(() => {});
  const loadProjects = () => api.get("/admin/projects").then((r) => setProjects(r.data)).catch(() => {});

  useEffect(() => {
    if (tab === "users") loadUsers();
    if (tab === "projects") loadProjects();
  }, [tab]);

  const createBanner = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/admin/banners", null, { params: newBanner });
      toast.success("Banner created");
      const { data } = await api.get("/banners");
      setBanners(data);
      setNewBanner({ image_url: "", caption: "", link_url: "", position: "top" });
    } catch { toast.error("Failed"); }
    finally { setSubmitting(false); }
  };

  const deleteBanner = async (id) => {
    try {
      await api.delete(`/admin/banners/${id}`);
      setBanners((prev) => prev.filter((b) => (b._id || b.id) !== id));
      toast.success("Banner deleted");
    } catch { toast.error("Failed"); }
  };

  const saveDeadline = async () => {
    try {
      await api.post("/admin/competition-deadline", null, { params: { deadline: deadlineInput } });
      setDeadline(deadlineInput);
      toast.success("Deadline updated");
    } catch { toast.error("Failed"); }
  };

  const deleteProject = async (slug) => {
    try {
      await api.delete(`/projects/${slug}`);
      setProjects((prev) => prev.filter((p) => p.slug !== slug));
      toast.success("Project deleted");
    } catch { toast.error("Failed"); }
  };

  const changeRole = async (uid, role) => {
    try {
      await api.patch(`/admin/users/${uid}/role`, null, { params: { role } });
      setUsers((prev) => prev.map((u) => u.id === uid ? { ...u, role } : u));
      toast.success("Role updated");
    } catch { toast.error("Failed"); }
  };

  const deleteUser = async (uid) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await api.delete(`/admin/users/${uid}`);
      setUsers((prev) => prev.filter((u) => u.id !== uid));
      toast.success("User deleted");
    } catch { toast.error("Failed"); }
  };

  if (!checked) return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading...</div>;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  const tabs = [
    { key: "overview", label: "Overview", icon: Shield },
    { key: "deadline", label: "Competition", icon: Clock },
    { key: "banners", label: "Banners", icon: ImageSquare },
    { key: "users", label: "Users", icon: Users },
    { key: "projects", label: "Projects", icon: FolderOpen },
  ];

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex items-center gap-3 mb-8">
            <Shield size={28} weight="fill" className="text-primary" />
            <div>
              <h1 className="font-heading font-black text-3xl sm:text-4xl tracking-tighter">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">Full control over Innovation Lab ZA.</p>
            </div>
          </div>

          <div className="flex gap-1 border-b border-border mb-8 overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>
        </FadeIn>

        {/* Overview */}
        {tab === "overview" && (
          <FadeIn>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Projects", value: stats.projects },
                { label: "Makers", value: stats.makers },
                { label: "Upvotes", value: stats.upvotes },
                { label: "Comments", value: stats.comments },
              ].map((s) => (
                <div key={s.label} className="border border-border rounded-xl p-5 bg-card text-center">
                  <div className="font-heading font-black text-3xl">{s.value.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="border border-border rounded-xl p-6 bg-card">
              <h3 className="font-heading font-bold text-lg mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setTab("banners")} variant="outline" className="rounded-full">Manage Banners</Button>
                <Button onClick={() => setTab("deadline")} variant="outline" className="rounded-full">Set Competition Date</Button>
                <Button onClick={() => setTab("users")} variant="outline" className="rounded-full">Manage Users</Button>
                <Button onClick={() => setTab("projects")} variant="outline" className="rounded-full">Manage Projects</Button>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Competition Deadline */}
        {tab === "deadline" && (
          <FadeIn>
            <div className="border border-border rounded-xl p-6 bg-card max-w-xl">
              <h3 className="font-heading font-bold text-lg mb-4">Competition Deadline</h3>
              <p className="text-sm text-muted-foreground mb-4">Set a date/time when the competition ends. The countdown timer on the homepage will count down to this date.</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Deadline (ISO format)</label>
                  <Input
                    value={deadlineInput}
                    onChange={(e) => setDeadlineInput(e.target.value)}
                    placeholder="2026-12-31T23:59:59+02:00"
                    className="rounded-sm mt-1 font-mono text-sm"
                  />
                </div>
                {deadline && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Current: </span>
                    <span className="font-mono font-semibold">{deadline}</span>
                    <span className="text-muted-foreground ml-2">({new Date(deadline).toLocaleString()})</span>
                  </p>
                )}
                <div className="flex gap-2">
                  <Button onClick={() => setDeadlineInput(new Date(Date.now() + 5 * 60000).toISOString())} variant="outline" className="text-xs rounded-full">5 min from now</Button>
                  <Button onClick={() => setDeadlineInput(new Date(Date.now() + 30 * 60000).toISOString())} variant="outline" className="text-xs rounded-full">30 min</Button>
                  <Button onClick={() => setDeadlineInput(new Date(Date.now() + 24 * 3600000).toISOString())} variant="outline" className="text-xs rounded-full">24 hours</Button>
                </div>
                <Button onClick={saveDeadline} className="bg-primary hover:bg-primary/90 rounded-sm">Save Deadline</Button>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Banners */}
        {tab === "banners" && (
          <FadeIn>
            <form onSubmit={createBanner} className="border border-border rounded-xl p-5 bg-card mb-6 space-y-3 max-w-xl">
              <h3 className="font-heading font-bold text-lg">Add Banner</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Image URL</label><Input value={newBanner.image_url} onChange={(e) => setNewBanner({ ...newBanner, image_url: e.target.value })} placeholder="https://..." className="rounded-sm mt-1" required /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Link URL</label><Input value={newBanner.link_url} onChange={(e) => setNewBanner({ ...newBanner, link_url: e.target.value })} placeholder="https://..." className="rounded-sm mt-1" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Caption</label><Input value={newBanner.caption} onChange={(e) => setNewBanner({ ...newBanner, caption: e.target.value })} placeholder="Optional" className="rounded-sm mt-1" /></div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Position</label>
                  <select value={newBanner.position} onChange={(e) => setNewBanner({ ...newBanner, position: e.target.value })} className="w-full h-9 px-3 border border-border rounded-sm text-sm bg-background mt-1">
                    <option value="top">Top</option><option value="bottom">Bottom</option>
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 rounded-sm gap-2"><Plus size={14} /> Add</Button>
            </form>
            {banners.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 border border-dashed border-border rounded-xl text-center">No banners.</p>
            ) : (
              <div className="space-y-2">
                {banners.map((b) => (
                  <div key={b._id || b.id} className="flex items-center gap-3 p-3 border border-border rounded-xl bg-card">
                    {b.imageUrl && <img src={b.imageUrl} alt="" className="w-16 h-10 object-cover rounded border flex-shrink-0" />}
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{b.caption || "—"}</p><p className="text-xs text-muted-foreground truncate">{b.position} · {b.linkUrl || "No link"}</p></div>
                    <button onClick={() => deleteBanner(b._id || b.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive"><Trash size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </FadeIn>
        )}

        {/* Users */}
        {tab === "users" && (
          <FadeIn>
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-secondary/40 text-left"><th className="p-3 font-semibold">Name</th><th className="p-3 font-semibold">Email</th><th className="p-3 font-semibold">Role</th><th className="p-3 font-semibold text-right">Actions</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                      <td className="p-3"><span className="font-medium">{u.name || u.username}</span><span className="text-muted-foreground ml-1">@{u.username}</span></td>
                      <td className="p-3 text-muted-foreground text-xs">{u.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>{u.role}</span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} className="h-7 px-2 border border-border rounded text-xs bg-background">
                            <option value="user">User</option><option value="admin">Admin</option>
                          </select>
                          <button onClick={() => deleteUser(u.id)} className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"><Trash size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="p-8 text-center text-muted-foreground text-sm">No users loaded. <button onClick={loadUsers} className="text-primary hover:underline">Retry</button></p>}
            </div>
          </FadeIn>
        )}

        {/* Projects */}
        {tab === "projects" && (
          <FadeIn>
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-secondary/40 text-left"><th className="p-3 font-semibold">Project</th><th className="p-3 font-semibold">Maker</th><th className="p-3 font-semibold">Category</th><th className="p-3 font-semibold">Score</th><th className="p-3 font-semibold text-right">Actions</th></tr></thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {p.cover_image_url ? <img src={p.cover_image_url} alt="" className="w-8 h-8 rounded object-cover border" /> : <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{p.name?.[0]}</div>}
                          <div className="min-w-0"><p className="font-medium truncate max-w-[200px]">{p.name}</p><p className="text-xs text-muted-foreground truncate max-w-[200px]">{p.tagline}</p></div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">@{p.maker?.username || "—"}</td>
                      <td className="p-3 text-xs text-muted-foreground">{p.category}</td>
                      <td className="p-3 font-semibold">{p.score}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => deleteProject(p.slug)} className="p-1.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"><Trash size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {projects.length === 0 && <p className="p-8 text-center text-muted-foreground text-sm">No projects loaded. <button onClick={loadProjects} className="text-primary hover:underline">Retry</button></p>}
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
