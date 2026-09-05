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
  courierName,
  trackingNumber,
}: {
  statusHistory: OrderStatusEvent[];
  currentStatus: OrderStatus;
  courierName?: string;
  trackingNumber?: string;
}) {
  const eventAt = new Map(statusHistory.map((e) => [e.status, e.at]));
  const isTerminal = TERMINAL_STATUSES.includes(currentStatus);

  // A cancelled/returned order stops the happy path partway through — only
  // the pipeline steps it actually reached are shown, followed by the
  // terminal marker. Otherwise every pipeline step is shown, with steps
  // beyond the current one rendered as upcoming (no timestamp yet).
  const steps: Step[] = MAIN_PIPELINE_STATUSES.filter((status) => !isTerminal || eventAt.has(status)).map((status) => {
    const at = eventAt.get(status);
    const state: StepState = !isTerminal && status === currentStatus ? "current" : at ? "done" : "upcoming";
    return { status, label: stepLabel(status), at, state };
  });

  if (isTerminal) {
    steps.push({ status: currentStatus, label: stepLabel(currentStatus), at: eventAt.get(currentStatus), state: "terminal" });
  }

  const hasCourierInfo = Boolean(courierName || trackingNumber);

  return (
    <div>
      <ol>
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
                {step.at ? formatEventDate(step.at) : "Pending"}
              </p>
            </li>
          );
        })}
      </ol>

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
