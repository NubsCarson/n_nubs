import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster 
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                    padding: '12px',
                    minWidth: '300px',
                    maxWidth: '400px',
                  },
                  closeButton: true,
                  className: "!bg-card !border-border/50 !text-foreground !shadow-lg",
                  classNames: {
                    toast: "!items-start !bg-card !rounded-lg !border !border-border/50",
                    title: "!text-sm !font-medium !text-foreground",
                    description: "!text-xs !text-muted-foreground",
                    closeButton: "!absolute !right-3 !top-3 !p-0 !opacity-50 hover:!opacity-100 !transition-opacity",
                    actionButton: "!bg-primary",
                  }
                }}
                theme="system"
                expand={false}
                visibleToasts={6}
                closeButton
                richColors={false}
              />
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
