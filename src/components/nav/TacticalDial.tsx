import React, { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDraggable } from '../../hooks/useDraggable';
import { View } from '../../types';

// --- SVG Icons for Roles ---
const GuardianIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const CoPilotIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
);

const StorytellerIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
);

const PlaymateIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
       <path d="M6 12h12M12 6v12" />
       <path d="M17.8 17.8l-1.4 1.4M6.2 6.2l-1.4-1.4" />
       <path d="m16.4 17.8-1.4-1.4M7.6 6.2 6.2 7.6" />
       <path d="M17.8 6.2l-1.4 1.4M6.2 17.8l1.4-1.4" />
       <circle cx="12" cy="12" r="10" />
    </svg>
);

// Added 'as const' to the array returned by this function. This tells TypeScript
// to infer the 'id' properties as specific string literals (e.g., 'guardian') instead of
// the general 'string' type. This makes the type compatible with the 'View' type expected
// by the onRoleSelect handler, resolving the type error.
const getRoles = (t: (key: string) => string) => [
    { id: 'guardian', name: t('dial.guardian'), icon: <GuardianIcon />, angle: -150 },
    { id: 'coPilot', name: t('dial.coPilot'), icon: <CoPilotIcon />, angle: -110 },
    { id: 'storyteller', name: t('dial.storyteller'), icon: <StorytellerIcon />, angle: -70 },
    { id: 'playmate', name: t('dial.playmate'), icon: <PlaymateIcon />, angle: -30 },
] as const;

// FIX: Update props to accept isOpen and setIsOpen from parent for external control.
interface TacticalDialProps {
  onRoleSelect: (view: View) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TacticalDial: React.FC<TacticalDialProps> = ({ onRoleSelect, isOpen, setIsOpen }) => {
    const { position, dragHandlers } = useDraggable();
    const { t } = useTranslation();
    const roles = getRoles(t);

    const longPressTimerRef = useRef<number>();
    const isMovedRef = useRef(false);
    const startCoordsRef = useRef({ x: 0, y: 0 });

    const handlePressStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        isMovedRef.current = false;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        startCoordsRef.current = { x: clientX, y: clientY };

        ('touches' in e) ? dragHandlers.onTouchStart(e) : dragHandlers.onMouseDown(e);

        longPressTimerRef.current = window.setTimeout(() => {
            if (!isMovedRef.current) {
                setIsOpen(true);
            }
        }, 300);
    }, [dragHandlers, setIsOpen]);

    const handlePressMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (longPressTimerRef.current) {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const dx = clientX - startCoordsRef.current.x;
            const dy = clientY - startCoordsRef.current.y;
            if (Math.sqrt(dx * dx + dy * dy) > 5) {
                isMovedRef.current = true;
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = undefined;
            }
        }
         ('touches' in e) ? dragHandlers.onTouchMove(e) : dragHandlers.onMouseMove(e);
    }, [dragHandlers]);

    const handlePressEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
        }
        // FIX: Pass the event object `e` to the dragHandlers `onTouchEnd` and `onMouseUp` methods to match their expected signature from the useDraggable hook.
        ('touches' in e) ? dragHandlers.onTouchEnd(e) : dragHandlers.onMouseUp(e);
        if (!isMovedRef.current && !isOpen) { // Also check if it's not already open to prevent toggle on drag
            // A simple click without a long press. Could be used for a default action.
            // For now, it does nothing if the menu isn't open.
        } else if (isOpen) {
            // If the menu is open and it wasn't a drag, it implies a click on the backdrop, so we close.
            // Or it's the end of a drag, in which case we do nothing to the open state.
            if (!isMovedRef.current) {
                setIsOpen(false);
            }
        }
    }, [dragHandlers, isOpen, setIsOpen]);
    
    const handleRoleClick = (view: View) => {
        onRoleSelect(view);
        setIsOpen(false);
    };

    const combinedHandlers = {
        onMouseDown: handlePressStart,
        onTouchStart: handlePressStart,
        onMouseMove: handlePressMove,
        onTouchMove: handlePressMove,
        onMouseUp: handlePressEnd,
        onTouchEnd: handlePressEnd,
        onMouseLeave: dragHandlers.onMouseLeave,
    };
    
    return (
        <div
            style={{ top: position.y, left: position.x }}
            className="fixed z-50 flex items-center justify-center"
            {...combinedHandlers}
        >
            {/* Radial Menu Items */}
            {roles.map((role) => {
                const angleRad = (role.angle * Math.PI) / 180;
                const radius = 80;
                const x = Math.cos(angleRad) * radius;
                const y = Math.sin(angleRad) * radius;
                return (
                    <button
                        key={role.id}
                        aria-label={role.name}
                        onClick={() => handleRoleClick(role.id)}
                        className="absolute w-14 h-14 bg-widget-background border border-widget-border rounded-full flex items-center justify-center text-primary-accent transition-all duration-300 ease-in-out shadow-glow hover:bg-primary-accent hover:text-white"
                        style={{
                            transform: isOpen ? `translate(${x}px, ${y}px)` : 'translate(0, 0)',
                            opacity: isOpen ? 1 : 0,
                            pointerEvents: isOpen ? 'auto' : 'none',
                        }}
                    >
                        {role.icon}
                    </button>
                );
            })}

            {/* Main Dial Button */}
            <button
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label={t('dial.open')}
                className="w-16 h-16 bg-primary-accent rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-200"
                style={{ transform: isOpen ? 'scale(0.9)' : 'scale(1)' }}
            >
                <div className="w-8 h-8 rounded-full border-2 border-white/50 animate-pulse-glow flex items-center justify-center">
                   <div className="w-3 h-3 rounded-full bg-white/50"></div>
                </div>
            </button>
        </div>
    );
};

export default TacticalDial;