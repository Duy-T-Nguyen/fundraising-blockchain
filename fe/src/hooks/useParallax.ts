import { useEffect, useState } from 'react';

/**
 * useParallax hook that returns a value based on scroll position.
 * @param speed - The multiplier for the scroll position (e.g., 0.1 for slow, 0.5 for fast)
 * @returns The translated value
 */
export const useParallax = (speed: number = 0.1) => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            // Use requestAnimationFrame for performance
            window.requestAnimationFrame(() => {
                setOffset(window.scrollY * speed);
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return offset;
};
