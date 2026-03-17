"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import useAxios from "@/hooks/useAxios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Loader2,
  MapPin,
  Route,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Package,
} from "lucide-react";

function parseTrackingCodes(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

function getTrackingCode(t) {
  return t?.trackingCode ?? t?.code ?? t?.number ?? null;
}

function getTrackingCarrier(t) {
  return t?.carrier ?? t?.company ?? "";
}

function humanizeTrackingStatus(latestStatus) {
  if (!latestStatus) return null;
  const s = String(latestStatus.sub_status || latestStatus.status || "").trim();
  const map = {
    Delivered: "Delivered",
    Delivered_Other: "Delivered",
    InTransit: "In transit",
    InTransit_PickedUp: "In transit",
    OutForDelivery: "Out for delivery",
    InfoReceived: "Label created",
    Exception: "Delivery exception",
    Pending: "Pending",
    Expired: "Tracking expired",
    NotFound: "Not found",
  };
  if (map[s]) return map[s];
  if (!s) return null;
  return s.replace(/_/g, " ");
}

function formatArrivalSummary(shipmentSummary) {
  if (!shipmentSummary) return null;
  const { estimatedFrom, estimatedTo } = shipmentSummary;
  if (!estimatedFrom && !estimatedTo) return null;
  const fmt = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return {
      dateStr: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    };
  };
  if (estimatedFrom && estimatedTo && String(estimatedFrom) !== String(estimatedTo)) {
    const a = fmt(estimatedFrom);
    const b = fmt(estimatedTo);
    if (a && b) return `Estimated delivery ${a.dateStr} – ${b.dateStr}`;
  }
  const target = estimatedTo || estimatedFrom;
  const x = fmt(target);
  if (!x) return null;
  return `Arriving on ${x.dateStr} (${x.weekday})`;
}

function mergeShipmentsFromItems(items) {
  const seen = new Set();
  const list = [];
  for (const it of items || []) {
    for (const t of parseTrackingCodes(it.tracking_codes)) {
      const code = getTrackingCode(t);
      if (!code || seen.has(code)) continue;
      seen.add(code);
      list.push({
        number: String(code),
        carrier: getTrackingCarrier(t) || "",
      });
    }
  }
  return list;
}

