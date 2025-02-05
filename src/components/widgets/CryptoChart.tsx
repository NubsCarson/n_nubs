import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Plus, TrendingUp, X, Command, Keyboard, MousePointerClick as MousePointerClickIcon, Rocket, Search, Star, Sparkles, LineChart, List, GripHorizontal, AlertTriangle, ChevronLeft, ChevronRight, Home, Code, Newspaper, Maximize2, Wrench, Clock, Palette, Calculator, Shield, ExternalLink, Lock } from "lucide-react";
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
  const [searchResults, setSearchResults] = useState<Record<string, SearchResponse | null>>({});
  const [searchErrors, setSearchErrors] = useState<Record<string, string | null>>({});
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
                 mode === 'test' ? 'Quick Links' : randomPair;
    
    const type = mode === 'google-search' ? 'google-search' as const :
                mode === 'iframe-search' ? 'iframe-search' as const :
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
    setActiveTab(newIndex);
  }, [clearSearchContainer]);

  const performSearch = useCallback(async (query: string, tabId: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setSearchErrors(prev => ({ ...prev, [tabId]: null }));
    
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
        setSearchErrors(prev => ({ ...prev, [tabId]: data.error.message }));
        setSearchResults(prev => ({ ...prev, [tabId]: null }));
      } else {
        setSearchResults(prev => ({ ...prev, [tabId]: data }));
      }
    } catch (error) {
      setSearchErrors(prev => ({ 
        ...prev, 
        [tabId]: error instanceof Error ? error.message : 'Failed to perform search. Please try again.' 
      }));
      setSearchResults(prev => ({ ...prev, [tabId]: null }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback((e: React.FormEvent, tabId: string) => {
    e.preventDefault();
    const query = searchQueries[tabId];
    if (!query?.trim()) return;

    // Create a new search tab if we're not already in a search tab
    if (!currentTab?.type?.includes('search')) {
      const newTab = createNewTab('google-search');
      setTabs(prev => [...prev, newTab]);
      setActiveTab(tabs.length);
      // Update the search query for the new tab
      setSearchQueries(prev => ({
        ...prev,
        [newTab.id]: query
      }));
      // Perform search in the new tab after a short delay to ensure state updates
      setTimeout(() => performSearch(query, newTab.id), 0);
    } else {
      performSearch(query, tabId);
    }
  }, [searchQueries, performSearch, currentTab?.type, createNewTab, tabs.length]);

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
    setSearchResults(prev => ({ ...prev, [currentTab.id]: null }));
    
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
    <div className="h-full flex flex-col">
      {/* Persistent Search Bar */}
      <div className="flex-shrink-0 border-b border-border p-2 bg-background">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (currentTab?.id) {
            handleSearch(e, currentTab.id);
          }
        }} className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground"
            placeholder="Search the web..."
            value={searchQueries[currentTab?.id || ''] || ''}
            onChange={(e) => handleSearchInputChange(e.target.value, currentTab?.id || '')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (currentTab?.id) {
                  handleSearch(e, currentTab.id);
                }
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
      </div>

      {/* Tabs Header */}
      <div className="flex-shrink-0 border-b border-border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={tabs.map(t => t.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex items-center p-2 gap-2 overflow-x-auto">
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-2"
                onClick={() => setIsNewTabDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
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

        {(currentTab?.mode === 'memescope' || currentTab?.mode === 'trending') && (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <div className="max-w-md text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                {currentTab.mode === 'memescope' ? (
                  <Rocket className="h-8 w-8 text-primary" />
                ) : (
                  <Sparkles className="h-8 w-8 text-primary" />
                )}
              </div>
              <h2 className="text-2xl font-bold">
                {currentTab.mode === 'memescope' ? 'MemeScope+' : 'Trending'} Coming Soon
              </h2>
              <p className="text-muted-foreground">
                {currentTab.mode === 'memescope' ? (
                  'Track viral tokens and market trends with advanced memecoin analytics and social sentiment tracking.'
                ) : (
                  'Discover the hottest tokens and market movements with real-time trending data and analysis.'
                )}
              </p>
              <div className="pt-4">
                <Button variant="outline" onClick={() => addNewTab('google-search')}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Web Instead
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentTab?.type === 'google-search' && (
          <div className="h-full flex flex-col p-4">
            {searchErrors[currentTab.id] && (
              <div className="p-4 mb-4 rounded-md bg-destructive/10 text-destructive">
                {searchErrors[currentTab.id]}
              </div>
            )}

            {searchResults[currentTab.id] ? (
              <div className="overflow-auto">
                {searchResults[currentTab.id]?.searchInformation && (
                  <div className="text-sm text-muted-foreground mb-4">
                    About {searchResults[currentTab.id]?.searchInformation.totalResults} results ({searchResults[currentTab.id]?.searchInformation.searchTime} seconds)
                  </div>
                )}
                
                <div className="space-y-6">
                  {searchResults[currentTab.id]?.items?.map((result, index) => (
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
            ) : (
              <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto p-6">
                <div className="w-full space-y-8">
                  {/* Quick Search Categories */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => {
                      if (currentTab?.id) {
                        handleSearchInputChange("crypto market news today", currentTab.id);
                        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                        handleSearch(fakeEvent, currentTab.id);
                      }
                    }}>
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">Crypto Markets</h3>
                          <p className="text-xs text-muted-foreground">Latest market updates and news</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => {
                      if (currentTab?.id) {
                        handleSearchInputChange("web3 development tutorials", currentTab.id);
                        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                        handleSearch(fakeEvent, currentTab.id);
                      }
                    }}>
                      <div className="flex items-center gap-3">
                        <Code className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">Web3 Dev</h3>
                          <p className="text-xs text-muted-foreground">Development resources and guides</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => {
                      if (currentTab?.id) {
                        handleSearchInputChange("blockchain technology news", currentTab.id);
                        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                        handleSearch(fakeEvent, currentTab.id);
                      }
                    }}>
                      <div className="flex items-center gap-3">
                        <Newspaper className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">Tech News</h3>
                          <p className="text-xs text-muted-foreground">Latest in blockchain and tech</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => {
                      if (currentTab?.id) {
                        handleSearchInputChange("crypto trading tools and analysis", currentTab.id);
                        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                        handleSearch(fakeEvent, currentTab.id);
                      }
                    }}>
                      <div className="flex items-center gap-3">
                        <Wrench className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">Trading Tools</h3>
                          <p className="text-xs text-muted-foreground">Analysis and trading resources</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Search Tips */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Search Tips:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>Use time filters for recent results</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Command className="h-4 w-4 text-primary" />
                        <span>Press Enter to search quickly</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-primary" />
                        <span>Add "site:" to search specific websites</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Keyboard className="h-4 w-4 text-primary" />
                        <span>Use quotes for exact matches</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab?.type === 'iframe-search' && (
          <div className="h-full flex flex-col p-4">
            {searchErrors[currentTab.id] && (
              <div className="p-4 mb-4 rounded-md bg-destructive/10 text-destructive">
                {searchErrors[currentTab.id]}
              </div>
            )}

            {searchResults[currentTab.id] ? (
              <div className="overflow-auto">
                {searchResults[currentTab.id]?.searchInformation && (
                  <div className="text-sm text-muted-foreground mb-4">
                    About {searchResults[currentTab.id]?.searchInformation.totalResults} results ({searchResults[currentTab.id]?.searchInformation.searchTime} seconds)
                  </div>
                )}
                
                <div className="space-y-6">
                  {searchResults[currentTab.id]?.items?.map((result, index) => (
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
            ) : currentTab.url ? (
              <IframeContainer tab={currentTab} isActive={true} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto p-6">
                <div className="w-full space-y-8">
                  {/* Quick iFrame Categories */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => {
                      if (currentTab?.id) {
                        handleSearchInputChange("tradingview chart site:tradingview.com", currentTab.id);
                        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                        handleSearch(fakeEvent, currentTab.id);
                      }
                    }}>
                      <div className="flex items-center gap-3">
                        <LineChart className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">Trading Charts</h3>
                          <p className="text-xs text-muted-foreground">Interactive price charts and analysis</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => {
                      if (currentTab?.id) {
                        handleSearchInputChange("crypto dashboard dexscreener", currentTab.id);
                        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                        handleSearch(fakeEvent, currentTab.id);
                      }
                    }}>
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">DEX Analytics</h3>
                          <p className="text-xs text-muted-foreground">Real-time DEX trading data</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => {
                      if (currentTab?.id) {
                        handleSearchInputChange("blockchain explorer etherscan", currentTab.id);
                        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                        handleSearch(fakeEvent, currentTab.id);
                      }
                    }}>
                      <div className="flex items-center gap-3">
                        <Search className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">Block Explorers</h3>
                          <p className="text-xs text-muted-foreground">Transaction and contract data</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => {
                      if (currentTab?.id) {
                        handleSearchInputChange("defi yield calculator apy.vision", currentTab.id);
                        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                        handleSearch(fakeEvent, currentTab.id);
                      }
                    }}>
                      <div className="flex items-center gap-3">
                        <Calculator className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">DeFi Tools</h3>
                          <p className="text-xs text-muted-foreground">Yield calculators and analytics</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* iFrame Tips */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">iFrame Search Tips:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Only shows embeddable websites</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Maximize2 className="h-4 w-4 text-primary" />
                        <span>Sites open directly in the tab</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-primary" />
                        <span>Non-embeddable sites open in new window</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary" />
                        <span>Some sites may be restricted</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
    </div>
  );
} 