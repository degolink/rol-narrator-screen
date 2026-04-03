import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NarratorDashboard } from './pages/NarratorDashboard/NarratorDashboard';
import { CharacterDetailsPage } from './pages/CharacterDetailsPage';
import { CharactersPage } from './pages/CharactersPage/CharactersPage';
import { LoginPage } from './pages/LoginPage';
import { VerifyPage } from './pages/VerifyPage';
import { ProfilePage } from './pages/ProfilePage';
import { RecorderPage } from './pages/RecorderPage';
import { HomePage } from './pages/HomePage';
import { NavBar } from './components/NavBar';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ChatWidget } from './components/ChatWidget';
import { UserContextProvider } from './context/UserContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useUser } from './context/UserContext';
import { LoadingScreen } from './components/LoadingScreen';

function AppContent() {
  const { user, loading } = useUser();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="bg-[#0a0a0c] min-h-screen text-gray-100 font-sans flex flex-col">
      {user && <NavBar />}

      <TooltipProvider>
        <main className="flex-1">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify" element={<VerifyPage />} />

            <Route path="/" element={<HomePage />} />

            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/narrador"
              element={
                <ProtectedRoute>
                  <NarratorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/personajes"
              element={
                <ProtectedRoute>
                  <CharactersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/grabadora"
              element={
                <ProtectedRoute>
                  <RecorderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/personaje/:id"
              element={
                <ProtectedRoute>
                  <CharacterDetailsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </TooltipProvider>

      <Toaster richColors position="top-right" />

      {!!user && <ChatWidget />}
    </div>
  );
}

export function App() {
  return (
    <Router>
      <UserContextProvider>
        <AppContent />
      </UserContextProvider>
    </Router>
  );
}
