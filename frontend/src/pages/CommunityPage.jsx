import InfoPage from "../components/InfoPage";
import { Users } from "@phosphor-icons/react";

export default function CommunityPage() {
  return (
    <InfoPage
      icon={Users}
      title="Community"
      description="The heart of Innovation Lab ZA — makers supporting makers."
      sections={[
        { heading: "For Makers", content: "Innovation Lab ZA is built for indie hackers and students who ship projects and want sustained visibility. Upvote, comment, and connect with makers who understand what you're building." },
        { heading: "Code of Conduct", content: "Be kind. Give constructive feedback. Celebrate wins. We believe in building each other up. Read our Community Guidelines for the full code of conduct." },
      ]}
      links={[{ to: "/rules", label: "Community Guidelines" }, { to: "/builders", label: "Meet the Makers" }]}
    />
  );
}
