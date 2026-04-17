import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, ArrowLeft, Clock, Shield, Settings, Cog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MODULE_DISPLAY = {
  marketing: { name: 'Marketing', color: '#6366f1' },
  sales: { name: 'Sales', color: '#10b981' },
  'post-sales': { name: 'Post-Sales', color: '#8b5cf6' },
  postSale: { name: 'Post-Sales', color: '#8b5cf6' },
  support: { name: 'Support', color: '#f59e0b' },
};

const ModuleMaintenanceCard = ({ moduleName, reason, eta, isAdmin = false }) => {
  const navigate = useNavigate();
  const info = MODULE_DISPLAY[moduleName] || { name: moduleName, color: '#6366f1' };

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-6">
      <motion.div
        className="max-w-md w-full rounded-2xl border border-gray-800/60 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(17,24,39,0.95) 0%, rgba(15,23,42,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        {/* Top accent bar */}
        <div
          className="h-1 relative overflow-hidden"
          style={{
            background: `linear-gradient(90deg, ${info.color}80, ${info.color}, ${info.color}80)`,
          }}
        >
          {/* Shimmer effect on accent bar */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
              width: '40%',
            }}
            animate={{ x: ['-100%', '350%'] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          />
        </div>

        <div className="p-8 text-center">
          {/* ─── Animated Icon Assembly ─────────────────────────────────── */}
          <div className="relative mx-auto mb-6 w-20 h-20">
            {/* Glow pulse behind */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{
                background: `radial-gradient(circle, ${info.color}20 0%, transparent 70%)`,
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Icon container */}
            <motion.div
              className="relative w-20 h-20 rounded-xl flex items-center justify-center"
              style={{
                background: `${info.color}15`,
                border: `1px solid ${info.color}25`,
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
                  size={36}
                  style={{ color: info.color }}
                  strokeWidth={1.2}
                  className="opacity-25"
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
                  size={14}
                  style={{ color: info.color }}
                  strokeWidth={1.5}
                  className="opacity-20"
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
                <Wrench size={28} style={{ color: info.color }} />
              </motion.div>
            </motion.div>
          </div>

          {/* Title */}
          <motion.h2
            className="text-xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            {info.name} is temporarily unavailable
          </motion.h2>

          {/* Description */}
          <motion.p
            className="text-gray-400 text-sm leading-relaxed mb-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            {reason || "We're upgrading this module. Please try again later."}
          </motion.p>

          {/* ETA */}
          {eta && (
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] mt-2 mb-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              {/* Pulsing dot */}
              <motion.span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: info.color }}
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
              <Clock size={13} className="text-gray-500" />
              <span className="text-gray-400 text-xs font-medium">
                Estimated return: {eta}
              </span>
            </motion.div>
          )}

          {/* Animated progress dots */}
          <div className="flex items-center justify-center gap-1.5 my-5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: info.color }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.3, 0.8],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.06] my-6" />

          {/* Actions */}
          {/* Admin escape hatch */}
          {isAdmin && (
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <button
                onClick={() => navigate('/admin/settings')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-amber-300 transition-all duration-200 hover:text-amber-200 hover:bg-amber-500/[0.08] border border-amber-500/20 hover:border-amber-500/30"
              >
                <Shield size={15} />
                Admin Panel
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ModuleMaintenanceCard;
