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

        <div className="flex justify-center pt-8">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="bg-purple-900 hover:bg-purple-700 text-white">
                <Plus className="mr-2 h-5 w-5" /> Nuevo Personaje
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full data-[side=right]:sm:max-w-xl bg-[#101014] border-l border-border text-white overflow-y-auto p-0 flex flex-col">
              <SheetHeader className="p-6 pb-4 border-b border-border sticky top-0 bg-[#101014] z-10 flex flex-row items-center justify-between space-y-0">
                <div>
                  <SheetTitle className="text-xl font-black text-white uppercase italic tracking-tighter">
                    Nuevo Héroe
                  </SheetTitle>
                  <SheetDescription className="text-gray-500 text-xs">
                    Define la identidad y rasgos de tu personaje.
                  </SheetDescription>
                </div>
              </SheetHeader>
              <div className="flex-1 p-6">
                <CharacterForm
                  close={(newChar) => {
                    setIsSheetOpen(false);
                    handleCreated(newChar);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
