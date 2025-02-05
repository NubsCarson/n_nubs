import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Send, Lock, MessageSquare, Users, ArrowLeftRight, Reply, Heart, Share2, Bot } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  content: string;
  timestamp: string;
  sender: string;
  reactions?: number;
}

const demoMessages: Message[] = [
  {
    id: 1,
    content: "Welcome to the public chat room! 👋",
    timestamp: "12:00 PM",
    sender: "System",
    reactions: 5
  },
  {
    id: 2,
    content: "Chat functionality coming soon...",
    timestamp: "12:01 PM",
    sender: "System",
    reactions: 2
  },
  {
    id: 3,
    content: "You'll be able to connect with other traders and discuss market trends in real-time!",
    timestamp: "12:02 PM",
    sender: "System",
    reactions: 8
  },
  {
    id: 4,
    content: "Features will include: live price discussions, trading signals, and market analysis sharing.",
    timestamp: "12:03 PM",
    sender: "System",
    reactions: 3
  }
];

type ChatMode = "public" | "private" | "swap";

export function ChatPanel() {
  const [mode, setMode] = useState<ChatMode>("public");
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="border-b">
        <div className="flex px-2 gap-1 py-2">
          <Button
            variant={mode === "public" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1 gap-2"
            onClick={() => setMode("public")}
          >
            <MessageSquare className="h-4 w-4" />
            Public
          </Button>
          <Button
            variant={mode === "private" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1 gap-2"
            onClick={() => setMode("private")}
          >
            <Users className="h-4 w-4" />
            Private
          </Button>
          <Button
            variant={mode === "swap" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1 gap-2"
            onClick={() => setMode("swap")}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Swap
          </Button>
        </div>
      </div>

      {mode === "public" ? (
        <>
          <ScrollArea className="flex-1">
            <div className="space-y-4 p-4">
              {demoMessages.map((message) => (
                <div
                  key={message.id}
                  className="bg-muted/50 rounded-lg p-3 space-y-1 relative group"
                  onMouseEnter={() => setHoveredMessage(message.id)}
                  onMouseLeave={() => setHoveredMessage(null)}
                >
                  <div className="flex items-center text-sm">
                    <span className="font-medium">{message.sender}</span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  
                  {/* Hover Actions */}
                  <div className={`absolute right-2 top-2 flex items-center gap-0.5 transition-opacity ${hoveredMessage === message.id ? 'opacity-100' : 'opacity-0'}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      disabled
                    >
                      <Reply className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      disabled
                    >
                      <Heart className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      disabled
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Reaction Count */}
                    {message.reactions > 0 && (
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-primary fill-primary" />
                        <span className="text-xs text-muted-foreground">{message.reactions}</span>
                      </div>
                    )}
                    <span className="text-muted-foreground text-xs ml-auto">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-border mt-auto">
            <div className="relative">
              <Input
                placeholder="Chat coming soon..."
                disabled
                className="pr-24"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="mt-2 text-xs text-center text-muted-foreground">
              <div className="inline-flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-full">
                <Bot className="h-3.5 w-3.5 text-primary" />
                <span className="text-primary">Coming Soon</span>
              </div>
            </div>
          </div>
        </>
      ) : mode === "private" ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-3 p-4 text-center">
          <Users className="h-12 w-12 text-primary" />
          <div className="bg-primary/10 px-3 py-1.5 rounded-full">
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              Coming Soon
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Create private groups or DM other traders securely. Share invite links to bring your trading friends.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center flex-col gap-3 p-4 text-center">
          <ArrowLeftRight className="h-12 w-12 text-primary" />
          <div className="bg-primary/10 px-3 py-1.5 rounded-full">
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              Coming Soon
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Swap Solana tokens instantly with the best rates from Jupiter aggregator. Support for SPL tokens and popular Solana DeFi protocols.
          </p>
        </div>
      )}
    </div>
  );
} 