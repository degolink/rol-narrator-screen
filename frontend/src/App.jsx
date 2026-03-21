import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NarratorDashboard } from './components/NarratorDashboard';
import { NavBar } from './components/NavBar';
import { Home } from './pages/Home';
import { Characters } from './pages/Characters';
import { CharacterDetail } from './pages/CharacterDetail';
import { Toaster } from "./components/ui/sonner";

export function App() {
  return (
    <Router>
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen text-gray-100 font-sans flex flex-col">
        <NavBar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/narrador" element={<NarratorDashboard />} />
            <Route path="/personajes" element={<Characters />} />
            <Route path="/personaje/:id" element={<CharacterDetail />} />
          </Routes>
        </main>

        <Toaster richColors position="top-right" />
      </div>
    </Router>
  );
}
