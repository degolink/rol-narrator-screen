import { Link } from 'react-router-dom';
import { BookOpen, Users } from 'lucide-react';

export function Home() {
  return (
    <div className="max-w-4xl mx-auto mt-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
          Bienvenido a la Pantalla del Narrador
        </h1>
        <p className="text-xl text-gray-400">
          Gestiona tus personajes y narra tus campañas con facilidad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link
          to="/narrador"
          className="group relative bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-indigo-500 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <BookOpen className="w-12 h-12 text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-300" />
          <h2 className="text-2xl font-bold text-gray-100 mb-3">Pantalla del Narrador</h2>
          <p className="text-gray-400">
            Accede a la pantalla principal del narrador para gestionar el flujo del juego, ver a los jugadores y controlar la historia.
          </p>
        </Link>

        <Link
          to="/personajes"
          className="group relative bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Users className="w-12 h-12 text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300" />
          <h2 className="text-2xl font-bold text-gray-100 mb-3">Personajes</h2>
          <p className="text-gray-400">
            Crea, visualiza y gestiona los personajes de los jugadores. Lleva un registro de las estadísticas, el inventario y la progresión.
          </p>
        </Link>
      </div>
    </div>
  );
}
