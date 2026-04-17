import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Wrench } from 'lucide-react';
import { useMaintenance } from '../../context/MaintenanceContext';

const MaintenanceBanner = () => {
  const { isGlobalMaintenance, maintenance } = useMaintenance();
  const [dismissed, setDismissed] = useState(false);

  // Collect which modules are under maintenance
  const activeModules = Object.entries(maintenance.modules || {})
    .filter(([, val]) => val?.enabled)
    .map(([key]) => {
      const names = { marketing: 'Marketing', sales: 'Sales', 'post-sales': 'Post-Sales', support: 'Support' };
      return names[key] || key;
    });

  const showBanner = !dismissed && (isGlobalMaintenance || activeModules.length > 0);

  if (!showBanner) return null;

  const message = isGlobalMaintenance
    ? 'Global Maintenance Mode is ON — all non-admin users see the maintenance page.'
    : `Module maintenance active: ${activeModules.join(', ')}`;

  return (
    <AnimatePresence>
      <motion.div
        className="relative z-50"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="flex items-center justify-between px-4 py-2.5 text-sm"
          style={{
            background: isGlobalMaintenance
              ? 'linear-gradient(90deg, #92400e, #b45309, #92400e)'
              : 'linear-gradient(90deg, #1e3a5f, #1e40af, #1e3a5f)',
          }}
        >
          <div className="flex items-center gap-2 text-white/90 font-medium">
            {isGlobalMaintenance ? (
              <AlertTriangle size={15} className="text-amber-200 shrink-0" />
            ) : (
              <Wrench size={15} className="text-blue-200 shrink-0" />
            )}
            <span>{message}</span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MaintenanceBanner;
