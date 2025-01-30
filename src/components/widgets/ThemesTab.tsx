import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Check, Sparkles, Star, Palette, Crown, Lock, ChevronRight, Heart, Search, Grid2x2, LayoutList, Zap, X } from "lucide-react";
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
    description: "Deep blues with neon accents and glass morphism",
    preview: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    accent: "#3b82f6",
    isPro: true,
    likes: 2.4e3,
    category: 'dark',
    features: [
      'OLED optimized',
      'Glass morphism UI',
      'Neon accents',
      'Custom animations',
      'Pro widgets',
      'Advanced blur effects'
    ]
  },
  {
    id: "n_nubs-dark",
    name: "n_nubs Dark",
    description: "Official dark theme with modern aesthetics",
    preview: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)",
    accent: "#9945FF",
    isNew: true,
    likes: 1.9e3,
    category: 'dark',
    features: [
      'Official theme',
      'Modern UI',
      'Purple accents',
      'Smart contrast',
      'Optimized readability'
    ]
  },
  {
    id: "n_nubs-light",
    name: "n_nubs Light",
    description: "Clean and minimal light experience",
    preview: "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
    accent: "#14F195",
    isNew: true,
    likes: 1.6e3,
    category: 'light',
    features: [
      'Official theme',
      'High contrast',
      'Green accents',
      'Paper-like design',
      'Reduced eye strain'
    ]
  },
  {
    id: "neon-future",
    name: "Neon Future",
    description: "Cyberpunk-inspired dark theme with neon accents",
    preview: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #2a2a3e 100%)",
    accent: "#f472b6",
    isNew: true,
    likes: 1.8e3,
    category: 'dark',
    features: [
      'Neon glow effects',
      'Cyberpunk aesthetics',
      'Animated borders',
      'Retro grid patterns',
      'Holographic UI',
      'Futuristic design'
    ]
  },
  {
    id: "arctic-dawn",
    name: "Arctic Dawn",
    description: "Clean & minimal light theme with crisp shadows",
    preview: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)",
    accent: "#0ea5e9",
    likes: 1.2e3,
    category: 'light',
    features: [
      'Pristine white UI',
      'Soft blue accents',
      'Crisp shadows',
      'High contrast text',
      'Minimalist design',
      'Reduced glare'
    ]
  },
  {
    id: "sunset-vibes",
    name: "Sunset Vibes",
    description: "Warm gradients & soft shadows with coral accents",
    preview: "linear-gradient(135deg, #fef2f2 0%, #fff1f2 50%, #ffe4e6 100%)",
    accent: "#f43f5e",
    likes: 956,
    category: 'light',
    features: [
      'Warm color palette',
      'Soft gradients',
      'Coral accents',
      'Smooth transitions',
      'Gentle shadows',
      'Calming design'
    ]
  },
  {
    id: "matrix",
    name: "Matrix",
    description: "Classic terminal aesthetics with digital rain effects",
    preview: "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #065f46 100%)",
    accent: "#22c55e",
    isPro: true,
    likes: 1.7e3,
    category: 'dark',
    features: [
      'Digital rain effects',
      'Terminal aesthetics',
      'Matrix green accents',
      'Monospace fonts',
      'CRT scan lines',
      'Retro glow effects'
    ]
  },
  {
    id: "galaxy",
    name: "Galaxy",
    description: "Deep space-inspired theme with nebula effects",
    preview: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
    accent: "#818cf8",
    isNew: true,
    likes: 823,
    category: 'dark',
    features: [
      'Nebula backgrounds',
      'Star field effects',
      'Space gradients',
      'Cosmic accents',
      'Aurora highlights',
      'Deep space colors'
    ]
  },
];

