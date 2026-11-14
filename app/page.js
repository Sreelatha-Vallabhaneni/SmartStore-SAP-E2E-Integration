"use client";
import { ShoppingBag, Settings2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "./components/ui/button";
import { Navbar } from "./components/NavBar";
import { SettingsDialog } from "./components/SettingsDialog";
import { Footer } from "./components/Footer";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({ url: "", key: "" });
  const [draft, setDraft] = useState({ url: "", key: "" });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    queueMicrotask(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("smartstore-sap-settings") ?? "{}");
      if (typeof saved.url === "string" && typeof saved.key === "string") {
        setSettings(saved);
        setDraft(saved);
      }
    } catch {
      /* Missing or invalid settings use simulation. */
    }
  });
    return () => {
      mounted.current = false;
    };
  }, []);
  function saveSettings() {
    const cleaned = { url: draft.url.trim(), key: draft.key.trim() };
    setSettings(cleaned);
    localStorage.setItem("smartstore-sap-settings", JSON.stringify(cleaned));
    setSettingsOpen(false);
  }
  function clearSettings() {
    const empty = { url: "", key: "" };
    setDraft(empty);
    setSettings(empty);
    localStorage.removeItem("smartstore-sap-settings");
    setSettingsOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between px-12 py-10">
      <Navbar
        onOpenSettings={() => {
          setDraft(settings);
          setSettingsOpen(true);
        }}
      />
      <main>
        <Footer />
      </main>
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        draft={draft}
        setDraft={setDraft}
        onSave={saveSettings}
        onClear={clearSettings}
      />
    </div>
  );
}
