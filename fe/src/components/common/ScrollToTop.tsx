import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that resets the scroll position to (0, 0)
 * whenever the route (pathname) changes.
 * 
 * Place this component inside your <Router> but outside of <Routes>.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to the top of the page on route change
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant', // Use 'smooth' if you want a soft scrolling effect
        });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
