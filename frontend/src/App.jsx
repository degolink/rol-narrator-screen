import NarratorDashboard from './components/NarratorDashboard'
import './index.css' // We rely on index.css for tailwind

function App() {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen text-gray-100 font-sans">
      <NarratorDashboard />
    </div>
  )
}

export default App
