import { useState, useCallback, useMemo } from "react";
import { Check, Star, Palette, Crown, Heart, Search, Grid2x2, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/contexts/NotificationContext";

interface Theme {
  id: string;
  name: string;
  description: string;
  preview: string;
  accent: string;
  isPro?: boolean;
  isNew?: boolean;
  likes: number;
  category: 'dark' | 'light' | 'custom';
  features?: string[];
}

const MOCK_THEMES: Theme[] = [
  {
    id: "midnight-pro",
    name: "Midnight Pro",
    description: "Deep blues with neon accents",
    preview: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    accent: "#3b82f6",
    isPro: true,
    likes: 2.4e3,
    category: 'dark',
    features: ['OLED optimized', 'Glass morphism UI', 'Neon accents']
  },
  {
    id: "n_nubs-dark",
    name: "n_nubs Dark",
    description: "Official dark theme",
    preview: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)",
    accent: "#9945FF",
    isNew: true,
    likes: 1.9e3,
    category: 'dark',
    features: ['Official theme', 'Modern UI', 'Purple accents']
  },
  {
    id: "n_nubs-light",
    name: "n_nubs Light",
    description: "Clean and minimal light theme",
    preview: "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
    accent: "#14F195",
    isNew: true,
    likes: 1.6e3,
    category: 'light',
    features: ['Official theme', 'High contrast', 'Green accents']
  },
  {
    id: "neon-future",
    name: "Neon Future",
    description: "Cyberpunk-inspired dark theme",
    preview: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #2a2a3e 100%)",
    accent: "#f472b6",
    isNew: true,
    likes: 1.8e3,
    category: 'dark',
    features: ['Neon glow', 'Cyberpunk style', 'Retro grid']
  },
  {
    id: "arctic-dawn",
    name: "Arctic Dawn",
    description: "Clean & minimal light theme",
    preview: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)",
    accent: "#0ea5e9",
    likes: 1.2e3,
    category: 'light',
    features: ['Pristine white', 'Soft blue', 'Crisp shadows']
  },
  {
    id: "sunset-vibes",
    name: "Sunset Vibes",
    description: "Warm gradients & soft shadows",
    preview: "linear-gradient(135deg, #fef2f2 0%, #fff1f2 50%, #ffe4e6 100%)",
    accent: "#f43f5e",
    likes: 956,
    category: 'light',
    features: ['Warm colors', 'Soft gradients', 'Coral accents']
  },
  {
    id: "matrix",
    name: "Matrix",
    description: "Classic terminal aesthetics",
    preview: "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #065f46 100%)",
    accent: "#22c55e",
    isPro: true,
    likes: 1.7e3,
    category: 'dark',
    features: ['Digital rain', 'Terminal style', 'Matrix green']
  },
  {
    id: "galaxy",
    name: "Galaxy",
    description: "Deep space-inspired theme",
    preview: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
    accent: "#818cf8",
    isNew: true,
    likes: 823,
    category: 'dark',
    features: ['Nebula effects', 'Star field', 'Space gradients']
  }
];

export function ThemesTab() {
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<'all' | Theme['category']>('all');
  const { setTheme } = useTheme();
  const { addNotification } = useNotifications();

  const filteredThemes = useMemo(() => {
    return MOCK_THEMES.filter(theme => {
      const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          theme.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || theme.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleThemeSelect = useCallback((theme: Theme) => {
    setSelectedTheme(theme);
    setTheme({
      id: theme.id,
      name: theme.name,
      accent: theme.accent,
      isDark: theme.category === 'dark'
    });
    addNotification(
      "Theme Applied",
      `${theme.name} theme has been applied successfully.`
    );
  }, [setTheme, addNotification]);

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border p-4 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            Theme Studio
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? (
              <LayoutList className="h-4 w-4" />
            ) : (
              <Grid2x2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background"
              placeholder="Search themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className={cn(
              "min-w-[80px]",
              selectedCategory === 'all' && "bg-primary/10 text-primary border-primary/20"
            )}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          <Button
            variant="outline"
            className={cn(
              "min-w-[80px]",
              selectedCategory === 'dark' && "bg-primary/10 text-primary border-primary/20"
            )}
            onClick={() => setSelectedCategory('dark')}
          >
            Dark
          </Button>
          <Button
            variant="outline"
            className={cn(
              "min-w-[80px]",
              selectedCategory === 'light' && "bg-primary/10 text-primary border-primary/20"
            )}
            onClick={() => setSelectedCategory('light')}
          >
            Light
          </Button>
        </div>
      </div>

      {/* Themes Grid/List */}
      <div className="absolute inset-0 top-[105px] bottom-0 overflow-hidden">
        <ScrollArea className="h-full relative" style={{ pointerEvents: 'auto' }}>
          <div className="p-4 pt-6">
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {filteredThemes.map((theme) => (
                <div
                  key={theme.id}
                  className={cn(
                    "group relative rounded-lg border border-border overflow-hidden transition-all duration-300",
                    selectedTheme?.id === theme.id && "ring-2 ring-primary",
                    viewMode === 'list' ? "flex gap-4" : "block"
                  )}
                >
                  {/* Theme Preview */}
                  <div
                    className={cn(
                      "theme-preview-hover",
                      viewMode === 'list' ? "w-32 h-24" : "h-24"
                    )}
                    style={{ background: theme.preview }}
                  >
                    {theme.isPro && (
                      <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                        <Crown className="h-3 w-3 text-amber-500" />
                        <span className="text-xs font-medium">PRO</span>
                      </div>
                    )}
                    {theme.isNew && (
                      <div className="absolute top-2 left-2 bg-primary/80 backdrop-blur-sm px-2 py-1 rounded-full">
                        <span className="text-xs font-medium text-primary-foreground">NEW</span>
                      </div>
                    )}
                  </div>

                  {/* Theme Info */}
                  <div className="p-3 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{theme.name}</h3>
                        <p className="text-sm text-muted-foreground">{theme.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Heart className="h-3.5 w-3.5" />
                        <span className="text-xs">{theme.likes.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Features */}
                    {theme.features && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {theme.features.map((feature, index) => (
                          <div
                            key={index}
                            className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
                          >
                            {feature}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3">
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => handleThemeSelect(theme)}
                      >
                        {selectedTheme?.id === theme.id ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Applied
                          </>
                        ) : (
                          <>
                            <Palette className="h-4 w-4 mr-2" />
                            Apply Theme
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 