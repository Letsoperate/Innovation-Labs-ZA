import InfoPage from "../components/InfoPage";
import { LinkSimple } from "@phosphor-icons/react";

export default function AffiliatesPage() {
  return (
    <InfoPage
      icon={LinkSimple}
      title="Affiliates"
      description="Earn commissions by referring makers to Innovation Lab ZA."
      sections={[
        { heading: "Coming Soon", content: "Our affiliate program is being built. Share your unique link, invite makers to the platform, and earn rewards when they submit projects that gain traction." },
      ]}
    />
  );
}
