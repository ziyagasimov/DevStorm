/**
 * Messages Page — Real-time messaging interface.
 * 
 * Architecture:
 * - Uses a single batch query to load conversations (avoids N+1 problem)
 * - Supabase Realtime subscription for live message updates
 * - `create_conversation` RPC for atomic conversation creation
 * - Input validated with Zod before sending to database
 */
import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { MessageCircle, Send, Plus, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { messageSchema, searchQuerySchema } from "@/lib/validation";
import type { Tables } from "@/integrations/supabase/types";

interface Conversation {
  id: string;
  other_user_id: string;
  other_name: string;
  last_message?: string;
  last_message_at?: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface UserOption {
  id: string;
  name: string;
}

/** Individual message bubble — memoized to prevent unnecessary re-renders */
const MessageBubble = memo(({ msg, isOwn }: { msg: Message; isOwn: boolean }) => (
  <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
      isOwn
        ? "bg-primary text-primary-foreground"
        : "bg-secondary text-foreground"
    }`}>
      <p>{msg.content}</p>
      <p className={`text-[10px] mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
        {new Date(msg.created_at).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  </div>
));
MessageBubble.displayName = "MessageBubble";

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchUsers, setSearchUsers] = useState("");
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  /**
   * Optimized conversation loader — uses batch queries instead of N+1 loop.
   * 1. Fetch all user's participations in one query
   * 2. Fetch all participants for those conversations in one query
   * 3. Fetch all profiles for other users in one query
   * 4. Fetch latest messages for all conversations in one query
   */
  const loadConversations = useCallback(async () => {
    if (!user) return;

    // Step 1: Get all conversation IDs for current user
    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (!participations || participations.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const convIds = participations.map((p) => p.conversation_id);

    // Step 2: Get ALL participants for these conversations (single query)
    const { data: allParticipants } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", convIds);

    if (!allParticipants) {
      setLoading(false);
      return;
    }

    // Build map: conversation_id -> other_user_id
    const convToOtherUser = new Map<string, string>();
    const otherUserIds = new Set<string>();
    for (const p of allParticipants) {
      if (p.user_id !== user.id) {
        convToOtherUser.set(p.conversation_id, p.user_id);
        otherUserIds.add(p.user_id);
      }
    }

    // Step 3: Fetch all profiles in one query
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", Array.from(otherUserIds));

    const profileMap = new Map<string, string>();
    if (profiles) {
      for (const p of profiles) {
        profileMap.set(p.id, `${p.first_name} ${p.last_name}`.trim() || "İstifadəçi");
      }
    }

    // Step 4: Fetch last message for each conversation (single query)
    const { data: allMessages } = await supabase
      .from("messages")
      .select("conversation_id, content, created_at")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false });

    // Build map: conversation_id -> last message (first occurrence per conv)
    const lastMessageMap = new Map<string, { content: string; created_at: string }>();
    if (allMessages) {
      for (const m of allMessages) {
        if (!lastMessageMap.has(m.conversation_id)) {
          lastMessageMap.set(m.conversation_id, { content: m.content, created_at: m.created_at });
        }
      }
    }

    // Step 5: Assemble conversation list
    const convList: Conversation[] = convIds
      .filter((id) => convToOtherUser.has(id))
      .map((id) => {
        const otherUserId = convToOtherUser.get(id)!;
        const lastMsg = lastMessageMap.get(id);
        return {
          id,
          other_user_id: otherUserId,
          other_name: profileMap.get(otherUserId) || "İstifadəçi",
          last_message: lastMsg?.content,
          last_message_at: lastMsg?.created_at,
        };
      })
      .sort((a, b) => {
        if (!a.last_message_at) return 1;
        if (!b.last_message_at) return -1;
        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
      });

    setConversations(convList);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user, loadConversations]);

  // Load messages for selected conversation with realtime subscription
  useEffect(() => {
    if (!selectedConv) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, sender_id, content, created_at")
        .eq("conversation_id", selectedConv)
        .order("created_at", { ascending: true });
      setMessages((data as Message[]) || []);
      setTimeout(scrollToBottom, 100);
    };

    loadMessages();

    // Subscribe to new messages via Supabase Realtime
    const channel = supabase
      .channel(`messages:${selectedConv}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${selectedConv}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => [...prev, newMsg]);
        setTimeout(scrollToBottom, 100);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConv, scrollToBottom]);

  /** Send message with input validation */
  const sendMessage = useCallback(async () => {
    if (!user || !selectedConv) return;

    const validation = messageSchema.safeParse({ content: newMessage });
    if (!validation.success) {
      toast({ title: "Xəta", description: validation.error.errors[0].message, variant: "destructive" });
      return;
    }

    setSending(true);
    await supabase.from("messages").insert({
      conversation_id: selectedConv,
      sender_id: user.id,
      content: validation.data.content,
    });
    setNewMessage("");
    setSending(false);
  }, [user, selectedConv, newMessage, toast]);

  /** Search users with sanitized input */
  const handleSearchUsers = useCallback(async (query: string) => {
    setSearchUsers(query);
    if (query.length < 2) {
      setUserOptions([]);
      return;
    }

    const parsed = searchQuerySchema.safeParse(query);
    if (!parsed.success) return;

    const sanitizedQuery = parsed.data;
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .or(`first_name.ilike.%${sanitizedQuery}%,last_name.ilike.%${sanitizedQuery}%`)
      .neq("id", user?.id || "")
      .limit(10);

    if (profiles) {
      setUserOptions(
        profiles.map((p) => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`.trim(),
        }))
      );
    }
  }, [user]);

  /** Start or navigate to existing conversation using atomic RPC */
  const startConversation = useCallback(async (otherUserId: string) => {
    if (!user) return;

    const existing = conversations.find((c) => c.other_user_id === otherUserId);
    if (existing) {
      setSelectedConv(existing.id);
      setDialogOpen(false);
      return;
    }

    const { data: convId, error } = await supabase.rpc("create_conversation", {
      other_user_id: otherUserId,
    });

    if (convId && !error) {
      setDialogOpen(false);
      await loadConversations();
      setSelectedConv(convId);
    } else {
      toast({ title: "Xəta", description: "Söhbət yaradıla bilmədi.", variant: "destructive" });
    }
  }, [user, conversations, loadConversations, toast]);

  /** Currently selected conversation's display name */
  const selectedConvName = useMemo(
    () => conversations.find((c) => c.id === selectedConv)?.other_name,
    [conversations, selectedConv]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageCircle size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Mesajlar</h1>
              <p className="text-sm text-muted-foreground">İstifadəçilərlə əlaqə qurun</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus size={16} className="mr-1" /> Yeni söhbət</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni söhbət başlat</DialogTitle>
                <DialogDescription>İstifadəçi axtarın və söhbətə başlayın</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                  <Input placeholder="İstifadəçi axtar..." value={searchUsers} onChange={(e) => handleSearchUsers(e.target.value)} className="pl-9" />
                </div>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {userOptions.map((u) => (
                    <button key={u.id} onClick={() => startConversation(u.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{u.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">{u.name}</span>
                    </button>
                  ))}
                  {searchUsers.length >= 2 && userOptions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">İstifadəçi tapılmadı</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          {/* Conversation list */}
          <Card className="md:col-span-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {conversations.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">Hələ söhbət yoxdur</p>
                )}
                {conversations.map((conv) => (
                  <button key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      selectedConv === conv.id ? "bg-accent" : "hover:bg-secondary"
                    }`}>
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary">{conv.other_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{conv.other_name}</p>
                      {conv.last_message && (
                        <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat area */}
          <Card className="md:col-span-2 flex flex-col overflow-hidden">
            {selectedConv ? (
              <>
                <div className="p-4 border-b border-border">
                  <p className="font-medium text-foreground">{selectedConvName}</p>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === user?.id} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-border flex gap-2">
                  <Input
                    placeholder="Mesaj yazın..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    maxLength={2000}
                  />
                  <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} size="icon">
                    <Send size={16} />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm">Söhbət seçin və ya yeni söhbət başladın</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Messages;
