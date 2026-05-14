import { useState } from "react";
import api from "../lib/api";
import { ArrowUp, ArrowDown, ChatCircle, Hash } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function PostCard({ post, score, channels, onVote, load, user }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");

  const submitReply = async () => {
    if (!user) { toast.error("Sign in to comment"); return; }
    if (!replyText.trim()) return;
    try {
      await api.post(`/community/posts/${post._id}/comments`, { body: replyText });
      toast.success("Reply posted");
      setReplyText("");
      setShowReply(false);
      load();
    } catch { toast.error("Failed to post"); }
  };

  return (
    <div className="border border-border rounded-2xl p-4 hover:border-foreground/20 transition-colors bg-card">
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <button onClick={() => onVote(post._id, 1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-orange-100 hover:text-orange-500 transition-colors"><ArrowUp size={14} weight="bold" /></button>
          <span className={`text-xs font-bold ${score > 0 ? "text-orange-500" : score < 0 ? "text-blue-500" : "text-muted-foreground"}`}>{score}</span>
          <button onClick={() => onVote(post._id, -1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-100 hover:text-blue-500 transition-colors"><ArrowDown size={14} weight="bold" /></button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            {channels.find((c) => c.slug === post.channelSlug) && (
              <span className="inline-flex items-center gap-1 text-primary font-medium">
                <Hash size={10} /> {channels.find((c) => c.slug === post.channelSlug).name}
              </span>
            )}
          </div>
          <h3 className="font-heading font-bold text-base leading-tight">{post.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{post.body}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <button onClick={() => setShowReply(!showReply)} className="flex items-center gap-1 hover:text-foreground transition-colors">
              <ChatCircle size={12} /> {post.commentCount || 0} {showReply ? "Cancel" : "Reply"}
            </button>
          </div>
          {showReply && (
            <div className="mt-3 border-t border-border pt-3">
              <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." className="w-full min-h-16 p-3 border border-border rounded-xl text-sm bg-background resize-none" />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => { setShowReply(false); setReplyText(""); }} className="px-3 py-1.5 text-xs border border-border rounded-full hover:bg-secondary transition-colors">Cancel</button>
                <button onClick={submitReply} className="px-3 py-1.5 text-xs bg-primary text-white rounded-full hover:bg-primary/90 transition-colors">Post reply</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
