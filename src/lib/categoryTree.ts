import { Category } from "@/types/catalog";

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

/** Builds an arbitrary-depth tree from the flat category list — the schema
 * supports any depth via `parent`, even though only 2 levels are seeded
 * today, so this doesn't hardcode a level count. */
export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const byId = new Map<string, CategoryTreeNode>(categories.filter((c) => c.isActive).map((c) => [c._id, { ...c, children: [] }]));
  const roots: CategoryTreeNode[] = [];

  for (const node of byId.values()) {
    const parent = node.parent ? byId.get(node.parent) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  function sortTree(nodes: CategoryTreeNode[]) {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    nodes.forEach((n) => sortTree(n.children));
  }
  sortTree(roots);

  return roots;
}

/** A node's own id plus every descendant's — checking a parent selects this whole set. */
export function collectIds(node: CategoryTreeNode): string[] {
  return [node._id, ...node.children.flatMap(collectIds)];
}

export function findNode(tree: CategoryTreeNode[], id: string): CategoryTreeNode | undefined {
  for (const node of tree) {
    if (node._id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return undefined;
}

/** Turns the id(s) a user actually clicked/checked into the full, flat set to
 * filter products by — each given id expands to itself plus every descendant
 * at any depth, unioned across all given ids. This is the ONE place that
 * expansion happens: every category link and the sidebar's own checkbox
 * toggle both funnel through here (or through `collectIds` directly, which
 * this wraps), so the URL's `category` param is always already the complete,
 * ground-truth set — nothing downstream needs to re-derive or second-guess
 * it. (A previous, shallower one-level-only version of this same idea living
 * in a different file was the root cause of a real bug: it disagreed with
 * this file's recursive `collectIds` the moment a category tree went 3+
 * levels deep, desyncing the sidebar's checked state from the product query.) */
export function expandCategorySelection(ids: string[], categories: Category[]): string[] {
  const tree = buildCategoryTree(categories);
  const expanded = new Set<string>();
  for (const id of ids) {
    const node = findNode(tree, id);
    if (node) collectIds(node).forEach((descendantId) => expanded.add(descendantId));
    else expanded.add(id); // unknown id (e.g. inactive) — pass through rather than silently drop it
  }
  return [...expanded];
}
