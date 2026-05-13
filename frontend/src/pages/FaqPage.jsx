import InfoPage from "../components/InfoPage";
import { Question } from "@phosphor-icons/react";

export default function FaqPage() {
  return (
    <InfoPage
      icon={Question}
      title="FAQ"
      description="Common questions about Innovation Lab ZA."
      sections={[
        { heading: "Is it free?", content: "Yes! Submitting projects, upvoting, commenting — everything is free. We believe maker discovery should be accessible to everyone." },
        { heading: "How does the leaderboard work?", content: "Projects are ranked by a combined score: upvotes × 3 + views + comments × 2 + bookmarks × 2. The leaderboard resets weekly and monthly, with an all-time view available." },
        { heading: "Can I submit any project?", content: "Yes! Whether it's a side project, startup, open-source tool, or student project — if you built it, you can share it. Community guidelines apply." },
        { heading: "How do badges work?", content: "Badges are automatically awarded. Top 3 projects get crown badges. Projects with 200+ score get HOT, 100+ get RISING, new projects (< 3 days) get NEW, and fast-growing projects get FAST GROWING." },
      ]}
      links={[{ to: "/rules", label: "Community Guidelines" }]}
    />
  );
}
