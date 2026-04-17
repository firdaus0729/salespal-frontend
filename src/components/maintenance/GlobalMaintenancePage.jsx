import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, RefreshCw, Mail, Clock, Server, Shield, Cog, Settings } from 'lucide-react';
import { useMaintenance } from '../../context/MaintenanceContext';
import { useNavigate } from 'react-router-dom';

const GlobalMaintenancePage = ({ isAdmin = false }) => {
  const { globalInfo } = useMaintenance();
  const navigate = useNavigate();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #111827 40%, #0f172a 70%, #0a0a0f 100%)',
      }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
            top: '-10%',
            right: '-10%',
          }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            bottom: '-15%',
            left: '-10%',
          }}
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Subtle noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* Main content card */}
      <motion.div
        className="relative z-10 max-w-lg w-full mx-4"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="rounded-3xl p-10 text-center border border-white/[0.06]"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* ─── Animated Icon Assembly ─────────────────────────────── */}
          <div className="relative mx-auto mb-8 w-20 h-20">
            {/* Glow pulse behind */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Icon container */}
            <motion.div
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              {/* Rotating cog (background) */}
              <motion.div
                className="absolute"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <Cog
                  size={40}
                  className="text-indigo-400 opacity-25"
                  strokeWidth={1.2}
                />
              </motion.div>

              {/* Counter-rotating smaller cog */}
              <motion.div
                className="absolute"
                style={{ top: '6px', right: '6px' }}
                animate={{ rotate: -360 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <Settings
                  size={15}
                  className="text-indigo-400 opacity-20"
                  strokeWidth={1.5}
                />
              </motion.div>

              {/* Floating wrench (foreground) */}
              <motion.div
                animate={{
                  y: [-3, 3, -3],
                  rotate: [-8, 8, -8],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.3,
                }}
              >
                <Wrench size={36} className="text-indigo-400" />
              </motion.div>
            </motion.div>
          </div>

          {/* Title */}
          <motion.h1
            className="text-3xl font-bold text-white mb-3 tracking-tight"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            We're Under Maintenance
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-gray-400 text-base leading-relaxed mb-2 max-w-sm mx-auto"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            We're improving your experience. Please check back shortly.
          </motion.p>

          {/* Reason */}
          {globalInfo.reason && (
            <motion.p
              className="text-gray-500 text-sm mb-4 italic"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              "{globalInfo.reason}"
            </motion.p>
          )}

          {/* ETA */}
          {globalInfo.eta && (
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6"
              style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.15)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              {/* Pulsing dot */}
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                animate={{
                  opacity: [1, 0.3, 1],
                  scale: [1, 0.8, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <Clock size={14} className="text-indigo-400" />
              <span className="text-indigo-300 text-sm font-medium">
                Expected downtime: {globalInfo.eta}
              </span>
            </motion.div>
          )}

          {/* Animated progress dots */}
          <div className="flex items-center justify-center gap-1.5 my-8">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-indigo-400/60"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Actions */}
          <motion.div
            className="flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
              }}
            >
              <RefreshCw size={15} />
              Refresh
            </button>

            <a
              href="mailto:support@salespal.in"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-gray-300 transition-all duration-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15]"
            >
              <Mail size={15} />
              Contact Support
            </a>
          </motion.div>

          {/* Admin escape hatch */}
          {isAdmin && (
            <motion.div
              className="mt-6 pt-5 border-t border-white/[0.06]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
            >
              <button
                onClick={() => navigate('/admin/settings')}
                className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-medium text-amber-300 transition-all duration-300 hover:text-amber-200 hover:bg-amber-500/[0.08] border border-amber-500/20 hover:border-amber-500/30"
              >
                <Shield size={15} />
                Go to Admin Panel
              </button>
            </motion.div>
          )}
        </div>

        {/* Small status line */}
        <div className="flex items-center justify-center gap-2 mt-6 text-gray-600 text-xs">
          <Server size={12} />
          <span>System maintenance in progress{dots}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default GlobalMaintenancePage;
