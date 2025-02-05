import { Sun, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StreakData {
  count: number;
  lastGm: string | null;
  level: number;
  progress: number;
}

export function GMStreak() {
  const [streakData, setStreakData] = useState<StreakData>({
    count: 0,
    lastGm: null,
    level: 1,
    progress: 0
  });
  const [canGm, setCanGm] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  // Calculate level and progress
  const calculateLevel = (streak: number) => {
    const level = Math.floor(streak / 7) + 1;
    const progress = ((streak % 7) / 7) * 100;
    return { level, progress };
  };

  useEffect(() => {
    // Load streak data from localStorage
    const savedData = localStorage.getItem('gmStreakData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setStreakData(parsed);
      checkCanGm(parsed.lastGm, parsed.count);
    } else {
      setCanGm(true);
    }
  }, []);

  const checkCanGm = (lastGmDate: string | null, currentStreak: number) => {
    if (!lastGmDate) {
      setCanGm(true);
      return;
    }

    const now = new Date();
    const last = new Date(lastGmDate);
    const timeDiff = now.getTime() - last.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Reset streak if more than 48 hours have passed
    if (daysDiff >= 2) {
      const newData = {
        count: 0,
        lastGm: null,
        level: 1,
        progress: 0
      };
      setStreakData(newData);
      localStorage.setItem('gmStreakData', JSON.stringify(newData));
      setCanGm(true);
      return;
    }

    // Can GM if last GM was on a different calendar day
    const canGmToday = now.toDateString() !== last.toDateString();
    setCanGm(canGmToday);
  };

  const handleGm = () => {
    if (!canGm) return;

    const now = new Date();
    const newCount = streakData.count + 1;
    const { level, progress } = calculateLevel(newCount);
    
    const newData = {
      count: newCount,
      lastGm: now.toISOString(),
      level,
      progress
    };

    setStreakData(newData);
    setCanGm(false);
    setShowAnimation(true);
    
    localStorage.setItem('gmStreakData', JSON.stringify(newData));
    
    // Reset animation
    setTimeout(() => setShowAnimation(false), 1000);
  };

  return (
    <Button
      variant="ghost"
      className="w-full p-0 h-auto hover:bg-transparent"
      onClick={handleGm}
      disabled={!canGm}
    >
      <div className={cn(
        "relative w-full p-2 rounded-lg border transition-colors",
        canGm 
          ? "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 hover:border-amber-500/30" 
          : "bg-gradient-to-r from-amber-500/5 via-amber-500/[0.02] to-transparent border-amber-500/10"
      )}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className={cn(
              "absolute inset-0 bg-amber-500/20 blur-lg rounded-full transition-opacity",
              showAnimation ? "opacity-100" : "opacity-0"
            )} />
            <div className={cn(
              "relative h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center transition-transform",
              canGm && "hover:scale-110"
            )}>
              <Sun className={cn(
                "h-3.5 w-3.5 text-amber-500 transition-transform",
                canGm && "animate-pulse"
              )} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-amber-500">GM Streak</div>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500/70" />
                <span className="text-xs text-amber-500/70">Level {streakData.level}</span>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-amber-950/20 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${streakData.progress}%` }}
                />
              </div>
              <span className="text-[10px] tabular-nums font-medium text-amber-500">{streakData.count} days</span>
            </div>
          </div>
        </div>
      </div>
    </Button>
  );
} 