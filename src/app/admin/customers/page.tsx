"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { listCustomersAdmin, listModeratorsAdmin, updateUserRoleAdmin } from "@/lib/admin/users";
import { AdminCustomer, Moderator } from "@/types/user";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { UsersIcon, SpinnerIcon } from "@/components/icons";
import { confirmToast } from "@/lib/confirmToast";
import { RoleActionsMenu } from "./RoleActionsMenu";

type Role = "customer" | "order_manager" | "super_admin";

const ROLE_LABEL: Record<Role, string> = {
  customer: "Customer",
  order_manager: "Order Manager",
  super_admin: "Super Admin",
};

const ROLE_BADGE_CLASS: Record<Role, string> = {
  customer: "bg-background text-muted-foreground",
  order_manager: "bg-primary/10 text-primary-strong",
  super_admin: "bg-danger/10 text-danger",
};

const inputClass =
  "rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong disabled:cursor-not-allowed disabled:opacity-50";
const LIMIT = 20;

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function CustomersTableSkeleton() {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface sm:block">
        <table className="w-full min-w-175 border-collapse">
          <thead>
            <tr className="border-b border-border bg-background text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-3.5 pl-4 pr-3 font-medium">Customer</th>
              <th className="py-3.5 pr-3 font-medium">Phone</th>
              <th className="py-3.5 pr-3 font-medium">Orders</th>
              <th className="py-3.5 pr-3 font-medium">Lifetime Spend</th>
              <th className="py-3.5 pr-3 font-medium">Last Order</th>
              <th className="py-3.5 pr-3 font-medium">Joined</th>
              <th className="w-10 py-3.5 pr-4" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td colSpan={7} className="py-3 pl-4 pr-4">
                  <div className="h-8 animate-pulse rounded-lg bg-background" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-2 sm:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
    </>
  );
}

function ModeratorsTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-150 border-collapse">
        <thead>
          <tr className="border-b border-border bg-background text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-3.5 pl-4 pr-3 font-medium">Name</th>
            <th className="py-3.5 pr-3 font-medium">Role</th>
            <th className="py-3.5 pr-3 font-medium">Joined</th>
            <th className="w-10 py-3.5 pr-4" />
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }).map((_, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td colSpan={4} className="py-3 pl-4 pr-4">
                <div className="h-8 animate-pulse rounded-lg bg-background" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminCustomersPage() {
  const { getIdToken, profile } = useAuth();
  const [tab, setTab] = useState<"customers" | "moderators">("customers");

  const [customers, setCustomers] = useState<AdminCustomer[] | null>(null);
  const [customersFetching, setCustomersFetching] = useState(true);
  const [customersError, setCustomersError] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const customersRequestId = useRef(0);

  const [moderators, setModerators] = useState<Moderator[] | null>(null);
  const [moderatorsFetching, setModeratorsFetching] = useState(true);
  const [moderatorsError, setModeratorsError] = useState(false);
  const moderatorsRequestId = useRef(0);

  const loadCustomers = useCallback(() => {
    const thisRequest = ++customersRequestId.current;
    setCustomersFetching(true);
    getIdToken()
      .then((idToken) => {
        if (!idToken) return;
        return listCustomersAdmin(idToken, { search: search || undefined, page, limit: LIMIT }).then((res) => {
          if (thisRequest !== customersRequestId.current) return;
          setCustomers(res.customers);
          setTotal(res.total);
          setCustomersError(false);
        });
      })
      .catch(() => {
        if (thisRequest !== customersRequestId.current) return;
        setCustomersError(true);
        // A refetch failure (search/page change) keeps the existing list on
        // screen and just toasts — only a first-ever load with nothing to
        // show falls back to the full error card below.
        setCustomers((prev) => {
          if (prev !== null) toast.error("Couldn't refresh customers — showing the last loaded list.");
          return prev;
        });
      })
      .finally(() => {
        if (thisRequest === customersRequestId.current) setCustomersFetching(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  const loadModerators = useCallback(() => {
    const thisRequest = ++moderatorsRequestId.current;
    setModeratorsFetching(true);
    getIdToken()
      .then((idToken) => {
        if (!idToken) return;
        return listModeratorsAdmin(idToken).then((res) => {
          if (thisRequest !== moderatorsRequestId.current) return;
          setModerators(res.moderators);
          setModeratorsError(false);
        });
      })
      .catch(() => {
        if (thisRequest !== moderatorsRequestId.current) return;
        setModeratorsError(true);
        setModerators((prev) => {
          if (prev !== null) toast.error("Couldn't refresh moderators — showing the last loaded list.");
          return prev;
        });
      })
      .finally(() => {
        if (thisRequest === moderatorsRequestId.current) setModeratorsFetching(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Genuine exception to the "no setState in an effect" rule (same as
  // DashboardHeader's clock) — flipping the loading flag the instant a
  // fetch starts is the point, not a sign the effect is unnecessary.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(loadCustomers, [loadCustomers]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- see loadCustomers above
  useEffect(loadModerators, [loadModerators]);

  async function handleChangeRole(userId: string, role: Role, name: string) {
    const demoting = role === "customer";
    const confirmed = await confirmToast(
      demoting
        ? `Revoke ${name}'s staff access and revert them to a regular customer?`
        : `Make ${name} a ${ROLE_LABEL[role]}? They'll get admin dashboard access.`,
      { confirmLabel: "Confirm", tone: demoting ? "danger" : "primary" }
    );
    if (!confirmed) return;

    const idToken = await getIdToken();
    if (!idToken) return;
    try {
      await updateUserRoleAdmin(idToken, userId, role);
      toast.success(`${name} is now a ${ROLE_LABEL[role]}.`);
      loadCustomers();
      loadModerators();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update role.");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const customersInitialLoad = customers === null && customersFetching;
  const customersInitialError = customers === null && !customersFetching && customersError;
  const moderatorsInitialLoad = moderators === null && moderatorsFetching;
  const moderatorsInitialError = moderators === null && !moderatorsFetching && moderatorsError;

  return (
    <div>
      <AdminPageHeader title="Customers" description="Everyone with an account — shoppers and staff." />

      <div className="mb-5 flex gap-1 border-b border-border">
        {(["customers", "moderators"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t ? "border-primary-strong text-primary-strong" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "customers" ? "Customers" : "Moderators"}
          </button>
        ))}
      </div>

      {tab === "customers" ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <input
              value={search}
              disabled={customersInitialLoad}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, or phone…"
              className={`${inputClass} w-full max-w-xs`}
            />
            {customersFetching && customers !== null && <SpinnerIcon className="h-4 w-4 shrink-0 text-muted-foreground" />}
          </div>

          {customersInitialError ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 px-6 py-16 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/10 text-danger">!</div>
              <p className="text-sm font-medium text-foreground">Couldn&apos;t load customers</p>
              <button
                type="button"
                onClick={loadCustomers}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong"
              >
                Retry
              </button>
            </div>
          ) : customersInitialLoad ? (
            <CustomersTableSkeleton />
          ) : customers !== null && customers.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
              <UsersIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">{search ? "No customers match your search" : "No customers yet"}</p>
            </div>
          ) : (
            customers && (
              <div className={customersFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
                <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface sm:block">
                  <table className="w-full min-w-175 border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-background text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-3.5 pl-4 pr-3 font-medium">Customer</th>
                        <th className="py-3.5 pr-3 font-medium">Phone</th>
                        <th className="py-3.5 pr-3 font-medium">Orders</th>
                        <th className="py-3.5 pr-3 font-medium">Lifetime Spend</th>
                        <th className="py-3.5 pr-3 font-medium">Last Order</th>
                        <th className="py-3.5 pr-3 font-medium">Joined</th>
                        <th className="w-10 py-3.5 pr-4" />
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c._id} className="border-b border-border last:border-0 hover:bg-black/1.5">
                          <td className="py-3.5 pl-4 pr-3">
                            <p className="text-sm font-medium">{c.username}</p>
                            <p className="text-xs text-muted-foreground">{c.email}</p>
                          </td>
                          <td className="py-3.5 pr-3 text-sm text-muted-foreground">{c.phone || "—"}</td>
                          <td className="py-3.5 pr-3 text-sm">{c.orderCount}</td>
                          <td className="py-3.5 pr-3 text-sm font-medium">৳{c.lifetimeSpend.toLocaleString()}</td>
                          <td className="py-3.5 pr-3 text-sm text-muted-foreground">
                            {c.lastOrderAt ? formatDate(c.lastOrderAt) : "—"}
                          </td>
                          <td className="py-3.5 pr-3 text-sm text-muted-foreground">{formatDate(c.createdAt)}</td>
                          <td className="py-3.5 pr-4 text-right">
                            <RoleActionsMenu
                              userId={c._id}
                              currentRole="customer"
                              isSelf={c._id === profile?._id}
                              onChangeRole={(id, role) => handleChangeRole(id, role, c.username)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2 sm:hidden">
                  {customers.map((c) => (
                    <div key={c._id} className="rounded-xl border border-border bg-surface p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{c.username}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                        <RoleActionsMenu
                          userId={c._id}
                          currentRole="customer"
                          isSelf={c._id === profile?._id}
                          onChangeRole={(id, role) => handleChangeRole(id, role, c.username)}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {c.orderCount} order{c.orderCount !== 1 ? "s" : ""} · ৳{c.lifetimeSpend.toLocaleString()}
                        </span>
                        <span>Joined {formatDate(c.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || customersFetching}
                      className="rounded-full border border-border px-3 py-1.5 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || customersFetching}
                      className="rounded-full border border-border px-3 py-1.5 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </>
      ) : moderatorsInitialError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 px-6 py-16 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/10 text-danger">!</div>
          <p className="text-sm font-medium text-foreground">Couldn&apos;t load moderators</p>
          <button
            type="button"
            onClick={loadModerators}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong"
          >
            Retry
          </button>
        </div>
      ) : moderatorsInitialLoad ? (
        <ModeratorsTableSkeleton />
      ) : moderators !== null && moderators.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <UsersIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No moderators yet</p>
        </div>
      ) : (
        moderators && (
          <div className={moderatorsFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full min-w-150 border-collapse">
                <thead>
                  <tr className="border-b border-border bg-background text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-3.5 pl-4 pr-3 font-medium">Name</th>
                    <th className="py-3.5 pr-3 font-medium">Role</th>
                    <th className="py-3.5 pr-3 font-medium">Joined</th>
                    <th className="w-10 py-3.5 pr-4" />
                  </tr>
                </thead>
                <tbody>
                  {moderators.map((m) => (
                    <tr key={m._id} className="border-b border-border last:border-0 hover:bg-black/1.5">
                      <td className="py-3.5 pl-4 pr-3">
                        <p className="text-sm font-medium">{m.username}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </td>
                      <td className="py-3.5 pr-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE_CLASS[m.role]}`}>
                          {ROLE_LABEL[m.role]}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3 text-sm text-muted-foreground">{formatDate(m.createdAt)}</td>
                      <td className="py-3.5 pr-4 text-right">
                        <RoleActionsMenu
                          userId={m._id}
                          currentRole={m.role}
                          isSelf={m._id === profile?._id}
                          onChangeRole={(id, role) => handleChangeRole(id, role, m.username)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
