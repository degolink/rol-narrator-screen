import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import useWebSocket from 'react-use-websocket';
import { dequal } from 'dequal';
import { toast } from 'sonner';
import { WS_BASE_URL } from '../config';
import { authService } from '../services/authService';

const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [isRecordingGlobal, setIsRecordingGlobal] = useState(false);
  const [recordingUser, setRecordingUser] = useState(null);
  const isDungeonMaster = user?.profile?.is_dungeon_master;
  const activeCharacter = user?.profile?.active_character;

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

      if (lastJsonMessage.notification) {
        toast.info(lastJsonMessage.notification);
      }

      if (lastJsonMessage.force_refresh) {
        window.dispatchEvent(new CustomEvent('chat:refresh_data'));
      }
    }

    if (lastJsonMessage?.type === 'recording_status') {
      const { status, user: sender } = lastJsonMessage;
      const isStarted = status === 'started';
      setIsRecordingGlobal(isStarted);
      setRecordingUser(isStarted ? sender : null);

      toast(isStarted ? '⏺ Grabación Iniciada' : '⏹ Grabación Finalizada', {
        description: isStarted
          ? `${sender} ha comenzado a grabar la sesión.`
          : 'La grabación se ha guardado correctamente.',
        duration: 4000,
      });
    }
  }, [lastJsonMessage, user]);

  const refreshUser = useCallback(async () => {
    const profile = await authService.getProfile();
    setUser(profile);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {});
    setUser(undefined);
  }, []);

  const requestMagicLink = useCallback(async (email, username) => {
    return await authService.requestMagicLink(email, username);
  }, []);

  const updateUser = useCallback(async (data) => {
    return await authService.updateProfile(data);
  }, []);

  const assignCharacterToUser = useCallback(async (characterId) => {
    return await authService.assignCharacter(characterId);
  }, []);

  const setActiveCharacter = useCallback(async (characterId) => {
    const data = await authService.setActiveCharacter(characterId);
    return data;
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
    async function initAuth() {
      // The profile check will fail with 401 if the cookie is invalid/expired,
      // which will trigger handleUnauthorized.
      await refreshUser().catch(() => {});
      setLoading(false);
    }

    function handleUnauthorized() {
      console.warn('AuthContext: Received auth:unauthorized');
      setUser(undefined);
    }

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
        activeCharacter,
        isRecordingGlobal,
        recordingUser,
        setUser,
        logout,
        updateUser,
        refreshUser,
        requestMagicLink,
        loginWithMagicLink,
        assignCharacterToUser,
        setActiveCharacter,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
