"use client";

import { usePWA } from "@/app/PWAProvider";
import { useState } from "react";
import styles from "./InstallButton.module.css";

export default function InstallButton() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showToast, setShowToast] = useState(false);

  if (!isInstallable || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    await installApp();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      <button
        className={styles.installButton}
        onClick={handleInstall}
        title="Install Jasmine Store app"
        aria-label="Install app"
      >
        <svg
          className={styles.icon}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span className={styles.text}>Install</span>
      </button>

      {showToast && (
        <div className={styles.toast}>App installation started!</div>
      )}
    </>
  );
}
