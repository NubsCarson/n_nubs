import { Button } from "@/components/ui/button";
import { Twitter, MessageSquare, Send, Rocket, Moon, Sun, Volume2, VolumeX, Keyboard, Palette } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = "twitter" | "discord" | "telegram" | "crypto";

interface Props {
  onSettingsClick?: () => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  onThemesClick?: () => void;
}

export function SocialFeeds({ onSettingsClick, onThemeToggle, isDarkMode, onThemesClick }: Props) {
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("twitter");

  const tabs = [
    { id: "twitter" as Tab, icon: Twitter, label: "Twitter", color: "primary" },
    { id: "discord" as Tab, icon: MessageSquare, label: "Discord", color: "blue-500" },
    { id: "telegram" as Tab, icon: Send, label: "Telegram", color: "sky-500" },
    { id: "crypto" as Tab, icon: Rocket, label: "Crypto", color: "purple-500" }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Header */}
      <div className="relative p-1.5">
        <div className="grid grid-cols-2 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors relative",
                  isActive 
                    ? `text-${tab.color} bg-${tab.color}/10`
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {isActive && (
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shine" />
                )}
              </button>
            );
          })}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-border/0 via-border/50 to-border/0" />
      </div>

      <div className="flex-1 space-y-6 p-4">
        {/* Twitter Feed */}
        <div className={cn(
          "relative p-4 rounded-lg border border-border/50 bg-gradient-to-b from-primary/5 to-transparent transition-opacity duration-200 min-h-[160px] flex items-center",
          activeTab === "twitter" ? "opacity-100" : "opacity-0 hidden"
        )}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" />
          <div className="flex flex-col items-center gap-3 text-center w-full">
            <Twitter className="h-8 w-8 text-primary" />
            <div className="bg-primary/10 px-3 py-1.5 rounded-full">
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Twitter feed integration with real-time updates and trending topics
            </p>
          </div>
        </div>

        {/* Discord Feed */}
        <div className={cn(
          "relative p-4 rounded-lg border border-border/50 bg-gradient-to-b from-blue-500/5 to-transparent transition-opacity duration-200 min-h-[160px] flex items-center",
          activeTab === "discord" ? "opacity-100" : "opacity-0 hidden"
        )}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0" />
          <div className="flex flex-col items-center gap-3 text-center w-full">
            <MessageSquare className="h-8 w-8 text-blue-500" />
            <div className="bg-blue-500/10 px-3 py-1.5 rounded-full">
              <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Discord community integration with live chat and announcements
            </p>
          </div>
        </div>

        {/* Telegram Feed */}
        <div className={cn(
          "relative p-4 rounded-lg border border-border/50 bg-gradient-to-b from-sky-500/5 to-transparent transition-opacity duration-200 min-h-[160px] flex items-center",
          activeTab === "telegram" ? "opacity-100" : "opacity-0 hidden"
        )}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-sky-500/0 via-sky-500/30 to-sky-500/0" />
          <div className="flex flex-col items-center gap-3 text-center w-full">
            <Send className="h-8 w-8 text-sky-500" />
            <div className="bg-sky-500/10 px-3 py-1.5 rounded-full">
              <span className="text-sm font-medium bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Telegram channel integration with market signals and alerts
            </p>
          </div>
        </div>

        {/* Crypto Feed */}
        <div className={cn(
          "relative p-4 rounded-lg border border-border/50 bg-gradient-to-b from-purple-500/5 to-transparent transition-opacity duration-200 min-h-[160px] flex items-center",
          activeTab === "crypto" ? "opacity-100" : "opacity-0 hidden"
        )}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-purple-500/0" />
          <div className="flex flex-col items-center gap-3 text-center w-full">
            <Rocket className="h-8 w-8 text-purple-500" />
            <div className="bg-purple-500/10 px-3 py-1.5 rounded-full">
              <span className="text-sm font-medium bg-gradient-to-r from-purple-500 to-purple-400 bg-clip-text text-transparent">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Crypto news feed with price alerts and trending tokens
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative mt-auto">
        {/* Animated top border */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-border/0 via-primary/20 to-border/0" />
        
        <div className="flex-shrink-0 p-2">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-1">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onThemeToggle}
                className="relative h-8 w-8 flex items-center justify-center"
              >
                {isDarkMode ? (
                  <Moon className="h-4 w-4 text-primary transition-colors" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-500 transition-colors" />
                )}
              </Button>

              {/* Themes Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onThemesClick}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              >
                <Palette className="h-3.5 w-3.5" />
                <span>Themes</span>
              </Button>

              {/* Keyboard Shortcuts Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettingsClick}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              >
                <Keyboard className="h-3.5 w-3.5" />
                <span>Ctrl + ?</span>
              </Button>
            </div>

            {/* Sound Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}