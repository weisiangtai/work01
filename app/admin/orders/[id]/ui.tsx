"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["PENDING_PAYMENT", "PENDING_REVIEW", "CONFIRMED", "FULFILLED", "CANCELED"];

export function AdminOrderActions({
  orderId,
  currentStatus,
  adminNote
}: {
  orderId: number;
  currentStatus: string;
  adminNote: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState(adminNote);
  const [deliveryChannel, setDeliveryChannel] = useState("");
  const [deliveryDestination, setDeliveryDestination] = useState("");

  const update = async () => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote: note, deliveryChannel, deliveryDestination })
    });
    if (res.ok) router.refresh();
  };

  return (
    <div className="card">
      <h3>Admin Actions</h3>
      <label>Status</label>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <label style={{ marginTop: 10, display: "block" }}>Admin Note</label>
      <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
      <label style={{ marginTop: 10, display: "block" }}>Delivery Channel (LINE/Email/Telegram)</label>
      <input value={deliveryChannel} onChange={(e) => setDeliveryChannel(e.target.value)} />
      <label style={{ marginTop: 10, display: "block" }}>Delivery Destination</label>
      <input value={deliveryDestination} onChange={(e) => setDeliveryDestination(e.target.value)} />
      <button onClick={update} style={{ marginTop: 12 }}>Save</button>
    </div>
  );
}
