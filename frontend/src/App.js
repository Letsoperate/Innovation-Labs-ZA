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
import SubmitProjectPage from "./pages/SubmitProjectPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";

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
            <Route path="/submit" element={<SubmitProjectPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
