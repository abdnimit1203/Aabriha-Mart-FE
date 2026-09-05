import { OrderStatusEvent } from "@/types/order";
import { STATUS_TIMELINE_CLASS, formatStatusLabel } from "@/lib/orderStatusStyles";

function formatEventDate(at: string): string {
  return new Date(at).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderTimeline({
  statusHistory,
  courierName,
  trackingNumber,
}: {
  statusHistory: OrderStatusEvent[];
  courierName?: string;
  trackingNumber?: string;
}) {
  const hasCourierInfo = Boolean(courierName || trackingNumber);

  return (
    <div>
      <ol className="space-y-2">
        {statusHistory.map((event, i) => {
          const isLatest = i === statusHistory.length - 1;
          const classes = STATUS_TIMELINE_CLASS[event.status];
          return (
            <li key={`${event.status}-${event.at}`} className={`flex items-center gap-3 rounded border px-3 py-2 ${classes.card}`}>
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${classes.dot}`} />
              <span className="flex-1 text-sm font-medium capitalize">{formatStatusLabel(event.status)}</span>
              <span className="text-xs text-muted-foreground">{formatEventDate(event.at)}</span>
              {isLatest && (
                <span className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Current
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {hasCourierInfo && (
        <div className="mt-3 rounded border border-border bg-black/[0.02] px-3 py-2 text-sm">
          {courierName && (
            <p>
              <span className="text-muted-foreground">Courier: </span>
              <span className="font-medium">{courierName}</span>
            </p>
          )}
          {trackingNumber && (
            <p>
              <span className="text-muted-foreground">Tracking #: </span>
              <span className="font-medium">{trackingNumber}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
