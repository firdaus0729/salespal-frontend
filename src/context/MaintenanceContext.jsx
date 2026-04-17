import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const MaintenanceContext = createContext(null);

export const useMaintenance = () => {
  const ctx = useContext(MaintenanceContext);
  if (!ctx) {
    throw new Error('useMaintenance must be used within MaintenanceProvider');
  }
  return ctx;
};

const DEFAULT_STATE = {
  global: { enabled: false, reason: '', eta: '', scheduled_start: null, scheduled_end: null, notify_users: false },
  modules: {
    marketing: { enabled: false, reason: '', eta: '' },
    sales: { enabled: false, reason: '', eta: '' },
    'post-sales': { enabled: false, reason: '', eta: '' },
    support: { enabled: false, reason: '', eta: '' },
  },
};

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export const MaintenanceProvider = ({ children }) => {
  const [maintenance, setMaintenance] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/maintenance/status`);
      if (res.ok) {
        const data = await res.json();
        if (data.maintenance) {
          setMaintenance(prev => ({
            ...DEFAULT_STATE,
            ...data.maintenance,
            global: { ...DEFAULT_STATE.global, ...data.maintenance.global },
            modules: {
              ...DEFAULT_STATE.modules,
              ...(data.maintenance.modules || {}),
            },
          }));
        }
      }
    } catch {
      // Silently fail — maintenance check is best-effort
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const isGlobalMaintenance = maintenance.global?.enabled === true;

  const isModuleUnderMaintenance = useCallback(
    (moduleName) => {
      if (isGlobalMaintenance) return true;
      const moduleKey = moduleName === 'postSale' ? 'post-sales' : moduleName;
      return maintenance.modules?.[moduleKey]?.enabled === true;
    },
    [maintenance, isGlobalMaintenance]
  );

  const getModuleMaintenanceInfo = useCallback(
    (moduleName) => {
      const moduleKey = moduleName === 'postSale' ? 'post-sales' : moduleName;
      return maintenance.modules?.[moduleKey] || { enabled: false, reason: '', eta: '' };
    },
    [maintenance]
  );

  const value = useMemo(
    () => ({
      maintenance,
      loading,
      isGlobalMaintenance,
      isModuleUnderMaintenance,
      getModuleMaintenanceInfo,
      globalInfo: maintenance.global || DEFAULT_STATE.global,
      refreshStatus: fetchStatus,
    }),
    [maintenance, loading, isGlobalMaintenance, isModuleUnderMaintenance, getModuleMaintenanceInfo, fetchStatus]
  );

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
};
