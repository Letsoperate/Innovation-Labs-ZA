import InfoPage from "../components/InfoPage";
import { CurrencyDollar } from "@phosphor-icons/react";

export default function PricingPage() {
  return (
    <InfoPage
      icon={CurrencyDollar}
      title="Pricing"
      description="Innovation Lab ZA is free — forever — for makers."
      sections={[
        { heading: "Free for Makers", content: "Submit projects, get upvoted, rank on the leaderboard, comment — all free. No hidden fees. No paywalls. Just build and get discovered." },
        { heading: "For Sponsors", content: "Interested in sponsoring a hackathon or featured placement? Reach out at admin@innovationlabza.dev for partnership opportunities." },
      ]}
    />
  );
}
