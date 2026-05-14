import { useState } from "react";
import api from "../lib/api";
import { VideoCamera, Spinner } from "@phosphor-icons/react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export default function VideoPreview({ project, onVideoGenerated }) {
  const [generating, setGenerating] = useState(false);

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
        <VideoCamera size={22} /> Video Preview
      </h2>
      {project.video_url ? (
        <div className="border border-border overflow-hidden rounded-xl">
          <video src={project.video_url} controls className="w-full max-h-[500px]" poster={project.screenshots?.[0] || ""}>
            Your browser doesn't support video playback.
          </video>
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-xl p-8 text-center bg-secondary/20">
          <VideoCamera size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="font-semibold text-sm mb-1">No video preview yet</p>
          <p className="text-xs text-muted-foreground mb-4">Generate a 5-second scrolling video of your website automatically.</p>
          <Button onClick={generate} disabled={generating} className="bg-primary hover:bg-primary/90 rounded-full gap-2">
            {generating ? "Generating..." : <>Generate Video Preview <VideoCamera size={16} weight="fill" /></>}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Opens <a href="https://urltovideo.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">urltovideo.com</a> to create the video. Paste the link back into the Edit modal to save it.
          </p>
        </div>
      )}
    </section>
  );
}
