import React, { useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import SalesPal360Hero from '../../components/products/SalesPal360Hero';
import SalesPal360Features from '../../components/products/SalesPal360Features';
import SalesPal360Comparison from '../../components/products/SalesPal360Comparison';
import SalesPal360TargetAudience from '../../components/products/SalesPal360TargetAudience';
import SalesPal360CTA from '../../components/products/SalesPal360CTA';

const SalesPal360Product = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <SalesPal360Hero />
            <SalesPal360Features />
            <SalesPal360Comparison />
            <SalesPal360TargetAudience />
            <SalesPal360CTA />
            <Footer />
        </div>
    );
};

export default SalesPal360Product;
