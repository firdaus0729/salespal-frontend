import React, { useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import SalesProductHero from '../../components/products/SalesProductHero';
import SalesFeaturesGrid from '../../components/products/SalesFeaturesGrid';
import SalesComparisonTable from '../../components/products/SalesComparisonTable';
import SalesTargetAudience from '../../components/products/SalesTargetAudience';
import SalesProductCTA from '../../components/products/SalesProductCTA';

const SalesProduct = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <SalesProductHero />
            <SalesFeaturesGrid />
            <SalesComparisonTable />
            <SalesTargetAudience />
            <SalesProductCTA />
            <Footer />
        </div>
    );
};

export default SalesProduct;
