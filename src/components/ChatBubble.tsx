import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import type { ChatMessage } from "@/lib/chat-stream";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 max-w-3xl mx-auto w-full", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-chat-user" : "bg-chat-ai"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-chat-user-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-chat-ai-foreground" />
        )}
      </div>
      <div
        className={cn(
          "rounded-2xl px-4 py-3 max-w-[80%]",
          isUser
            ? "bg-chat-user text-chat-user-foreground"
            : "bg-chat-ai text-chat-ai-foreground"
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-chat-ai-foreground [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_pre]:bg-secondary [&_pre]:rounded-lg [&_code]:text-primary [&_code]:font-mono [&_code]:text-xs">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
