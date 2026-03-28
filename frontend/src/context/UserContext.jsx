import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { authService } from '../services/authService';

const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const isDungeonMaster = user?.profile?.is_dungeon_master;

  const refreshUser = useCallback(async () => {
    const profile = await authService.getProfile();
    setUser(profile);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(undefined);
  }, []);

  const requestMagicLink = useCallback(async (email, username) => {
    return await authService.requestMagicLink(email, username);
  }, []);

  const updateUser = useCallback(async (data) => {
    return await authService.updateProfile(data);
  }, []);

  const assignCharacterToUser = useCallback(async (characterId) => {
    return await authService.post('/profile/assign_character/', {
      character_id: characterId,
    });
  }, []);

  const loginWithMagicLink = useCallback(async (token) => {
    try {
      const user = await authService.verifyMagicLink(token);
      setUser(user);
      return user;
    } catch (err) {
      setUser(undefined);
      throw err;
    }
  }, []);

  useEffect(() => {
    // Initialize tokens and check if user is logged in
    const initAuth = async () => {
      authService.initTokens();
      if (authService.isAuthenticated()) {
        await refreshUser().catch(() => {});
      }
      setLoading(false);
    };

    const handleUnauthorized = () => {
      console.warn('AuthContext: Received auth:unauthorized');
      authService.logout();
      setUser(undefined);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    initAuth();

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isDungeonMaster,
        setUser,
        logout,
        updateUser,
        refreshUser,
        requestMagicLink,
        loginWithMagicLink,
        assignCharacterToUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
