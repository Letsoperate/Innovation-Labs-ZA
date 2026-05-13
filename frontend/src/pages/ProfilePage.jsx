import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api, { fileUrl, formatApiErrorDetail } from "../lib/api";
import { FadeIn, Stagger, StaggerItem } from "../components/Motion";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import ProjectCard from "../components/ProjectCard";
import { TwitterLogo, GithubLogo, Globe, PencilSimple, UploadSimple } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "../components/ui/skeleton";

export default function ProfilePage() {
  const { username } = useParams();
  const { user: me, refresh } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", twitter: "", github: "", website: "", avatar_url: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/${username}`);
      setData(data);
      setForm({
        name: data.user.name || "",
        bio: data.user.bio || "",
        twitter: data.user.twitter || "",
        github: data.user.github || "",
        website: data.user.website || "",
        avatar_url: data.user.avatar_url || "",
      });
    } catch {
      toast.error("Profile not found");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => { load(); }, [load]);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm((p) => ({ ...p, avatar_url: data.url }));
      toast.success("Avatar uploaded");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await api.patch("/users/me", form);
      toast.success("Profile updated");
      setEditing(false);
      await refresh();
      await load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return null;
  const u = data.user;
  const isMe = me?.username === u.username;
  const initials = (u.name || u.username).split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="border border-border p-6 sm:p-10 bg-card">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24 ring-1 ring-border">
                <AvatarImage src={fileUrl(u.avatar_url)} />
                <AvatarFallback className="bg-foreground text-background font-heading font-black text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="font-heading font-black text-3xl sm:text-4xl tracking-tighter" data-testid="profile-name">{u.name}</h1>
                <p className="text-muted-foreground">@{u.username}</p>
                {u.bio && <p className="text-foreground/80 mt-4 max-w-2xl">{u.bio}</p>}
                <div className="flex gap-2 mt-4">
                  {u.twitter && <a href={`https://twitter.com/${u.twitter}`} target="_blank" rel="noreferrer" className="w-9 h-9 border border-border flex items-center justify-center hover:border-primary hover:text-primary"><TwitterLogo size={16} /></a>}
                  {u.github && <a href={`https://github.com/${u.github}`} target="_blank" rel="noreferrer" className="w-9 h-9 border border-border flex items-center justify-center hover:border-primary hover:text-primary"><GithubLogo size={16} /></a>}
                  {u.website && <a href={u.website} target="_blank" rel="noreferrer" className="w-9 h-9 border border-border flex items-center justify-center hover:border-primary hover:text-primary"><Globe size={16} /></a>}
                </div>
              </div>
              {isMe && (
                <Dialog open={editing} onOpenChange={setEditing}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-sm gap-2" data-testid="edit-profile-button">
                      <PencilSimple size={14} /> Edit profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-sm max-w-lg">
                    <DialogHeader><DialogTitle>Edit profile</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Avatar</Label>
                        <div className="flex items-center gap-3 mt-2">
                          <Avatar className="h-14 w-14"><AvatarImage src={fileUrl(form.avatar_url)} /><AvatarFallback className="bg-foreground text-background">{initials}</AvatarFallback></Avatar>
                          <label className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm cursor-pointer hover:bg-foreground hover:text-background">
                            <UploadSimple size={14} /> Upload
                            <input type="file" accept="image/*" onChange={onUpload} className="hidden" data-testid="avatar-upload" />
                          </label>
                        </div>
                      </div>
                      <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-sm mt-2" /></div>
                      <div><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="rounded-sm mt-2" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label>Twitter</Label><Input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} className="rounded-sm mt-2" placeholder="handle" /></div>
                        <div><Label>GitHub</Label><Input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} className="rounded-sm mt-2" placeholder="username" /></div>
                      </div>
                      <div><Label>Website</Label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="rounded-sm mt-2" placeholder="https://..." /></div>
                      <Button onClick={onSave} disabled={saving} className="w-full bg-primary hover:bg-primary/90 rounded-sm" data-testid="save-profile-button">
                        {saving ? "Saving..." : "Save changes"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-12 mb-6 flex items-end justify-between">
            <h2 className="font-heading font-bold text-2xl">Projects · {data.projects.length}</h2>
          </div>
          {data.projects.length === 0 ? (
            <div className="border border-dashed border-border p-12 text-center text-muted-foreground">No projects yet.</div>
          ) : (
            <Stagger className="grid sm:grid-cols-2 gap-4">
              {data.projects.map((p) => (
                <StaggerItem key={p.id}><ProjectCard project={{ ...p, maker: u }} /></StaggerItem>
              ))}
            </Stagger>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
