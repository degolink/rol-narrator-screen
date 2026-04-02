import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Maximize2,
  Minimize2,
  Ghost,
  Search,
  Loader2,
  User as UserIcon,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formatFriendlyDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / 60000);

  if (diffInMinutes < 1) return 'hace unos instantes';
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }

  // Format: 20 Enero 2020 20:20
  const formattedDate = date.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = date.toLocaleString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Capitalize first letter of month
  const parts = formattedDate.split(' ');
  if (parts.length >= 2) {
    parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
  }

  return `${parts.join(' ')} ${formattedTime}`;
};

export function ChatWidget() {
  const { user, activeCharacter, setActiveCharacter, isDungeonMaster } =
    useUser();
  const {
    messages,
    typingUsers,
    sendMessage,
    sendTypingStatus,
    fetchMore,
    hasMore,
    readyState,
    isInitialLoad,
  } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isOOC, setIsOOC] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recipientId, setRecipientId] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectableCharacters, setSelectableCharacters] = useState([]);
  const [isLoadingCharacters] = useState(false);

  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  const lastScrollHeightRef = useRef(0);
  const [shouldMaintainScroll, setShouldMaintainScroll] = useState(false);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && !shouldMaintainScroll) {
      // Small timeout to allow the DOM to update
      const timer = setTimeout(() => scrollToBottom('smooth'), 100);
      return () => clearTimeout(timer);
    }
  }, [messages, shouldMaintainScroll, scrollToBottom]);

  const fetchUsers = useCallback(async () => {
    try {
      // 1. Fetch participants for whisper selector
      const participantsRes = await api.get('/profile/participants/');
      const others = participantsRes.data.filter((u) => u.id !== user.id);
      setAvailableUsers(others);

      // 2. Fetch characters for active selection
      const response = await api.get('/characters/');
      const allChars = response.data;

      let foundSelectable = [];
      if (isDungeonMaster) {
        // DM can select any visible character/NPC as active
        foundSelectable = allChars.filter((c) => c.visible);
      } else {
        // Players can only select their own assigned characters
        foundSelectable = allChars.filter((c) => c.player === user.id);
      }
      setSelectableCharacters(foundSelectable);

      // Auto-select if there's only one character and none is active
      if (
        !isDungeonMaster &&
        foundSelectable.length === 1 &&
        !activeCharacter
      ) {
        console.log('Auto-selecting character:', foundSelectable[0].name);
        setActiveCharacter(foundSelectable[0].id);
      }
    } catch (e) {
      console.error('Failed to fetch data for chat', e);
    }
  }, [user, isDungeonMaster, activeCharacter, setActiveCharacter]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      // Auto-scroll to bottom when opened
      setTimeout(() => {
        const scrollContainer = scrollRef.current?.querySelector(
          '[data-radix-scroll-area-viewport]',
        );
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }, 100);
    }
  }, [isOpen, fetchUsers]);

  // Handle Loading More - Scroll Preservation
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight } = e.currentTarget;
    if (scrollTop === 0 && hasMore) {
      lastScrollHeightRef.current = scrollHeight;
      setShouldMaintainScroll(true);
      fetchMore();
    }
  };

  useLayoutEffect(() => {
    if (shouldMaintainScroll && scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector(
        '[data-radix-scroll-area-viewport]',
      );
      if (scrollContainer) {
        const delta =
          scrollContainer.scrollHeight - lastScrollHeightRef.current;
        scrollContainer.scrollTop = delta;
      }
    }
  }, [messages.length, shouldMaintainScroll]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue, { ooc: isOOC, recipient_id: recipientId });
      setInputValue('');
      sendTypingStatus(false);
    }
  };

  const sendingAsName = useMemo(() => {
    if (isDungeonMaster) {
      if (!activeCharacter) return 'Dungeon Master';
      const char = selectableCharacters.find((c) => c.id == activeCharacter);
      return char ? char.name : 'Dungeon Master';
    }
    const char = selectableCharacters.find((c) => c.id == activeCharacter);
    return char ? char.name : user?.username || 'Jugador';
  }, [isDungeonMaster, activeCharacter, selectableCharacters, user]);

  const filteredMessages = messages.filter(
    (msg) =>
      msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.sender_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    sendTypingStatus(e.target.value.length > 0);
  };

  // Listen for external refresh requests (e.g. from UserContext WS)
  useEffect(() => {
    const handleRefresh = () => {
      if (isOpen) {
        fetchUsers();
      }
    };
    window.addEventListener('chat:refresh_data', handleRefresh);
    return () => window.removeEventListener('chat:refresh_data', handleRefresh);
  }, [isOpen, fetchUsers]);

  if (!isOpen && !isFullScreen) {
    return (
      <Button
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-500 text-white z-40 transition-transform hover:scale-105"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-7 w-7" />
      </Button>
    );
  }

  const typingArray = Object.values(typingUsers).filter((u) => u.is_typing);

  return (
    <div
      className={cn(
        'fixed bottom-6 left-6 flex flex-col bg-gray-900/95 backdrop-blur-md border border-gray-800 shadow-2xl transition-[width,height,bottom,left] duration-300 z-40 overflow-hidden',
        isFullScreen
          ? 'w-screen h-[calc(100vh-64px)] bottom-0 left-0 bg-gray-950'
          : 'w-96 h-[550px] rounded-2xl',
      )}
    >
      {/* Header */}
      <div className="p-4 bg-gray-800/50 border-b border-gray-700 flex flex-col gap-3 shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 rounded-lg">
              <Ghost className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              {selectableCharacters.length > 1 ||
              (isDungeonMaster && selectableCharacters.length > 0) ? (
                <div className="flex flex-col">
                  <select
                    value={activeCharacter || ''}
                    onChange={(e) => setActiveCharacter(e.target.value || null)}
                    className="bg-transparent border-none p-0 font-bold text-gray-100 text-sm tracking-wide focus:ring-0 outline-none cursor-pointer hover:text-indigo-400 transition-colors w-full"
                  >
                    {!isDungeonMaster ? null : (
                      <option
                        value=""
                        className="bg-gray-900 text-gray-100 font-bold"
                      >
                        Dungeon Master
                      </option>
                    )}
                    {selectableCharacters.map((char) => (
                      <option
                        key={char.id}
                        value={char.id}
                        className="bg-gray-900 text-gray-100 font-bold"
                      >
                        {char.name}
                      </option>
                    ))}
                  </select>
                  {user?.username && (
                    <span className="text-[9px] text-gray-500 font-medium leading-none">
                      {user.username}
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-gray-100 text-sm tracking-wide select-none cursor-default truncate">
                    {sendingAsName}
                  </h3>
                  {user?.username && (
                    <span className="text-[9px] text-gray-500 font-medium leading-none block mt-0.5">
                      {user.username}
                    </span>
                  )}
                </>
              )}
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full animate-pulse',
                    readyState === 1 ? 'bg-green-500' : 'bg-red-500',
                  )}
                />
                <span className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">
                  {readyState === 1 ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsSearching(!isSearching)}
              className={cn(
                'p-1.5 hover:bg-gray-700 rounded-md transition-colors',
                isSearching ? 'text-indigo-400' : 'text-gray-400',
              )}
              title="Buscar en el historial"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              title={isFullScreen ? 'Minimizar' : 'Pantalla completa'}
            >
              {isFullScreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsFullScreen(false);
              }}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isSearching && (
          <div className="relative animate-in slide-in-from-top-2 duration-200">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en el historial..."
              className="h-8 pl-9 bg-gray-950/50 border-gray-700 text-xs focus-visible:ring-indigo-500"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea
        ref={scrollRef}
        className="flex-1 min-h-0 p-4"
        onScrollCapture={handleScroll}
      >
        <div className="space-y-4 pb-2">
          {hasMore && !searchQuery && (
            <div className="flex justify-center py-2">
              <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
            </div>
          )}

          {(searchQuery ? filteredMessages : messages)
            .slice()
            .reverse()
            .map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex flex-col gap-1 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300',
                  msg.sender_user_id === user?.id ? 'items-end' : 'items-start',
                )}
              >
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                    {msg.sender_name}
                    {msg.sender_username && (
                      <span className="ml-1 opacity-50 font-normal lowercase">
                        ({msg.sender_username})
                      </span>
                    )}
                  </span>
                  {msg.message_type === 'WHISPER' && (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 h-4 border-purple-500/50 text-purple-400 bg-purple-500/5"
                    >
                      (Privado)
                    </Badge>
                  )}
                  {msg.message_type === 'OOC' && (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 h-4 border-gray-600 text-gray-400"
                    >
                      (Fuera de rol)
                    </Badge>
                  )}
                </div>

                <div
                  className={cn(
                    'max-w-[90%] rounded-2xl px-4 py-2.5 text-sm prose prose-invert prose-p:my-0 shadow-md',
                    msg.sender_user_id === user?.id
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-gray-800 text-gray-100 rounded-tl-none',
                    msg.message_type === 'WHISPER' &&
                      'border border-purple-500/30 ring-1 ring-purple-500/20',
                    msg.message_type === 'OOC' &&
                      'italic text-gray-300 bg-gray-800/50 border-dashed border-gray-700 border',
                  )}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                <span className="text-[9px] text-gray-600 px-1 italic">
                  {formatFriendlyDate(msg.created_at)}
                </span>
              </div>
            ))}

          {isInitialLoad && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Sincronizando historial...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {typingArray.length > 0 && (
        <div className="px-4 py-1.5 bg-gray-800/30 text-[10px] text-indigo-400 italic shrink-0">
          {typingArray.map((u) => u.name).join(', ')}{' '}
          {typingArray.length > 1
            ? 'están escribiendo...'
            : 'está escribiendo...'}
        </div>
      )}

      {/* Input or Character Selection */}
      <div className="p-4 bg-gray-800/80 border-t border-gray-700 shrink-0">
        {!activeCharacter && !isDungeonMaster ? (
          <div className="flex flex-col items-center gap-4 py-4 animate-in fade-in zoom-in duration-300">
            <div className="p-3 bg-amber-500/10 rounded-full">
              <UserIcon className="w-8 h-8 text-amber-500" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-gray-100">
                Selecciona un personaje
              </h4>
              <p className="text-xs text-gray-400">
                Debes elegir un personaje antes de poder chatear.
              </p>
            </div>
            <div className="w-full max-w-[240px] space-y-2">
              {selectableCharacters.length > 0 ? (
                <>
                  {selectableCharacters.map((char) => (
                    <Button
                      key={char.id}
                      variant="outline"
                      className="w-full justify-start gap-3 bg-gray-900 border-gray-700 hover:bg-gray-800 hover:border-indigo-500 transition-all group"
                      onClick={() => setActiveCharacter(char.id)}
                      disabled={isLoadingCharacters}
                    >
                      <div className="w-2 h-2 rounded-full bg-indigo-500 group-hover:animate-ping" />
                      <span className="truncate">{char.name}</span>
                    </Button>
                  ))}
                  <div className="pt-2 text-center">
                    <Link
                      to="/perfil"
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                    >
                      Ir a mi perfil
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-[10px] text-center text-gray-500 italic">
                    No tienes personajes asignados.
                  </p>
                  <Button
                    asChild
                    variant="link"
                    className="text-xs text-indigo-400 h-auto p-0"
                  >
                    <Link to="/perfil">Asignar personajes en mi perfil</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-2">
            <div className="flex flex-wrap items-center justify-end gap-2 px-1">
              {/* Character Selector for DM (Compact) - keep only if needed, but redundant now? */}
              {isDungeonMaster && (
                <div className="flex items-center gap-2">
                  <select
                    value={activeCharacter || ''}
                    onChange={(e) => setActiveCharacter(e.target.value || null)}
                    className="bg-gray-950 border border-gray-700/50 rounded text-[10px] h-5 px-1 text-gray-400 focus:ring-1 focus:ring-indigo-500 outline-none w-28 transition-colors hover:border-gray-500"
                  >
                    <option value="">DM</option>
                    {selectableCharacters.map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ooc-mode"
                  checked={isOOC}
                  onCheckedChange={(val) => {
                    setIsOOC(val);
                    if (val) setRecipientId(null);
                  }}
                  className="scale-75 data-[state=checked]:bg-indigo-600"
                />
                <Label
                  htmlFor="ooc-mode"
                  className="text-[10px] text-gray-400 uppercase font-bold cursor-pointer"
                >
                  Modo Fuera de Rol
                </Label>
              </div>

              {!isOOC && (
                <div className="flex items-center gap-2">
                  <Label className="text-[10px] text-gray-500 uppercase font-bold shrink-0">
                    Susurrar a:
                  </Label>
                  <Select
                    value={recipientId?.toString() || 'none'}
                    onValueChange={(val) =>
                      setRecipientId(val === 'none' ? null : parseInt(val))
                    }
                  >
                    <SelectTrigger className="h-6 w-[120px] bg-gray-950 border-gray-700/50 text-[10px] px-2 text-gray-300 focus:ring-1 focus:ring-indigo-500">
                      <SelectValue placeholder="(Todos)" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-gray-100 min-w-[200px]">
                      <SelectItem
                        value="none"
                        className="text-[11px] data-[highlighted]:bg-indigo-600 data-[highlighted]:text-white focus:bg-indigo-600 focus:text-white cursor-pointer"
                      >
                        (Todos)
                      </SelectItem>
                      {availableUsers.map((u) => (
                        <SelectItem
                          key={u.id}
                          value={u.id.toString()}
                          className="text-[11px] data-[highlighted]:bg-indigo-600 data-[highlighted]:text-white focus:bg-indigo-600 focus:text-white cursor-pointer"
                        >
                          {u.display_name} ({u.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex gap-2 relative group">
              <Input
                id="chat-input"
                value={inputValue}
                onChange={handleInputChange}
                autoComplete="off"
                placeholder={
                  isOOC
                    ? 'Mensaje fuera de personaje...'
                    : 'Escribe algo épico...'
                }
                className="flex-1 bg-gray-950 border-gray-700/50 text-white placeholder:text-gray-600 focus-visible:ring-indigo-500 h-10 rounded-xl pr-12 transition-all hover:border-gray-600"
              />
              <Button
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-1 top-1 bottom-1 bg-indigo-600 hover:bg-indigo-500 h-8 w-8 p-0 rounded-lg transition-all active:scale-95"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
