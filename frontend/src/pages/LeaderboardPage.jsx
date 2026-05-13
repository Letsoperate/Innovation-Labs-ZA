import { FadeIn } from "../components/Motion";
import Leaderboard from "../components/Leaderboard";

export default function LeaderboardPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <Leaderboard defaultPeriod="all" limit={50} />
        </FadeIn>
      </div>
    </div>
  );
}
