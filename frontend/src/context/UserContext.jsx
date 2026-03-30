import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useLocation } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import { dequal } from 'dequal';
import { WS_BASE_URL } from '../config';
import { authService } from '../services/authService';

const UserContext = createContext();

export function UserContextProvider({ children }) {
  const location = useLocation();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const isDungeonMaster = user?.profile?.is_dungeon_master;

  const socketUrl = useMemo(() => {
    return user ? `${WS_BASE_URL}/user/` : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only reconnect if user ID changes

  const { lastJsonMessage } = useWebSocket(socketUrl, {
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  useEffect(() => {
    if (lastJsonMessage?.type === 'profile_update' && lastJsonMessage.data) {
      if (!dequal(user, lastJsonMessage.data)) {
        console.log(
          'Updating user state from WS:',
          lastJsonMessage.data.username,
        );
        setUser(lastJsonMessage.data);
      }
    }
  }, [lastJsonMessage, user]);

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
      // The profile check will fail with 401 if the cookie is invalid/expired, 
      // which will trigger handleUnauthorized.
      await refreshUser().catch(() => {});
      setLoading(false);
    };

    const handleUnauthorized = () => {
      console.warn('AuthContext: Received auth:unauthorized');
      setUser(undefined);
      
      // Only redirect to login if we're not already on a public page
      const publicPaths = ['/login', '/verify'];
      if (!publicPaths.includes(location.pathname)) {
        authService.logout();
      }
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
