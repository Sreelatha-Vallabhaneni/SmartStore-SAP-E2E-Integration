"use client";

import { useState } from "react";
import {
  Check,
  CircleCheck,
  Code2,
  Copy,
  Layers3,
  LoaderCircle,
  Radio,
  ShieldCheck,
  TriangleAlert,
  Workflow,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { orderXml } from "@/lib/orders";

const tabs = ["Outgoing JSON", "SAP Transformed XML", "SAP Response"];
const steps = [
  { icon: Code2, label: "Web App", sub: "JSON payload" },
  { icon: ShieldCheck, label: "SAP API Mgmt", sub: "API proxy" },
  { icon: Workflow, label: "CPI Groovy & Router", sub: "Validate & transform" },
  { icon: Layers3, label: "S/4HANA Target", sub: "Sales order" },
];

function JsonLine({ line }) {
  const pieces = line.split(/("(?:[^"\\]|\\.)*"|\b\d+(?:\.\d+)?\b)/g);
  return (
    <>
      {pieces.map((piece, index) => (
        <span
          key={index}
          className={
            piece.startsWith('"')
              ? pieces[index + 1]?.trim().startsWith(":")
                ? "json-key"
                : "json-value"
              : /^\d/.test(piece)
                ? "json-number"
                : undefined
          }
        >
          {piece}
        </span>
      ))}
    </>
  );
}

export function IntegrationMonitor({ busy, failed, stage, live, preview, response, tab, setTab }) {
  const [copied, setCopied] = useState(false);

  const terminalText =
    tab === "Outgoing JSON"
      ? JSON.stringify(preview, null, 2)
      : tab === "SAP Transformed XML"
        ? orderXml(preview)
        : response || "// Awaiting SAP response…";

  async function copy() {
    try {
      await navigator.clipboard.writeText(terminalText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h3 className="panel-title">
          <Radio size={18} className="text-primary" />
          Live SAP integration monitor
        </h3>
        <span className="pill pill-success">
          <span className="status-dot" />
          {busy ? "Processing" : "Ready"}
        </span>
      </div>

      <div className="flow">
        {steps.map((step, index) => {
          const state =
            index === 2 && failed
              ? "error"
              : stage > index || (stage === 3 && !busy && !failed)
                ? "complete"
                : stage === index
                  ? "active"
                  : "";
          return (
            <div className="flow-step" key={step.label}>
              <div className={`flow-node ${state}`}>
                {state === "complete" ? (
                  <Check size={18} />
                ) : state === "error" ? (
                  <TriangleAlert size={18} />
                ) : (
                  <step.icon size={18} strokeWidth={1.7} />
                )}
              </div>
              <p className="flow-label text-[10px] font-bold">
                {index + 1}. {step.label}
              </p>
              <p className="flow-subtitle text-[9px] text-muted-foreground mt-1">{step.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="terminal">
        <div className="terminal-tabs" role="tablist" aria-label="Payload inspector">
          {tabs.map((item) => (
            <Button
              key={item}
              role="tab"
              aria-selected={tab === item}
              variant="ghost"
              className={`terminal-tab ${tab === item ? "selected" : ""}`}
              onClick={() => {
                setTab(item);
                setCopied(false);
              }}
            >
              {item}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="text-terminal-text ml-auto shrink-0"
            aria-label={copied ? "Copied" : "Copy payload"}
            title="Copy payload"
            onClick={copy}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </Button>
        </div>

        <div className="code-view" role="tabpanel" aria-label={tab}>
          {terminalText.split("\n").map((line, index) => (
            <div className="code-line" key={index}>
              <span className="line-number">{index + 1}</span>
              <code>{tab === "Outgoing JSON" ? <JsonLine line={line} /> : line}</code>
            </div>
          ))}
        </div>

        <div className="terminal-footer">
          <span className="flex items-center gap-1.5">
            <Code2 size={12} />
            {tab === "Outgoing JSON"
              ? "application/json"
              : tab === "SAP Transformed XML"
                ? "application/xml · transformation preview"
                : "SAP response"}
          </span>
          <span>UTF-8</span>
        </div>
      </div>

      <div
        className={`monitor-status ${failed ? "text-destructive" : stage === 3 && !busy ? "text-success" : ""}`}
      >
        {busy ? (
          <LoaderCircle size={13} className="spinning" />
        ) : failed ? (
          <TriangleAlert size={13} />
        ) : stage === 3 ? (
          <CircleCheck size={13} />
        ) : (
          <span className="status-dot" />
        )}
        <span>
          {busy
            ? "Order moving through the integration flow…"
            : failed
              ? live
                ? "SAP request failed. See the response for details."
                : "Exception Subprocess HTTP 400 · Invalid postal code"
              : stage === 3
                ? "Order successfully delivered to S/4HANA."
                : "Waiting for an order. Integration flow is ready."}
        </span>
      </div>
    </section>
  );
}
