"use client";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export function SettingsDialog({ open, onOpenChange, draft, setDraft, onSave, onClear }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>SAP API Management Settings</DialogTitle>
          <DialogDescription>
            Enter your SAP API Proxy URL and API Key to send live requests, or leave blank to use
            Simulation Mode.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
          className="space-y-4 mt-2"
        >
          <div>
            <label htmlFor="sap-url" className="block text-xs font-medium mb-1">
              SAP API Proxy URL
            </label>
            <input
              id="sap-url"
              type="url"
              placeholder="https://ondemand.com"
              value={draft.url}
              onChange={(e) => setDraft({ ...draft, url: e.target.value })}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="sap-key" className="block text-xs font-medium mb-1">
              APIKey Header
            </label>
            <input
              id="sap-key"
              type="password"
              placeholder="Enter your SAP API Key"
              value={draft.key}
              onChange={(e) => setDraft({ ...draft, key: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClear}>
              Reset to Simulation
            </Button>
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}