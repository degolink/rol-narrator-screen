import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NarratorDashboard } from './pages/NarratorDashboard/NarratorDashboard';
import { CharacterDetail } from './pages/CharacterDetail';
import { CharactersPage } from './pages/CharactersPage/CharactersPage';
import { LoginPage } from './pages/LoginPage';
import { VerifyPage } from './pages/VerifyPage';
import { ProfilePage } from './pages/ProfilePage';
import { HomePage } from './pages/HomePage';
import { NavBar } from './components/NavBar';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ChatWidget } from './components/ChatWidget';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';


function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-[#0a0a0c] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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
              path="/personaje/:id"
              element={
                <ProtectedRoute>
                  <CharacterDetail />
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
