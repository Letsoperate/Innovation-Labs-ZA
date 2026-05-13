import InfoPage from "../components/InfoPage";
import { Toolbox } from "@phosphor-icons/react";

export default function FreeToolsPage() {
  return (
    <InfoPage
      icon={Toolbox}
      title="Free Tools"
      description="A curated directory of free developer tools and utilities for indie hackers."
      sections={[
        { heading: "Developer Utilities", content: "Free tools for every stage of development — from code editors and design tools to deployment platforms and monitoring. All listed tools are free or offer generous free tiers for makers." },
        { heading: "Student Benefits", content: "Students get access to premium tools for free through GitHub Student Pack, AWS Educate, JetBrains Education, and many more. Browse the Student Benefits section on the homepage for details." },
      ]}
      links={[{ to: "/discover?category=developer-tools", label: "Browse Developer Tools" }]}
    />
  );
}
