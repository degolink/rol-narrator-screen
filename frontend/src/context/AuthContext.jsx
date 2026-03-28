import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const isDungeonMaster = user?.profile?.is_dungeon_master;

  useEffect(() => {
    // Initialize tokens and check if user is logged in
    const initAuth = async () => {
      authService.initTokens();
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (error) {
          console.error(
            'AuthContext: Failed to fetch profile (non-critical)',
            error,
          );
          // Don't logout here; wait for 401 event if it's actually an auth issue
        }
      } else {
        setUser(undefined);
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
    return () =>
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(undefined);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('AuthContext: Failed to refresh profile', error);
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isDungeonMaster,
        setUser,
        login,
        logout,
        refreshUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
