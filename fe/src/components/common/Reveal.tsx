import React, { type ReactNode } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface RevealProps {
    children: ReactNode;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    delay?: number;
    duration?: number;
    cascade?: boolean;
    triggerOnce?: boolean;
    threshold?: number;
    className?: string;
}

/**
 * Reveal component that animates its children when they enter the viewport.
 * Uses Intersection Observer for performance and CSS transitions for smoothness.
 * 
 * Optimized to NOT wrap children in an extra div if a single DOM element is provided,
 * which preserves the original layout (especially for flex/grid).
 */
const Reveal: React.FC<RevealProps> = ({
    children,
    direction = 'up',
    delay = 0,
    duration = 800,
    cascade = false,
    triggerOnce = true,
    threshold = 0.1,
    className = '',
}) => {
    const { elementRef, isIntersecting } = useIntersectionObserver({
        threshold,
        triggerOnce,
    });

    const getDirectionClass = () => {
        switch (direction) {
            case 'up': return 'reveal-up';
            case 'down': return 'reveal-down';
            case 'left': return 'reveal-left';
            case 'right': return 'reveal-right';
            default: return '';
        }
    };

    const animationClasses = `reveal-base ${getDirectionClass()} ${isIntersecting ? 'reveal-visible' : ''} ${className}`;

    const style: React.CSSProperties = {
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
    };

    // Determine if we can safely clone the child or if we need a wrapper div.
    // We can only clone native DOM elements (strings) because they reliably support refs.
    // Functional/Class components must be wrapped in a div to ensure the IntersectionObserver has a DOM node to watch.
    const isDomElement = React.isValidElement(children) && typeof children.type === 'string';

    // If cascade is true, we expect children to be a single DOM element (the container) 
    // whose internal children we will stagger.
    if (cascade && isDomElement) {
        const container = children as React.ReactElement<{ children?: React.ReactNode; className?: string; style?: React.CSSProperties }>;

        const staggeredChildren = React.Children.map(container.props.children, (child, index) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement<{ className?: string; style?: React.CSSProperties }>, {
                    className: `${(child.props as any).className || ''} stagger-item`,
                    style: {
                        ...(child.props as any).style,
                        '--stagger-delay': `${index * 100}ms`,
                    } as React.CSSProperties,
                });
            }
            return child;
        });

        return React.cloneElement(container, {
            ref: elementRef,
            className: `${container.props.className || ''} ${animationClasses}`,
            style: {
                ...container.props.style,
                ...style,
            },
            children: staggeredChildren,
        } as any);
    }

    // If it's a single valid DOM element, we clone it
    if (isDomElement && !Array.isArray(children)) {
        const child = children as React.ReactElement<{ className?: string; style?: React.CSSProperties }>;
        return React.cloneElement(child, {
            ref: elementRef,
            className: `${(child.props as any).className || ''} ${animationClasses}`,
            style: {
                ...(child.props as any).style,
                ...style,
            },
        } as any);
    }

    // Fallback: wrap in a div if we have custom components, multiple children, or text
    return (
        <div
            ref={elementRef}
            className={animationClasses}
            style={style}
        >
            {children}
        </div>
    );
};

export default Reveal;
