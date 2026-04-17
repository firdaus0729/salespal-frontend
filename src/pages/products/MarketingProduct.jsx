import React, { useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ProductHero from '../../components/products/ProductHero';
import FeaturesGrid from '../../components/products/FeaturesGrid';
import ComparisonTable from '../../components/products/ComparisonTable';
import TargetAudience from '../../components/products/TargetAudience';
import ProductCTA from '../../components/products/ProductCTA';

const MarketingProduct = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <ProductHero />
            <FeaturesGrid />
            <ComparisonTable />
            <TargetAudience />
            <ProductCTA />
            <Footer />
        </div>
    );
};

export default MarketingProduct;
