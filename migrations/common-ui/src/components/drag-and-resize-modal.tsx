"use client";

import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface DragAndResizeModalProps {
  onOpenChange?(open: boolean): void;
  open?: boolean;
  children?: React.ReactNode;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  title?: string | React.ReactNode;
  ratio?: number | "16:9" | "4:3" | "1:1" | "3:2";
  name: string;
  className?: string;
  hasBackdrop?: boolean;
}

interface DialogPosition {
  x: number;
  y: number;
}

interface DialogSize {
  width: number;
  height: number;
}

const getStoredValue = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;

  try {
    const item = window.localStorage.getItem(key);
    if (!item) return defaultValue;

    const parsedValue = JSON.parse(item);
    return parsedValue || defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const setStoredValue = <T,>(key: string, value: T): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error writing to localStorage key "${key}":`, error);
  }
};

const getInitialDialogPosition = (
  storageKey: string,
  initialWidth: number,
  initialHeight: number
): DialogPosition => {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 }; // Default position for SSR
  }

  const storedPos = getStoredValue<DialogPosition | null>(storageKey, null);

  if (!storedPos) {
    // If no stored position, center in viewport
    const x = Math.max(0, (window.innerWidth - initialWidth) / 2);
    const y = Math.max(0, (window.innerHeight - initialHeight) / 2);
    return { x, y };
  }

  // Ensure stored position is within current viewport
  return {
    x: Math.min(Math.max(0, storedPos.x), window.innerWidth - initialWidth),
    y: Math.min(Math.max(0, storedPos.y), window.innerHeight - initialHeight),
  };
};

const getInitialDialogSize = (
  storageKey: string,
  initialWidth: number,
  initialHeight: number
): DialogSize => {
  if (typeof window === "undefined") {
    return { width: initialWidth, height: initialHeight }; // Default size for SSR
  }

  const storedSize = getStoredValue<DialogSize | null>(storageKey, null);

  if (!storedSize) {
    return { width: initialWidth, height: initialHeight };
  }

  // Ensure stored size fits within current viewport
  return {
    width: Math.min(storedSize.width, window.innerWidth),
    height: Math.min(storedSize.height, window.innerHeight),
  };
};

const DragAndResizeModal: React.FC<DragAndResizeModalProps> = ({
  children,
  open,
  onOpenChange,
  // initialWidth = 400,
  // initialHeight = 300,
  initialWidth = 600,
  initialHeight = 400,
  minWidth = 200,
  minHeight = 150,
  title = "Draggable Dialog",
  ratio,
  name,
  className,
  hasBackdrop = false,
}) => {
  const storageKeyPosition = `dialog-position-${name}`;
  const storageKeySize = `dialog-size-${name}`;
  const dialogRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState<DialogPosition>(() =>
    getInitialDialogPosition(storageKeyPosition, initialWidth, initialHeight)
  );

  const [size, setSize] = useState<DialogSize>(() =>
    getInitialDialogSize(storageKeySize, initialWidth, initialHeight)
  );

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const newX = Math.min(prev.x, window.innerWidth - size.width);
        const newY = Math.min(prev.y, window.innerHeight - size.height);

        if (newX !== prev.x || newY !== prev.y) {
          setStoredValue(storageKeyPosition, { x: newX, y: newY });
        }

        return { x: newX, y: newY };
      });

      setSize((prev) => {
        const newWidth = Math.min(prev.width, window.innerWidth);
        const newHeight = Math.min(prev.height, window.innerHeight);

        if (newWidth !== prev.width || newHeight !== prev.height) {
          setStoredValue(storageKeySize, {
            width: newWidth,
            height: newHeight,
          });
        }

        return { width: newWidth, height: newHeight };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [size.width, size.height, storageKeyPosition, storageKeySize]);

  // Get numeric ratio if provided
  const getNumericRatio = (
    ratioValue: DragAndResizeModalProps["ratio"]
  ): number | null => {
    if (!ratioValue || typeof window === 'undefined') return null;
    if (typeof ratioValue === "number") return ratioValue;
    const [width, height] = ratioValue.split(":").map(Number);
    return width && height ? width / height : null;
  };

  const aspectRatio = getNumericRatio(ratio);

  // Store position when it changes
  useEffect(() => {
    if (!isDragging) {
      setStoredValue(storageKeyPosition, position);
    }
  }, [position, storageKeyPosition, isDragging]);

  // Store size when it changes
  useEffect(() => {
    if (!isResizing) {
      setStoredValue(storageKeySize, size);
    }
  }, [size, storageKeySize, isResizing]);

  const handleMouseDown = (e: React.MouseEvent, type: "drag" | "resize") => {
    e.preventDefault();
    if (type === "drag") {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    } else if (type === "resize") {
      setIsResizing(true);
      setDragStart({
        x: e.clientX - size.width,
        y: e.clientY - size.height,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    } else if (isResizing) {
      let newWidth = Math.max(minWidth, e.clientX - dragStart.x);
      let newHeight = Math.max(minHeight, e.clientY - dragStart.y);

      const maxWidth = window.innerWidth - position.x;
      const maxHeight = window.innerHeight - position.y;

      newWidth = Math.min(newWidth, maxWidth);

      if (aspectRatio) {
        newHeight = newWidth / aspectRatio;

        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = newHeight * aspectRatio;
        }
      } else {
        newHeight = Math.min(newHeight, maxHeight);
      }

      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  if (!open) return null;

  return (
    <>
      {hasBackdrop && (
        <div
          className={cn(
            "fixed inset-0 z-50 bg-black/50",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "duration-200"
          )}
          data-state={open ? "open" : "closed"}
        />
      )}

      <div
        ref={dialogRef}
        className={cn(
          "fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",

          // block transitions ONLY while dragging/resizing
          (isDragging || isResizing)
            ? "duration-0 transition-none"
            : "duration-200 transition-all",

          className
        )}
        style={{
          width: size.width,
          height: size.height,
          left: position.x,
          top: position.y,
          transform: "translate(0, 0)",
        }}
        data-state={open ? "open" : "closed"}
      >


        <div
          className="h-12 bg-white border-b flex items-center justify-between px-4 select-none"
          onMouseDown={(e) => handleMouseDown(e, "drag")}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <div className="font-medium text-sm truncate">{title}</div>
          <button
            onClick={() => onOpenChange?.(false)}
            className="h-6 w-6 rounded-sm inline-flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div
          className="p-4 overflow-auto"
          style={{ height: `calc(100% - 3rem)` }}
        >
          {children}
        </div>

        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize")}
        >
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-gray-400 rounded" />
        </div>
      </div>
    </>
  );
};

export default DragAndResizeModal;
