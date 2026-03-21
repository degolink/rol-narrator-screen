import { useParams } from 'react-router-dom';

export function CharacterDetail() {
  const { id } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Detalles del Personaje</h1>
        <p className="text-gray-400 mt-2">Viendo el ID del personaje: <span className="text-indigo-400 font-mono">{id}</span></p>
      </div>
      
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
        <p className="text-gray-400 italic">La vista detallada del personaje se implementará aquí.</p>
      </div>
    </div>
  );
}
