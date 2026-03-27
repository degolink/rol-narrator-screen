import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import { api } from '../services/apiService';

export function ProfilePage() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [allCharacters, setAllCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isDungeonMaster, setIsDungeonMaster] = useState(
    user?.profile?.is_dungeon_master || false,
  );

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
        setIsDungeonMaster(profileData.profile?.is_dungeon_master);
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
        is_dungeon_master: isDungeonMaster,
      });
      setUser(updatedUser);
      toast.success('Perfil actualizado correctamente');
    } catch {
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignCharacter = async (charId) => {
    try {
      await authService.assignCharacter(charId);
      toast.success('Personaje asignado correctamente');
      // Refresh user data to update assigned characters count
      const updatedUser = await authService.getProfile();
      setUser(updatedUser);
    } catch {
      toast.error('Error al asignar el personaje');
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-inter p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#2d2d35] pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              MI PERFIL
            </h1>
            <p className="text-gray-500">
              Gestiona tu identidad y tus personajes
            </p>
          </div>
          <button
            onClick={() => authService.logout()}
            className="text-red-500 hover:text-red-400 font-bold text-sm tracking-widest uppercase"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Profile Form */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold border-l-4 border-blue-600 pl-4 uppercase tracking-widest">
              Datos Personales
            </h2>
            <form
              onSubmit={handleUpdateProfile}
              className="space-y-6 bg-[#16161a] p-8 rounded-2xl border border-[#2d2d35]"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Nombre de Usuario
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#1e1e24] border border-[#2d2d35] p-3 rounded-xl focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Correo Electrónico
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1e1e24] border border-[#2d2d35] p-3 rounded-xl focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>

            {/* Role Toggle */}
            <div className="bg-red-900/10 border border-red-900/30 p-8 rounded-2xl space-y-4">
              <h3 className="text-red-500 font-black tracking-tighter text-xl uppercase italic">
                Zona de Peligro: Rol de Usuario
              </h3>
              <p className="text-gray-400 text-sm">
                Cambiar a Dungeon Master te dará acceso total a la gestión del
                mundo, monstruos y personajes. Los jugadores normales no tienen
                acceso a estas herramientas.
              </p>
              <button
                onClick={() => setIsDungeonMaster(!isDungeonMaster)}
                className={`w-full p-4 rounded-xl font-black text-lg transition-all border-2 ${
                  isDungeonMaster
                    ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/20'
                    : 'bg-transparent border-red-900/50 text-red-500 hover:bg-red-900/20'
                }`}
              >
                {isDungeonMaster
                  ? 'ACTIVADO: DUNGEON MASTER'
                  : 'CONVERTIRSE EN DUNGEON MASTER'}
              </button>
              {isDungeonMaster !== user?.profile?.is_dungeon_master && (
                <p className="text-xs text-center text-yellow-500 animate-pulse">
                  Debes guardar los cambios arriba para aplicar el nuevo rol
                </p>
              )}
            </div>
          </div>

          {/* Characters Assignment */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold border-l-4 border-green-600 pl-4 uppercase tracking-widest">
              Asignar Personajes
            </h2>
            <p className="text-gray-500 text-sm">
              Selecciona de la lista de personajes públicos para asignarlos a tu
              cuenta.
            </p>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {allCharacters
                .filter((c) => !c.npc)
                .map((char) => {
                  const isAssignedToMe = char.player === user.id;
                  const isAssignedToOther =
                    char.player && char.player !== user.id;

                  return (
                    <div
                      key={char.id}
                      className="bg-[#16161a] border border-[#2d2d35] p-4 rounded-xl flex items-center justify-between group hover:border-gray-600 transition-all"
                    >
                      <div>
                        <h4 className="font-bold text-lg">{char.name}</h4>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">
                          {char.char_class} • {char.race}
                        </p>
                      </div>

                      {isAssignedToMe ? (
                        <span className="bg-green-600/20 text-green-500 text-xs font-black px-3 py-1 rounded-full border border-green-500/30 uppercase">
                          Asignado
                        </span>
                      ) : isAssignedToOther ? (
                        <span className="bg-gray-800 text-gray-600 text-xs font-black px-3 py-1 rounded-full uppercase">
                          Ocupado
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAssignCharacter(char.id)}
                          className="bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-600/30 px-6 py-2 rounded-lg text-sm font-bold transition-all"
                        >
                          Reclamar
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="pt-8">
              <button
                onClick={() => navigate('/personajes')}
                className="w-full bg-[#1e1e24] border border-[#2d2d35] p-4 rounded-xl text-gray-400 hover:text-white hover:border-gray-500 transition-all font-bold"
              >
                Ver Lista de Personajes Completa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Shortcuts for Debug/Ease */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#16161a]/80 backdrop-blur-xl border-t border-[#2d2d35] p-4 flex justify-around items-center md:hidden">
        <button
          onClick={() => navigate('/personajes')}
          className="text-gray-400 font-bold text-xs uppercase"
        >
          Personajes
        </button>
        {isDungeonMaster && (
          <button
            onClick={() => navigate('/narrador')}
            className="text-gray-400 font-bold text-xs uppercase"
          >
            Narrador
          </button>
        )}
      </div>
    </div>
  );
}
