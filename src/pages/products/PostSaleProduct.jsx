import React, { useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PostSaleProductHero from '../../components/products/PostSaleProductHero';
import PostSaleFeaturesGrid from '../../components/products/PostSaleFeaturesGrid';
import PostSaleComparisonTable from '../../components/products/PostSaleComparisonTable';
import PostSaleTargetAudience from '../../components/products/PostSaleTargetAudience';
import PostSaleProductCTA from '../../components/products/PostSaleProductCTA';

const PostSaleProduct = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <PostSaleProductHero />
            <PostSaleFeaturesGrid />
            <PostSaleComparisonTable />
            <PostSaleTargetAudience />
            <PostSaleProductCTA />
            <Footer />
        </div>
    );
};

export default PostSaleProduct;
