"use client";

import {
  ArrowRight,
  CheckCheck,
  FlaskConical,
  Info,
  LoaderCircle,
  Send,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { Button } from "./ui/button";
import { eur, products } from "@/lib/orders";

export function OrderForm({
  customer,
  setCustomer,
  productId,
  setProductId,
  quantity,
  setQuantity,
  product,
  total,
  priority,
  busy,
  onSubmit,
  onFill,
}) {
  return (
    <section className="panel">
        <div className="panel-heading">
            <h3 className="panel-title">
                <ShoppingBag size={18} className="text-primary" />
                Customer order
            </h3>
            <span className="text-[10px] text-muted-foreground">
                New sales order
            </span>
        </div>
        <form className="form-body" onSubmit={onSubmit}>
            <div className="flex items-center gap-2 mb-5">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    Customer details
                </span>
                <div className="h-px flex-1 bg-border" />
            </div>
            <div className="field-grid">
                <div>
                    <label htmlFor="name">Customer name</label>
                    <input
                    id="name"
                    required
                    value={customer.name}
                    onChange={(e) =>
                        setCustomer({ ...customer, name: e.target.value })
                    }
                    />
                </div>
                <div>
                    <label htmlFor="email">Email address</label>
                    <input
                    id="email"
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) =>
                        setCustomer({ ...customer, email: e.target.value })
                    }
                    />
                </div>
                <div>
                    <label htmlFor="country">Country</label>
                    <select
                    id="country"
                    value={customer.country}
                    onChange={(e) =>
                        setCustomer({ ...customer, country: e.target.value })
                    }
                    >
                    <option value="DK">Denmark — DK</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="postal">Danish postal code</label>
                    <input
                    id="postal"
                    inputMode="numeric"
                    required
                    value={customer.postalCode}
                    onChange={(e) =>
                        setCustomer({ ...customer, postalCode: e.target.value })
                    }
                    />
                    <p className="field-hint">
                        <Info size={11} className="mt-0.5 shrink-0" />
                        <span>4 digits = Valid · 5 digits = Tests SAP Groovy Error</span>
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-6 mb-5">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    Order details
                </span>
                <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-[1fr_95px] gap-4">
                <div>
                    <label htmlFor="product">Product</label>
                    <select
                    id="product"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    >
                    {products.map((item) => (
                        <option key={item.id} value={item.id}>
                        {item.name} — {eur(item.price)}
                        </option>
                    ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="quantity">Quantity</label>
                    <input
                    id="quantity"
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={quantity || ""}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                </div>
            </div>

            <div className="order-summary">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Order total</span>
                    <span className="text-[10px] text-muted-foreground">EUR</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
                    <strong className="text-[28px]">{eur(total)}</strong>
                    <span
                    className={`pill ${priority === "HIGH" ? "pill-warning" : "pill-success"}`}
                    >
                    {priority === "HIGH" ? (
                        <Zap size={11} />
                    ) : (
                        <ArrowRight size={11} />
                    )}
                    {priority === "HIGH" ? "HIGH PRIORITY > €1000" : "STANDARD ROUTE"}
                    </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                    {quantity || 0} × {product.name}
                    <span className="mx-2">·</span>
                    {eur(product.price)} each
                </p>
            </div>

            <Button className="w-full h-11" type="submit" disabled={busy}>
            {busy ? <LoaderCircle className="spinning" /> : <Send />}
            {busy ? "Sending order…" : "Submit Order to SAP"}
            {!busy && <ArrowRight className="ml-auto" />}
            </Button>

            <div className="grid grid-cols-2 gap-2 mt-3">
                <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    disabled={busy}
                    onClick={() => onFill(false)}
                >
                    <CheckCheck size={13} />
                    <span className="text-[10px]">Fill Valid Order</span>
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    disabled={busy}
                    onClick={() => onFill(true)}
                >
                    <FlaskConical size={13} />
                    <span className="text-[10px]">Test Invalid Postal Code</span>
                </Button>
            </div>
        </form>
    </section>
  );
}
