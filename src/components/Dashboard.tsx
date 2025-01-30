/** @jsxRuntime classic */
/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Clock } from "./widgets/Clock";
import { Calculator } from "./widgets/Calculator";
import { MediaPlayer } from "./widgets/MediaPlayer";
import { DailyJournal } from "./widgets/DailyJournal";
import { SocialFeeds } from "./widgets/SocialFeeds";
import { CryptoChart } from "./widgets/CryptoChart";
import { ChatPanel } from "./widgets/ChatPanel";
import { AIChatPanel } from "./widgets/AIChatPanel";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { Window } from "./ui/Window";
import { ResizablePanel } from "./ui/ResizablePanel";
import { ScrollArea } from "./ui/ScrollArea";
import { GripVertical, Hand, Terminal, Activity, Cloud, Signal, BarChart2, ChevronDown, User, Settings, Wallet, History, LogOut, Star, Bell, BellOff, Trash2, X, Menu, Maximize2, Minimize2, ArrowLeft, ArrowRight, Monitor, Moon, Sun, Palette, Keyboard } from "lucide-react";
import { GMStreak } from "./widgets/GMStreak";
import { LeftPanelFooter } from "./widgets/LeftPanelFooter";
import { cn } from "../lib/utils";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showMediaPlayer, setShowMediaPlayer] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const { 
    notifications, 
    clearNotifications, 
    markAllAsRead, 
    markAsRead,
    removeNotification 
  } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && (event.key === "?" || event.key === "/")) {
        event.preventDefault();
        setShowKeyboardShortcuts((prev) => !prev);
        return;
      }

      if (event.altKey) {
        switch (event.key.toLowerCase()) {
          case "c":
            event.preventDefault();
            setShowCalculator((prev) => !prev);
            break;
        }
      }
      
      if (event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case "y":
            event.preventDefault();
            setShowCalendar((prev) => !prev);
            break;
          case "m":
            event.preventDefault();
            setShowMediaPlayer((prev) => !prev);
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSettingsClick = () => {
    setShowKeyboardShortcuts(true);
  };

  const handleThemesClick = () => {
    const event = new CustomEvent('openThemesTab');
    window.dispatchEvent(event);
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      dashboardRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  return (
    <div ref={dashboardRef} className="flex h-screen overflow-hidden bg-background">
      {/* Left Panel - Social Media */}
      <ResizablePanel
        defaultSize={250}
        minSize={260}
        maxSize={400}
        side="left"
        className="border-r border-border bg-card"
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex-shrink-0 border-b border-border space-y-4">
            <a 
              href="https://x.com/n_nubsDEV" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#9945FF] to-[#14F195] tracking-tight flex items-center gap-3">
                n_nubs
                <Hand className="h-8 w-8 text-[#14F195] animate-wave" />
              </h2>
            </a>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors">
                <Terminal className="h-5 w-5" />
                <span>terminal</span>
              </a>
              <GMStreak />
            </div>
          </div>
          <div className="flex-1">
            <SocialFeeds />
          </div>
        </div>
      </ResizablePanel>

      {/* Center Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1">
          <CryptoChart />
        </div>
        <ResizablePanel
          direction="vertical"
          defaultSize={200}
          minSize={55}
          maxSize={500}
          className="border-t border-border"
        >
          <ChatPanel />
        </ResizablePanel>
      </div>

      {/* Right Panel - AI Assistant & Clock */}
      <ResizablePanel
        defaultSize={400}
        minSize={320}
        maxSize={600}
        side="right"
        className="relative border-l border-border bg-card"
      >
        <div className="h-full flex flex-col">
          <div className="flex-shrink-0 border-b border-border">
            <div className="flex items-center justify-between p-2 px-3 bg-gradient-to-r from-background to-card backdrop-blur-sm">
              <Clock />
              <div className="flex items-center gap-2">
                {/* Notifications Button */}
                <div className="relative group/notifications">
                  <button 
                    className="flex items-center gap-1.5 hover:bg-accent/50 transition-colors rounded-md px-1.5 py-1"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    {unreadCount > 0 ? (
                      <div className="relative">
                        <Bell className="h-4 w-4 text-primary" />
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 flex items-center justify-center">
                          <span className="text-[10px] text-white font-medium">{unreadCount}</span>
                        </div>
                      </div>
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Profile Button */}
                <div className="relative group/profile">
                  <button className="flex items-center gap-1.5 hover:bg-accent/50 transition-colors rounded-md px-1.5 py-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/90 to-primary/50 flex items-center justify-center text-primary-foreground font-medium text-xs">
                      NN
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="px-3 py-2 border-t border-border/10">
              {/* Trading Score */}
              <div className="relative p-2 rounded-lg bg-gradient-to-r from-emerald-500/5 via-emerald-500/[0.02] to-transparent border border-emerald-500/10">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full" />
                    <div className="relative h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <BarChart2 className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-emerald-500">Trading Score</div>
                      <div className="text-xs text-emerald-500/70">Level 4</div>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-emerald-950/20 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-[75%] rounded-full" />
                      </div>
                      <span className="text-[10px] tabular-nums font-medium text-emerald-500">75%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {/* Trades */}
                <div className="group relative p-2 rounded-lg bg-gradient-to-b from-blue-500/[0.08] to-blue-500/[0.03] border border-blue-500/10 hover:border-blue-500/20 transition-colors">
                  <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                  <div className="relative">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-blue-500 tabular-nums">247</span>
                      <span className="text-[10px] font-medium text-blue-500/70">wins</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Trades</span>
                  </div>
                </div>

                {/* Win Rate */}
                <div className="group relative p-2 rounded-lg bg-gradient-to-b from-amber-500/[0.08] to-amber-500/[0.03] border border-amber-500/10 hover:border-amber-500/20 transition-colors">
                  <div className="absolute inset-0 bg-amber-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                  <div className="relative">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-amber-500 tabular-nums">84.3</span>
                      <span className="text-[10px] font-medium text-amber-500/70">%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Win Rate</span>
                  </div>
                </div>

                {/* Response */}
                <div className="group relative p-2 rounded-lg bg-gradient-to-b from-purple-500/[0.08] to-purple-500/[0.03] border border-purple-500/10 hover:border-purple-500/20 transition-colors">
                  <div className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                  <div className="relative">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-purple-500 tabular-nums">23</span>
                      <span className="text-[10px] font-medium text-purple-500/70">ms</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Response</span>
                  </div>
                </div>
              </div>

              {/* Achievement Progress */}
              <div className="mt-2 p-2 rounded-lg bg-gradient-to-r from-primary/[0.08] to-transparent">
                <div className="flex items-center gap-2">
                  <div className="relative flex-shrink-0">
                    <div className="absolute w-2 h-2 rounded-full bg-primary/60 animate-ping" />
                    <div className="relative w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="text-xs text-primary/70">
                      Next achievement in <span className="font-medium text-primary">3</span>
                    </div>
                    <div className="flex-1 h-1 rounded-full bg-primary/10 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500 ease-out"
                        style={{ width: '85%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <AIChatPanel />
          </div>
        </div>
      </ResizablePanel>

      {/* Floating Windows */}
      {showCalculator && (
        <Window
          title="Calculator"
          isOpen={showCalculator}
          onClose={() => setShowCalculator(false)}
          defaultPosition={{ x: 100, y: 100 }}
          defaultSize={{ width: 300, height: 400 }}
        >
          <Calculator />
        </Window>
      )}

      {showMediaPlayer && (
        <Window
          title="Media Player"
          isOpen={showMediaPlayer}
          onClose={() => setShowMediaPlayer(false)}
          defaultPosition={{ x: 150, y: 150 }}
          defaultSize={{ width: 500, height: 400 }}
        >
          <MediaPlayer />
        </Window>
      )}

      {showCalendar && (
        <Window
          title="Calendar"
          isOpen={showCalendar}
          onClose={() => setShowCalendar(false)}
          defaultPosition={{ x: 200, y: 200 }}
          defaultSize={{ width: 600, height: 500 }}
        >
          <DailyJournal />
        </Window>
      )}

      {/* Keyboard Shortcuts Dialog */}
      {showKeyboardShortcuts && (
        <KeyboardShortcuts
          open={showKeyboardShortcuts}
          onOpenChange={setShowKeyboardShortcuts}
        />
      )}
    </div>
  );
};

export default Dashboard;