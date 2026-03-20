import NarratorDashboard from './components/NarratorDashboard'
import { Toaster } from "@/components/ui/sonner"
import './index.css'

function App() {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen text-gray-100 font-sans">
      <NarratorDashboard />
      <Toaster richColors position="top-right" />
    </div>
  )
}

export default App
