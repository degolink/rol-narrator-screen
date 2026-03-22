import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { NarratorDashboard } from './components/NarratorDashboard';
import { CharacterDetail } from './pages/CharacterDetail';
import { Characters } from './pages/Characters';
import { NavBar } from './components/NavBar';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import { ChatWidget } from './components/ChatWidget';
import { useChat } from './hooks/useChat';

export function App() {
  const { messages, handleNewUserMessage } = useChat();
  return (
    <Router>
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen text-gray-100 font-sans flex flex-col">
        <NavBar />

        <TooltipProvider>
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/narrador" element={<NarratorDashboard />} />
              <Route path="/personajes" element={<Characters />} />
              <Route path="/personaje/:id" element={<CharacterDetail />} />
            </Routes>
          </main>
        </TooltipProvider>

        <Toaster richColors position="top-right" />
        <ChatWidget
          onSendMessage={handleNewUserMessage}
          initialMessages={messages}
        />
      </div>
    </Router>
  );
}
