import { useState, useRef, useEffect, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Bot, Send, User, Key, AlertCircle, CheckCircle2, Settings, ChevronUp, ChevronDown, LayoutPanelTop } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatsVisibilityContext } from "../Dashboard";

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

const SYSTEM_PROMPT = `Role: You are an advanced AI trading assistant specializing in Solana-based tokens and memecoins. Your purpose is to provide insights, strategies, and explanations regarding cryptocurrency markets, with a special focus on the Solana ecosystem. You are knowledgeable about major Solana memecoins like BONK, DOGWIFHAT (WIF), POPCAT, MYRO, and others, as well as key Solana infrastructure like Jupiter (JUP), Jito (JTO), and Marinade (MNDE).

Core Knowledge Base:
- Deep understanding of the Solana blockchain, its technical advantages (high speed, low fees), and ecosystem
- Comprehensive knowledge of Solana DEXs (Jupiter, Raydium, Orca) and their mechanics
- Familiarity with Solana wallets (Phantom, Solflare) and their features
- Understanding of Solana NFT marketplaces (Tensor, Magic Eden) and their impact on token economics
- Knowledge of key Solana memecoins and their histories, communities, and market behaviors
- Expert knowledge of Pump.fun platform and its features:
  • Understanding of Pump.fun's role as a Solana-based trading platform
  • Knowledge of Pump.fun's unique trading mechanics and tools
  • Familiarity with Pump.fun's community and trading strategies
  • Awareness of Pump.fun's impact on Solana memecoin trading
  • Understanding of Pump.fun's integration with other Solana tools

Market Analysis Capabilities:
- Track and analyze current Solana memecoin trends and market movements
- Interpret technical indicators (RSI, MACD, Volume) in the context of Solana's high-speed market
- Monitor and explain on-chain metrics using tools like Solscan, Solana FM, and Dune Analytics
- Analyze liquidity pools, trading volumes, and holder distributions
- Special focus on Pump.fun trading metrics and patterns
- Track Pump.fun-specific market indicators and trends

Education & Trading Guidance:
- Explain Solana-specific concepts (SPL tokens, rent, staking)
- Break down memecoin trading strategies specific to Solana's market dynamics
- Guide users on using Solana DEX aggregators and trading tools
- Provide context on Solana ecosystem developments and their market impact
- Explain Pump.fun platform mechanics and best practices
- Guide users on effective use of Pump.fun tools and features

Risk Management Focus:
- Emphasize the high volatility of Solana memecoins
- Explain Solana-specific risks (network congestion, MEV)
- Guide on position sizing and risk management specific to Solana trading
- Discuss wallet security and best practices for Solana users
- Specific focus on Pump.fun trading risks and mitigation strategies
- Explain Pump.fun-specific security considerations

Important Guidelines:
- Always provide current, accurate information about the Solana ecosystem and Pump.fun platform
- Acknowledge when information might be outdated due to the fast-moving nature of crypto markets
- Include relevant disclaimers about trading risks
- Never provide financial advice, only educational information
- Maintain professionalism while being approachable and clear
- Use bullet points and clear formatting for complex explanations
- Stay updated on major Solana developments and token trends
- Keep current with Pump.fun platform updates and changes

Remember: Focus on education and information rather than predictions or advice. Always encourage users to do their own research and understand the risks involved in memecoin trading.`;

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: "Hello! I'm your AI assistant. I can help you analyze markets, develop trading strategies, and provide insights about Solana and cryptocurrencies. How can I assist you today?",
  timestamp: new Date().toLocaleTimeString()
};



export function ChatV2() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('openai_api_key') || '';
  });
  const [model, setModel] = useState(() => {
    return localStorage.getItem('openai_model') || 'gpt-4';
  });
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isStatsVisible, toggleStats } = useContext(StatsVisibilityContext);

  // Load API key from localStorage
  useEffect(() => {
    if (apiKey) {
      validateApiKey(apiKey);
    }
  }, [apiKey]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const validateApiKey = async (key: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`,
        },
      });
      const isValid = response.ok;
      setIsApiKeyValid(isValid);
      if (isValid) {
        localStorage.setItem('openai_api_key', key);
      }
      return isValid;
    } catch (error) {
      setIsApiKeyValid(false);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !apiKey || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: input.trim() }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none border-b border-border">
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <Select
              value={model}
              onValueChange={(value) => {
                setModel(value);
                localStorage.setItem('openai_model', value);
              }}
            >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleStats}
              className="h-8 w-8"
              title={isStatsVisible ? "Hide stats" : "Show stats"}
            >
              <LayoutPanelTop className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              className="h-8 w-8"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages.map((message, index) => (
            message.role !== 'system' && (
              <div
                key={index}
                className={cn(
                  "flex gap-3 text-sm",
                  message.role === 'assistant' ? "items-start" : "items-start justify-end"
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={cn(
                  "rounded-lg px-3 py-2 max-w-[80%]",
                  message.role === 'assistant' 
                    ? "bg-muted" 
                    : "bg-primary text-primary-foreground"
                )}>
                  <div className="break-words whitespace-pre-line">{message.content}</div>
                  {message.timestamp && (
                    <div className={cn(
                      "text-[10px] mt-1",
                      message.role === 'assistant' 
                        ? "text-muted-foreground" 
                        : "text-primary-foreground/70"
                    )}>
                      {message.timestamp}
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            )
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Form */}
      <div className="flex-none border-t border-border">
        <div className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder={apiKey ? "Type a message..." : "Please enter your API key in settings"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!apiKey || isLoading}
            />
            <Button 
              type="submit" 
              disabled={!apiKey || !input.trim() || isLoading}
              className="shrink-0"
            >
              {isLoading ? "Sending..." : "Send"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>AI Chat Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">OpenAI API Key</label>
              <div className="relative">
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-8"
                />
                <Key className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              {isApiKeyValid !== null && (
                <div className={cn(
                  "flex items-center gap-1.5 text-xs",
                  isApiKeyValid ? "text-green-500" : "text-red-500"
                )}>
                  {isApiKeyValid ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      API key is valid
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5" />
                      Invalid API key
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 