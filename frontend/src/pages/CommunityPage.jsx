import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { FadeIn, Stagger, StaggerItem } from "../components/Motion";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Plus, Hash, Compass, Lightning, Trophy, Users, Rocket, Note, X
} from "@phosphor-icons/react";
import { toast } from "sonner";
import PostCard from "../components/PostCard";

const CHANNEL_ICONS = { general: Compass, showcase: Trophy, feedback: ChatCircle, hackathons: Lightning, jobs: Rocket, random: Note };

export default function CommunityPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const activeChannel = params.get("channel") || "";
  const sort = params.get("sort") || "new";
  const [channels, setChannels] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", channel: activeChannel });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ch, po] = await Promise.all([
        api.get("/community/channels"),
        activeChannel ? api.get(`/community/posts?channel=${activeChannel}&sort=${sort}`) : api.get(`/community/posts?sort=${sort}`),
      ]);
      setChannels(ch.data);
      setPosts(po.data);
    } catch { toast.error("Failed to load community"); }
    finally { setLoading(false); }
  }, [activeChannel, sort]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in to post"); return; }
    if (!form.title.trim() || !form.body.trim() || !form.channel) { toast.error("Fill all fields"); return; }
    setSubmitting(true);
    try {
      await api.post("/community/posts", { title: form.title, body: form.body, channel_slug: form.channel });
      toast.success("Posted!");
      setShowCreate(false);
      setForm({ title: "", body: "", channel: activeChannel });
      load();
    } catch { toast.error("Failed to post"); }
    finally { setSubmitting(false); }
  };

  const onVote = async (postId, vote) => {
    if (!user) { toast.error("Sign in to vote"); return; }
    try {
      await api.post(`/community/posts/${postId}/vote`, { vote });
      load();
    } catch { toast.error("Failed to vote"); }
  };

  const setChannel = (s) => {
    const p = new URLSearchParams(params);
    if (s) p.set("channel", s); else p.delete("channel");
    setParams(p);
  };

  const setSort = (s) => {
    const p = new URLSearchParams(params);
    p.set("sort", s);
    setParams(p);
  };

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tighter">Community</h1>
          <Button onClick={() => { if (!user) { toast.error("Sign in first"); return; } setShowCreate(!showCreate); setForm({ ...form, channel: activeChannel }); }} className="bg-primary hover:bg-primary/90 rounded-full gap-2">
            {showCreate ? <X size={16} /> : <Plus size={16} weight="bold" />} {showCreate ? "Cancel" : "New Post"}
          </Button>
        </div>

        {showCreate && (
          <FadeIn>
            <form onSubmit={onSubmit} className="border border-border bg-card p-5 mb-6 rounded-2xl space-y-4">
              <div>
                <Label>Channel</Label>
                <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="w-full h-10 mt-1 px-3 border border-border rounded-xl bg-background text-sm">
                  <option value="">Select channel...</option>
                  {channels.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl mt-1" placeholder="What's on your mind?" />
              </div>
              <div>
                <Label>Body</Label>
                <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="rounded-xl mt-1 min-h-24" placeholder="Share details..." />
              </div>
              <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 rounded-full">{submitting ? "Posting..." : "Post to Community"}</Button>
            </form>
          </FadeIn>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-56 flex-shrink-0">
            <div className="border border-border rounded-2xl overflow-hidden sticky top-24">
              <div className="p-3 border-b border-border bg-secondary/30">
                <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">Channels</p>
              </div>
              <div className="p-2 space-y-0.5">
                <button onClick={() => setChannel("")} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors text-left ${!activeChannel ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                  <Hash size={15} /> All
                </button>
                {channels.map((ch) => {
                  const Icon = CHANNEL_ICONS[ch.slug] || Hash;
                  return (
                    <button key={ch.slug} onClick={() => setChannel(ch.slug)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors text-left ${activeChannel === ch.slug ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                      <Icon size={15} /> {ch.name}
                      <span className="ml-auto text-[10px] opacity-50">{ch.postCount}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setSort("new")} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${sort === "new" ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/40"}`}>New</button>
              <button onClick={() => setSort("top")} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${sort === "top" ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/40"}`}>Top</button>
            </div>

            {loading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-24 border border-border rounded-2xl bg-secondary/20 animate-pulse" />)}</div>
            ) : posts.length === 0 ? (
              <div className="border border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground">
                <p className="font-semibold">No posts yet</p>
                <p className="text-sm mt-1">Be the first to start a discussion.</p>
              </div>
            ) : (
              <Stagger className="space-y-2">
                {posts.map((post) => {
                  const score = (post.upvotes || 0) - (post.downvotes || 0);
                  return (
                    <StaggerItem key={post._id}>
                      <PostCard post={post} score={score} channels={channels} onVote={onVote} load={load} user={user} />
                    </StaggerItem>
                  );
                })}
              </Stagger>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
