import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Sparkles, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/ChatBubble";
import { ChatSidebar } from "@/components/ChatSidebar";
import { streamChat, type ChatMessage } from "@/lib/chat-stream";
import { useConversations } from "@/hooks/use-conversations";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Explain quantum computing simply",
  "Write a haiku about coding",
  "What are the best practices for React?",
  "Help me brainstorm startup ideas",
];

export default function ChatPage() {
  const {
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    createConversation,
    updateMessages,
    deleteConversation,
  } = useConversations();

  const messages = activeConversation?.messages ?? [];
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const ensureConversation = useCallback(() => {
    if (activeId) return activeId;
    return createConversation();
  }, [activeId, createConversation]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const convoId = ensureConversation();
    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    updateMessages(convoId, newMessages);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    const upsert = (chunk: string) => {
      assistantContent += chunk;
      const updated = [
        ...newMessages,
        { role: "assistant" as const, content: assistantContent },
      ];
      // Remove duplicate assistant at end if already exists
      const base = newMessages.filter((_, i) => i < newMessages.length);
      updateMessages(convoId, [...base, { role: "assistant" as const, content: assistantContent }]);
    };

    try {
      await streamChat({
        messages: newMessages,
        onDelta: upsert,
        onDone: () => setIsLoading(false),
        onError: (err) => {
          toast.error(err);
          setIsLoading(false);
        },
      });
    } catch {
      toast.error("Failed to connect to AI service");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleNewChat = () => {
    createConversation();
  };

  const isEmpty = messages.length === 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onCreate={handleNewChat}
          onDelete={deleteConversation}
        />

        <div className="flex-1 flex flex-col h-screen">
          {/* Header */}
          <header className="flex-shrink-0 border-b border-border px-4 py-3">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <SidebarTrigger className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-semibold text-foreground truncate">
                  {activeConversation?.title ?? "New Chat"}
                </h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => document.documentElement.classList.toggle("dark")}
                className="rounded-xl flex-shrink-0"
              >
                <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </header>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full gap-8">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">How can I help you?</h2>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Ask me anything — I can answer questions, write code, brainstorm ideas, and more.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-sm px-4 py-3 rounded-xl border border-border bg-chat-surface text-foreground hover:bg-accent transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <ChatBubble key={i} message={msg} />
                ))}
                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex gap-3 max-w-3xl mx-auto">
                    <div className="w-8 h-8 rounded-full bg-chat-ai flex items-center justify-center flex-shrink-0">
                      <Loader2 className="w-4 h-4 text-chat-ai-foreground animate-spin" />
                    </div>
                    <div className="bg-chat-ai rounded-2xl px-4 py-3">
                      <p className="text-sm text-muted-foreground">Thinking…</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-border p-4">
            <div className="max-w-3xl mx-auto flex gap-3 items-end">
              <div className="flex-1 bg-chat-input-bg border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-ring transition-shadow">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  rows={1}
                  className="w-full resize-none bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none max-h-32"
                  style={{ minHeight: "44px" }}
                />
              </div>
              <Button
                onClick={() => send(input)}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-xl h-11 w-11 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
