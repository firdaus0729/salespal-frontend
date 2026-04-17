import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant' // As requested by user ("instant" in snippet, though "smooth" was mentioned in verifying, "instant" is safer for full page resets)
        });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
