import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import CreateSessionPage from "./pages/CreateSessionPage";
import SessionDetailPage from "./pages/SessionDetailPage";
import ResourcesPage from "./pages/ResourcesPage";
import CodingLabPage from "./pages/CodingLabPage";
import MockRoomsPage from "./pages/MockRoomsPage";
import MockRoomDetailPage from "./pages/MockRoomDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/app" replace /> : <LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="sessions/new" element={<CreateSessionPage />} />
        <Route path="sessions/:sessionId" element={<SessionDetailPage />} />
        <Route path="coding-lab" element={<CodingLabPage />} />
        <Route path="mock-rooms" element={<MockRoomsPage />} />
        <Route path="mock-rooms/:roomCode" element={<MockRoomDetailPage />} />
        <Route path="resources" element={<ResourcesPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
