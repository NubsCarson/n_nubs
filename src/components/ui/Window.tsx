import { ReactNode, useState } from "react";
import { X, Minus, Square, Maximize2 } from "lucide-react";

interface WindowProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
}

type ResizeDirection = 
  | "n" | "s" | "e" | "w" 
  | "ne" | "nw" | "se" | "sw" 
  | null;

export function Window({
  title,
  children,
  isOpen,
  onClose,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 400, height: 300 },
}: WindowProps) {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeDirection>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleResizeStart = (e: React.MouseEvent, direction: ResizeDirection) => {
    if (isMaximized) return;
    e.stopPropagation();
    setIsResizing(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !isMaximized) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    } else if (isResizing && !isMaximized) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = size.width;
      let newHeight = size.height;
      let newX = position.x;
      let newY = position.y;

      // Handle horizontal resizing
      if (isResizing.includes('e')) {
        newWidth = size.width + deltaX;
      } else if (isResizing.includes('w')) {
        newWidth = size.width - deltaX;
        newX = position.x + deltaX;
      }

      // Handle vertical resizing
      if (isResizing.includes('s')) {
        newHeight = size.height + deltaY;
      } else if (isResizing.includes('n')) {
        newHeight = size.height - deltaY;
        newY = position.y + deltaY;
      }

      // Apply minimum size constraints
      const minSize = 200;
      if (newWidth >= minSize) {
        setSize(prev => ({ ...prev, width: newWidth }));
        if (isResizing.includes('w')) {
          setPosition(prev => ({ ...prev, x: newX }));
        }
      }
      if (newHeight >= minSize) {
        setSize(prev => ({ ...prev, height: newHeight }));
        if (isResizing.includes('n')) {
          setPosition(prev => ({ ...prev, y: newY }));
        }
      }

      setResizeStart({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMaximized) setIsMaximized(false);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (isMinimized) setIsMinimized(false);
  };

  const windowStyle = isMaximized
    ? {
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        transform: "none",
      }
    : {
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: isMinimized ? "40px" : `${size.height}px`,
        transform: "translate(0, 0)",
      };

  return (
    <div
      className="fixed bg-card border border-border rounded-lg shadow-lg overflow-hidden"
      style={{
        ...windowStyle,
        userSelect: isDragging || isResizing ? 'none' : 'auto',
        zIndex: 100
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Resize handles */}
      {!isMaximized && !isMinimized && (
        <>
          <div
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-50 hover:bg-accent/10"
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-50 hover:bg-accent/10"
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-50 hover:bg-accent/10"
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-50 hover:bg-accent/10"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
          <div
            className="absolute top-0 left-3 right-3 h-2 cursor-n-resize z-50 hover:bg-accent/10"
            onMouseDown={(e) => handleResizeStart(e, "n")}
          />
          <div
            className="absolute bottom-0 left-3 right-3 h-2 cursor-s-resize z-50 hover:bg-accent/10"
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          <div
            className="absolute left-0 top-3 bottom-3 w-2 cursor-w-resize z-50 hover:bg-accent/10"
            onMouseDown={(e) => handleResizeStart(e, "w")}
          />
          <div
            className="absolute right-0 top-3 bottom-3 w-2 cursor-e-resize z-50 hover:bg-accent/10"
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />
        </>
      )}

      {/* Window Title Bar */}
      <div
        className="h-10 bg-muted px-4 flex items-center justify-between cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <span className="font-semibold">{title}</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMinimize}
            className="p-1 hover:bg-accent rounded-sm"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={toggleMaximize}
            className="p-1 hover:bg-accent rounded-sm"
          >
            {isMaximized ? (
              <Square className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div
        className={`bg-background p-4 overflow-auto transition-all duration-200 ${
          isMinimized ? "hidden" : ""
        }`}
        style={{ 
          height: "calc(100% - 40px)",
          pointerEvents: isDragging || isResizing ? 'none' : 'auto',
          userSelect: isDragging || isResizing ? 'none' : 'auto'
        }}
      >
        {children}
      </div>
    </div>
  );
} 