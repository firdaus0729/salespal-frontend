import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

import HeroSection from './sections/HeroSection';
import WhySalesPal from './sections/WhySalesPal';
import ValueProposition from './sections/ValueProposition';
import ModulesSection from './sections/ModulesSection';
import HowItWorks from './sections/HowItWorks';
import PricingSection from './sections/PricingSection';
import FinalCTA from './sections/FinalCTA';


const Home = () => {
    const location = useLocation();

    useEffect(() => {
        // Initialize Lenis for smooth scrolling
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    useEffect(() => {
        if (location.hash === '#pricing') {
            const el = document.getElementById('pricing');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

    return (
        <div className="bg-primary">
            <HeroSection />
            <WhySalesPal />
            <ValueProposition />
            <ModulesSection />
            <HowItWorks />
            <PricingSection />
            <FinalCTA />
        </div>
    );
};

export default Home;
