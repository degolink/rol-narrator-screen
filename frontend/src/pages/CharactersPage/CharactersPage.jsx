import React from 'react';
import { useCharacters } from '../../hooks/characters/useCharacters';
import { useUser } from '../../context/UserContext';
import { CharacterCardsSection } from './CharacterCardsSection';
import { Header } from '../../components/Header';
import { LoadingScreen } from '../../components/LoadingScreen';

export function CharactersPage() {
  const { user } = useUser();
  const { characters, loading } = useCharacters();

  if (loading) {
    return <LoadingScreen fullScreen={false} className="min-h-[50vh]" />;
  }

  const myCharacters = characters.filter(
    (c) => c.player === user?.id && !c.npc,
  );
  const otherPublicCharacters = characters.filter(
    (c) => c.player !== user?.id && !c.npc,
  );
  const npcs = characters.filter((c) => c.npc);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <Header
        title="Personajes"
        description="Explora los héroes y entidades de este mundo."
      />

      <div className="space-y-16">
        <CharacterCardsSection
          title="Mis Personajes"
          characters={myCharacters}
          variant="mine"
          isMine
        />

        <CharacterCardsSection
          title="Héroes del Reino"
          characters={otherPublicCharacters}
          emptyMessage="No hay otros héroes públicos actualmente."
        />

        <CharacterCardsSection
          title="Habitantes y Entidades"
          characters={npcs}
          variant="npc"
        />

        {/* TODO: Create new character page */}
        {/* <div>
          <Button onClick={() => navigate('/characters/new')}>
            <Plus className="w-5 h-5" />
            <span>Crear Nuevo Personaje</span>
          </Button>
        </div> */}
      </div>
    </div>
  );
}
