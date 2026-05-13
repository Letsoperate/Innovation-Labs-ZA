import InfoPage from "../components/InfoPage";
import { ArrowsLeftRight } from "@phosphor-icons/react";

export default function AlternativesPage() {
  return (
    <InfoPage
      icon={ArrowsLeftRight}
      title="Alternatives"
      description="Compare tools and find alternatives. Discover what other indie makers are switching to."
      sections={[
        { heading: "Compare & Switch", content: "Looking for an alternative to a popular tool? Browse projects tagged with alternative or replacement tags. See what the community is using and why they switched. Real feedback from real makers." },
        { heading: "Why Makers Switch", content: "Read project descriptions and comments to understand the trade-offs. Cost, DX, performance, community — makers share their honest experiences with both mainstream and alternative tools." },
      ]}
      links={[{ to: "/discover?q=alternative", label: "Find Alternatives" }]}
    />
  );
}
