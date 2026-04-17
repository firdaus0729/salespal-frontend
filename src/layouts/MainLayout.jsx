import React from 'react';
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 bg-gray-50 pt-28">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
