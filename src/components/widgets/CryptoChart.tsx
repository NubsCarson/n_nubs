import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Plus, TrendingUp, X, Command, Keyboard, MousePointerClick, Rocket, Search, Star, Sparkles, LineChart, List, GripHorizontal } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type VariantProps } from "class-variance-authority";

interface ChartTab {
  id: string;
  title: string;
  pair: string;
  type: 'welcome' | 'chart' | 'google-search';
  mode: 'memescope' | 'trending' | 'dex' | 'cex' | 'custom' | 'watchlist' | 'google-search' | null;
}

const TRADING_PAIRS = [
  "BTC/USD",
  "ETH/USD",
  "SOL/USD",
  "BONK/USD",
  "JUP/USD",
  "JTO/USD",
];

interface SortableTabProps {
  tab: ChartTab;
  active: boolean;
  onActivate: () => void;
  onClose: (e: React.MouseEvent) => void;
}

function SortableTab({ tab, active, onActivate, onClose }: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 px-4 py-2 border-r border-border cursor-pointer hover:bg-background/50 min-w-[120px] transition-colors select-none rounded-t-lg",
        active && "bg-background",
        isDragging && "opacity-50"
      )}
      onClick={onActivate}
      {...attributes}
    >
      <div
        className="opacity-0 group-hover:opacity-100 hover:bg-muted rounded-sm p-0.5 cursor-grab active:cursor-grabbing select-none"
        {...listeners}
      >
        <GripHorizontal className="h-3 w-3" />
      </div>
      <span className="flex-1 text-sm truncate select-none">{tab.title}</span>
      {tab.type !== 'welcome' && (
        <button
          onClick={onClose}
          className="opacity-0 group-hover:opacity-100 hover:bg-muted rounded-sm p-0.5 select-none"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// Add type declaration for Google Search
declare global {
  interface Window {
    google?: {
      search?: {
        cse?: {
          element?: {
            render: (options: { div: HTMLElement; tag: string }) => void;
          };
        };
      };
    };
  }
}

export function CryptoChart() {
  const [tabs, setTabs] = useState<ChartTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isNewTabDialogOpen, setIsNewTabDialogOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Create initial welcome tab on mount
  useEffect(() => {
    if (tabs.length === 0) {
      const welcomeTab = {
        id: crypto.randomUUID(),
        title: "New Tab",
        pair: "",
        type: 'welcome' as const,
        mode: null,
      };
      setTabs([welcomeTab]);
      setActiveTab(welcomeTab.id);
    }
  }, []);

  // Get current tab
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  // Effect to initialize Google Search when tab becomes active
  useEffect(() => {
    if (currentTab?.type === 'google-search' && searchContainerRef.current) {
      // Clear previous content
      searchContainerRef.current.innerHTML = '';
      // Create new search element
      const searchDiv = document.createElement('div');
      searchDiv.className = 'gcse-search';
      searchContainerRef.current.appendChild(searchDiv);
      
      // Reinitialize Google Search
      if (window.google?.search?.cse?.element?.render) {
        window.google.search.cse.element.render({
          div: searchDiv,
          tag: 'search'
        });
      }
    }
  }, [currentTab?.type]);

  const createNewTab = (mode: ChartTab['mode']): ChartTab => {
    const randomPair = TRADING_PAIRS[Math.floor(Math.random() * TRADING_PAIRS.length)];
    const title = mode === 'memescope' ? 'MemeScope+' :
                 mode === 'trending' ? 'Trending' :
                 mode === 'dex' ? 'DEX Search' :
                 mode === 'cex' ? 'CEX Search' :
                 mode === 'custom' ? 'Custom Chart' :
                 mode === 'watchlist' ? 'My Watchlist' :
                 mode === 'google-search' ? 'Google Search' : randomPair;
    
    const type = mode === 'google-search' ? ('google-search' as const) : ('chart' as const);
    
    return {
      id: crypto.randomUUID(),
      title,
      pair: randomPair,
      type,
      mode,
    };
  };

  const addNewTab = (mode: ChartTab['mode']) => {
    const newTab = createNewTab(mode);
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
    setIsNewTabDialogOpen(false);
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // Don't close the last tab
    
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);
    
    // If we're closing the active tab, activate the previous tab
    if (activeTab === tabId) {
      const index = tabs.findIndex((tab) => tab.id === tabId);
      const newActiveTab = newTabs[Math.max(0, index - 1)];
      setActiveTab(newActiveTab.id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTabs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (!activeTab) {
    return null; // Or a loading state
  }

  return (
    <Card className="w-full h-full flex flex-col">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-border bg-muted/50 px-2 pt-2">
        <div className="flex-1 flex items-center overflow-x-auto scrollbar-none">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tabs}
              strategy={horizontalListSortingStrategy}
            >
              {tabs.map((tab) => (
                <SortableTab
                  key={tab.id}
                  tab={tab}
                  active={activeTab === tab.id}
                  onActivate={() => setActiveTab(tab.id)}
                  onClose={(e) => closeTab(tab.id, e)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-2"
          onClick={() => setIsNewTabDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* New Tab Dialog */}
      <Dialog open={isNewTabDialogOpen} onOpenChange={setIsNewTabDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Choose Tab Type</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-6">
            <Button
              variant="outline"
              size="default"
              className="h-auto min-h-[200px] w-full p-6 flex flex-col items-center relative bg-card hover:bg-card/80"
              onClick={() => addNewTab('memescope')}
            >
              <Rocket className="h-16 w-16 text-primary" />
              <h3 className="font-semibold text-xl mt-4">MemeScope+</h3>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground text-center px-4 leading-relaxed">
                  Track viral tokens<br />
                  social sentiment &<br />
                  emerging meme trends
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto min-h-[200px] w-full p-6 flex flex-col items-center relative bg-card hover:bg-card/80"
              onClick={() => addNewTab('trending')}
            >
              <Sparkles className="h-16 w-16 text-primary" />
              <h3 className="font-semibold text-xl mt-4">Trending</h3>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground text-center px-4 leading-relaxed">
                  Discover the hottest<br />
                  tokens and market<br />
                  movements in realtime
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto min-h-[200px] w-full p-6 flex flex-col items-center relative bg-card hover:bg-card/80"
              onClick={() => addNewTab('dex')}
            >
              <Search className="h-16 w-16 text-primary" />
              <h3 className="font-semibold text-xl mt-4">Search DEX</h3>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground text-center px-4 leading-relaxed">
                  Find and analyze<br />
                  tokens across all<br />
                  decentralized exchanges
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto min-h-[200px] w-full p-6 flex flex-col items-center relative bg-card hover:bg-card/80"
              onClick={() => addNewTab('cex')}
            >
              <LineChart className="h-16 w-16 text-primary" />
              <h3 className="font-semibold text-xl mt-4">Search CEX</h3>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground text-center px-4 leading-relaxed">
                  Explore tokens listed<br />
                  on major centralized<br />
                  exchanges worldwide
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto min-h-[200px] w-full p-6 flex flex-col items-center relative bg-card hover:bg-card/80"
              onClick={() => addNewTab('custom')}
            >
              <Activity className="h-16 w-16 text-primary" />
              <h3 className="font-semibold text-xl mt-4">Create Your Own!</h3>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground text-center px-4 leading-relaxed">
                  Launch your token<br />
                  with AI-powered smart<br />
                  contract generation
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto min-h-[200px] w-full p-6 flex flex-col items-center relative bg-card hover:bg-card/80"
              onClick={() => addNewTab('watchlist')}
            >
              <List className="h-16 w-16 text-primary" />
              <h3 className="font-semibold text-xl mt-4">My Watchlist's</h3>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground text-center px-4 leading-relaxed">
                  Monitor your tokens<br />
                  with custom alerts<br />
                  and analytics
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto min-h-[200px] w-full p-6 flex flex-col items-center relative bg-card hover:bg-card/80"
              onClick={() => addNewTab('google-search')}
            >
              <Search className="h-16 w-16 text-primary" />
              <h3 className="font-semibold text-xl mt-4">Google Search</h3>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground text-center px-4 leading-relaxed">
                  Search the web<br />
                  directly from your<br />
                  terminal
                </p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content */}
      <div className="flex-1 p-4">
        {currentTab?.type === 'welcome' ? (
          <div className="h-full flex flex-col items-center justify-center gap-8 max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold">Welcome to n_nubs Terminal</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <Card className="p-6 flex flex-col gap-3 items-center">
                <MousePointerClick className="h-8 w-8 text-primary" />
                <h2 className="text-lg font-semibold">Getting Started</h2>
                <p className="text-sm text-muted-foreground">
                  Click the + button in the top right to open a new chart. Each tab can track a different trading pair.
                </p>
              </Card>
              <Card className="p-6 flex flex-col gap-3 items-center">
                <Command className="h-8 w-8 text-primary" />
                <h2 className="text-lg font-semibold">Quick Actions</h2>
                <p className="text-sm text-muted-foreground">
                  Use the dropdown menus to change trading pairs, timeframes, and metrics for each chart.
                </p>
              </Card>
              <Card className="p-6 flex flex-col gap-3 items-center">
                <Keyboard className="h-8 w-8 text-primary" />
                <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
                <p className="text-sm text-muted-foreground">
                  Press CTRL + ? anywhere in the terminal to view all available keyboard shortcuts.
                </p>
              </Card>
              <Card className="p-6 flex flex-col gap-3 items-center">
                <Activity className="h-8 w-8 text-primary" />
                <h2 className="text-lg font-semibold">Real-time Data</h2>
                <p className="text-sm text-muted-foreground">
                  Monitor multiple assets simultaneously with live price updates and market data.
                </p>
              </Card>
            </div>
            <Button onClick={() => setIsNewTabDialogOpen(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Open Your First Chart
            </Button>
          </div>
        ) : currentTab?.type === 'google-search' ? (
          <div className="w-full h-full flex flex-col bg-white dark:bg-background p-4 rounded-lg overflow-auto">
            <div ref={searchContainerRef} className="w-full h-full min-h-[600px]"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                {/* Removing the redundant pair display and dropdown */}
              </div>
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
          </>
        )}
      </div>
    </Card>
  );
} 