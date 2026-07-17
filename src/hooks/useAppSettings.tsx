import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "@/lib/api";

export interface AppSettings {
  id: string;
  teamName: string;
  teamLogoUrl: string;
  initPrompt: string;
  updatedAt: string;
}

type AppSettingsUpdate = Partial<Pick<AppSettings, "teamName" | "teamLogoUrl" | "initPrompt">>;

interface AppSettingsContextValue {
  settings: AppSettings | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  updateSettings: (updates: AppSettingsUpdate) => Promise<AppSettings>;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/app-settings");
      setSettings(res.data.settings ?? res.data);
    } catch {
      // Non-fatal: components fall back to defaults when settings are absent.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Keep the browser favicon in sync with the team logo.
  useEffect(() => {
    const url = settings?.teamLogoUrl?.trim();
    if (!url) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = url;
  }, [settings?.teamLogoUrl]);

  // Keep the document title in sync with the team name.
  useEffect(() => {
    const name = settings?.teamName?.trim();
    document.title = name ? `Reviewdoo | ${name}` : "Reviewdoo";
  }, [settings?.teamName]);

  const updateSettings = useCallback(
    async (updates: AppSettingsUpdate) => {
      const res = await api.put("/app-settings", updates);
      const updated: AppSettings = res.data.settings ?? res.data;
      setSettings(updated);
      return updated;
    },
    [],
  );

  const value: AppSettingsContextValue = {
    settings,
    isLoading,
    refresh,
    updateSettings,
  };

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings(): AppSettingsContextValue {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within an AppSettingsProvider");
  }
  return context;
}
