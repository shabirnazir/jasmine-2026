"use client";

import { SessionProvider } from "next-auth/react";
import PWAProvider from "./PWAProvider";

export const AuthProvider = ({ children }) => {
  return (
    <SessionProvider>
      <PWAProvider>{children}</PWAProvider>
    </SessionProvider>
  );
};
