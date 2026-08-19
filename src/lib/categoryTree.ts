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
