import { useEffect } from 'react';
import { createPortal } from 'react-dom';

let bodyLockCount = 0;
let previousOverflow = '';
let previousPaddingRight = '';

function lockBodyScroll() {
    if (typeof document === 'undefined') return;
    if (bodyLockCount === 0) {
        previousOverflow = document.body.style.overflow;
        previousPaddingRight = document.body.style.paddingRight;

        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollBarWidth > 0) {
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        }
        document.body.style.overflow = 'hidden';
    }
    bodyLockCount += 1;
}

function unlockBodyScroll() {
    if (typeof document === 'undefined') return;
    bodyLockCount = Math.max(0, bodyLockCount - 1);
    if (bodyLockCount === 0) {
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPaddingRight;
    }
}

/** Locks body scroll while an overlay is open, resilient to nested overlays. */
export function useBodyScrollLock(locked: boolean) {
    useEffect(() => {
        if (!locked) return undefined;
        lockBodyScroll();
        return () => unlockBodyScroll();
    }, [locked]);
}

/** Basic overlay portal to body. */
export const OverlayPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(children, document.body);
};
