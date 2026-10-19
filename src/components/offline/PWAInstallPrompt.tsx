import React, { useState, useEffect } from 'react';
import { Download, X, ShieldCheck } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user has previously dismissed
      const dismissed = localStorage.getItem('zaboraa_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem('zaboraa_pwa_dismissed', 'true');
    } catch {}
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-5 z-40 max-w-sm rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-3.5 text-xs text-slate-200 animate-in slide-in-from-bottom duration-200">
      <div className="flex items-start justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white">Install Zaboraa Offline Console</div>
            <div className="text-[11px] text-slate-400">Enable offline datacenter & emergency access</div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleInstall}
          className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install Web App</span>
        </button>
        <button
          onClick={handleDismiss}
          className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
        >
          Later
        </button>
      </div>
    </div>
  );
};
