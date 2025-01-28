import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sun } from "lucide-react";

export function GMStreak() {
  const [streak, setStreak] = useState(0);
  const [lastGm, setLastGm] = useState<string | null>(null);
  const [canGm, setCanGm] = useState(false);

  useEffect(() => {
    // Load streak and last GM time from localStorage
    const savedStreak = localStorage.getItem('gmStreak');
    const savedLastGm = localStorage.getItem('lastGm');
    
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedLastGm) setLastGm(savedLastGm);
    
    // Check if user can GM today
    checkCanGm(savedLastGm);
  }, []);

  const checkCanGm = (lastGmDate: string | null) => {
    if (!lastGmDate) {
      setCanGm(true);
      return;
    }

    const now = new Date();
    const last = new Date(lastGmDate);
    
    // Reset streak if more than 48 hours have passed
    if ((now.getTime() - last.getTime()) > 48 * 60 * 60 * 1000) {
      setStreak(0);
      localStorage.setItem('gmStreak', '0');
    }
    
    // Can GM if last GM was on a different calendar day
    const canGmToday = now.toDateString() !== last.toDateString();
    setCanGm(canGmToday);
  };

  const handleGm = () => {
    if (!canGm) return;

    const now = new Date();
    const newStreak = streak + 1;
    
    setStreak(newStreak);
    setLastGm(now.toISOString());
    setCanGm(false);
    
    localStorage.setItem('gmStreak', newStreak.toString());
    localStorage.setItem('lastGm', now.toISOString());
  };

  return (
    <Button
      variant={canGm ? "default" : "outline"}
      size="sm"
      className={`gap-2 w-full justify-start ${canGm ? 'hover:bg-primary/90' : 'hover:bg-muted/50'}`}
      onClick={handleGm}
      disabled={!canGm}
    >
      <Sun className={`h-4 w-4 ${canGm ? 'animate-spin-slow text-primary-foreground' : 'text-muted-foreground'}`} />
      <span className={`font-mono ${canGm ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
        GM Streak: {streak}🔥
      </span>
    </Button>
  );
} 