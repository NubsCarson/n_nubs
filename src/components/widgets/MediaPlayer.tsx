import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

export const MediaPlayer = () => {
  const [url, setUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="widget-card">
      <h2 className="text-lg font-semibold mb-4">Media Player</h2>
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Enter media URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <div className="flex justify-center space-x-2">
          <Button variant="outline" size="icon">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" size="icon">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};