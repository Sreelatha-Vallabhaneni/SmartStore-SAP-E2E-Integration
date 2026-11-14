"use client";

import { ArrowRight, Box, CircleCheck, Package, TriangleAlert, Zap } from "lucide-react";
import { eur } from "@/lib/orders";

export function RecentOrders({ orders }) {
  return (
    <section className="panel log-section">
      <div className="panel-heading">
        <h3 className="panel-title">
          <Package size={18} className="text-primary" />
          Recent orders<span className="pill pill-neutral">{orders.length}</span>
        </h3>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="status-dot" />
          This session
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="orders-table">
          <thead>
            <tr>
              {["Order ID", "Customer", "Postal Code", "Total EUR", "SAP Route", "Status"].map(
                (label) => (
                  <th key={label}>{label}</th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 8).map(({ order, success }) => (
              <tr key={order.orderId}>
                <td className="font-mono text-primary font-medium">{order.orderId}</td>
                <td>{order.customer.name}</td>
                <td className="font-mono">{order.customer.postalCode}</td>
                <td className="font-semibold">{eur(order.totalAmount)}</td>
                <td>
                  <span
                    className={`pill ${order.priority === "HIGH" ? "pill-warning" : "pill-success"}`}
                  >
                    {order.priority === "HIGH" ? <Zap size={10} /> : <ArrowRight size={10} />}
                    {order.priority === "HIGH" ? "High priority" : "Standard"}
                  </span>
                </td>
                <td>
                  <span className={`pill ${success ? "pill-success" : "pill-error"}`}>
                    {success ? <CircleCheck size={10} /> : <TriangleAlert size={10} />}
                    {success ? "Success" : "Failed"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="empty-log">
            <Box size={24} strokeWidth={1.3} className="mx-auto mb-2 opacity-60" />
            No orders yet<span className="mx-2">·</span>Your session starts here
          </div>
        )}
      </div>
    </section>
  );
}