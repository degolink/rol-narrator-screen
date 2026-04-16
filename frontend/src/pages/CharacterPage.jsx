import { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CharacterForm } from '../components/CharacterForm';
import { useCharacter } from '../hooks/characters/useCharacter';
import { LoadingScreen } from '../components/LoadingScreen';
import { useUser } from '../context/UserContext';
import { Button } from '@/components/ui/button';

export function CharacterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDungeonMaster, activeCharacter, setActiveCharacter } = useUser();
  const { loading, character } = useCharacter(id);

  const isNew = id === 'nuevo';
  const backPath = isDungeonMaster ? '/narrador' : '/personajes';

  const handleClose = useCallback(
    async (newChar) => {
      // Auto-select if no active character and this is not a DM
      if (isNew && newChar?.id && !isDungeonMaster && !activeCharacter) {
        await setActiveCharacter(newChar.id);
      }

      // If we just created a character, we might want to go to their new page or back to list
      if (isNew && newChar?.id) {
        navigate(`/personaje/${newChar.id}`, { replace: true });
      } else {
        navigate(-1);
      }
    },
    [isNew, isDungeonMaster, activeCharacter, setActiveCharacter, navigate],
  );

  useEffect(() => {
    if (!loading && !isNew && !character) {
      navigate('/', { replace: true });
    }
  }, [loading, isNew, character, navigate]);

  if (loading || (!isNew && !character)) {
    return <LoadingScreen message="Cargando detalles..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(backPath)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-300">
              {isNew ? 'Nuevo Personaje' : character.name}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {isNew ? 'Forja una nueva leyenda' : 'Hoja de Personaje'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 sm:p-6">
        <CharacterForm character={character} close={handleClose} />
      </div>
    </div>
  );
}
