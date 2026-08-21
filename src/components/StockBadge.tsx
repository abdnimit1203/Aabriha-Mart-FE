import { StockLevel, STOCK_LEVEL_CLASS, STOCK_LEVEL_LABEL } from "@/lib/stockLevel";

export function StockBadge({ level }: { level: StockLevel }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STOCK_LEVEL_CLASS[level]}`}>{STOCK_LEVEL_LABEL[level]}</span>;
}
