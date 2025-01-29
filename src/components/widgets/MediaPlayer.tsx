import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, SkipForward, SkipBack, AlertCircle } from "lucide-react";

export const MediaPlayer = () => {
  const [url, setUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLDivElement>(null);

  const isSoundCloudUrl = (url: string) => {
    return url.toLowerCase().includes('soundcloud.com');
  };

  const getSoundCloudEmbedUrl = (url: string) => {
    // Convert regular SoundCloud URL to embed URL
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23FF5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
  };

  const handlePlay = () => {
    if (!url) {
      setError("Please enter a SoundCloud URL");
      return;
    }

    if (!isSoundCloudUrl(url)) {
      setError("Only SoundCloud URLs are supported");
      return;
    }

    setError(null);
    setIsPlaying(!isPlaying);

    // Create or update iframe
    if (iframeRef.current) {
      // Clear existing content
      while (iframeRef.current.firstChild) {
        iframeRef.current.removeChild(iframeRef.current.firstChild);
      }

      const iframe = document.createElement('iframe');
      iframe.src = getSoundCloudEmbedUrl(url);
      iframe.width = '100%';
      iframe.height = '160';
      iframe.frameBorder = '0';
      iframe.allow = 'autoplay';
      iframeRef.current.appendChild(iframe);
    }
  };

  return (
    <div className="widget-card space-y-4">
      <h2 className="text-lg font-semibold">Media Player</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter SoundCloud URL..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            className={error ? "border-red-500" : ""}
          />
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePlay}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* SoundCloud Player Container */}
        <div 
          ref={iframeRef}
          className="w-full rounded-md overflow-hidden bg-card"
        />

        <div className="text-sm text-muted-foreground text-center">
          Paste a SoundCloud track URL to play
        </div>
      </div>
    </div>
  );
};