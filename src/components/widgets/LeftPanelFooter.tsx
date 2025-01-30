import { Button } from "@/components/ui/button";
import { Moon, Sun, Volume2, VolumeX, Keyboard, Palette } from "lucide-react";
import { useState } from "react";

interface Props {
  onSettingsClick: () => void;
  onThemeToggle: () => void;
  isDarkMode: boolean;
  onThemesClick?: () => void;
}

export function LeftPanelFooter({ onSettingsClick, onThemeToggle, isDarkMode, onThemesClick }: Props) {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="relative">
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
  );
}

// Add these animations to your global CSS
const styles = `
@keyframes sound-wave-1 {
  0%, 100% { height: 8px; }
  50% { height: 4px; }
}
@keyframes sound-wave-2 {
  0%, 100% { height: 12px; }
  50% { height: 6px; }
}
@keyframes sound-wave-3 {
  0%, 100% { height: 6px; }
  50% { height: 3px; }
}
.animate-sound-wave-1 { animation: sound-wave-1 1.2s ease-in-out infinite; }
.animate-sound-wave-2 { animation: sound-wave-2 1.2s ease-in-out infinite 0.2s; }
.animate-sound-wave-3 { animation: sound-wave-3 1.2s ease-in-out infinite 0.4s; }
`; 