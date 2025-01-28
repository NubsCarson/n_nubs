import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Send, Lock, Bot, MessageSquare, Terminal, Github, Twitter } from "lucide-react";
import { useState } from "react";

interface Message {
  id: number;
  content: string;
  timestamp: string;
  sender: "ai" | "user";
}

const demoMessages: Message[] = [
  {
    id: 1,
    content: "Hello! I'm your AI trading assistant. I can help you analyze markets, explain trading concepts, and provide insights about cryptocurrencies.",
    timestamp: "12:00 PM",
    sender: "ai"
  },
  {
    id: 2,
    content: "Some features I'll offer:",
    timestamp: "12:01 PM",
    sender: "ai"
  },
  {
    id: 3,
    content: "• Technical analysis explanations\n• Market sentiment analysis\n• Risk management advice\n• Trading strategy suggestions",
    timestamp: "12:01 PM",
    sender: "ai"
  },
  {
    id: 4,
    content: "Stay tuned for the full release! 🚀",
    timestamp: "12:02 PM",
    sender: "ai"
  }
];

type Mode = "chat" | "agent";

export function AIChatPanel() {
  const [mode, setMode] = useState<Mode>("chat");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b">
        <div className="flex px-2 gap-1 py-2">
          <Button
            variant={mode === "chat" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1 gap-2"
            onClick={() => setMode("chat")}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Button>
          <Button
            variant={mode === "agent" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1 gap-2"
            onClick={() => setMode("agent")}
          >
            <Terminal className="h-4 w-4" />
            Agent
          </Button>
        </div>
      </div>
      
      {mode === "chat" ? (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1">
            <div className="space-y-6 p-4">
              {demoMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col space-y-2 ${
                    message.sender === "ai" ? "" : "items-end"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {message.sender === "ai" && (
                      <Bot className="h-4 w-4 text-primary" />
                    )}
                    <span>{message.timestamp}</span>
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[85%] ${
                      message.sender === "ai" 
                        ? "bg-muted/50 text-foreground" 
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Box */}
          <div className="mt-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="p-4">
              <div className="relative flex items-center gap-2">
                <Input
                  placeholder="AI Chat coming soon..."
                  disabled
                  className="pr-20 bg-muted/50 border-muted-foreground/20"
                />
                <div className="absolute right-3 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground text-center">
                AI chat functionality will be available in the next update
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>© 2025 n_nubs. All rights reserved.</span>
                <div className="flex items-center gap-3">
                  <a
                    href="https://github.com/NubsCarson/n_nubs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                  <a
                    href="https://twitter.com/n_nubsDEV"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center flex-col gap-3 p-4 text-center">
          <Terminal className="h-12 w-12 text-muted-foreground" />
          <h3 className="font-medium">AI Agent Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            The AI Agent will help automate your trading tasks and provide real-time market analysis.
          </p>
        </div>
      )}
    </div>
  );
} 