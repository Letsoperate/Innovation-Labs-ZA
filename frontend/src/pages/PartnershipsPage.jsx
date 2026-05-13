import InfoPage from "../components/InfoPage";
import { Handshake } from "@phosphor-icons/react";

export default function PartnershipsPage() {
  return (
    <InfoPage
      icon={Handshake}
      title="Partnerships"
      description="Work with Innovation Lab ZA to reach thousands of indie makers and students."
      sections={[
        { heading: "Partner With Us", content: "Reach the South African indie maker community. Sponsor hackathons, feature your tools, or co-host events. We're open to partnerships that benefit the community." },
        { heading: "Current Partners", content: "We're actively building our partner network. If you represent a tool, platform, or organization that serves indie developers, let's talk." },
      ]}
    />
  );
}
