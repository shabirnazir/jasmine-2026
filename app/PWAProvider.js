'use client';

import { useEffect, useState, createContext, useContext } from 'react';

const PWAContext = createContext();

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
};

export default function PWAProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event triggered');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Detect when app is installed
    const handleAppInstalled = () => {
      console.log('App installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Handle online/offline status
    const handleOnline = () => {
      console.log('Back online');
      setIsOnline(true);
      document.body.classList.remove('offline');
    };

    const handleOffline = () => {
      console.log('Connection lost');
      setIsOnline(false);
      document.body.classList.add('offline');
    };

    // Register service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered successfully:', registration);
        } catch (error) {
          console.log('Service Worker registration failed:', error);
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial online state check
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      document.body.classList.add('offline');
    }

    // Register service worker on load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', registerServiceWorker);
    } else {
      registerServiceWorker();
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('Install prompt not available');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const pwaValue = {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
  };

  return (
    <PWAContext.Provider value={pwaValue}>
      {children}
    </PWAContext.Provider>
  );
}
