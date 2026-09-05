import { OrderStatus, OrderStatusEvent } from "@/types/order";
import { MAIN_PIPELINE_STATUSES, TIMELINE_STEP_LABEL, formatStatusLabel } from "@/lib/orderStatusStyles";
import { CheckIcon, CloseIcon } from "@/components/icons";

function formatEventDate(at: string): string {
  return new Date(at).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Drops the year — the mobile strip is tight on width, and the order's own
// full date already shows at the top of the page it lives on.
function formatCompactEventDate(at: string): string {
  return new Date(at).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function stepLabel(status: OrderStatus): string {
  return TIMELINE_STEP_LABEL[status] ?? formatStatusLabel(status);
}

const TERMINAL_STATUSES: OrderStatus[] = ["cancelled", "returned"];

type StepState = "done" | "current" | "upcoming" | "terminal";

interface Step {
  status: OrderStatus;
  label: string;
  at?: string;
  state: StepState;
}

export function OrderTimeline({
  statusHistory,
  currentStatus,
  createdAt,
  courierName,
  trackingNumber,
}: {
  statusHistory: OrderStatusEvent[];
  currentStatus: OrderStatus;
  createdAt: string;
  courierName?: string;
  trackingNumber?: string;
}) {
  const eventAt = new Map(statusHistory.map((e) => [e.status, e.at]));
  // Every order starts life at "pending" the instant it's created — true
  // regardless of statusHistory, which only started being recorded once this
  // feature shipped. An order placed before that has an empty statusHistory
  // up to whatever status it was already at, so without this its first step
  // renders as "still pending" even after later steps have real dates.
  eventAt.set("pending", createdAt);
  const isTerminal = TERMINAL_STATUSES.includes(currentStatus);

  // How far the order has actually progressed through the main pipeline.
  // NEXT_STATUSES only allows moving one step at a time, so reaching any
  // status proves every earlier pipeline step already happened too — even
  // one a legacy order never individually logged (statusHistory only started
  // being recorded once this feature shipped, so an order that was already
  // past some step when it launched has a gap there). Deriving "done" from
  // pipeline position rather than "does this step have its own timestamp"
  // means that gap can't make an earlier step look like it never happened
  // just because a later one did.
  const currentIndex = MAIN_PIPELINE_STATUSES.indexOf(currentStatus);
  const highestRecordedIndex = MAIN_PIPELINE_STATUSES.reduce((max, s, i) => (eventAt.has(s) ? i : max), -1);
  const reachedIndex = isTerminal ? highestRecordedIndex : currentIndex;

  // A cancelled/returned order stops the happy path partway through — only
  // the pipeline steps it actually reached are shown, followed by the
  // terminal marker. Otherwise every pipeline step is shown, with steps
  // beyond the current one rendered as upcoming.
  const steps: Step[] = MAIN_PIPELINE_STATUSES.map((status, i) => {
    const at = eventAt.get(status);
    const state: StepState = !isTerminal && i === currentIndex ? "current" : i <= reachedIndex ? "done" : "upcoming";
    return { status, label: stepLabel(status), at, state };
  }).filter((step, i) => !isTerminal || i <= reachedIndex);

  if (isTerminal) {
    steps.push({ status: currentStatus, label: stepLabel(currentStatus), at: eventAt.get(currentStatus), state: "terminal" });
  }

  const hasCourierInfo = Boolean(courierName || trackingNumber);

  // A step can be "done" (per pipeline position above) without its own
  // timestamp — the legacy gap described above. "Pending" would be
  // misleading there since it did happen; "—" says a real date just isn't on
  // record for it.
  function dateLabel(step: Step, format: (at: string) => string): string {
    if (step.at) return format(step.at);
    return step.state === "upcoming" ? "Pending" : "—";
  }

  return (
    <div>
      {/* Desktop/tablet — connected vertical list */}
      <ol className="hidden sm:block">
        {steps.map((step, i) => {
          const isLastRow = i === steps.length - 1;
          const reached = step.state === "done" || step.state === "current" || step.state === "terminal";
          const isTerminalStep = step.state === "terminal";

          return (
            <li key={step.status} className={`relative pl-11 ${isLastRow ? "" : "pb-6"}`}>
              {!isLastRow && (
                <span
                  className={`absolute left-3.75 top-8 -bottom-1 w-0.5 ${
                    step.state === "done" ? "bg-green-500" : "bg-border"
                  }`}
                />
              )}
              <span
                className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  isTerminalStep
                    ? "border-danger bg-danger text-white"
                    : reached
                      ? `border-green-500 bg-green-500 text-white ${step.state === "current" ? "ring-4 ring-green-100" : ""}`
                      : "border-border bg-surface text-transparent"
                }`}
              >
                {isTerminalStep ? <CloseIcon className="h-4 w-4" /> : reached ? <CheckIcon className="h-4 w-4" /> : null}
              </span>

              <div className="flex items-center gap-2 pt-1">
                <p className={`text-sm font-semibold capitalize ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.label}
                </p>
                {step.state === "current" && (
                  <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-green-700">
                    Current
                  </span>
                )}
              </div>
              <p className={`text-xs ${reached ? "text-muted-foreground" : "italic text-muted-foreground/70"}`}>
                {dateLabel(step, formatEventDate)}
              </p>
            </li>
          );
        })}
      </ol>

      {/* Mobile — compact horizontal strip, scrollable */}
      <div className="-mx-1 overflow-x-auto px-1 pb-1 sm:hidden">
        <ol className="flex w-max gap-1.5">
          {steps.map((step, i) => {
            const isFirst = i === 0;
            const isLastRow = i === steps.length - 1;
            const reached = step.state === "done" || step.state === "current" || step.state === "terminal";
            const isTerminalStep = step.state === "terminal";
            const lineDoneColor = step.state === "done" ? "bg-green-500" : "bg-border";

            return (
              <li key={step.status} className="flex w-24 shrink-0 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <span className={`h-0.5 flex-1 ${isFirst ? "bg-transparent" : lineDoneColor}`} />
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      isTerminalStep
                        ? "border-danger bg-danger text-white"
                        : reached
                          ? `border-green-500 bg-green-500 text-white ${step.state === "current" ? "ring-2 ring-green-100" : ""}`
                          : "border-border bg-surface text-transparent"
                    }`}
                  >
                    {isTerminalStep ? (
                      <CloseIcon className="h-3 w-3" />
                    ) : reached ? (
                      <CheckIcon className="h-3 w-3" />
                    ) : null}
                  </span>
                  <span className={`h-0.5 flex-1 ${isLastRow ? "bg-transparent" : lineDoneColor}`} />
                </div>
                <p
                  className={`mt-1 text-[10px] font-semibold capitalize leading-tight ${
                    reached ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                <p className={`text-[9px] leading-tight ${reached ? "text-muted-foreground" : "italic text-muted-foreground/70"}`}>
                  {dateLabel(step, formatCompactEventDate)}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      {hasCourierInfo && (
        <div className="mt-4 rounded border border-border bg-black/2 px-3 py-2 text-sm">
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
