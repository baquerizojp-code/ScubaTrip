import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type Message = Tables<'group_messages'>;

const GroupChat = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [tripTitle, setTripTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tripId || !user) return;

    const init = async () => {
      // Get trip title
      const { data: trip } = await supabase.from('trips').select('title').eq('id', tripId).single();
      if (trip) setTripTitle(trip.title);

      // Get sender name
      const { data: profile } = await supabase.from('diver_profiles').select('full_name').eq('user_id', user.id).maybeSingle();
      setSenderName(profile?.full_name || user.email?.split('@')[0] || 'Unknown');

      // Fetch messages
      const { data } = await supabase
        .from('group_messages')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true });
      setMessages(data || []);
      setLoading(false);
    };

    init();

    // Realtime subscription
    const channel = supabase
      .channel(`group-chat-${tripId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `trip_id=eq.${tripId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tripId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !tripId || !user) return;
    setSending(true);
    await supabase.from('group_messages').insert({
      trip_id: tripId,
      sender_id: user.id,
      sender_name: senderName,
      message: newMsg.trim(),
    });
    setNewMsg('');
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-3/4" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="font-semibold text-foreground text-sm">{tripTitle}</h2>
          <p className="text-xs text-muted-foreground">{t('diver.group.title')}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">{t('diver.group.empty')}</p>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                isMe ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'
              }`}>
                {!isMe && <p className="text-xs font-medium opacity-70 mb-0.5">{msg.sender_name}</p>}
                <p className="text-sm">{msg.message}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                  {format(new Date(msg.created_at), 'HH:mm')}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card">
        <form
          className="flex items-center gap-2"
          onSubmit={e => { e.preventDefault(); handleSend(); }}
        >
          <Input
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            placeholder={t('diver.group.placeholder')}
            className="flex-1"
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={sending || !newMsg.trim()} className="bg-gradient-ocean text-primary-foreground hover:opacity-90">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default GroupChat;
