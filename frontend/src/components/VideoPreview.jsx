import { useState } from "react";
import api from "../lib/api";
import { VideoCamera, Spinner, ImageSquare } from "@phosphor-icons/react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export default function VideoPreview({ project, onVideoGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  const screenshots = (() => {
    try {
      const raw = project.screenshots || project._screenshots_raw;
      if (typeof raw === "string") return JSON.parse(raw);
      if (Array.isArray(raw)) return raw;
    } catch {}
    return [];
  })();

  const generate = async () => {
    if (!project.website_url) return;
    setGenerating(true);
    try {
      const { data } = await api.post("/generate-video", { url: project.website_url, project_id: project.id || project._id });
      if (data.ok && data.video_url) {
        toast.success("Video generated!");
        onVideoGenerated?.(data.video_url);
      } else {
        toast.success("Opening preview generator...");
        window.open(`https://urltovideo.com?url=${encodeURIComponent(project.website_url)}`, "_blank");
      }
    } catch {
      window.open(`https://urltovideo.com?url=${encodeURIComponent(project.website_url)}`, "_blank");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section>
      <h2 className="font-heading font-bold text-2xl mb-4 flex items-center gap-2">
        <VideoCamera size={22} /> Preview
      </h2>

      {project.video_url ? (
        <div className="border border-border overflow-hidden rounded-xl">
          <video src={project.video_url} controls className="w-full max-h-[500px]" poster={screenshots[0] || ""}>
            Your browser doesn't support video playback.
          </video>
        </div>
      ) : screenshots.length > 0 ? (
        <div className="space-y-3">
          <div className="border border-border overflow-hidden rounded-xl bg-secondary/20">
            <img src={screenshots[activeScreenshot]} alt={`Screenshot ${activeScreenshot + 1}`} className="w-full max-h-[500px] object-contain" />
          </div>
          {screenshots.length > 1 && (
            <div className="flex justify-center gap-2">
              {screenshots.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveScreenshot(i)}
                  className={`w-16 h-10 rounded-lg border overflow-hidden transition-all ${i === activeScreenshot ? "border-primary ring-1 ring-primary" : "border-border hover:border-foreground/40"}`}
                >
                  <img src={s} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <span className="flex items-center gap-1"><ImageSquare size={12} /> {screenshots.length} screenshot{screenshots.length > 1 ? "s" : ""}</span>
            <button onClick={generate} disabled={generating} className="text-primary hover:underline font-medium flex items-center gap-1">
              {generating ? <><Spinner size={12} className="animate-spin" /> Generating...</> : <><VideoCamera size={12} /> Generate video</>}
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-xl p-8 text-center bg-secondary/20">
          <VideoCamera size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="font-semibold text-sm mb-1">No preview yet</p>
          <p className="text-xs text-muted-foreground mb-4">Upload screenshots or generate a video preview.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={generate} disabled={generating} className="bg-primary hover:bg-primary/90 rounded-full gap-2 text-sm">
              {generating ? "Generating..." : <><VideoCamera size={16} weight="fill" /> Generate Video</>}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Opens <a href="https://urltovideo.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">urltovideo.com</a> to create a video. Paste the link in Edit modal to save.
          </p>
        </div>
      )}
    </section>
  );
}
