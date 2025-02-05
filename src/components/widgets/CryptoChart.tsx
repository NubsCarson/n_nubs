import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Plus, TrendingUp, X, Command, Keyboard, MousePointerClick as MousePointerClickIcon, Rocket, Search, Star, Sparkles, LineChart, List, GripHorizontal, AlertTriangle, ChevronLeft, ChevronRight, Home, Code, Newspaper, Maximize2, Wrench, Clock, Palette } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
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
import { v4 as uuidv4 } from 'uuid';
import { ThemesTab } from "./ThemesTab";

interface ChartTab {
  id: string;
  title: string;
  pair: string;
  type: 'welcome' | 'chart' | 'google-search' | 'iframe-search' | 'my-home' | 'test' | 'themes';
  mode: 'memescope' | 'trending' | 'dex' | 'cex' | 'custom' | 'watchlist' | 'google-search' | 'iframe-search' | 'my-home' | 'test' | 'themes' | null;
  url?: string;
  nonEmbeddableUrl?: string;
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

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  htmlTitle: string;
  htmlSnippet: string;
  displayLink: string;
}

interface SearchResponse {
  items?: SearchResult[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
  error?: {
    message: string;
  };
}

// Add list of known non-embeddable domains
const NON_EMBEDDABLE_DOMAINS = [
  'twitter.com',
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'google.com',
  'youtube.com'
];

// Add this interface above the component
interface IframeContainerProps {
  tab: ChartTab;
  isActive: boolean;
}

// Add this component above the main CryptoChart component
function IframeContainer({ tab, isActive }: IframeContainerProps) {
  const iframeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!iframeRef.current || !tab.url) return;
    
    // Only create iframe if it doesn't exist
    if (!iframeRef.current.firstChild) {
      const iframe = document.createElement('iframe');
      iframe.src = tab.url;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframeRef.current.appendChild(iframe);
    }
  }, [tab.url]);

  return (
    <div 
      ref={iframeRef}
      className="w-full h-full"
      style={{
        display: isActive ? 'block' : 'none',
        position: 'relative',
        minHeight: '100%'
      }}
    />
  );
}

// Add interface for the component props
interface IframeLinkDirectoryProps {
  createNewTab: (mode: ChartTab['mode']) => ChartTab;
  checkIframeCompatibility: (url: string) => Promise<boolean>;
  setTabs: React.Dispatch<React.SetStateAction<ChartTab[]>>;
  handleTabChange: (index: number) => void;
  tabs: ChartTab[];
}

