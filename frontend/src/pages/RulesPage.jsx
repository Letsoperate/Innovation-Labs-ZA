import InfoPage from "../components/InfoPage";
import { Scales } from "@phosphor-icons/react";

export default function RulesPage() {
  return (
    <InfoPage
      icon={Scales}
      title="Community Guidelines"
      description="The rules that keep Innovation Lab ZA safe and valuable for everyone."
      sections={[
        { heading: "1. Be Respectful", content: "Treat all community members with respect. No harassment, hate speech, or personal attacks. Constructive criticism is welcome — toxic behavior is not." },
        { heading: "2. Original Work", content: "Only submit projects you've built or contributed to. Don't claim credit for others' work. Open-source and team projects are welcome." },
        { heading: "3. No Spam", content: "Don't submit duplicate projects, use bots to inflate votes/views, or post irrelevant content. We have view deduplication and vote protection in place." },
        { heading: "4. Accurate Information", content: "Your project name, description, and website URL should be accurate and up-to-date. Misleading content will be removed." },
        { heading: "5. Have Fun", content: "This is a community for makers. Ship cool stuff, celebrate wins, help others grow. The best way to get upvotes is to build something people love." },
      ]}
    />
  );
}
