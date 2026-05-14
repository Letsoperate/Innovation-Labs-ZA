import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/index.css";

import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import DiscoverPage from "./pages/DiscoverPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import CategoriesPage from "./pages/CategoriesPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import HallOfFamePage from "./pages/HallOfFamePage";
import SubmitProjectPage from "./pages/SubmitProjectPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import BuildersPage from "./pages/BuildersPage";
import ToolsPage from "./pages/ToolsPage";
import AlternativesPage from "./pages/AlternativesPage";
import BlogPage from "./pages/BlogPage";
import NewsletterPage from "./pages/NewsletterPage";
import CommunityPage from "./pages/CommunityPage";
import PricingPage from "./pages/PricingPage";
import PartnershipsPage from "./pages/PartnershipsPage";
import AffiliatesPage from "./pages/AffiliatesPage";
import FaqPage from "./pages/FaqPage";
import RulesPage from "./pages/RulesPage";
import ComingSoonPage from "./pages/ComingSoonPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/p/:slug" element={<ProjectDetailPage />} />
            <Route path="/u/:username" element={<ProfilePage />} />
            <Route path="/hall-of-fame" element={<HallOfFamePage />} />
            <Route path="/submit" element={<SubmitProjectPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/builders" element={<BuildersPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/alternatives" element={<AlternativesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/newsletter" element={<NewsletterPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/partnerships" element={<PartnershipsPage />} />
            <Route path="/affiliates" element={<AffiliatesPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/platforms" element={<ComingSoonPage title="Platforms" description="Browse tools by platform — Web, API, CLI, and Mobile. Coming soon." />} />
            <Route path="/free-tools" element={<ComingSoonPage title="Free Tools" description="Curated free developer tools and utilities. Coming soon." />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
