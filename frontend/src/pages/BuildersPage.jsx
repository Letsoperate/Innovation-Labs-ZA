import InfoPage from "../components/InfoPage";
import { Users } from "@phosphor-icons/react";

export default function BuildersPage() {
  return (
    <InfoPage
      icon={Users}
      title="Builders"
      description="Meet the indie makers and students building the future of African tech."
      sections={[
        { heading: "Featured Makers", content: "Discover the top builders on Innovation Lab ZA. Browse their profiles, see their projects, and connect with fellow makers. Use the Discover page to find and filter builders by tech stack, category, and more." },
        { heading: "Become a Builder", content: "Create your maker profile, submit your projects, and join the community. Get on the leaderboard, earn badges, and get discovered by people who care about what you build." },
      ]}
      links={[{ to: "/discover", label: "Discover Makers" }, { to: "/register", label: "Join Now" }]}
    />
  );
}
