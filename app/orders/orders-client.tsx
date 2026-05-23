"use client";

import { useEffect, useMemo, useState } from "react";
import { BidraAccountShell } from "@/components/bidra/layout/BidraAccountShell";
import { BidraBadge } from "@/components/bidra/ui/BidraBadge";
import { BidraButton } from "@/components/bidra/ui/BidraButton";
import { BidraCard } from "@/components/bidra/ui/BidraCard";
import { BidraEmptyState } from "@/components/bidra/ui/BidraEmptyState";
import { BidraPageHeader } from "@/components/bidra/ui/BidraPageHeader";
import AccountNav from "@/components/account-nav";

type JsonObject = Record<string, unknown>;

type OrderItem = {
  id: string;
  title: string;
  status: string;
  amountLabel: string;
  createdLabel: string;
};

function asObject(value: unknown): JsonObject | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return null;
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function moneyLabel(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Amount not shown";
  }

  const dollars = value > 1000 ? value / 100 : value;

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(dollars);
}

function dateLabel(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "Date not shown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date not shown";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function readOrders(payload: unknown): OrderItem[] {
  const root = asObject(payload);
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(root?.orders)
      ? root.orders
      : Array.isArray(root?.items)
        ? root.items
        : Array.isArray(root?.data)
          ? root.data
          : [];

  return source.map((raw, index) => {
    const order = asObject(raw) || {};
    const listing = asObject(order.listing) || {};

    return {
      id: asString(order.id, "order-" + index),
      title: asString(order.title, asString(listing.title, "Order")),
      status: asString(order.status, "Pending"),
      amountLabel: moneyLabel(order.totalCents || order.amountCents || order.priceCents || order.total || order.amount),
      createdLabel: dateLabel(order.createdAt || order.updatedAt),
    };
  });
}

export function OrdersClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<OrderItem[]>([]);

  useEffect(() => {
    let alive = true;

    async function loadOrders() {
      try {
        const response = await fetch("/api/orders", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Orders API returned " + response.status);
        }

        const payload = await response.json();
        const nextOrders = readOrders(payload);

        if (alive) {
          setOrders(nextOrders);
          setError("");
        }
      } catch (caught) {
        if (alive) {
          setOrders([]);
          setError("Orders could not be loaded right now.");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      alive = false;
    };
  }, []);

  const summary = useMemo(() => {
    if (loading) {
      return "Loading your order history.";
    }

    if (orders.length === 1) {
      return "1 order found.";
    }

    return orders.length + " orders found.";
  }, [loading, orders.length]);

  return (
    <BidraAccountShell>
      <div className="grid gap-5">
        <AccountNav active="buying" />
        <BidraPageHeader
          eyebrow="Orders"
          title="Your orders"
          description="Track buying and selling activity, handover status and order history."
          actions={<BidraButton href="/listings" variant="secondary">Browse listings</BidraButton>}
        />

        <BidraCard className="p-4 text-sm font-semibold text-[#475569] sm:p-5">
          {summary}
        </BidraCard>

        {error ? (
          <BidraCard className="border-amber-200 bg-amber-50 p-5">
            <h2 className="text-lg font-black text-amber-950">Orders are temporarily unavailable</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-amber-900">{error}</p>
            <div className="mt-4">
              <BidraButton href="/account" variant="secondary">Back to account</BidraButton>
            </div>
          </BidraCard>
        ) : null}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <BidraCard key={item} className="p-5">
                <div className="h-4 w-24 rounded-full bg-[#E2E8F0]" />
                <div className="mt-5 h-6 w-3/4 rounded-full bg-[#E2E8F0]" />
                <div className="mt-3 h-4 w-1/2 rounded-full bg-[#E2E8F0]" />
              </BidraCard>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="grid gap-4">
            {orders.map((order) => (
              <BidraCard key={order.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black text-[#0F172A]">{order.title}</h2>
                      <BidraBadge tone="info">{order.status}</BidraBadge>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[#64748B]">{order.createdLabel}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <p className="text-lg font-black text-[#0F172A]">{order.amountLabel}</p>
                    <BidraButton href={"/orders/" + encodeURIComponent(order.id)} variant="secondary" size="sm">View order</BidraButton>
                  </div>
                </div>
              </BidraCard>
            ))}
          </div>
        ) : (
          <BidraEmptyState
            title="No orders yet"
            description="Orders will appear here after you buy an item or accept an offer."
            action={<BidraButton href="/listings">Browse listings</BidraButton>}
          />
        )}
      </div>
    </BidraAccountShell>
  );
}