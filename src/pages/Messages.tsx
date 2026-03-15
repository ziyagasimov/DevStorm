import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { MessageCircle, Send, Plus, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  role: string;
}

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversations
  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    const { data: participations } = await supabase
      .from("conversation_participants" as any)
      .select("conversation_id")
      .eq("user_id", user.id);

    if (!participations || participations.length === 0) {
      setLoading(false);
      return;
    }

    const convIds = (participations as any[]).map(p => p.conversation_id);
    const convList: Conversation[] = [];

    for (const convId of convIds) {
      // Get other participant
      const { data: otherParticipants } = await supabase
        .from("conversation_participants" as any)
        .select("user_id")
        .eq("conversation_id", convId)
        .neq("user_id", user.id);

      if (!otherParticipants || otherParticipants.length === 0) continue;
      const otherUserId = (otherParticipants[0] as any).user_id;

      // Get name from profiles
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", otherUserId)
        .single();

      const otherName = profileData
        ? `${profileData.first_name} ${profileData.last_name}`.trim() || "İstifadəçi"
        : "İstifadəçi";

      // Get last message
      const { data: lastMsg } = await supabase
        .from("messages" as any)
        .select("content, created_at")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      convList.push({
        id: convId,
        other_user_id: otherUserId,
        other_name: otherName,
        last_message: (lastMsg as any)?.content,
        last_message_at: (lastMsg as any)?.created_at,
      });
    }

    convList.sort((a, b) => {
      if (!a.last_message_at) return 1;
      if (!b.last_message_at) return -1;
      return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
    });

    setConversations(convList);
    setLoading(false);
  };

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConv) return;
    loadMessages(selectedConv);

    // Subscribe to realtime
    const channel = supabase
      .channel(`messages:${selectedConv}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${selectedConv}`,
      }, (payload) => {
        const newMsg = payload.new as any as Message;
        setMessages(prev => [...prev, newMsg]);
        setTimeout(scrollToBottom, 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConv]);

  const loadMessages = async (convId: string) => {
    const { data } = await supabase
      .from("messages" as any)
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages((data as any as Message[]) || []);
    setTimeout(scrollToBottom, 100);
  };

  const sendMessage = async () => {
    if (!user || !selectedConv || !newMessage.trim()) return;
    setSending(true);
    await supabase.from("messages" as any).insert({
      conversation_id: selectedConv,
      sender_id: user.id,
      content: newMessage.trim(),
    } as any);
    setNewMessage("");
    setSending(false);
  };

  // Search users for new conversation
  const handleSearchUsers = async (query: string) => {
    setSearchUsers(query);
    if (query.length < 2) { setUserOptions([]); return; }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .neq("id", user?.id || "")
      .limit(10);

    if (profiles) {
      const options: UserOption[] = profiles.map(p => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name}`.trim(),
        role: "",
      }));
      setUserOptions(options);
    }
  };

  const startConversation = async (otherUserId: string) => {
    if (!user) return;

    // Check if conversation already exists
    const existing = conversations.find(c => c.other_user_id === otherUserId);
    if (existing) {
      setSelectedConv(existing.id);
      setDialogOpen(false);
      return;
    }

    // Create new conversation using server function
    const { data: convId, error } = await supabase.rpc("create_conversation", {
      other_user_id: otherUserId,
    });

    if (convId && !error) {
      setDialogOpen(false);
      await loadConversations();
      setSelectedConv(convId);
    } else {
      toast({
        title: "Xəta",
        description: "Söhbət yaradıla bilmədi.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <div className="flex items-center justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

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
                <p className="text-sm text-muted-foreground">İstifadəçi axtarın və söhbətə başlayın</p>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                  <Input placeholder="İstifadəçi axtar..." value={searchUsers} onChange={e => handleSearchUsers(e.target.value)} className="pl-9" />
                </div>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {userOptions.map(u => (
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
                {conversations.map(conv => (
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
                  <p className="font-medium text-foreground">
                    {conversations.find(c => c.id === selectedConv)?.other_name}
                  </p>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                          msg.sender_id === user?.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-foreground"
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-border flex gap-2">
                  <Input
                    placeholder="Mesaj yazın..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
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
