import { NavLink, Link, useMatch } from 'react-router-dom';
import { BookOpen, Users } from 'lucide-react';

export function NavBar() {
  const isCharacterDetail = useMatch('/personaje/*');

  const navItems = [
    { path: '/narrador', label: 'Pantalla del Narrador', icon: BookOpen },
    {
      path: '/personajes',
      label: 'Personajes',
      icon: Users,
      extraActiveState: !!isCharacterDetail,
    },
  ];

  return (
    <nav className="bg-gray-800 border-b border-gray-700 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                className="text-xl font-bold text-gray-100 flex items-center gap-2 hover:text-indigo-300 transition-colors"
              >
                <BookOpen className="w-6 h-6 text-indigo-400" />
                Pantalla del Narrador
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => {
                      const active = isActive || item.extraActiveState;

                      return `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        active
                          ? 'border-indigo-500 text-white'
                          : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'
                      }`;
                    }}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
