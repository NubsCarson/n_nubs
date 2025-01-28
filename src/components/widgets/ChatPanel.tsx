import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Send, Lock, MessageSquare, Users, ArrowLeftRight } from "lucide-react";
import { useState } from "react";

interface Message {
  id: number;
  content: string;
  timestamp: string;
  sender: string;
}

const demoMessages: Message[] = [
  {
    id: 1,
    content: "Welcome to the public chat room! 👋",
    timestamp: "12:00 PM",
    sender: "System"
  },
  {
    id: 2,
    content: "Chat functionality coming soon...",
    timestamp: "12:01 PM",
    sender: "System"
  },
  {
    id: 3,
    content: "You'll be able to connect with other traders and discuss market trends in real-time!",
    timestamp: "12:02 PM",
    sender: "System"
  },
  {
    id: 4,
    content: "Features will include: live price discussions, trading signals, and market analysis sharing.",
    timestamp: "12:03 PM",
    sender: "System"
  }
];

type ChatMode = "public" | "private" | "swap";

export function ChatPanel() {
  const [mode, setMode] = useState<ChatMode>("public");

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
                  className="bg-muted/50 rounded-lg p-3 space-y-1"
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{message.sender}</span>
                    <span className="text-muted-foreground text-xs">
                      {message.timestamp}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
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
          </div>
        </>
      ) : mode === "private" ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-3 p-4 text-center">
          <Users className="h-12 w-12 text-muted-foreground" />
          <h3 className="font-medium">Private Chat Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Create private groups or DM other traders securely. Share invite links to bring your trading friends.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center gap-8 p-4">
          <div className="flex flex-col gap-3 text-center max-w-[280px]">
            <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="font-medium">Solana Token Swap Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              Swap Solana tokens instantly with the best rates from Jupiter aggregator. Support for SPL tokens and popular Solana DeFi protocols.
            </p>
          </div>
          <div className="w-full max-w-sm p-4 rounded-lg border border-border bg-muted/50">
            <div className="space-y-4">
              <div className="rounded-lg bg-background p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">From</span>
                  <span className="text-muted-foreground">Balance: 0.00</span>
                </div>
                <Input disabled placeholder="0.0" className="border-0 bg-transparent text-lg p-0 h-auto" />
              </div>
              <div className="rounded-lg bg-background p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">To</span>
                  <span className="text-muted-foreground">Balance: 0.00</span>
                </div>
                <Input disabled placeholder="0.0" className="border-0 bg-transparent text-lg p-0 h-auto" />
              </div>
              <Button className="w-full" disabled>
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 