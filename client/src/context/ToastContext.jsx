import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              layout
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md min-w-[320px] ${
                toast.type === 'success' 
                  ? 'bg-emerald-500/90 border-emerald-400 text-white' 
                  : toast.type === 'error'
                  ? 'bg-rose-500/90 border-rose-400 text-white'
                  : 'bg-indigo-600/90 border-indigo-500 text-white'
              }`}
            >
              <div className="flex-shrink-0">
                {toast.type === 'success' ? <CheckCircle2 size={24} /> : 
                 toast.type === 'error' ? <AlertCircle size={24} /> : <Info size={24} />}
              </div>
              <div className="flex-1 font-bold text-sm">
                {toast.message}
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="hover:bg-white/20 p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