function UserShipmentCard({ orderId, trackingNumber, carrierName, packageTitle }) {
  const { request } = useAxios();
  const requestRef = useRef(request);
  requestRef.current = request;
  const [tick, setTick] = useState(0);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    (async () => {
      try {
        const { data, error } = await requestRef.current({
          method: "GET",
          url: `/users/shipment-tracking-timeline?orderId=${encodeURIComponent(orderId)}&number=${encodeURIComponent(trackingNumber)}&carrier=${encodeURIComponent(carrierName || "")}`,
          authRequired: true,
        });
        if (cancelled) return;
        if (error) {
          setState({ status: "error", message: "Unable to load live tracking." });
          return;
        }
        const payload = data?.data ?? data;
        setState({ status: "done", ...payload });
      } catch {
        if (!cancelled) setState({ status: "error", message: "Unable to load live tracking." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, trackingNumber, carrierName, tick]);

  const events = Array.isArray(state.events) ? state.events : [];
  const configured = state.configured !== false;
  const summary = state.shipmentSummary || null;
  const statusLabel = humanizeTrackingStatus(state.latestStatus);
  const arrivalLine = formatArrivalSummary(summary);

  if (state.status === "loading") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-4">
        <Loader2 className="h-5 w-5 animate-spin text-[#c38e1e] shrink-0" />
        <span className="text-sm text-neutral-600">Loading shipment…</span>
      </div>
    );
  }

  const detailsBlock = () => {
    if (state.status === "error") {
      return (
        <div className="text-sm text-amber-900 space-y-2">
          <p>{state.message}</p>
          <p className="text-xs text-neutral-600">Please check back later or contact support if you need help.</p>
        </div>
      );
    }
    if (!configured) {
      return (
        <div className="text-sm text-neutral-600 space-y-2">
          <p>{state.message || "Detailed progress will show here when available."}</p>
        </div>
      );
    }
    if (state.error) {
      return (
        <div className="flex flex-wrap items-center gap-2 text-sm text-red-600">
          {state.error}
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setTick((x) => x + 1)}>
            <RefreshCw className="w-3 h-3 mr-1" /> Retry
          </Button>
        </div>
      );
    }
    if (events.length === 0) {
      return (
        <div className="space-y-3 text-sm text-neutral-600">
          <p>{state.message || "No delivery updates yet — check back soon."}</p>
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setTick((x) => x + 1)}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        </div>
      );
    }
    return (
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500 flex items-center gap-1">
            <Route className="w-3.5 h-3.5 text-[#c38e1e]" />
            Scan history
          </span>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setTick((x) => x + 1)}>
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
        </div>
        <ul className="border-l-2 border-[#c38e1e]/40 ml-2 pl-4 space-y-3 max-h-[min(380px,50vh)] overflow-y-auto">
          {events.map((ev, i) => (
            <li key={`${ev.timeUtc}-${i}`} className="relative">
              <span className="absolute -left-[calc(1rem+3px)] top-1.5 w-2.5 h-2.5 rounded-full bg-[#c38e1e] ring-2 ring-white" />
              <div className="text-[11px] text-neutral-500 font-mono">
                {ev.timeUtc
                  ? new Date(ev.timeUtc).toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </div>
              <div className="text-sm text-neutral-900">{ev.description}</div>
              {ev.location && (
                <div className="text-xs text-neutral-500 flex gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                  {ev.location}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-amber-50/20 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-neutral-900">{packageTitle}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {statusLabel ? (
                <span className="inline-flex items-center rounded-full bg-black px-2.5 py-0.5 text-[11px] font-medium text-white">
                  {statusLabel}
                </span>
              ) : configured ? (
                <span className="inline-flex items-center rounded-full border border-neutral-300 px-2.5 py-0.5 text-[11px] text-neutral-700">
                  On the way
                </span>
              ) : null}
            </div>
            {arrivalLine ? <p className="mt-2 text-sm font-semibold text-neutral-900">{arrivalLine}</p> : null}
            {summary?.lastScanDescription ? (
              <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                <span className="font-medium text-neutral-800">Last update:</span> {summary.lastScanDescription}
                {summary.lastScanTimeUtc ? (
                  <span className="text-neutral-500">
                    {" "}
                    ·{" "}
                    {new Date(summary.lastScanTimeUtc).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                ) : null}
                {summary.lastScanLocation ? <span className="text-neutral-500"> · {summary.lastScanLocation}</span> : null}
              </p>
            ) : null}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full justify-between h-10 text-sm border-neutral-200 hover:bg-neutral-50"
          onClick={() => setOpen((v) => !v)}
        >
          <span>{open ? "Hide details" : "See shipment details"}</span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      {open ? <div className="border-t border-neutral-200 bg-white px-4 py-4">{detailsBlock()}</div> : null}
    </div>
  );
}

export default function ShipmentTrackingDialog({
  open,
  onOpenChange,
  order,
  orderId,
  formattedDate,
  normalizedStatus,
  trackingSteps,
  currentIndex,
}) {
  const shipments = useMemo(() => mergeShipmentsFromItems(order?.items), [order?.items]);
  const hasCarrierTracking = shipments.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={hasCarrierTracking ? "sm:max-w-lg max-h-[90vh] overflow-y-auto" : "sm:max-w-xl"}>
        {hasCarrierTracking ? (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                  <Package className="h-6 w-6" />
                </div>
                <div className="text-left min-w-0">
                  <DialogTitle className="text-lg font-semibold">Delivery updates</DialogTitle>
                  <DialogDescription className="text-left mt-1 text-neutral-600">
                    Order <span className="font-mono font-medium text-neutral-800">{order?.order_no || orderId}</span>
                    {shipments.length > 1 ? ` · ${shipments.length} separate deliveries` : null}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {shipments.map((s, idx) => (
                <UserShipmentCard
                  key={`${s.number}-${idx}`}
                  orderId={orderId}
                  trackingNumber={s.number}
                  carrierName={s.carrier}
                  packageTitle={
                    shipments.length > 1 ? `Package ${idx + 1} of ${shipments.length}` : "Your shipment"
                  }
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Order status</DialogTitle>
              <DialogDescription>
                Order #{order?.order_no || orderId} · Current:{" "}
                <span className="capitalize font-medium text-neutral-800">{normalizedStatus}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2">
              <div className="relative pl-6">
                <div className="absolute left-[11px] top-1 bottom-1 w-px bg-neutral-200" />
                <div className="space-y-6">
                  {trackingSteps.map((step, index) => {
                    const isCurrent = index === currentIndex;
                    const isCompleted =
                      normalizedStatus === "cancelled" ? index === 0 : index < currentIndex;
                    const isCancelled = step.key === "cancelled";
                    const dotClass = isCancelled
                      ? "bg-red-600"
                      : isCompleted || isCurrent
                        ? "bg-black"
                        : "bg-neutral-300";
                    return (
                      <div key={step.key} className="relative flex gap-4">
                        <div className="absolute left-[-1px] top-1.5">
                          <div className={`h-3 w-3 rounded-full border border-white shadow ${dotClass}`} />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm font-semibold ${
                                isCancelled ? "text-red-700" : isCurrent ? "text-neutral-900" : "text-neutral-700"
                              }`}
                            >
                              {step.label}
                            </p>
                            {isCurrent && (
                              <span className="text-[10px] uppercase tracking-wider text-neutral-500">Current</span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-600">
                            {step.key === "created" ? `Placed on ${formattedDate}` : step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="mt-6 text-xs text-neutral-500 text-center">
                Delivery progress will show here once your order is on the way.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
