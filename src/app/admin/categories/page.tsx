"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { getAllCategories } from "@/lib/catalog";
import { deleteCategory } from "@/lib/admin/categories";
import { Category } from "@/types/catalog";
import { TrashIcon } from "@/components/icons";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { confirmToast } from "@/lib/confirmToast";

interface AdminCategoryNode extends Category {
  children: AdminCategoryNode[];
}

/** Unlike lib/categoryTree's buildCategoryTree (storefront-facing, drops
 * inactive categories), the admin list needs to show hidden categories too —
 * dropping them here would also orphan any of their still-active children. */
function buildFullTree(categories: Category[]): AdminCategoryNode[] {
  const byId = new Map<string, AdminCategoryNode>(categories.map((c) => [c._id, { ...c, children: [] }]));
  const roots: AdminCategoryNode[] = [];

  for (const node of byId.values()) {
    const parent = node.parent ? byId.get(node.parent) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  function sortTree(nodes: AdminCategoryNode[]) {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    nodes.forEach((n) => sortTree(n.children));
  }
  sortTree(roots);

  return roots;
}

function Row({ node, depth }: { node: AdminCategoryNode; depth: number }) {
  const { getIdToken } = useAuth();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!(await confirmToast(`Delete "${node.name}"? This cannot be undone.`))) return;
    const idToken = await getIdToken();
    if (!idToken) return;
    setDeleting(true);
    try {
      await deleteCategory(idToken, node._id);
      toast.success("Category deleted.");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete this category.");
      setDeleting(false);
    }
  }

  return (
    <>
      <tr className="border-b border-border last:border-0">
        <td className="py-2.5 pr-3" style={{ paddingLeft: depth * 20 }}>
          <span className="text-sm font-medium">{node.name}</span>
          <span className="ml-2 text-xs text-muted-foreground">/{node.slug}</span>
        </td>
        <td className="py-2.5 pr-3 text-sm text-muted-foreground">{node.sortOrder}</td>
        <td className="py-2.5 pr-3">
          {node.isActive ? (
            <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
          ) : (
            <span className="rounded bg-border px-2 py-0.5 text-xs font-medium text-muted-foreground">Hidden</span>
          )}
        </td>
        <td className="py-2.5 text-right">
          <Link href={`/admin/categories/${node._id}/edit`} className="mr-3 text-sm text-primary-strong hover:underline">
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            aria-label={`Delete ${node.name}`}
            className="text-danger hover:opacity-70 disabled:opacity-40"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </td>
      </tr>
      {node.children.map((child) => (
        <Row key={child._id} node={child} depth={depth + 1} />
      ))}
    </>
  );
}

function MobileRow({ node, depth }: { node: AdminCategoryNode; depth: number }) {
  const { getIdToken } = useAuth();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!(await confirmToast(`Delete "${node.name}"? This cannot be undone.`))) return;
    const idToken = await getIdToken();
    if (!idToken) return;
    setDeleting(true);
    try {
      await deleteCategory(idToken, node._id);
      toast.success("Category deleted.");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete this category.");
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="rounded-md border border-border p-3" style={{ marginLeft: depth * 16 }}>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{node.name}</p>
            <p className="truncate text-xs text-muted-foreground">/{node.slug}</p>
          </div>
          {node.isActive ? (
            <span className="shrink-0 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
          ) : (
            <span className="shrink-0 rounded bg-border px-2 py-0.5 text-xs font-medium text-muted-foreground">Hidden</span>
          )}
        </div>
        <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2.5 text-sm">
          <span className="text-muted-foreground">Sort: {node.sortOrder}</span>
          <div className="flex items-center gap-4">
            <Link href={`/admin/categories/${node._id}/edit`} className="text-primary-strong hover:underline">
              Edit
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              aria-label={`Delete ${node.name}`}
              className="text-danger hover:opacity-70 disabled:opacity-40"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      {node.children.map((child) => (
        <MobileRow key={child._id} node={child} depth={depth + 1} />
      ))}
    </>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);

  const load = useCallback(() => {
    getAllCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(load, [load]);

  if (!categories) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const tree = buildFullTree(categories);

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Organize your catalog into a browsable hierarchy."
        actions={
          <Link
            href="/admin/categories/new"
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong"
          >
            New Category
          </Link>
        }
      />

      {tree.length > 0 && (
        <p className="mb-3 text-sm text-muted-foreground">
          {categories.length} categor{categories.length !== 1 ? "ies" : "y"} total
        </p>
      )}

      {tree.length === 0 ? (
        <p className="text-sm text-muted-foreground">No categories yet.</p>
      ) : (
        <>
          {/* See the products page for why this is a card list below sm:
              rather than a squeezed table — same reasoning applies here. */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Sort</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {tree.map((node) => (
                  <Row key={node._id} node={node} depth={0} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 sm:hidden">
            {tree.map((node) => (
              <MobileRow key={node._id} node={node} depth={0} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
