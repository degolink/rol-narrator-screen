import { useMemo } from 'react';
import { NavLink, Link, useMatch } from 'react-router-dom';
import { BookOpen, Users, LogOut, Mic, Scroll } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { Button } from './ui/button';

export function NavBar() {
  const { user, logout, isRecordingGlobal } = useUser();
  const isCharacterDetail = useMatch('/personaje/*');
  const isLogin = useMatch('/login');
  const isVerify = useMatch('/verify');
  const isDM = user?.profile?.is_dungeon_master;

  const navItems = useMemo(() => {
    if (!user || isLogin || isVerify) return;

    return [
      ...(isDM
        ? [{ path: '/narrador', label: 'Narrador', icon: BookOpen }]
        : [
            {
              path: '/personajes',
              label: 'Personajes',
              icon: Users,
              extraActiveState: !!isCharacterDetail,
            },
          ]),
      { path: '/codice', label: 'El Códice', icon: Scroll },
      { path: '/grabadora', label: 'Grabadora', icon: Mic },
    ];
  }, [user, isLogin, isVerify, isDM, isCharacterDetail]);

  if (!navItems) return null;
  return (
    <nav className="bg-[#16161a] border-b border-[#2d2d35] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                className="text-xl font-black text-white flex items-center gap-2 hover:text-blue-400 transition-all uppercase tracking-tighter"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                Pantalla De Narrador
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => {
                        const active = isActive || item.extraActiveState;

                        return `inline-flex items-center px-4 pt-1 border-b-2 text-sm font-bold transition-all ${
                          active
                            ? 'border-blue-500 text-white bg-blue-500/5'
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                        }`;
                      }}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isRecordingGlobal && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full animate-pulse">
                <div className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">
                  REC
                </span>
              </div>
            )}
            {user ? (
              <>
                <Link
                  to="/perfil"
                  className="flex items-center gap-2 bg-[#1e1e24] px-3 py-1.5 rounded-full border border-[#2d2d35] hover:border-gray-600 transition-all"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${isDM ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}
                  >
                    {user.username ? user.username[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-gray-300">
                    {user.username || user.email.split('@')[0]}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all font-bold uppercase text-[10px] tracking-widest"
                >
                  <LogOut className="w-3 h-3 mr-1.5" />
                  Salir
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 font-bold"
                >
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
