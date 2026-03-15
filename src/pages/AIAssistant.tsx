/**
 * AI Assistant — Chat interface with persistent message history.
 * 
 * Features:
 * - Connects to external LLM endpoint on Modal (FastAPI)
 * - Chat history persisted to localStorage to survive page refreshes
 * - Personalized greeting with user's first name
 * - Markdown rendering for AI responses via react-markdown
 * - Input validation to prevent empty/oversized messages
 */
import { useState, useRef, useEffect, useCallback, memo } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Sparkles, Bot, Send, User, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { messageSchema } from "@/lib/validation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "commas_ai_chat_history";
const AI_ENDPOINT = "https://u-sharifzade2007--academy-advisor-fastapi-app.modal.run/chat";

/** Load persisted chat history from localStorage */
const loadChatHistory = (firstName: string): Message[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Silently ignore corrupted data
  }
  return [getWelcomeMessage(firstName)];
};

const getWelcomeMessage = (firstName: string): Message => ({
  role: "assistant",
  content: `Salam, ${firstName}! 👋\n\nMən sizin Community AI Assistentinizəm. Sizə necə kömək edə bilərəm?\nCommunity qurmaq, spikerlər tapmaq, mentorlarla əlaqə yaratmaq və ya tədbirlərinizi planlaşdırmaq kimi məsələlərdə sizə yardımçı ola bilərəm. 🚀`,
});

/** Individual chat message bubble — memoized for performance */
const ChatBubble = memo(({ msg }: { msg: Message }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""} max-w-[85%] ${msg.role === "user" ? "ml-auto" : ""}`}
  >
    {msg.role === "assistant" && (
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-1">
        <Bot size={16} className="text-primary-foreground" />
      </div>
    )}
    <div className={`rounded-2xl px-4 py-3 ${
      msg.role === "user"
        ? "bg-primary text-primary-foreground rounded-tr-md"
        : "bg-secondary text-foreground rounded-tl-md"
    }`}>
      <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>{msg.content}</ReactMarkdown>
      </div>
    </div>
    {msg.role === "user" && (
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-1">
        <User size={16} className="text-muted-foreground" />
      </div>
    )}
  </motion.div>
));
ChatBubble.displayName = "ChatBubble";

const AIAssistant = () => {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.first_name || "İstifadəçi";
  const [messages, setMessages] = useState<Message[]>(() => loadChatHistory(firstName));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** Send message to AI endpoint with input validation */
  const sendMessage = useCallback(async () => {
    const validation = messageSchema.safeParse({ content: input });
    if (!validation.success || loading) return;

    const text = validation.data.content;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || data.reply || data.answer || JSON.stringify(data) },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  /** Clear chat history and reset to welcome message */
  const clearHistory = useCallback(() => {
    const fresh = [getWelcomeMessage(firstName)];
    setMessages(fresh);
    localStorage.removeItem(STORAGE_KEY);
  }, [firstName]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
            <Sparkles size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">AI Community Builder</h1>
            <p className="text-xs text-muted-foreground">Sizin community köməkçiniz</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearHistory} className="text-muted-foreground">
          <Trash2 size={14} className="mr-1" /> Təmizlə
        </Button>
      </div>

      <div className="flex-1 overflow-auto space-y-4 mb-6 pr-2">
        {messages.map((msg, i) => (
          <ChatBubble key={i} msg={msg} />
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-1">
              <Bot size={16} className="text-primary-foreground" />
            </div>
            <div className="bg-secondary rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Mesajınızı yazın..."
          className="flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
          maxLength={2000}
        />
        <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon">
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
};

export default AIAssistant;
