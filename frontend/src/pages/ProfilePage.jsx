import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import { api } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { cn } from '@/lib/cn';

export function ProfilePage() {
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const [user, setUser] = useState(authUser || authService.getCurrentUser());
  const [allCharacters, setAllCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingRole, setTogglingRole] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');

  const isDungeonMaster = user?.profile?.is_dungeon_master;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, charsData] = await Promise.all([
          authService.getProfile(),
          api.get('/characters/?visible=true'),
        ]);
        setUser(profileData);
        setAllCharacters(charsData.data);

        setUsername(profileData.username);
        setEmail(profileData.email);
      } catch {
        toast.error('Error al cargar datos del perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await authService.updateProfile({
        username,
        email,
      });
      setUser(updatedUser);
      setAuthUser(updatedUser);
      toast.success('Perfil actualizado correctamente');
    } catch {
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDungeonMaster = async (checked) => {
    setTogglingRole(true);
    try {
      const updatedUser = await authService.updateProfile({
        is_dungeon_master: checked,
      });
      setUser(updatedUser);
      setAuthUser(updatedUser);

      // Refresh characters list since some might have been unassigned if user became DM
      const charsData = await api.get('/characters/?visible=true');
      setAllCharacters(charsData.data);

      toast.success(
        checked
          ? 'Ahora eres Dungeon Master'
          : 'Has dejado el rol de Dungeon Master',
      );
    } catch {
      toast.error('Error al cambiar de rol');
    } finally {
      setTogglingRole(false);
    }
  };

  const handleAssignCharacter = async (charId) => {
    try {
      await authService.assignCharacter(charId);
      toast.success('Personaje reclamado correctamente');

      // Refresh user and characters to update assignments
      const [profileData, charsData] = await Promise.all([
        authService.getProfile(),
        api.get('/characters/?visible=true'),
      ]);
      setUser(profileData);
      setAuthUser(profileData);
      setAllCharacters(charsData.data);
    } catch {
      toast.error('Error al reclamar el personaje');
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 w-full max-w-4xl mx-auto pb-20">
      <div className="space-y-10">
        {/* Header */}
        <Header 
          title="MI PERFIL" 
          description="Gestiona tu identidad y tus roles en la plataforma." 
        />

        <div className="space-y-10">
          {/* Section 1: User Data */}
          <Card className="bg-gray-800/50 border-gray-700 shadow-xl shadow-black/20">
            <CardHeader>
              <CardTitle className="text-xl uppercase tracking-wider flex items-center gap-2 text-gray-100">
                <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span>
                Datos Personales
              </CardTitle>
              <CardDescription className="text-gray-400">
                Información fundamental de tu cuenta de usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleUpdateProfile}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">Nombre de Usuario</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tu nombre de héroe"
                    className="bg-gray-900/50 border-gray-700 focus:border-purple-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="bg-gray-900/50 border-gray-700 focus:border-purple-500/50 transition-colors"
                  />
                </div>
                <div className="md:col-span-2 pt-2">
                  <Button
                    type="submit"
                    className="w-full md:w-auto px-12 bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20"
                    disabled={saving}
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Section 2: Role Selection */}
          <Card
            className={cn(
              'shadow-xl shadow-black/20 transition-all duration-300 bg-gray-800/50',
              isDungeonMaster
                ? 'border-destructive/50 bg-destructive/5'
                : 'border-gray-700',
            )}
          >
            <CardHeader>
              <CardTitle
                className={cn(
                  'text-xl uppercase tracking-wider flex items-center gap-2 text-gray-100',
                  isDungeonMaster && 'text-destructive italic',
                )}
              >
                <span
                  className={cn(
                    'w-1.5 h-6 rounded-full',
                    isDungeonMaster ? 'bg-destructive' : 'bg-purple-600',
                  )}
                ></span>
                Rol de Usuario
              </CardTitle>
              <CardDescription className="text-gray-400">
                Los Dungeon Masters tienen control total sobre la narrativa,
                mientras que los jugadores gestionan sus propios personajes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-6 bg-gray-900/40 rounded-2xl border-2 border-dashed border-gray-700/50">
                <div className="space-y-1">
                  <Label className="text-lg font-bold text-gray-200">
                    Modo Dungeon Master
                  </Label>
                  <p className="text-sm text-gray-400 max-w-md">
                    Al activar este modo, dejas de ser un jugador y te
                    conviertes en el narrador.
                    <span className="font-bold text-destructive block mt-1 underline decoration-destructive/30 underline-offset-4 italic">
                      ¡Atención! Se desvincularán todos tus personajes actuales
                      al cambiar de rol.
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Switch
                    checked={isDungeonMaster}
                    onCheckedChange={handleToggleDungeonMaster}
                    disabled={togglingRole}
                    className="data-[state=checked]:bg-destructive"
                  />
                  <span
                    className={cn(
                      'text-[10px] font-black uppercase tracking-tighter',
                      isDungeonMaster
                        ? 'text-destructive'
                        : 'text-muted-foreground',
                    )}
                  >
                    {isDungeonMaster ? 'Activado' : 'Desactivado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Character Selection (Conditional) */}
          {!isDungeonMaster && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-1 px-1">
                <h2 className="text-2xl font-bold tracking-tight uppercase flex items-center gap-3 text-gray-100">
                  <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm font-black">
                    ?
                  </span>
                  Tus Personajes
                </h2>
                <p className="text-gray-400">
                  Como jugador regular, selecciona los personajes que deseas
                  encarnar en esta aventura.
                </p>
              </div>

              <Card className="overflow-hidden shadow-xl shadow-black/20 border-purple-500/20 bg-purple-900/10">
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px] w-full p-4">
                    <div className="grid gap-4">
                      {allCharacters
                        .filter((c) => !c.npc)
                        .map((char) => {
                          const isAssignedToMe = char.player === user.id;
                          const isAssignedToOther =
                            char.player && char.player !== user.id;

                          return (
                            <div
                              key={char.id}
                              className={cn(
                                'flex items-center justify-between p-5 rounded-2xl border transition-all group',
                                isAssignedToMe
                                  ? 'bg-purple-500/20 border-purple-500/40 shadow-lg shadow-purple-900/20'
                                  : 'bg-gray-900/40 border-gray-700/50 hover:bg-gray-800/60 hover:border-purple-500/30',
                              )}
                            >
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-xl leading-tight tracking-tight text-gray-100">
                                    {char.name}
                                  </span>
                                  {isAssignedToMe && (
                                    <Badge className="bg-purple-600 text-white border-0 hover:bg-purple-700 px-3">
                                      Tu Héroe
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] font-bold uppercase tracking-widest py-0 border-gray-700 text-gray-400"
                                  >
                                    {char.char_class}
                                  </Badge>
                                  <div className="w-1 h-1 rounded-full bg-muted-foreground/30"></div>
                                  <span className="text-xs text-muted-foreground font-medium italic">
                                    {char.race}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {isAssignedToMe ? (
                                  <div
                                    className="flex flex-col items-end gap-1 cursor-pointer hover:opacity-70 transition-opacity"
                                    onClick={() =>
                                      handleAssignCharacter(char.id)
                                    }
                                  >
                                    <Badge
                                      variant="outline"
                                      className="text-purple-400 border-purple-500/30 bg-purple-500/5"
                                    >
                                      Asignado
                                    </Badge>
                                    <span className="text-[10px] text-gray-500 font-bold tracking-tighter uppercase">
                                      Clic para liberar
                                    </span>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant={
                                      isAssignedToOther
                                        ? 'secondary'
                                        : 'default'
                                    }
                                    onClick={() =>
                                      handleAssignCharacter(char.id)
                                    }
                                    className={cn(
                                      'font-black rounded-lg px-6',
                                      isAssignedToOther
                                        ? 'bg-gray-800 text-gray-600 border-gray-700'
                                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40',
                                    )}
                                  >
                                    {isAssignedToOther
                                      ? 'Arrebatar'
                                      : 'Reclamar'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="bg-gray-900/50 p-6 border-t border-gray-800 flex flex-col md:flex-row items-center gap-4">
                  <p className="text-xs text-gray-500 text-center md:text-left md:flex-1">
                    Solo puedes jugar con personajes que hayas reclamado en esta
                    lista.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full md:w-auto font-bold border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                    onClick={() => navigate('/personajes')}
                  >
                    Ver Todos los Personajes
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {isDungeonMaster && (
            <div className="p-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center space-y-4 bg-muted/5 animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center text-3xl">
                ⚔️
              </div>
              <div className="max-w-xs space-y-2">
                <h3 className="text-xl font-bold tracking-tight">
                  Modo Maestro Activo
                </h3>
                <p className="text-sm text-muted-foreground italic">
                  Como Dungeon Master, controlas la realidad entera. Los
                  aventureros individuales han sido ocultados de tu perfil
                  personal.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-destructive/20 text-destructive hover:bg-destructive/10"
                onClick={() => handleToggleDungeonMaster(false)}
              >
                Volver a ser Jugador
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 bg-[#121214]/90 backdrop-blur-xl border border-white/5 shadow-2xl rounded-2xl p-2 flex justify-around items-center z-50 animate-in slide-in-from-bottom-12 duration-700">
        <Button
          variant="ghost"
          className="text-xs uppercase font-black"
          onClick={() => navigate('/personajes')}
        >
          Explorar
        </Button>
        <div className="w-1 h-8 rounded-full bg-border"></div>
        {isDungeonMaster ? (
          <Button
            variant="ghost"
            className="text-xs uppercase font-black text-destructive"
            onClick={() => navigate('/narrador')}
          >
            Maestro
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="text-xs uppercase font-black text-primary"
            onClick={() => navigate('/')}
          >
            Inicio
          </Button>
        )}
      </div>
    </div>
  );
}
