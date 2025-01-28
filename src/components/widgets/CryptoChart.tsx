import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, TrendingUp } from "lucide-react";

export function CryptoChart() {
  return (
    <Card className="w-full h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">SOL/USD</h2>
        <div className="flex items-center gap-2">
          {/* Timeframe Selection */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Select defaultValue="1h">
              <SelectTrigger className="w-[100px] h-9 text-sm bg-transparent border-0 focus:ring-0 rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="live" className="text-sm">LIVE</SelectItem>
                <SelectItem value="15s" className="text-sm">15s</SelectItem>
                <SelectItem value="30s" className="text-sm">30s</SelectItem>
                <SelectItem value="1m" className="text-sm">1m</SelectItem>
                <SelectItem value="5m" className="text-sm">5m</SelectItem>
                <SelectItem value="10m" className="text-sm">10m</SelectItem>
                <SelectItem value="15m" className="text-sm">15m</SelectItem>
                <SelectItem value="30m" className="text-sm">30m</SelectItem>
                <SelectItem value="1h" className="text-sm">1H</SelectItem>
                <SelectItem value="4h" className="text-sm">4H</SelectItem>
                <SelectItem value="1d" className="text-sm">1D</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Metric Selection */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Select defaultValue="price">
              <SelectTrigger className="w-[120px] h-9 text-sm bg-transparent border-0 focus:ring-0 rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="price" className="text-sm">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Price
                  </span>
                </SelectItem>
                <SelectItem value="mcap" className="text-sm">
                  <span className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5" />
                    Market Cap
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="w-full h-[calc(100%-3rem)] bg-background rounded-lg border border-border flex items-center justify-center">
        <p className="text-muted-foreground">Chart coming soon...</p>
        {/* We'll integrate a real chart library here later */}
      </div>
    </Card>
  );
} 