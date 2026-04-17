import React, { useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import SupportProductHero from '../../components/products/SupportProductHero';
import SupportFeaturesGrid from '../../components/products/SupportFeaturesGrid';
import SupportComparisonTable from '../../components/products/SupportComparisonTable';
import SupportTargetAudience from '../../components/products/SupportTargetAudience';
import SupportProductCTA from '../../components/products/SupportProductCTA';

const SupportProduct = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <SupportProductHero />
            <SupportFeaturesGrid />
            <SupportComparisonTable />
            <SupportTargetAudience />
            <SupportProductCTA />
            <Footer />
        </div>
    );
};

export default SupportProduct;
