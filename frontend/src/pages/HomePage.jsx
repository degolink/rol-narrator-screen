import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export function HomePage() {
  const { user, loading } = useUser();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  // DM goes to Narrator Screen
  if (user.profile?.is_dungeon_master) return <Navigate to="/narrador" />;

  // Player logic
  if (user.assigned_characters_count === 1 && user.first_character_id) {
    return <Navigate to={`/personaje/${user.first_character_id}`} />;
  }

  if (user.assigned_characters_count > 1) {
    return <Navigate to="/personajes" />;
  }

  // No characters? Go to profile
  return <Navigate to="/perfil" />;
}
