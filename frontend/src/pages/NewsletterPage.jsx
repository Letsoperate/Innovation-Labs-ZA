import InfoPage from "../components/InfoPage";
import { Envelope } from "@phosphor-icons/react";

export default function NewsletterPage() {
  return (
    <InfoPage
      icon={Envelope}
      title="Newsletter"
      description="A weekly digest of the best projects, top makers, and community updates."
      sections={[
        { heading: "Weekly Digest", content: "Every Monday, get a curated list of the top 10 projects launched this week, rising makers, new tools added, and upcoming hackathon announcements. Stay in the loop without the noise." },
        { heading: "What's Inside", content: "Top projects by score · Rising Badges awarded · New categories added · Hackathon announcements · Student benefit highlights · Featured maker interviews" },
      ]}
      links={[{ to: "/hall-of-fame", label: "Hall of Fame" }]}
    />
  );
}
