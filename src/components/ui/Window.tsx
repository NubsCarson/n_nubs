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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isMaximized) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
      style={windowStyle}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
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
        style={{ height: "calc(100% - 40px)" }}
      >
        {children}
      </div>
    </div>
  );
} 