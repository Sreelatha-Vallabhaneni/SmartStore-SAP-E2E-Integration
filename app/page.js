"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, CircleCheck, Send, Zap } from "lucide-react";
import { defaultCustomer, products, orderPriority, validPostalCode } from "@/lib/orders";
import { Navbar } from "./components/NavBar";
import { SettingsDialog } from "./components/SettingsDialog";
import { Footer } from "./components/Footer";
import { OrderForm } from "./components/OrderForm";
import { IntegrationMonitor } from "./components/IntegrationMonitor";
import { RecentOrders } from "./components/RecentOrders";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
   const [customer, setCustomer] = useState(defaultCustomer);
  const [productId, setProductId] = useState("thinkpad");
  const [quantity, setQuantity] = useState(1);
  const [orders, setOrders] = useState([]);
  const [payload, setPayload] = useState(null);
  const [response, setResponse] = useState("");
  const [stage, setStage] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState("Outgoing JSON");
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


  const product = products.find((item) => item.id === productId) ?? products[0];
  if (!product) return null;

  const total = product.price * quantity;
  const priority = orderPriority(total);
  const live = Boolean(settings.url && settings.key);
  const successful = orders.filter((item) => item.success).length;

  const preview = payload ?? {
    orderId: "SO-2026-0001",
    customer,
    product: product.name,
    quantity,
    totalAmount: total,
    currency: "EUR",
    priority,
  };

  function fill(invalid) {
    setCustomer({ ...defaultCustomer, postalCode: invalid ? "26300" : "2630" });
    setProductId("thinkpad");
    setQuantity(1);
  }

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

  /************ On submit Function ****************/

  async function submit(event) {
    event.preventDefault();
    if (!product || busy || !Number.isInteger(quantity) || quantity < 1) return;

    const order = {
      orderId: `SO-2026-${String(orders.length + 1).padStart(4, "0")}`,
      customer: { ...customer },
      product: product.name,
      quantity,
      totalAmount: total,
      currency: "EUR",
      priority,
    };

    setPayload(order);
    setBusy(true);
    setFailed(false);
    setResponse("");
    setTab("Outgoing JSON");
    setStage(0);
    await wait(500);
    if (!mounted.current) return;
    setStage(1);
    await wait(650);
    if (!mounted.current) return;
    setStage(2);
    await wait(700);
    if (!mounted.current) return;

    let success = validPostalCode(order.customer.postalCode);
    let result = `HTTP ${success ? "200 OK" : "400 Bad Request"}\nX-Order-Priority: ${order.priority}\nContent-Type: application/json\n\n${JSON.stringify({ orderId: order.orderId, status: success ? "SUCCESS" : "ERROR", message: success ? "Sales order successfully created in S/4HANA." : "Exception Subprocess HTTP 400: Danish postal code must contain exactly 4 digits." }, null, 2)}`;

    if (live) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          const res = await fetch(settings.url, {
            method: "POST",
            headers: { "Content-Type": "application/json", APIKey: settings.key },
            body: JSON.stringify(order),
            signal: controller.signal,
          });
          success = res.ok;
          result = `HTTP ${res.status} ${res.statusText}\nX-Order-Priority: ${res.headers.get("X-Order-Priority") ?? "Not provided"}\n\n${await res.text()}`;
        } finally {
          clearTimeout(timeout);
        }
      } catch {
        success = false;
        result =
          "Connection error\n\nSAP proxy could not be reached. Check the URL, API key, and browser CORS permissions.";
      }
    }

    if (!mounted.current) return;
    setResponse(result);
    setFailed(!success);
    if (success) {
      setStage(3);
      await wait(500);
    }
    if (!mounted.current) return;
    setOrders((previous) => [{ order, success, response: result }, ...previous]);
    setBusy(false);
    setTab("SAP Response");
  }

  return (
    <div className=" flex flex-col justify-between min-h-screen">
      <header className="app-header px-15 py-6">
        <Navbar
          onOpenSettings={() => {
            setDraft(settings);
            setSettingsOpen(true);
          }}
        />
      </header>
      <main className =" px-15 py-10">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span>Workspace</span>
              <ChevronRight size={12} />
              <span className="text-foreground">Order integration</span>
            </div>
            <h2 className="text-2xl font-bold">Order workspace</h2>
            <p className="text-xs text-muted-foreground mt-2">
              From customer order to SAP sales order. One connected flow.
            </p>
          </div>
          <span className={`pill mt-7 ${live ? "pill-success" : "pill-warning"}`}>
            <span className="status-dot" />
            {live ? "Live connection" : "Simulation Mode"}
          </span>
        </div>

        <div className="kpi-grid">
          {[
            {
              label: "Orders Sent",
              value: orders.length.toString().padStart(2, "0"),
              icon: Send,
              note: "This session",
            },
            {
              label: "High-Value Routes",
              value: orders
                .filter((item) => item.order.priority === "HIGH")
                .length.toString()
                .padStart(2, "0"),
              icon: Zap,
              note: "Orders above €1,000",
            },
            {
              label: "Success Rate",
              value: `${orders.length ? Math.round((successful / orders.length) * 100) : 0}%`,
              icon: CircleCheck,
              note: orders.length
                ? `${successful} of ${orders.length} orders successful`
                : "No orders submitted yet",
            },
          ].map((kpi) => (
            <div className="kpi" key={kpi.label}>
              <div>
                <p className="kpi-label text-xs text-muted-foreground font-medium">{kpi.label}</p>
                <p className="kpi-value text-3xl font-bold mt-2 mb-1">{kpi.value}</p>
                <p className="hidden sm:block text-[10px] text-muted-foreground">{kpi.note}</p>
              </div>
              <div className={`kpi-icon ${kpi.label === "Success Rate" ? "text-success" : ""}`}>
                <kpi.icon size={20} strokeWidth={1.6} />
              </div>
            </div>
          ))}
        </div>
        <div className="main-grid">
          <OrderForm
            customer={customer}
            setCustomer={setCustomer}
            productId={productId}
            setProductId={setProductId}
            quantity={quantity}
            setQuantity={setQuantity}
            product={product}
            total={total}
            priority={priority}
            busy={busy}
            onSubmit={submit}
            onFill={fill}
          />
          <IntegrationMonitor
            busy={busy}
            failed={failed}
            stage={stage}
            live={live}
            preview={preview}
            response={response}
            tab={tab}
            setTab={setTab}
          />
        </div>
        <RecentOrders orders={orders} />
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
