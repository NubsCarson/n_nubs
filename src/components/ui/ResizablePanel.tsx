import React, { useState, useEffect, useRef } from 'react';

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  direction?: 'horizontal' | 'vertical';
  side?: 'left' | 'right';
  className?: string;
  onResize?: (size: number) => void;
}

export function ResizablePanel({
  children,
  defaultSize = 250,
  minSize = 100,
  maxSize = 800,
  direction = 'horizontal',
  side = 'right',
  className = '',
  onResize,
}: ResizablePanelProps) {
  const [size, setSize] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(size);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      let newSize: number;
      if (direction === 'horizontal') {
        const delta = e.clientX - startPosRef.current;
        // For right-side panels, invert the delta
        const adjustedDelta = side === 'right' ? -delta : delta;
        newSize = Math.min(Math.max(startSizeRef.current + adjustedDelta, minSize), maxSize);
      } else {
        const delta = startPosRef.current - e.clientY;
        newSize = Math.min(Math.max(startSizeRef.current + delta, minSize), maxSize);
      }
      
      setSize(newSize);
      onResize?.(newSize);

      // Prevent text selection while resizing
      e.preventDefault();
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'horizontal' ? 'ew-resize' : 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, direction, maxSize, minSize, onResize, side]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
    startSizeRef.current = size;
  };

  const resizeHandleClasses = direction === 'horizontal'
    ? `w-[3px] cursor-col-resize bg-border hover:bg-accent ${side === 'right' ? 'left-[-1.5px]' : 'right-[-1.5px]'} top-0 h-screen absolute`
    : 'h-[3px] cursor-row-resize bg-border hover:bg-accent top-0 left-0 right-0';

  const style = direction === 'horizontal'
    ? { width: size }
    : { height: size };

  return (
    <div
      ref={panelRef}
      className={`relative flex-shrink-0 ${className}`}
      style={style}
    >
      <div
        className={`${resizeHandleClasses} ${isResizing ? 'bg-accent' : ''} z-50 transition-colors`}
        onMouseDown={handleMouseDown}
      />
      {children}
    </div>
  );
} 