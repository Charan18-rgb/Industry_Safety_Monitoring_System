'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

const ICONS = {
  info: <Info className="w-4 h-4 text-cyan-400" />,
  success: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  warning: <AlertCircle className="w-4 h-4 text-amber-400" />,
  error: <XCircle className="w-4 h-4 text-red-400" />,
};

const BORDERS = {
  info: 'border-cyan-500/20',
  success: 'border-green-500/20',
  warning: 'border-amber-500/20',
  error: 'border-red-500/20',
};

const BGS = {
  info: 'bg-cyan-500/5',
  success: 'bg-green-500/5',
  warning: 'bg-amber-500/5',
  error: 'bg-red-500/5',
};

export function ToastContainer() {
  const { notifications, removeNotification } = useUIStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            layout
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl min-w-[300px] max-w-[400px] ${BORDERS[notif.type as keyof typeof BORDERS] || BORDERS.info} ${BGS[notif.type as keyof typeof BGS] || BGS.info} bg-black/80`}
          >
            <div className="mt-0.5">
              {ICONS[notif.type as keyof typeof ICONS] || ICONS.info}
            </div>
            
            <div className="flex-1">
              <p className="text-sm text-white font-medium">{notif.message}</p>
              <p className="text-[10px] text-[#3a5a7a] font-mono mt-1 uppercase tracking-tighter">
                {new Date(notif.timestamp).toLocaleTimeString()}
              </p>
            </div>

            <button 
              onClick={() => removeNotification(notif.id)}
              className="mt-0.5 text-[#3a5a7a] hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            
            {/* Progress bar timer */}
            <motion.div 
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: "linear" }}
              className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${notif.type === 'error' ? 'bg-red-500/50' : 'bg-cyan-500/50'}`}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
