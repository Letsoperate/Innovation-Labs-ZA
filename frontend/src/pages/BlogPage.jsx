import InfoPage from "../components/InfoPage";
import { Note } from "@phosphor-icons/react";

export default function BlogPage() {
  return (
    <InfoPage
      icon={Note}
      title="Blog"
      description="Articles, guides, and stories from the Innovation Lab ZA community."
      sections={[
        { heading: "Latest Posts", content: "Stay tuned for articles on indie hacking, building in public, tech stack decisions, and lessons learned from real projects. Our blog is written by makers, for makers." },
        { heading: "Write for Us", content: "Share your journey, teach what you've learned, or showcase your tech stack. We welcome guest posts from the community. Reach out to admin@innovationlabza.dev to contribute." },
      ]}
      links={[{ to: "/hall-of-fame", label: "Hall of Fame" }]}
    />
  );
}
