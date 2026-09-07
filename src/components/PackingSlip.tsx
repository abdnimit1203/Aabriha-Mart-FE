import { AdminOrder } from "@/types/order";
import { DELIVERY_ZONE_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/orderStatusStyles";

// The physical slip sealed with the package — modeled on the standard
// Bangladeshi courier consignment/COD slip layout (From/To block, a
// impossible-to-miss COD amount box, an items table, a signature line).
// Hidden on screen (`hidden print:block`) and only ever rendered inside the
// browser's print output; VAT is deliberately never shown here — it's
// internal bookkeeping only (see Order.ts), never a charge to the customer.
export function PackingSlip({ order }: { order: AdminOrder }) {
  const shopAddress = process.env.NEXT_PUBLIC_CONTACT_ADDRESS;
  const shopWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const orderCode = order._id.slice(-8).toUpperCase();
  const recipientName = order.recipientName ?? order.customer?.name ?? "Customer";
  const isCod = order.paymentMethod === "cod";
  const codAmountDue = isCod && order.paymentStatus !== "paid" ? order.total : 0;

  return (
    <div className="hidden print:block print:text-black">
      <div className="flex items-start justify-between border-b-2 border-black pb-3">
        <div>
          <p className="text-xl font-bold">Aabriha Mart</p>
          {shopAddress && <p className="text-xs">{shopAddress}</p>}
          {shopWhatsapp && <p className="text-xs">Phone/WhatsApp: {shopWhatsapp}</p>}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">Order Invoice</p>
          <p className="font-mono text-lg font-bold">#{orderCode}</p>
          <p className="text-xs">
            {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="border border-black p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide">From</p>
          <p className="mt-1 text-sm font-bold">Aabriha Mart</p>
          {shopAddress && <p className="text-xs">{shopAddress}</p>}
        </div>
        <div className="border-2 border-black p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide">To (Recipient)</p>
          <p className="mt-1 text-base font-bold">{recipientName}</p>
          <p className="text-base font-bold">{order.phone}</p>
          <p className="mt-1 text-xs">
            {order.deliveryAddress.detailedAddress}, {order.deliveryAddress.area}, {order.deliveryAddress.district},{" "}
            {order.deliveryAddress.division}
          </p>
          <p className="text-[10px]">{DELIVERY_ZONE_LABEL[order.deliveryZone]}</p>
        </div>
      </div>

      {order.deliveryNote && (
        <p className="mt-2 border border-dashed border-black p-2 text-xs">Delivery note: {order.deliveryNote}</p>
      )}

      <div className="mt-3 flex items-center justify-between border-2 border-black bg-black p-3 text-white">
        <span className="text-sm font-semibold uppercase tracking-wide">
          {isCod ? "Cash on Delivery — Amount to Collect" : "Payment"}
        </span>
        <span className="text-2xl font-bold">
          {isCod ? `৳${codAmountDue.toLocaleString()}` : PAYMENT_METHOD_LABEL[order.paymentMethod]}
        </span>
      </div>

      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-black text-left text-xs uppercase">
            <th className="py-1.5">Item</th>
            <th className="py-1.5 text-center">Qty</th>
            <th className="py-1.5 text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i} className="border-b border-black/30">
              <td className="py-1.5 pr-2">
                <p className="font-medium">{item.nameSnapshot}</p>
                {Object.keys(item.attributesSnapshot).length > 0 && (
                  <p className="text-xs">
                    {Object.entries(item.attributesSnapshot)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ")}
                  </p>
                )}
              </td>
              <td className="py-1.5 text-center">×{item.quantity}</td>
              <td className="py-1.5 text-right">৳{(item.unitPrice * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 space-y-0.5 border-t-2 border-black pt-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>৳{order.subtotal.toLocaleString()}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>−৳{order.discount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Delivery charge</span>
          <span>৳{order.deliveryCharge.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-t border-black pt-0.5 text-base font-bold">
          <span>Total</span>
          <span>৳{order.total.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-between gap-6 text-xs">
        <div className="flex-1 border-t border-black pt-1">Received by (name)</div>
        <div className="flex-1 border-t border-black pt-1">Signature / Date</div>
      </div>

      <div className="mt-6 border-t-2 border-black pt-3 text-center">
        <p className="text-lg font-bold">ধন্যবাদ!</p>
        <p className="mt-1 text-base">
          Thank you for shopping with <span className="font-logo text-lg tracking-wide">Aabriha Mart</span>
        </p>
        {shopWhatsapp && <p className="mt-1 text-xs">For any issue, WhatsApp us at {shopWhatsapp}</p>}
      </div>
    </div>
  );
}
