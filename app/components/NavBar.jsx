"use client";

import { Settings2, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar({ onOpenSettings }) {
  return (
    <nav className="flex w-full items-center justify-between">
        <div className="flex items-center space-x-4">
            <div className="w-10 h-10 relative bg-blue-900 rounded-xl flex items-center justify-center text-white font-bold">
                <ShoppingBag size={24} strokeWidth={1.8} />
            </div>
            <div>
                <h1 className="brand-title text-xl font-extrabold">
                    SmartStore{" "}
                    <span className="font-medium">Order-to-SAP Integration</span>
                </h1>
                <p className="brand-subtitle text-xs text-muted-foreground mt-1">
                    Next.js to SAP Integration Suite Demo
                </p>
            </div>
        </div>
        <Button variant="outline" onClick={onOpenSettings}>
            <Settings2 />
            <span className="settings-label">SAP Settings</span>
        </Button>
    </nav>
  );
}
