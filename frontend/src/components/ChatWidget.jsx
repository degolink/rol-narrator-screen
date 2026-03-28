import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react';
import {
  MessageCircle,
  X,
  Send,
  Maximize2,
  Minimize2,
  Ghost,
  Search,
  Loader2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useImmersiveChat } from '@/hooks/useImmersiveChat';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function ChatWidget() {
  const { user } = useAuth();
  const {
    messages,
    typingUsers,
    sendMessage,
    sendTypingStatus,
    fetchMore,
    hasMore,
    readyState,
    isInitialLoad,
  } = useImmersiveChat();

  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isOOC, setIsOOC] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recipientId, setRecipientId] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);

  const scrollRef = useRef(null);
  const lastScrollHeightRef = useRef(0);
  const [shouldMaintainScroll, setShouldMaintainScroll] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/characters/');
      setAvailableUsers(
        response.data.filter((c) => c.player && user && c.player !== user.id),
      );
    } catch (e) {
      console.error('Failed to fetch users', e);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) fetchUsers();
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

  const filteredMessages = messages.filter(
    (msg) =>
      msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.sender_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    sendTypingStatus(e.target.value.length > 0);
  };

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
            <div>
              <h3 className="font-bold text-gray-100 tracking-wide select-none cursor-default">
                Chat de Sesión
              </h3>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full animate-pulse',
                    readyState === 1 ? 'bg-green-500' : 'bg-red-500',
                  )}
                />
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
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
                  {new Date(msg.created_at).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}

          {isInitialLoad && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Sincronizando historial...</p>
            </div>
          )}
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

      {/* Input */}
      <div className="p-4 bg-gray-800/80 border-t border-gray-700 shrink-0">
        <form onSubmit={handleSend} className="space-y-3">
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
                <Label className="text-[10px] text-gray-500 uppercase font-bold">
                  Susurrar a:
                </Label>
                <select
                  value={recipientId || ''}
                  onChange={(e) => setRecipientId(e.target.value || null)}
                  className="bg-gray-950 border border-gray-700 rounded text-[10px] h-6 px-1 text-gray-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="">(Todos)</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.player}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder={
                isOOC
                  ? 'Mensaje fuera de personaje...'
                  : 'Escribe algo épico...'
              }
              className="flex-1 bg-gray-950 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500 h-11 rounded-xl"
            />
            <Button
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 h-11 w-11 p-0 rounded-xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
