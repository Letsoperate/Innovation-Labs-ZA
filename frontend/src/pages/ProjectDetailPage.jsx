import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import api, { fileUrl } from "../lib/api";
import { FadeIn } from "../components/Motion";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Textarea } from "../components/ui/textarea";
import { ArrowUp, Eye, ChatCircle, ArrowSquareOut, GithubLogo, TwitterLogo, Globe, ArrowLeft, Monitor, LinkSimple, LinkedinLogo, PencilSimple } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "../components/ui/skeleton";

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [hasUp, setHasUp] = useState(false);
  const [upCount, setUpCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cached = location.state?.project;
      if (cached && cached.slug === slug) {
        setProject(cached);
        setHasUp(!!cached.has_upvoted);
        setUpCount(cached.upvotes_count);
        setLoading(false);
        api.get(`/projects/${cached.slug}/comments`).then((c) => setComments(c.data));
        return;
      }
      const { data } = await api.get(`/projects/${slug}`);
      setProject(data);
      setHasUp(!!data.has_upvoted);
      setUpCount(data.upvotes_count);
      const c = await api.get(`/projects/${slug}/comments`);
      setComments(c.data);
    } catch {
      toast.error("Project not found. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [slug, location.state]);

  useEffect(() => { load(); }, [load]);

  const onUpvote = async () => {
    if (!user) return toast.error("Sign in to upvote");
    try {
      const { data } = await api.post(`/projects/${project.slug}/upvote`);
      setHasUp(data.upvoted);
      setUpCount(data.upvotes_count);
    } catch { toast.error("Failed to upvote"); }
  };

  const onComment = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Sign in to comment");
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post(`/projects/${project.slug}/comments`, { body: comment });
      setComments([data, ...comments]);
      setComment("");
      toast.success("Comment posted");
    } catch { toast.error("Failed to post comment"); }
    finally { setPosting(false); }
  };

  if (loading || !project) {
    return (
      <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const maker = project.maker;
  const initials = (maker?.name || maker?.username || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8"
            data-testid="back-button"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 border border-border bg-muted overflow-hidden">
              {project.cover_image_url ? (
                <img src={fileUrl(project.cover_image_url)} alt={project.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center font-heading font-black text-4xl text-primary">
                  {project.name[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tighter" data-testid="project-name">{project.name}</h1>
              <p className="text-muted-foreground text-lg mt-2">{project.tagline}</p>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {project.category && <Badge variant="outline" className="rounded-sm">{project.category}</Badge>}
                {(project.tags || []).map((t) => (
                  <Badge key={t} variant="outline" className="rounded-sm text-muted-foreground">{t}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <a href={project.website_url} target="_blank" rel="noreferrer">
                  <Button data-testid="visit-website-button" className="bg-primary hover:bg-primary/90 text-white rounded-sm gap-2">
                    Visit website <ArrowSquareOut size={16} weight="bold" />
                  </Button>
                </a>
                <button
                  onClick={onUpvote}
                  data-testid="detail-upvote-button"
                  className={`inline-flex items-center gap-2 px-5 h-10 border rounded-sm active:scale-95 transition-all ${
                    hasUp ? "bg-primary text-white border-primary" : "border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  <ArrowUp size={16} weight="bold" /> Upvote · {upCount}
                </button>
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="rounded-sm gap-2">
                        <GithubLogo size={16} weight="bold" /> GitHub
                      </Button>
                    </a>
                  )}
                  {user && (user._id === project.makerId || user.id === project.maker_id) && (
                    <Button variant="outline" className="rounded-sm gap-2" data-testid="edit-project-button">
                      <PencilSimple size={16} /> Edit
                    </Button>
                  )}
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="grid lg:grid-cols-3 gap-8 mt-16">
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h2 className="font-heading font-bold text-2xl mb-4">About</h2>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{project.description}</p>
              </section>

              {project.video_url && (
                <section>
                  <h2 className="font-heading font-bold text-2xl mb-4 flex items-center gap-2">
                    <Monitor size={22} /> Video Preview
                  </h2>
                  <div className="border border-border overflow-hidden">
                    <video src={project.video_url} controls className="w-full max-h-[500px]" poster={project.screenshots?.[0] || project.cover_image_url}>
                      Your browser doesn't support video playback.
                    </video>
                  </div>
                </section>
              )}

              {project.screenshots && project.screenshots.length > 0 && (
                <section>
                  <h2 className="font-heading font-bold text-2xl mb-4 flex items-center gap-2">
                    <Monitor size={22} /> Screenshots
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.screenshots.map((s, i) => (
                      <a key={i} href={fileUrl(s)} target="_blank" rel="noreferrer" className="block border border-border overflow-hidden group">
                        <img src={fileUrl(s)} alt={`${project.name} screenshot ${i + 1}`} className="w-full h-64 object-cover object-top group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {project.tech_stack?.length > 0 && (
                <section>
                  <h2 className="font-heading font-bold text-2xl mb-4">Tech stack</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {project.tech_stack.map((t) => (
                      <div key={t} className="p-3 border border-border bg-secondary/40 text-sm font-medium" data-testid={`tech-${t}`}>
                        {t}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section data-testid="comments-section">
                <h2 className="font-heading font-bold text-2xl mb-4">Discussion · {comments.length}</h2>
                {user ? (
                  <form onSubmit={onComment} className="mb-6">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="rounded-sm border-border min-h-24"
                      data-testid="comment-input"
                    />
                    <div className="flex justify-end mt-2">
                      <Button type="submit" disabled={posting || !comment.trim()} data-testid="post-comment-button" className="bg-primary hover:bg-primary/90 rounded-sm">
                        {posting ? "Posting..." : "Post comment"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 border border-border bg-secondary/40 mb-6 text-sm">
                    <Link to="/login" className="text-primary font-medium">Sign in</Link> to join the discussion.
                  </div>
                )}

                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No comments yet. Be the first.</p>
                  ) : comments.map((c) => (
                    <div key={c.id} className="flex gap-3 p-4 border border-border" data-testid={`comment-${c.id}`}>
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage src={fileUrl(c.author?.avatar_url)} />
                        <AvatarFallback className="bg-foreground text-background text-xs font-semibold">
                          {(c.author?.name || "U")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold">{c.author?.name || "User"}</span>
                          <span className="text-muted-foreground text-xs">@{c.author?.username}</span>
                        </div>
                        <p className="text-foreground/90 text-sm mt-1 whitespace-pre-wrap">{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <div className="border border-border p-5">
                <div className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-4">Maker</div>
                <Link to={`/u/${maker?.username}`} className="flex items-center gap-3 group">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={fileUrl(maker?.avatar_url)} />
                    <AvatarFallback className="bg-foreground text-background font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-semibold group-hover:text-primary">{maker?.name}</div>
                    <div className="text-xs text-muted-foreground">@{maker?.username}</div>
                  </div>
                </Link>
                {maker?.bio && <p className="text-sm text-muted-foreground mt-4">{maker.bio}</p>}
                <div className="flex gap-2 mt-4">
                  {maker?.twitter && <a href={`https://twitter.com/${maker.twitter}`} target="_blank" rel="noreferrer" className="w-8 h-8 border border-border flex items-center justify-center hover:border-primary hover:text-primary"><TwitterLogo size={14} /></a>}
                  {maker?.github && <a href={`https://github.com/${maker.github}`} target="_blank" rel="noreferrer" className="w-8 h-8 border border-border flex items-center justify-center hover:border-primary hover:text-primary"><GithubLogo size={14} /></a>}
                  {maker?.website && <a href={maker.website} target="_blank" rel="noreferrer" className="w-8 h-8 border border-border flex items-center justify-center hover:border-primary hover:text-primary"><Globe size={14} /></a>}
                </div>
              </div>

              <div className="border border-border p-5">
                <div className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-4">Stats</div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="flex items-center gap-2 text-muted-foreground"><ArrowUp size={14} /> Upvotes</span><span className="font-heading font-bold">{upCount}</span></div>
                  <div className="flex justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Eye size={14} /> Views</span><span className="font-heading font-bold">{project.views_count}</span></div>
                  <div className="flex justify-between"><span className="flex items-center gap-2 text-muted-foreground"><ChatCircle size={14} /> Comments</span><span className="font-heading font-bold">{project.comments_count}</span></div>
                  <div className="pt-3 border-t border-border flex justify-between">
                    <span className="text-muted-foreground">Combined score</span>
                    <span className="font-heading font-black text-primary">{project.score}</span>
                  </div>
                </div>
              </div>

              <div className="border border-border p-5">
                <div className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-4">Share</div>
                <div className="flex gap-2">
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(project.name + " - " + project.tagline)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" className="w-9 h-9 border border-border flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-colors" title="Share on X/Twitter"><TwitterLogo size={16} weight="fill" /></a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" className="w-9 h-9 border border-border flex items-center justify-center hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors" title="Share on LinkedIn"><LinkedinLogo size={16} weight="fill" /></a>
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }} className="w-9 h-9 border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors" title="Copy link"><LinkSimple size={16} /></button>
                </div>
              </div>
            </aside>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
