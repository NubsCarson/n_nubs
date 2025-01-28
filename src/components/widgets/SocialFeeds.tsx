import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SocialFeeds() {
  return (
    <div className="space-y-4 min-w-0">
      <Tabs defaultValue="twitter" className="w-full">
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 bg-background/5 p-1 gap-1">
          <TabsTrigger
            value="twitter"
            className="text-xs py-1.5 px-1 truncate"
          >
            Twitter
          </TabsTrigger>
          <TabsTrigger
            value="discord"
            className="text-xs py-1.5 px-1 truncate"
          >
            Discord
          </TabsTrigger>
          <TabsTrigger
            value="telegram"
            className="text-xs py-1.5 px-1 truncate"
          >
            Telegram
          </TabsTrigger>
          <TabsTrigger
            value="crypto"
            className="text-xs py-1.5 px-1 truncate"
          >
            Crypto
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        <div className="bg-background/5 rounded-lg p-3">
          <p className="text-xs text-muted-foreground break-words min-w-0 overflow-hidden">
            Twitter feed integration coming soon
          </p>
        </div>
      </div>
    </div>
  );
}