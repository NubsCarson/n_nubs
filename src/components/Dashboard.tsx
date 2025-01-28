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
import { useEffect, useState } from "react";
import { GripVertical, Hand, Terminal, Activity, Cloud, Signal, BarChart2 } from "lucide-react";

const Dashboard = () => {
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showMediaPlayer, setShowMediaPlayer] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Shift + / (which is ?)
      if (event.shiftKey && event.key === "?") {
        event.preventDefault();
        setShowKeyboardShortcuts((prev) => !prev);
        return;
      }

      // Handle other keyboard shortcuts
      if (event.altKey) {
        switch (event.key.toLowerCase()) {
          case "c":
            event.preventDefault();
            setShowCalculator((prev) => !prev);
            break;
          case "m":
            event.preventDefault();
            setShowMediaPlayer((prev) => !prev);
            break;
          case "d":
            event.preventDefault();
            setShowCalendar((prev) => !prev);
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Panel - Social Media */}
      <ResizablePanel
        defaultSize={250}
        minSize={200}
        maxSize={400}
        side="left"
        className="border-r border-border bg-card"
      >
        <div className="h-full flex flex-col">
          <div className="p-4 flex-shrink-0 border-b border-border space-y-2">
            <a 
              href="https://x.com/n_nubsDEV" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#9945FF] to-[#14F195] tracking-tight flex items-center gap-2">
                n_nubs
                <Hand className="h-5 w-5 text-[#14F195] animate-wave" />
              </h2>
            </a>
            <a 
              href="https://x.com/n_nubsDEV" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Terminal className="h-4 w-4" />
              <span>terminal</span>
            </a>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              <SocialFeeds />
            </div>
          </ScrollArea>
        </div>
      </ResizablePanel>

      {/* Center Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main Content */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4 h-full">
              <CryptoChart />
            </div>
          </ScrollArea>
        </div>

        {/* Bottom Terminal/Chat Panel */}
        <div className="flex-shrink-0">
          <ResizablePanel
            direction="vertical"
            defaultSize={200}
            minSize={55}
            maxSize={500}
            className="border-t border-border bg-card"
          >
            <div className="h-full flex flex-col">
              <ChatPanel />
            </div>
          </ResizablePanel>
        </div>
      </div>

      {/* Right Panel - AI Assistant & Clock */}
      <ResizablePanel
        defaultSize={400}
        minSize={320}
        maxSize={600}
        side="right"
        className="border-l border-border bg-card"
      >
        <div className="h-full flex flex-col">
          <div className="flex-shrink-0 border-b border-border p-2">
            <div className="flex items-center justify-between">
              <Clock />
              <div className="flex items-center gap-4 px-3">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BarChart2 className="h-3.5 w-3.5 text-green-400" />
                    <span>Market</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Activity className="h-3.5 w-3.5 text-blue-400" />
                    <span>System</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Cloud className="h-3.5 w-3.5 text-yellow-400" />
                    <span>72°F</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Signal className="h-3.5 w-3.5 text-purple-400" />
                    <span>23ms</span>
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
      <Window
        title="Calculator"
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        defaultPosition={{ x: 100, y: 100 }}
        defaultSize={{ width: 300, height: 400 }}
      >
        <Calculator />
      </Window>

      <Window
        title="Media Player"
        isOpen={showMediaPlayer}
        onClose={() => setShowMediaPlayer(false)}
        defaultPosition={{ x: 150, y: 150 }}
        defaultSize={{ width: 500, height: 400 }}
      >
        <MediaPlayer />
      </Window>

      <Window
        title="Calendar"
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        defaultPosition={{ x: 200, y: 200 }}
        defaultSize={{ width: 600, height: 500 }}
      >
        <DailyJournal />
      </Window>

      <KeyboardShortcuts
        open={showKeyboardShortcuts}
        onOpenChange={setShowKeyboardShortcuts}
      />
    </div>
  );
};

export default Dashboard;