// Update the component to use props
function IframeLinkDirectory({ 
  createNewTab, 
  checkIframeCompatibility, 
  setTabs, 
  handleTabChange, 
  tabs 
}: IframeLinkDirectoryProps) {
  const categories = [
    {
      title: "General Use Sites",
      icon: <Home className="h-6 w-6" />,
      items: [
        { name: "Wiby.me", url: "https://wiby.me" },
        { name: "OpenStreetMap", url: "https://www.openstreetmap.org/export/embed.html" },
        { name: "Archive.org Today", url: "https://web.archive.org/web/today/" }
      ]
    },
    {
      title: "Developer Tools",
      icon: <Code className="h-6 w-6" />,
      items: [
        { name: "JSFiddle", url: "https://jsfiddle.net/" },
        { name: "CodeSandbox", url: "https://codesandbox.io/s/" },
        { name: "Replit", url: "https://replit.com/" },
        { name: "StackBlitz", url: "https://stackblitz.com/" },
        { name: "DevDocs", url: "https://devdocs.io/" }
      ]
    }
  ];

  const openInNewTab = useCallback(async (url: string) => {
    const newTab = createNewTab('iframe-search');
    const isEmbeddable = await checkIframeCompatibility(url);
    
    if (isEmbeddable) {
      newTab.url = url;
    } else {
      newTab.nonEmbeddableUrl = url;
    }
    
    setTabs(prev => [...prev, newTab]);
    handleTabChange(tabs.length);
  }, [createNewTab, handleTabChange, tabs.length]);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Quick Access Directory</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Click any link below to open it in a new tab. Compatible sites will open directly in the terminal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <Card key={category.title} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-primary">{category.icon}</div>
              <h2 className="text-xl font-semibold">{category.title}</h2>
            </div>
            <div className="space-y-4">
              {category.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="font-medium">{item.name}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openInNewTab(item.url)}
                  >
                    Open
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Add this interface above the component
interface TabOption {
  mode: ChartTab['mode'];
  title: string;
  description: string;
  icon: JSX.Element;
  category: 'trading' | 'search' | 'tools';
}

export function CryptoChart() {
  // Initialize with a welcome tab
  const [tabs, setTabs] = useState<ChartTab[]>([{
    id: uuidv4(),
    title: "Welcome",
    pair: "",
    type: "welcome",
    mode: null
  }]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isNewTabDialogOpen, setIsNewTabDialogOpen] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [tabSearch, setTabSearch] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentTab = tabs[activeTab];

  // Add this constant for all available tabs
  const TAB_OPTIONS: TabOption[] = [
    {
      mode: 'memescope',
      title: 'MemeScope+',
      description: 'Track viral tokens & trends',
      icon: <Rocket className="h-5 w-5" />,
      category: 'trading'
    },
    {
      mode: 'trending',
      title: 'Trending',
      description: 'Hot market movements',
      icon: <Sparkles className="h-5 w-5" />,
      category: 'trading'
    },
    {
      mode: 'themes',
      title: 'Themes',
      description: 'Customize your workspace',
      icon: <Palette className="h-5 w-5" />,
      category: 'tools'
    },
    {
      mode: 'google-search',
      title: 'Google Search',
      description: 'Search the web',
      icon: <Search className="h-5 w-5" />,
      category: 'search'
    },
    {
      mode: 'iframe-search',
      title: 'iFrame Search',
      description: 'Embeddable sites only',
      icon: <Maximize2 className="h-5 w-5" />,
      category: 'search'
    },
    {
      mode: 'my-home',
      title: 'My Home',
      description: 'Personal dashboard',
      icon: <Home className="h-5 w-5" />,
      category: 'tools'
    },
    {
      mode: 'test',
      title: 'Quick Links',
      description: 'Favorite tools & sites',
      icon: <List className="h-5 w-5" />,
      category: 'tools'
    }
  ];

  // Add this function to filter tabs
  const getFilteredTabs = useCallback((category: TabOption['category']) => {
    return TAB_OPTIONS.filter(tab => {
      const matchesCategory = tab.category === category;
      const matchesSearch = tabSearch.trim() === '' || 
        tab.title.toLowerCase().includes(tabSearch.toLowerCase()) ||
        tab.description.toLowerCase().includes(tabSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [tabSearch]);

  const createNewTab = useCallback((mode: ChartTab['mode']) => {
    const randomPair = TRADING_PAIRS[Math.floor(Math.random() * TRADING_PAIRS.length)];
    const title = mode === 'memescope' ? 'Memescope' :
                 mode === 'trending' ? 'Trending' :
                 mode === 'themes' ? 'Themes' :
                 mode === 'dex' ? 'DEX' :
                 mode === 'cex' ? 'CEX' :
                 mode === 'custom' ? 'Custom Chart' :
                 mode === 'watchlist' ? 'My Watchlist' :
                 mode === 'google-search' ? 'Google Search' :
                 mode === 'iframe-search' ? 'iFrame Only Search' :
                 mode === 'my-home' ? 'My Home' :
                 mode === 'test' ? 'Quick Links' : randomPair;
    
    const type = mode === 'google-search' ? 'google-search' as const :
                mode === 'iframe-search' ? 'iframe-search' as const :
                mode === 'my-home' ? 'my-home' as const :
                mode === 'themes' ? 'themes' as const :
                mode === 'test' ? 'test' as const : 'chart' as const;
    
    return {
      id: uuidv4(),
      title,
      pair: randomPair,
      type,
      mode,
      url: undefined,
      nonEmbeddableUrl: undefined
    };
  }, []);

  const clearSearchContainer = useCallback(() => {
    if (searchContainerRef.current) {
      while (searchContainerRef.current.firstChild) {
        searchContainerRef.current.removeChild(searchContainerRef.current.firstChild);
      }
    }
  }, []);

  const handleTabChange = useCallback((newIndex: number) => {
    clearSearchContainer();
    setSearchResults(null);
    setSearchQueries({});
    setSearchError(null);
    setActiveTab(newIndex);
  }, [clearSearchContainer]);

  const performSearch = useCallback(async (query: string, tabId: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setSearchError(null);
    setSearchResults(null);
    
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      const cx = import.meta.env.VITE_GOOGLE_CX;
      
      if (!apiKey || !cx) {
        throw new Error('Google Search API key or Custom Search Engine ID not configured');
      }

      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      
      const data: SearchResponse = await response.json();
      
      if (data.error) {
        setSearchError(data.error.message);
        setSearchResults(null);
      } else {
        setSearchResults(data);
      }
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Failed to perform search. Please try again.');
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback((e: React.FormEvent, tabId: string) => {
    e.preventDefault();
    const query = searchQueries[tabId];
    if (!query?.trim()) return;
    
    performSearch(query, tabId);
  }, [searchQueries, performSearch]);

  const handleSearchInputChange = useCallback((value: string, tabId: string) => {
    setSearchQueries(prev => ({
      ...prev,
      [tabId]: value
    }));
  }, []);

  const addNewTab = useCallback((mode: ChartTab['mode']) => {
    const newTab = createNewTab(mode);
    setTabs(prev => [...prev, newTab]);
    setActiveTab(tabs.length);
    setIsNewTabDialogOpen(false);
  }, [createNewTab, tabs.length]);

  const checkIframeCompatibility = useCallback(async (url: string): Promise<boolean> => {
    try {
      // First check if domain is in blacklist
      const domain = new URL(url).hostname;
      const NON_EMBEDDABLE_DOMAINS = [
        'twitter.com',
        'facebook.com',
        'youtube.com',
        'instagram.com',
        'linkedin.com',
        'reddit.com',
        'zoom.us',
        'merriam-webster.com',
        'fast.com',
        'speedtest.net',
        'duolingo.com',
        'uscis.gov',
        'harvard.edu',
        'americastestkitchen.com',
        'av-test.org'
      ];

      // Check if domain or any parent domain is in blacklist
      if (NON_EMBEDDABLE_DOMAINS.some(d => domain.includes(d))) {
        return false;
      }

      // For domains not in blacklist, assume they are embeddable
      // This is a simplification since we can't reliably check X-Frame-Options due to CORS
      return true;

    } catch (error) {
      console.error('Error checking iframe compatibility:', error);
      return false;
    }
  }, []);

  const openInNewTab = useCallback(async (result: SearchResult) => {
    setSearchResults(null);
    
    const newTab = createNewTab(currentTab?.type === 'iframe-search' ? 'iframe-search' : 'google-search');
    
    if (currentTab?.type === 'iframe-search') {
      newTab.url = result.link;
    } else {
      const isEmbeddable = await checkIframeCompatibility(result.link);
      if (isEmbeddable) {
        newTab.url = result.link;
      } else {
        newTab.nonEmbeddableUrl = result.link;
      }
    }
    
    setTabs(prev => [...prev, newTab]);
    handleTabChange(tabs.length);
  }, [checkIframeCompatibility, createNewTab, currentTab?.type, tabs.length, handleTabChange]);

  // Create initial welcome tab on mount
  useEffect(() => {
    if (tabs.length === 0) {
      const welcomeTab: ChartTab = {
        id: uuidv4(),
        title: 'Welcome',
        pair: '',
        type: 'welcome',
        mode: null
      };
      setTabs([welcomeTab]);
      setActiveTab(0);
    }
  }, []);

  // Add this effect after the initial welcome tab effect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Navigation shortcuts
      if (event.ctrlKey) {
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            if (activeTab > 0) {
              handleTabChange(Math.max(0, activeTab - 1));
            }
            break;
          case 'ArrowRight':
            event.preventDefault();
            if (activeTab < tabs.length - 1) {
              handleTabChange(Math.min(tabs.length - 1, activeTab + 1));
            }
            break;
          case 'h':
            event.preventDefault();
            const homeTabIndex = tabs.findIndex(tab => tab.type === 'welcome');
            if (homeTabIndex >= 0) {
              handleTabChange(homeTabIndex);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, tabs, handleTabChange]);

  useEffect(() => {
    const handleOpenThemesTab = () => {
      const newTab = createNewTab('themes');
      setTabs(prev => [...prev, newTab]);
      setActiveTab(tabs.length);
      setIsNewTabDialogOpen(false);
    };

    window.addEventListener('openThemesTab', handleOpenThemesTab);
    return () => window.removeEventListener('openThemesTab', handleOpenThemesTab);
  }, [tabs.length]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTabs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const closeTab = useCallback((index: number) => {
    setTabs(prev => {
      // Don't allow closing the last tab
      if (prev.length <= 1) return prev;
      
      const newTabs = prev.filter((_, i) => i !== index);
      
      // If we're closing the active tab or a tab before it,
      // adjust the active tab index
      if (index <= activeTab) {
        setActiveTab(Math.max(0, activeTab - 1));
      }
      
      return newTabs;
    });
  }, [activeTab]);

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 p-2 bg-card border-b border-border overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
            items={tabs.map((tab) => tab.id)}
              strategy={horizontalListSortingStrategy}
            >
            {tabs.map((tab, index) => (
                <SortableTab
                  key={tab.id}
                  tab={tab}
                active={index === activeTab}
                onActivate={() => handleTabChange(index)}
                onClose={(e) => {
                  e.stopPropagation();
                  closeTab(index);
                }}
                />
              ))}
            </SortableContext>
          </DndContext>
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={() => setIsNewTabDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {currentTab?.type === 'welcome' && (
          <div className="h-full flex flex-col items-center justify-center gap-8 max-w-2xl mx-auto text-center p-6">
            <h1 className="text-3xl font-bold">Welcome to n_nubs Terminal</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <Card className="p-6 flex flex-col gap-3 items-center">
                <MousePointerClickIcon className="h-8 w-8 text-primary" />
                <h2 className="text-lg font-semibold">Getting Started</h2>
                <p className="text-sm text-muted-foreground">
                  Click the + button in the top right to open a new tab. Each tab can be customized for different purposes.
                </p>
              </Card>
              <Card className="p-6 flex flex-col gap-3 items-center">
                <Command className="h-8 w-8 text-primary" />
                <h2 className="text-lg font-semibold">Navigation</h2>
                <p className="text-sm text-muted-foreground">
                  Use the navigation buttons or drag tabs to rearrange them. Click the home icon to return to this screen.
                </p>
              </Card>
              <Card className="p-6 flex flex-col gap-3 items-center">
                <Search className="h-8 w-8 text-primary" />
                <h2 className="text-lg font-semibold">Quick Search</h2>
                <p className="text-sm text-muted-foreground">
                  Use the search bar at the top to search the web. Press Enter to search in a new tab.
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
            <div className="flex flex-col gap-4 items-center">
              <Button onClick={() => setIsNewTabDialogOpen(true)} className="w-[200px]">
              <Plus className="h-4 w-4 mr-2" />
                Open Your First Tab
              </Button>
              <Button 
                variant="outline" 
                onClick={() => addNewTab('test')} 
                className="w-[200px]"
              >
                <List className="h-4 w-4 mr-2" />
                Quick Links
            </Button>
            </div>
          </div>
        )}

        {currentTab?.type === 'my-home' && (
          <div className="h-full flex flex-col gap-6 p-6 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <Star className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Quick Actions</h3>
                    <p className="text-sm text-muted-foreground">Your most used tools</p>
              </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <LineChart className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Market Overview</h3>
                    <p className="text-sm text-muted-foreground">Latest market trends</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Trending Now</h3>
                    <p className="text-sm text-muted-foreground">Hot topics and trends</p>
                </div>
              </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Opened new chart: BTC/USD</span>
                    <span className="text-muted-foreground">2m ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Added to watchlist: SOL/USD</span>
                    <span className="text-muted-foreground">15m ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Created custom chart</span>
                    <span className="text-muted-foreground">1h ago</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Favorites</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>BTC/USD Chart</span>
                    <Button variant="ghost" size="sm" onClick={() => addNewTab('memescope')}>Open</Button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>My Watchlist</span>
                    <Button variant="ghost" size="sm" onClick={() => addNewTab('trending')}>Open</Button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Market Research</span>
                    <Button variant="ghost" size="sm" onClick={() => addNewTab('google-search')}>Open</Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {currentTab?.type === 'google-search' && (
          <div className="h-full flex flex-col p-4">
            <form onSubmit={(e) => handleSearch(e, currentTab.id)} className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQueries[currentTab.id] || ''}
                onChange={(e) => handleSearchInputChange(e.target.value, currentTab.id)}
                placeholder="Search the web..."
                className="flex-1 px-3 py-2 rounded-md border border-border bg-background"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </form>

            {searchError && (
              <div className="p-4 mb-4 rounded-md bg-destructive/10 text-destructive">
                {searchError}
              </div>
            )}

            {searchResults && (
              <div className="overflow-auto">
                {searchResults.searchInformation && (
                  <div className="text-sm text-muted-foreground mb-4">
                    About {searchResults.searchInformation.totalResults} results ({searchResults.searchInformation.searchTime} seconds)
                  </div>
                )}
                
                <div className="space-y-6">
                  {searchResults.items?.map((result, index) => (
                    <div key={index} className="space-y-1">
                      <a
                        href={result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline block"
                        dangerouslySetInnerHTML={{ __html: result.htmlTitle }}
                      />
                      <div className="text-sm text-muted-foreground">
                        {result.displayLink}
                      </div>
                      <div
                        className="text-sm"
                        dangerouslySetInnerHTML={{ __html: result.htmlSnippet }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab?.type === 'iframe-search' && (
          <IframeContainer tab={currentTab} isActive={true} />
        )}

        {currentTab?.type === 'themes' && (
          <ThemesTab />
        )}

        {currentTab?.type === 'test' && (
          <IframeLinkDirectory
            createNewTab={createNewTab}
            checkIframeCompatibility={checkIframeCompatibility}
            setTabs={setTabs}
            handleTabChange={handleTabChange}
            tabs={tabs}
          />
        )}
      </div>

      <Dialog open={isNewTabDialogOpen} onOpenChange={setIsNewTabDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Open New Tab</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <input
              type="text"
              value={tabSearch}
              onChange={(e) => setTabSearch(e.target.value)}
              placeholder="Search tabs..."
              className="w-full px-3 py-2 rounded-md border border-border bg-background"
            />
            
            {['trading', 'search', 'tools'].map((category) => (
              <div key={category} className="space-y-2">
                <h3 className="font-medium capitalize">{category}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {getFilteredTabs(category as TabOption['category']).map((option) => (
                    <button
                      key={option.mode}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent text-left"
                      onClick={() => addNewTab(option.mode)}
                    >
                      <div className="mt-1">{option.icon}</div>
                      <div>
                        <div className="font-medium">{option.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 