"use client";

import { FaCopy } from "react-icons/fa6";
import toast from "react-hot-toast";

const THEME = {
  bkash: {
    name: "bKash",
    color: "#E2136E",
    bg: "bg-[#E2136E]/5",
    border: "border-[#E2136E]/30",
    button: "bg-[#E2136E] hover:bg-[#c10f5f]",
    numberEnv: process.env.NEXT_PUBLIC_BKASH_NUMBER,
  },
  nagad: {
    name: "Nagad",
    color: "#F6921E",
    bg: "bg-[#F6921E]/5",
    border: "border-[#F6921E]/30",
    button: "bg-[#F6921E] hover:bg-[#d97c0f]",
    numberEnv: process.env.NEXT_PUBLIC_NAGAD_NUMBER,
  },
} as const;

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

export function BkashNagadPayment({
  gateway,
  qrImage,
  total,
  senderNumber,
  onSenderNumberChange,
  transactionId,
  onTransactionIdChange,
}: {
  gateway: "bkash" | "nagad";
  qrImage?: string;
  total: number | undefined;
  senderNumber: string;
  onSenderNumberChange: (v: string) => void;
  transactionId: string;
  onTransactionIdChange: (v: string) => void;
}) {
  const theme = THEME[gateway];
  const merchantNumber = theme.numberEnv || "";

  async function handleCopy() {
    if (!merchantNumber) return;
    try {
      await navigator.clipboard.writeText(merchantNumber);
      toast.success("Number copied.");
    } catch {
      toast.error("Couldn't copy — please copy it manually.");
    }
  }

  return (
    <div className={`mt-4 space-y-4 rounded-lg border ${theme.border} ${theme.bg} p-4`}>
      <p className="text-sm font-semibold" style={{ color: theme.color }}>
        {theme.name} Payment
      </p>

      <div className="rounded-md p-3 text-sm text-white" style={{ backgroundColor: theme.color }}>
        ৳{total?.toLocaleString() ?? "—"} payment required to confirm your order
      </div>

      <p className="text-sm text-muted-foreground">
        Please first send the payment via {theme.name}&apos;s &ldquo;Send Money&rdquo; option to the merchant number
        below, then fill in the details.
      </p>

      <div className="flex items-center justify-between rounded-md border border-border bg-surface px-3.5 py-2.5">
        <div>
          <p className="text-xs text-muted-foreground">{theme.name} merchant number</p>
          <p className="text-sm font-semibold">{merchantNumber || "Not configured yet — contact the seller"}</p>
        </div>
        {merchantNumber && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white"
            style={{ backgroundColor: theme.color }}
          >
            <FaCopy className="h-3 w-3" />
            Copy
          </button>
        )}
      </div>

      {qrImage && (
        <div className="flex flex-col items-center gap-1.5 rounded-md border border-border bg-surface p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrImage} alt={`${theme.name} payment QR code`} className="h-40 w-40 object-contain" />
          <p className="text-xs text-muted-foreground">Scan to pay</p>
        </div>
      )}

      <div>
        <label htmlFor={`${gateway}SenderNumber`} className="mb-1 block text-sm font-medium">
          {theme.name} Number
        </label>
        <input
          id={`${gateway}SenderNumber`}
          required
          placeholder="01XXXXXXXXX"
          value={senderNumber}
          onChange={(e) => onSenderNumberChange(e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-muted-foreground">The number you sent the payment from.</p>
      </div>

      <div>
        <label htmlFor="transactionId" className="mb-1 block text-sm font-medium">
          Transaction ID
        </label>
        <input
          id="transactionId"
          required
          placeholder="e.g. 8N7A6D5E27M"
          value={transactionId}
          onChange={(e) => onTransactionIdChange(e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs" style={{ color: theme.color }}>
          Your order won&apos;t be confirmed without a Transaction ID.
        </p>
      </div>
    </div>
  );
}