// Add styles to the document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .theme-selected {
      animation: theme-pulse 0.5s ease-out;
    }

    @keyframes theme-pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.02); }
      100% { transform: scale(1); }
    }

    .theme-preview-hover {
      transition: transform 0.3s ease-out;
    }

    .group:hover .theme-preview-hover {
      transform: scale(1.05);
    }

    [data-theme="neon-future"] {
      --background: 230 33% 8%;
      --foreground: 210 40% 98%;
      
      --card: 230 35% 12%;
      --card-foreground: 210 40% 98%;
      
      --popover: 230 35% 12%;
      --popover-foreground: 210 40% 98%;
      
      --primary: 330 80% 70%;
      --primary-foreground: 210 40% 98%;
      
      --secondary: 230 33% 15%;
      --secondary-foreground: 210 40% 98%;
      
      --muted: 230 33% 15%;
      --muted-foreground: 215 20.2% 75%;
      
      --accent: 330 80% 70%;
      --accent-foreground: 210 40% 98%;
      
      --destructive: 0 84% 60%;
      --destructive-foreground: 210 40% 98%;

      --border: 230 33% 20%;
      --input: 230 33% 20%;
      --ring: 330 80% 70%;

      --radius: 0.5rem;
    }

    [data-theme="neon-future"] * {
      --neon-glow: 0 0 5px rgba(244, 114, 182, 0.3),
                   0 0 10px rgba(244, 114, 182, 0.2);
    }

    /* Improve chart visibility */
    [data-theme="neon-future"] .tradingview-widget-container iframe {
      filter: brightness(1.2) contrast(1.1);
    }

    [data-theme="neon-future"] .bg-card {
      background: hsl(230 35% 12%);
    }

    [data-theme="neon-future"] .bg-background {
      background: hsl(230 33% 8%);
    }

    [data-theme="neon-future"] button {
      transition: all 0.2s ease;
    }

    [data-theme="neon-future"] button:hover {
      box-shadow: var(--neon-glow);
    }

    [data-theme="neon-future"] input {
      border-color: rgba(244, 114, 182, 0.2);
      background: hsl(230 35% 10%);
    }

    [data-theme="neon-future"] input:focus {
      box-shadow: var(--neon-glow);
      border-color: rgba(244, 114, 182, 0.4);
      background: hsl(230 35% 12%);
    }

    [data-theme="neon-future"] ::-webkit-scrollbar-thumb {
      background: rgba(244, 114, 182, 0.2);
      border-radius: 10px;
    }

    [data-theme="neon-future"] ::-webkit-scrollbar-track {
      background: rgba(244, 114, 182, 0.05);
    }

    /* Chart specific improvements */
    [data-theme="neon-future"] .chart-container {
      background: hsl(230 35% 10%);
      border-color: rgba(244, 114, 182, 0.2);
    }

    [data-theme="neon-future"] .chart-container:hover {
      border-color: rgba(244, 114, 182, 0.4);
      box-shadow: var(--neon-glow);
    }

    [data-theme="neon-future"] .chart-title {
      color: hsl(210 40% 98%);
      text-shadow: var(--neon-glow);
    }

    [data-theme="arctic-dawn"] {
      --background: 210 40% 98%;
      --foreground: 222.2 84% 4.9%;
      
      --card: 0 0% 100%;
      --card-foreground: 222.2 84% 4.9%;
      
      --popover: 0 0% 100%;
      --popover-foreground: 222.2 84% 4.9%;
      
      --primary: 199 89% 48%;
      --primary-foreground: 210 40% 98%;
      
      --secondary: 210 40% 96.1%;
      --secondary-foreground: 222.2 47.4% 11.2%;
      
      --muted: 210 40% 96.1%;
      --muted-foreground: 215.4 16.3% 46.9%;
      
      --accent: 210 40% 96.1%;
      --accent-foreground: 222.2 47.4% 11.2%;
      
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 210 40% 98%;

      --border: 214.3 31.8% 91.4%;
      --input: 214.3 31.8% 91.4%;
      --ring: 199 89% 48%;

      --radius: 0.5rem;
    }

    [data-theme="arctic-dawn"] .bg-card {
      background: hsl(0 0% 100%);
      box-shadow: 
        0 1px 3px rgba(0, 0, 0, 0.05),
        0 1px 2px rgba(0, 0, 0, 0.1);
    }

    [data-theme="arctic-dawn"] .bg-background {
      background: linear-gradient(
        to bottom right,
        hsl(210 40% 98%),
        hsl(210 40% 96%)
      );
    }

    [data-theme="arctic-dawn"] button {
      transition: all 0.2s ease;
    }

    [data-theme="arctic-dawn"] button:hover {
      box-shadow: 
        0 2px 4px rgba(14, 165, 233, 0.1),
        0 1px 2px rgba(14, 165, 233, 0.1);
    }

    [data-theme="arctic-dawn"] input {
      border-color: hsl(214.3 31.8% 91.4%);
      background: white;
    }

    [data-theme="arctic-dawn"] input:focus {
      border-color: hsl(199 89% 48% / 0.5);
      box-shadow: 
        0 0 0 2px hsl(199 89% 48% / 0.1),
        0 1px 2px rgba(14, 165, 233, 0.1);
    }

    [data-theme="arctic-dawn"] ::-webkit-scrollbar-thumb {
      background: hsl(214.3 31.8% 91.4%);
      border-radius: 10px;
    }

    [data-theme="arctic-dawn"] ::-webkit-scrollbar-track {
      background: hsl(210 40% 98%);
    }

    /* Chart specific improvements */
    [data-theme="arctic-dawn"] .chart-container {
      background: white;
      border: 1px solid hsl(214.3 31.8% 91.4%);
      box-shadow: 
        0 1px 3px rgba(0, 0, 0, 0.05),
        0 1px 2px rgba(0, 0, 0, 0.1);
    }

    [data-theme="arctic-dawn"] .chart-container:hover {
      border-color: hsl(199 89% 48% / 0.5);
      box-shadow: 
        0 4px 12px rgba(14, 165, 233, 0.1),
        0 2px 4px rgba(14, 165, 233, 0.1);
    }

    [data-theme="arctic-dawn"] .chart-title {
      color: hsl(222.2 84% 4.9%);
    }

    [data-theme="sunset-vibes"] {
      --background: 0 100% 98%;
      --foreground: 336 84% 17%;
      
      --card: 0 0% 100%;
      --card-foreground: 336 84% 17%;
      
      --popover: 0 0% 100%;
      --popover-foreground: 336 84% 17%;
      
      --primary: 339 90% 51%;
      --primary-foreground: 355 100% 97%;
      
      --secondary: 339 90% 96%;
      --secondary-foreground: 336 84% 17%;
      
      --muted: 339 90% 96%;
      --muted-foreground: 336 84% 38%;
      
      --accent: 339 90% 96%;
      --accent-foreground: 336 84% 17%;
      
      --destructive: 0 84% 60%;
      --destructive-foreground: 355 100% 97%;

      --border: 339 90% 90%;
      --input: 339 90% 90%;
      --ring: 339 90% 51%;

      --radius: 0.75rem;
    }

    [data-theme="sunset-vibes"] .bg-card {
      background: linear-gradient(
        to bottom right,
        hsl(0 0% 100%),
        hsl(339 90% 99%)
      );
      box-shadow: 
        0 1px 3px rgba(244, 63, 94, 0.05),
        0 1px 2px rgba(244, 63, 94, 0.1);
    }

    [data-theme="sunset-vibes"] .bg-background {
      background: linear-gradient(
        135deg,
        hsl(0 100% 98%),
        hsl(355 100% 97%),
        hsl(350 100% 96%)
      );
    }

    [data-theme="sunset-vibes"] button {
      transition: all 0.2s ease;
    }

    [data-theme="sunset-vibes"] button:hover {
      box-shadow: 
        0 2px 4px rgba(244, 63, 94, 0.1),
        0 1px 2px rgba(244, 63, 94, 0.1);
      background: linear-gradient(
        to bottom right,
        rgba(244, 63, 94, 0.1),
        rgba(244, 63, 94, 0.05)
      );
    }

    [data-theme="sunset-vibes"] input {
      border-color: rgba(244, 63, 94, 0.2);
      background: white;
    }

    [data-theme="sunset-vibes"] input:focus {
      border-color: rgba(244, 63, 94, 0.4);
      box-shadow: 
        0 0 0 2px rgba(244, 63, 94, 0.1),
        0 1px 2px rgba(244, 63, 94, 0.1);
    }

    [data-theme="sunset-vibes"] ::-webkit-scrollbar-thumb {
      background: rgba(244, 63, 94, 0.2);
      border-radius: 10px;
    }

    [data-theme="sunset-vibes"] ::-webkit-scrollbar-track {
      background: rgba(244, 63, 94, 0.05);
    }

    /* Chart specific improvements */
    [data-theme="sunset-vibes"] .chart-container {
      background: white;
      border: 1px solid rgba(244, 63, 94, 0.2);
      box-shadow: 
        0 1px 3px rgba(244, 63, 94, 0.05),
        0 1px 2px rgba(244, 63, 94, 0.1);
    }

    [data-theme="sunset-vibes"] .chart-container:hover {
      border-color: rgba(244, 63, 94, 0.4);
      box-shadow: 
        0 4px 12px rgba(244, 63, 94, 0.1),
        0 2px 4px rgba(244, 63, 94, 0.1);
    }

    [data-theme="sunset-vibes"] .chart-title {
      color: hsl(336 84% 17%);
      background: linear-gradient(
        to right,
        hsl(339 90% 51%),
        hsl(339 90% 45%)
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    @keyframes matrix-scan {
      from { transform: translateY(0); }
      to { transform: translateY(2px); }
    }

    [data-theme="matrix"] {
      --background: 160 84% 8%;
      --foreground: 142 84% 45%;
      
      --card: 160 84% 10%;
      --card-foreground: 142 84% 45%;
      
      --popover: 160 84% 10%;
      --popover-foreground: 142 84% 45%;
      
      --primary: 142 84% 45%;
      --primary-foreground: 160 84% 8%;
      
      --secondary: 160 84% 12%;
      --secondary-foreground: 142 84% 45%;
      
      --muted: 160 84% 12%;
      --muted-foreground: 142 84% 35%;
      
      --accent: 142 84% 45%;
      --accent-foreground: 160 84% 8%;
      
      --destructive: 0 84% 60%;
      --destructive-foreground: 160 84% 8%;

      --border: 160 84% 15%;
      --input: 160 84% 15%;
      --ring: 142 84% 45%;

      --radius: 0;

      font-family: "JetBrains Mono", ui-monospace, monospace;
    }

    [data-theme="matrix"] * {
      --matrix-glow: 0 0 5px rgba(34, 197, 94, 0.5),
                     0 0 10px rgba(34, 197, 94, 0.3);
    }

    [data-theme="matrix"] .bg-card {
      background: linear-gradient(
        to bottom,
        hsl(160 84% 10%),
        hsl(160 84% 12%)
      );
      position: relative;
      overflow: hidden;
    }

    [data-theme="matrix"] .bg-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        transparent 0px,
        transparent 1px,
        rgba(34, 197, 94, 0.03) 2px,
        rgba(34, 197, 94, 0.03) 3px
      );
      pointer-events: none;
      animation: matrix-scan 8s linear infinite;
    }

    [data-theme="matrix"] .bg-background {
      background: hsl(160 84% 8%);
      position: relative;
      overflow: hidden;
    }

    [data-theme="matrix"] .bg-background::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        transparent 0px,
        transparent 1px,
        rgba(34, 197, 94, 0.02) 2px,
        rgba(34, 197, 94, 0.02) 3px
      );
      pointer-events: none;
      animation: matrix-scan 8s linear infinite;
    }

    [data-theme="matrix"] button {
      transition: all 0.2s ease;
      text-shadow: var(--matrix-glow);
    }

    [data-theme="matrix"] button:hover {
      box-shadow: var(--matrix-glow);
      background: rgba(34, 197, 94, 0.1);
    }

    [data-theme="matrix"] input {
      border-color: rgba(34, 197, 94, 0.3);
      background: rgba(34, 197, 94, 0.05);
      color: hsl(142 84% 45%);
    }

    [data-theme="matrix"] input:focus {
      border-color: rgba(34, 197, 94, 0.5);
      box-shadow: var(--matrix-glow);
    }

    [data-theme="matrix"] ::-webkit-scrollbar-thumb {
      background: rgba(34, 197, 94, 0.3);
      border-radius: 0;
    }

    [data-theme="matrix"] ::-webkit-scrollbar-track {
      background: rgba(34, 197, 94, 0.05);
    }

    /* Chart specific improvements */
    [data-theme="matrix"] .chart-container {
      background: hsl(160 84% 10%);
      border: 1px solid rgba(34, 197, 94, 0.3);
      position: relative;
      overflow: hidden;
    }

    [data-theme="matrix"] .chart-container::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        transparent 0px,
        transparent 1px,
        rgba(34, 197, 94, 0.03) 2px,
        rgba(34, 197, 94, 0.03) 3px
      );
      pointer-events: none;
      animation: matrix-scan 8s linear infinite;
    }

    [data-theme="matrix"] .chart-container:hover {
      border-color: rgba(34, 197, 94, 0.5);
      box-shadow: var(--matrix-glow);
    }

    [data-theme="matrix"] .chart-title {
      color: hsl(142 84% 45%);
      text-shadow: var(--matrix-glow);
      font-family: "JetBrains Mono", ui-monospace, monospace;
    }

    [data-theme="matrix"] .tradingview-widget-container iframe {
      filter: hue-rotate(210deg) saturate(1.2);
    }

    @keyframes twinkle {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 1; }
    }

    [data-theme="galaxy"] {
      --background: 240 85% 12%;
      --foreground: 217 91% 91%;
      
      --card: 240 85% 15%;
      --card-foreground: 217 91% 91%;
      
      --popover: 240 85% 15%;
      --popover-foreground: 217 91% 91%;
      
      --primary: 234 89% 74%;
      --primary-foreground: 240 85% 12%;
      
      --secondary: 240 85% 18%;
      --secondary-foreground: 217 91% 91%;
      
      --muted: 240 85% 18%;
      --muted-foreground: 217 91% 71%;
      
      --accent: 234 89% 74%;
      --accent-foreground: 240 85% 12%;
      
      --destructive: 0 84% 60%;
      --destructive-foreground: 217 91% 91%;

      --border: 240 85% 20%;
      --input: 240 85% 20%;
      --ring: 234 89% 74%;

      --radius: 0.75rem;
    }

    [data-theme="galaxy"] .bg-card {
      background: linear-gradient(
        135deg,
        hsl(240 85% 15%),
        hsl(240 85% 18%)
      );
    }

    [data-theme="galaxy"] .bg-background {
      background: linear-gradient(
        to bottom right,
        hsl(240 85% 12%),
        hsl(240 85% 15%)
      );
    }

    [data-theme="galaxy"] button {
      transition: all 0.2s ease;
    }

    [data-theme="galaxy"] button:hover {
      background: rgba(129, 140, 248, 0.1);
    }

    [data-theme="galaxy"] input {
      border-color: rgba(129, 140, 248, 0.2);
      background: hsl(240 85% 12%);
    }

    [data-theme="galaxy"] input:focus {
      border-color: rgba(129, 140, 248, 0.4);
      box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.1);
    }

    [data-theme="galaxy"] ::-webkit-scrollbar-thumb {
      background: rgba(129, 140, 248, 0.2);
      border-radius: 0.75rem;
    }

    [data-theme="galaxy"] ::-webkit-scrollbar-track {
      background: rgba(129, 140, 248, 0.05);
    }

    /* Chart specific improvements */
    [data-theme="galaxy"] .chart-container {
      background: hsl(240 85% 15%);
      border: 1px solid rgba(129, 140, 248, 0.2);
    }

    [data-theme="galaxy"] .chart-container:hover {
      border-color: rgba(129, 140, 248, 0.4);
    }

    [data-theme="galaxy"] .chart-title {
      color: hsl(217 91% 91%);
    }

    [data-theme="galaxy"] .tradingview-widget-container iframe {
      filter: brightness(1.1) contrast(1.1);
    }

    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0); }
      50% { opacity: 1; transform: scale(1); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
  `;
  document.head.appendChild(style);
}

export function ThemesTab() {
  const { currentTheme, setTheme } = useTheme();
  const { addNotification } = useNotifications();
  const [activeCategory, setActiveCategory] = useState<'all' | 'dark' | 'light' | 'custom'>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>(currentTheme.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Advanced filtering with memoization
  const filteredThemes = useMemo(() => {
    return MOCK_THEMES.filter(theme => {
      const matchesCategory = activeCategory === 'all' || theme.category === activeCategory;
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(Boolean);
      
      const matchesSearch = searchTerms.length === 0 || searchTerms.every(term =>
        theme.name.toLowerCase().includes(term) ||
        theme.description.toLowerCase().includes(term) ||
        theme.features?.some(f => f.toLowerCase().includes(term))
      );
      
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Theme statistics
  const themeStats = useMemo(() => ({
    total: filteredThemes.length,
    dark: filteredThemes.filter(t => t.category === 'dark').length,
    light: filteredThemes.filter(t => t.category === 'light').length,
    custom: filteredThemes.filter(t => t.category === 'custom').length,
    pro: filteredThemes.filter(t => t.isPro).length,
  }), [filteredThemes]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleThemeSelect = useCallback((themeId: string) => {
    const theme = MOCK_THEMES.find(t => t.id === themeId);
    if (!theme) return;

    if (theme.isPro) {
      addNotification(
        "Pro Theme Required",
        "Upgrade to Pro to access premium themes"
      );
      return;
    }

    setSelectedTheme(themeId);
    setTheme({
      id: theme.id,
      name: theme.name,
      accent: theme.accent,
      isDark: theme.category === 'dark'
    });

    addNotification(
      "Theme Applied",
      `${theme.name} theme has been activated successfully`
    );
  }, [setTheme, addNotification]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Enhanced Header */}
      <div className="flex-shrink-0 border-b border-border/50 bg-gradient-to-r from-background to-background/50 backdrop-blur-sm p-6">
        <div className="max-w-screen-xl mx-auto space-y-6">
          {/* Title and Search Section */}
          <div className="flex items-center justify-between gap-8">
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                Theme Gallery
              </h1>
              <p className="text-muted-foreground mt-1">
                Customize your experience with our handcrafted themes
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative group flex-1 max-w-md">
              <div className={cn(
                "absolute inset-0 -m-1 rounded-lg transition-all duration-300",
                "bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20",
                "opacity-0 group-hover:opacity-100",
                isSearchFocused && "opacity-100 animate-pulse"
              )} />
              <div className="relative flex items-center">
                <Search className={cn(
                  "absolute left-3 h-4 w-4 transition-colors duration-200",
                  isSearchFocused ? "text-primary" : "text-muted-foreground"
                )} />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search themes... (Ctrl + K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={cn(
                    "flex-1 pl-9 pr-4 py-2 rounded-md border bg-card/50",
                    "placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/20",
                    "transition-all duration-200 backdrop-blur-sm",
                    isSearchFocused && "bg-card border-primary/20"
                  )}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 p-1 rounded-full hover:bg-accent"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Category Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(['all', 'dark', 'light', 'custom'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    "hover:bg-accent/50 relative group",
                    activeCategory === category && "bg-accent text-accent-foreground"
                  )}
                >
                  <span className="relative z-10">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                  {activeCategory === category && (
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-md animate-in fade-in duration-200" />
                  )}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {themeStats[category === 'all' ? 'total' : category]}
                  </span>
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-muted/50 rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'grid' ? "bg-background shadow-sm" : "hover:bg-background/50"
                )}
              >
                <Grid2x2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'list' ? "bg-background shadow-sm" : "hover:bg-background/50"
                )}
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content Area */}
      <ScrollArea className="flex-1">
        <div className="max-w-screen-xl mx-auto p-6">
          {filteredThemes.length > 0 ? (
            <div className={cn(
              "grid gap-6 animate-in fade-in-50 duration-500",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {filteredThemes.map((theme) => (
                <div
                  key={theme.id}
                  id={`theme-${theme.id}`}
                  className={cn(
                    "group relative rounded-lg border border-border/50 bg-card overflow-hidden",
                    "transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
                    viewMode === 'list' && "flex gap-6"
                  )}
                >
                  {/* Preview Section */}
                  <div 
                    className={cn(
                      "relative aspect-video overflow-hidden",
                      viewMode === 'list' && "w-64 shrink-0"
                    )}
                  >
                    <div
                      className="absolute inset-0 transition-transform duration-500"
                      style={{ background: theme.preview }}
                    />
                    {theme.isPro && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-primary/90 backdrop-blur-sm text-xs font-medium text-primary-foreground flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        PRO
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold leading-none">{theme.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {theme.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Heart className="h-3 w-3 fill-current" />
                          {theme.likes.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Features Grid */}
                    {theme.features && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {theme.features.map((feature, index) => (
                          <div
                            key={index}
                            className="text-xs text-muted-foreground flex items-center gap-1.5"
                          >
                            <div className="h-1 w-1 rounded-full bg-primary/50" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        onClick={() => handleThemeSelect(theme.id)}
                        disabled={theme.isPro}
                        className={cn(
                          "w-full transition-all duration-300",
                          selectedTheme === theme.id && "bg-primary/90 shadow-lg shadow-primary/20"
                        )}
                      >
                        {selectedTheme === theme.id ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Applied
                          </>
                        ) : theme.isPro ? (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Unlock Pro
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Apply Theme
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">No themes found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 