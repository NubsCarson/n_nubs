import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Plus, TrendingUp, X, Command, Keyboard, MousePointerClick, Rocket, Search, Star, Sparkles, LineChart, List, GripHorizontal, AlertTriangle, ChevronLeft, ChevronRight, Home, Code, Newspaper, Maximize2, Wrench, Clock, Palette } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any>(null);
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
    setSearchQuery('');
    setSearchError(null);
    setActiveTab(newIndex);
  }, [clearSearchContainer]);

  const performSearch = useCallback(async (query: string, iframeOnly: boolean = false) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setSearchError(null);
    setSearchResults(null);
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=AIzaSyAoVPPjimVHrzHRMS7lDueuK-hdACNodxQ&cx=83fcba2875b974a68&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      if (data.error) {
        setSearchError(data.error.message);
        setSearchResults(null);
      } else {
        setSearchResults(data);
      }
    } catch (error) {
      setSearchError('Failed to perform search. Please try again.');
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Create a new Google Search tab
    const newTab = createNewTab('google-search');
    setTabs(prev => [...prev, newTab]);
    const newTabIndex = tabs.length;
    handleTabChange(newTabIndex);
    // Perform the search in the new tab after a short delay to ensure tab switch
    setTimeout(() => {
      performSearch(searchQuery, false);
    }, 100);
  }, [searchQuery, performSearch, createNewTab, handleTabChange, tabs.length]);

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

  return (
    <Card className="w-full h-full flex flex-col">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-border bg-muted/50 px-2 pt-2">
        <div className="flex items-center gap-1 mr-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleTabChange(Math.max(0, activeTab - 1))}
            disabled={activeTab === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleTabChange(Math.min(tabs.length - 1, activeTab + 1))}
            disabled={activeTab === tabs.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              const homeTabIndex = tabs.findIndex(tab => tab.type === 'welcome');
              if (homeTabIndex >= 0) {
                handleTabChange(homeTabIndex);
              }
            }}
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center overflow-x-auto scrollbar-none">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const { active, over } = event;
              if (over && active.id !== over.id) {
                setTabs((items) => {
                  const oldIndex = items.findIndex((item) => item.id === active.id);
                  const newIndex = items.findIndex((item) => item.id === over.id);
                  return arrayMove(items, oldIndex, newIndex);
                });
              }
            }}
          >
            <SortableContext
              items={tabs}
              strategy={horizontalListSortingStrategy}
            >
              {tabs.map((tab) => (
                <SortableTab
                  key={tab.id}
                  tab={tab}
                  active={activeTab === tabs.findIndex((t) => t.id === tab.id)}
                  onActivate={() => handleTabChange(tabs.findIndex((t) => t.id === tab.id))}
                  onClose={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    const newTabs = tabs.filter((t) => t.id !== tab.id);
                    setTabs(newTabs);
                    if (activeTab === tabs.findIndex((t) => t.id === tab.id)) {
                      handleTabChange(Math.max(0, activeTab - 1));
                    }
                  }}
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

      {/* Permanent Search Bar */}
      <div className="border-b border-border p-2 bg-background">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground"
            placeholder={currentTab?.type === 'iframe-search' ? "Search for embeddable sites only..." : "Search the web..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
            }}
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {currentTab?.type === 'iframe-search' && (
          <div className="mt-2 text-sm text-muted-foreground bg-accent/10 p-2 rounded-md">
            iFrame Only Mode: Results will only show sites that can be embedded
          </div>
        )}
      </div>

      {/* New Tab Dialog */}
      <Dialog open={isNewTabDialogOpen} onOpenChange={setIsNewTabDialogOpen}>
        <DialogContent className="sm:max-w-[800px] p-0 gap-0 bg-background/95 backdrop-blur-md border-border/50">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">Quick Access Hub</DialogTitle>
          </DialogHeader>

          {/* Search Filter */}
          <div className="px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tabs..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-card text-foreground"
                value={tabSearch}
                onChange={(e) => setTabSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Tab Categories */}
          <div className="p-6 pt-2">
            <div className="grid grid-cols-3 gap-6">
              {/* Trading & Analysis */}
              <div className="space-y-4">
                <h3 className="font-semibold text-primary flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  Trading & Analysis
                </h3>
                <div className="space-y-2">
                  {getFilteredTabs('trading').map((tab) => (
                    <button
                      key={tab.mode}
                      onClick={() => addNewTab(tab.mode)}
                      className="w-full p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors flex items-center gap-3 group"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        {tab.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{tab.title}</div>
                        <div className="text-xs text-muted-foreground">{tab.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Discovery */}
              <div className="space-y-4">
                <h3 className="font-semibold text-primary flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search & Discovery
                </h3>
                <div className="space-y-2">
                  {getFilteredTabs('search').map((tab) => (
                    <button
                      key={tab.mode}
                      onClick={() => addNewTab(tab.mode)}
                      className="w-full p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors flex items-center gap-3 group"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        {tab.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{tab.title}</div>
                        <div className="text-xs text-muted-foreground">{tab.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tools & Utilities */}
              <div className="space-y-4">
                <h3 className="font-semibold text-primary flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Tools & Utilities
                </h3>
                <div className="space-y-2">
                  {getFilteredTabs('tools').map((tab) => (
                    <button
                      key={tab.mode}
                      onClick={() => addNewTab(tab.mode)}
                      className="w-full p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors flex items-center gap-3 group"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        {tab.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{tab.title}</div>
                        <div className="text-xs text-muted-foreground">{tab.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recently Used */}
            <div className="mt-6">
              <h3 className="font-semibold text-primary flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4" />
                Recently Used
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.slice(-4).reverse().map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      const newTab = createNewTab(tab.mode);
                      setTabs(prev => [...prev, newTab]);
                      setActiveTab(tabs.length);
                      setIsNewTabDialogOpen(false);
                    }}
                    className="flex-shrink-0 p-2 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors flex items-center gap-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      {tab.mode === 'memescope' ? <Rocket className="h-4 w-4" /> :
                       tab.mode === 'trending' ? <Sparkles className="h-4 w-4" /> :
                       tab.mode === 'google-search' ? <Search className="h-4 w-4" /> :
                       tab.mode === 'my-home' ? <Home className="h-4 w-4" /> :
                       <List className="h-4 w-4" />}
                    </div>
                    <span className="text-sm font-medium">{tab.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {!currentTab ? (
          // Fallback content when no tab is active
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No active tab</p>
          </div>
        ) : currentTab.type === 'themes' ? (
          <ThemesTab />
        ) : currentTab.type === 'google-search' || currentTab.type === 'iframe-search' ? (
          <>
            {/* Search Bar */}
            <div className="border-b border-border p-2 bg-background">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground"
                  placeholder={currentTab.type === 'iframe-search' ? "Search for embeddable sites only..." : "Search the web..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch(e);
                    }
                  }}
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </form>
              {currentTab.type === 'iframe-search' && (
                <div className="mt-2 text-sm text-muted-foreground bg-accent/10 p-2 rounded-md">
                  iFrame Only Mode: Results will only show sites that can be embedded
                </div>
              )}
            </div>
            {/* Search Results */}
            <div ref={searchContainerRef} className="flex-1 overflow-auto" />
          </>
        ) : currentTab.type === 'test' ? (
          <IframeLinkDirectory
            createNewTab={createNewTab}
            checkIframeCompatibility={checkIframeCompatibility}
            setTabs={setTabs}
            handleTabChange={handleTabChange}
            tabs={tabs}
          />
        ) : currentTab.type === 'welcome' ? (
          <div className="h-full flex flex-col items-center justify-center gap-8 max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold">Welcome to n_nubs Terminal</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <Card className="p-6 flex flex-col gap-3 items-center">
                <MousePointerClick className="h-8 w-8 text-primary" />
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
        ) : currentTab.type === 'my-home' ? (
          <div className="h-full flex flex-col gap-6">
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
                    <Button variant="ghost" size="sm">Open</Button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>My Watchlist</span>
                    <Button variant="ghost" size="sm">Open</Button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Market Research</span>
                    <Button variant="ghost" size="sm">Open</Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="h-full">
            {/* Chart/iframe content */}
            <div className="w-full h-full bg-white dark:bg-background rounded-lg overflow-auto">
              {currentTab && (currentTab.url || currentTab.nonEmbeddableUrl) ? (
                currentTab.nonEmbeddableUrl ? (
                  <div className="flex flex-col items-center justify-center gap-4 p-8">
                    <AlertTriangle className="h-12 w-12 text-yellow-500" />
                    <h3 className="text-xl font-semibold">This site cannot be embedded</h3>
                    <p className="text-center text-muted-foreground">
                      Due to security restrictions, this site cannot be displayed directly in the app.
                      You can visit it in a new window instead.
                    </p>
                    <Button
                      variant="default"
                      onClick={() => window.open(currentTab.nonEmbeddableUrl, '_blank')}
                    >
                      Open in New Window
                    </Button>
                  </div>
                ) : currentTab.url ? (
                  <IframeContainer
                    key={currentTab.id}
                    tab={currentTab}
                    isActive={true}
                  />
                ) : null
              ) : (
                <div className="flex flex-col gap-4">
                  {searchError && (
                    <div className="text-sm text-red-500 bg-red-500/10 p-4 rounded-md">
                      {searchError}
                    </div>
                  )}

                  {searchResults && searchResults.items && searchResults.items.length > 0 ? (
                    <div className="space-y-6">
                      {searchResults.items.map((result: SearchResult) => (
                        <div key={result.link} className="space-y-2">
                          <h3 className="text-lg font-semibold">
                            <button
                              className="hover:underline text-left"
                              onClick={() => openInNewTab(result)}
                            >
                              {result.title}
                            </button>
                          </h3>
                          <p className="text-sm text-muted-foreground">{result.snippet}</p>
                          <p className="text-sm text-primary">{result.link}</p>
                        </div>
                      ))}
                    </div>
                  ) : searchResults && !searchError ? (
                    <div className="text-center text-muted-foreground py-8">
                      No results found. Try a different search term.
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 