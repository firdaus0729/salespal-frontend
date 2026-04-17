import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const PricingContext = createContext(null);

// Default fallback prices (used while loading or if API fails)
const FALLBACK_PRICING = [
  { productType: 'marketing', name: 'Marketing', monthlyPrice: 5999, yearlyPrice: 59990 },
  { productType: 'sales', name: 'Sales', monthlyPrice: 9999, yearlyPrice: 99990 },
  { productType: 'post-sales', name: 'Post-Sales', monthlyPrice: 9999, yearlyPrice: 99990 },
  { productType: 'support', name: 'Support', monthlyPrice: 9999, yearlyPrice: 99990 },
  { productType: 'salespal-360', name: 'SalesPal 360', monthlyPrice: 29999, yearlyPrice: 299990 },
];

// Cache duration: set to 0 to prevent caching so admin switches apply instantly (per user request)
const CACHE_DURATION_MS = 0;

export function PricingProvider({ children }) {
  const [pricing, setPricing] = useState(FALLBACK_PRICING);
  const [moduleAccess, setModuleAccess] = useState({
    marketing: true,
    sales: true,
    'post-sales': true,
    support: true
  });
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(0);

  const fetchPricing = useCallback(async (force = false) => {
    // Skip if recently fetched (unless forced)
    if (!force && Date.now() - lastFetched < CACHE_DURATION_MS) return;

    try {
      setIsLoading(true);
      setError(null);

      // Use raw fetch for the public endpoint (no auth needed)
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/pricing`);

      if (!res.ok) throw new Error(`Pricing API returned ${res.status}`);

      const data = await res.json();

      if (data && Array.isArray(data.pricing)) {
        setPricing(data.pricing);
        if (data.modules) {
          setModuleAccess(data.modules);
        }
        if (data.maintenanceMode !== undefined) {
          setMaintenanceMode(data.maintenanceMode);
        }
        setLastFetched(Date.now());
      } else if (Array.isArray(data)) {
        // Fallback for older API responses
        setPricing(data);
        setLastFetched(Date.now());
      }
    } catch (err) {
      console.error('[PricingContext] Failed to fetch pricing:', err.message);
      setError(err.message);
      // Keep fallback pricing — never show empty
    } finally {
      setIsLoading(false);
    }
  }, [lastFetched]);

  // Fetch on mount
  useEffect(() => {
    fetchPricing(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Get pricing for a specific product type.
   * @param {string} productType - e.g. 'marketing', 'sales', 'post-sales', 'support', 'salespal-360'
   * @returns {{ productType: string, name: string, monthlyPrice: number, yearlyPrice: number } | null}
   */
  const getProductPricing = useCallback((productType) => {
    if (!productType) return null;
    return pricing.find(p => p.productType === productType) || null;
  }, [pricing]);

  /**
   * Get the monthly price for a product type.
   * Falls back to 0 if not found.
   */
  const getMonthlyPrice = useCallback((productType) => {
    return getProductPricing(productType)?.monthlyPrice || 0;
  }, [getProductPricing]);

  /**
   * Get the yearly price for a product type.
   * Falls back to 0 if not found.
   */
  const getYearlyPrice = useCallback((productType) => {
    return getProductPricing(productType)?.yearlyPrice || 0;
  }, [getProductPricing]);

  const isModuleVisible = useCallback((moduleId) => {
    // Map internal identifiers if necessary, 'post-sales' vs 'postSale', etc.
    let key = moduleId;
    if (key === 'postSale' || key === 'postsale') key = 'post-sales';
    if (key === 'bundle') return true; // Bundle is always visible
    
    // If not found in moduleAccess, default to true
    if (moduleAccess[key] === undefined) return true;
    return moduleAccess[key];
  }, [moduleAccess]);

  const value = {
    pricing,
    moduleAccess,
    maintenanceMode,
    isLoading,
    error,
    fetchPricing,
    getProductPricing,
    getMonthlyPrice,
    getYearlyPrice,
    isModuleVisible,
  };

  return (
    <PricingContext.Provider value={value}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing() {
  const ctx = useContext(PricingContext);
  if (!ctx) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return ctx;
}

export default PricingContext;
