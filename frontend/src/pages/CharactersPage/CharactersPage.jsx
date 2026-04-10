import React from 'react';
import { useCharacters } from '../../hooks/characters/useCharacters';
import { useUser } from '../../context/UserContext';
import { CharacterCardsSection } from './CharacterCardsSection';
import { Header } from '../../components/Header';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CharacterForm } from '../../components/CharacterForm';

export function CharactersPage() {
  const { user, activeCharacter, setActiveCharacter } = useUser();
  const { characters, loading, refreshCharacters } = useCharacters();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleCreated = async (newChar) => {
    await refreshCharacters();
    // Auto-select if no active character
    if (!activeCharacter && newChar?.id) {
      await setActiveCharacter(newChar.id);
    }
  };

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

        {/* Creation UI */}
        <div className="flex justify-center pt-8">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                size="lg"
                className="bg-purple-900 hover:bg-purple-800 text-white rounded-full px-8 h-14 shadow-xl shadow-purple-900/20 group transition-all"
              >
                <Plus className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-lg font-bold">Crear Nuevo Personaje</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-[#101014] border-[#2d2d35] text-white w-full sm:max-w-xl overflow-y-auto">
              <SheetHeader className="mb-8">
                <SheetTitle className="text-2xl font-black text-white uppercase italic">
                  Nuevo Héroe
                </SheetTitle>
                <SheetDescription className="text-gray-500">
                  Define la identidad y los rasgos básicos de tu nuevo personaje.
                </SheetDescription>
              </SheetHeader>
              <CharacterForm
                close={(newChar) => {
                  setIsSheetOpen(false);
                  handleCreated(newChar);
                }}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
