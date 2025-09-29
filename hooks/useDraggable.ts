import React, { useState, useRef, useCallback } from 'react';

export const useDraggable = (initialPos = { x: 30, y: window.innerHeight - 120 }) => {
  const [position, setPosition] = useState(initialPos);
  const isDraggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    offsetRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);
  
  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: clientX - offsetRef.current.x,
      y: clientY - offsetRef.current.y,
    });
  }, []);
  
  // Added event argument to handler for signature consistency, resolving a type error in the calling component.
  const handleDragEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = false;
  }, []);

  return {
    position,
    dragHandlers: {
      onMouseDown: handleDragStart,
      onTouchStart: handleDragStart,
      onMouseMove: handleDragMove,
      onTouchMove: handleDragMove,
      onMouseUp: handleDragEnd,
      onTouchEnd: handleDragEnd,
      onMouseLeave: handleDragEnd,
    },
  };
};