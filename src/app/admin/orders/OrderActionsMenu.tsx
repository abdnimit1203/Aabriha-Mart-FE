"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AdminOrder, OrderStatus } from "@/types/order";
import { NEXT_STATUSES, formatStatusLabel } from "./orderStatusStyles";

const MENU_WIDTH = 192; // matches w-48

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  confirmed: "Confirm order",
  processing: "Mark processing",
  packed: "Mark packed",
  shipped: "Mark shipped",
  out_for_delivery: "Mark out for delivery",
  delivered: "Mark delivered",
  cancelled: "Cancel order",
  returned: "Return order",
};

export function OrderActionsMenu({
  order,
  onStatusChange,
}: {
  order: AdminOrder;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const nextStatuses = NEXT_STATUSES[order.status];

  function openMenu() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({ top: rect.bottom + 4, left: Math.max(8, rect.right - MENU_WIDTH) });
    }
    setOpen(true);
  }

  // Rendered via a portal (below) specifically because this button lives
  // inside the orders table's overflow-x-auto wrapper — an absolutely
  // positioned menu there gets clipped by that ancestor's overflow instead
  // of floating free, which is what was happening before this fix. Portaling
  // to <body> and positioning with `fixed` off the button's real screen
  // coordinates sidesteps the clipping entirely.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    // Closing on scroll (capture: true catches the table's own scroll
    // container too) is simpler and more robust than tracking position live.
    function handleScroll() {
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Order actions"
        onClick={() => (open ? setOpen(false) : openMenu())}
        className="rounded-lg px-2 py-1 text-muted-foreground hover:bg-black/3 hover:text-foreground"
      >
        ⋯
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: "fixed", top: position.top, left: position.left, width: MENU_WIDTH }}
            // admin-shell: this menu is portaled outside the admin layout's DOM
            // subtree (straight onto <body>), so it needs its own copy of the
            // scoped token override to render with the admin palette.
            className="admin-shell z-50 rounded-xl border border-border bg-surface p-1.5 shadow-lg"
          >
            <Link
              href={`/admin/orders/${order._id}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-1.5 text-sm hover:bg-black/3"
            >
              View order
            </Link>
            {nextStatuses.length > 0 && <div className="my-1 border-t border-border" />}
            {nextStatuses.map((status) => (
              <button
                key={status}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onStatusChange(order._id, status);
                }}
                className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-black/3 ${
                  status === "cancelled" || status === "returned" ? "text-danger" : ""
                }`}
              >
                {ACTION_LABEL[status] ?? formatStatusLabel(status)}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
