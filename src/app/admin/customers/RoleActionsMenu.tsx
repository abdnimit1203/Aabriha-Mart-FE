"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MENU_WIDTH = 176;

type Role = "customer" | "order_manager" | "super_admin";

const ROLE_LABEL: Record<Role, string> = {
  customer: "Customer",
  order_manager: "Order Manager",
  super_admin: "Super Admin",
};

const ALL_ROLES: Role[] = ["customer", "order_manager", "super_admin"];

/** Same portal-dropdown pattern as OrderActionsMenu — needed for the same
 * reason: this button lives inside an overflow-x-auto table wrapper, and an
 * absolutely positioned menu there gets clipped instead of floating free. */
export function RoleActionsMenu({
  userId,
  currentRole,
  isSelf,
  onChangeRole,
}: {
  userId: string;
  currentRole: Role;
  isSelf: boolean;
  onChangeRole: (id: string, role: Role) => void;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  if (isSelf) {
    return (
      <span className="text-xs text-muted-foreground" title="You can't change your own role">
        —
      </span>
    );
  }

  function openMenu() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setPosition({ top: rect.bottom + 4, left: Math.max(8, rect.right - MENU_WIDTH) });
    setOpen(true);
  }

  const otherRoles = ALL_ROLES.filter((r) => r !== currentRole);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change role"
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
            className="admin-shell z-50 rounded-xl border border-border bg-surface p-1.5 shadow-lg"
          >
            {otherRoles.map((role) => (
              <button
                key={role}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onChangeRole(userId, role);
                }}
                className="block w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-black/3"
              >
                Make {ROLE_LABEL[role]}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
