import { Button } from "@/components/ui/button";
import { Settings, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

interface Props {
  onSettingsClick: () => void;
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

export function LeftPanelFooter({ onSettingsClick, onThemeToggle, isDarkMode }: Props) {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="flex-shrink-0 border-t border-border p-2">
      <div className="flex items-center justify-between px-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onSettingsClick}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onThemeToggle}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
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
  );
} 