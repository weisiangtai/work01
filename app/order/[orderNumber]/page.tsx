"use client";

import { useEffect, useState } from "react";

type OrderData = {
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentLast5Digits?: string;
  paymentTransferTime?: string;
  paymentNote?: string;
};

export default function OrderPage({ params }: { params: { orderNumber: string } }) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [last5Digits, setLast5Digits] = useState("");
  const [transferTime, setTransferTime] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${params.orderNumber}`)
      .then((r) => r.json())
      .then(setOrder);
  }, [params.orderNumber]);

  const submitPayment = async () => {
    const res = await fetch(`/api/orders/${params.orderNumber}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ last5Digits, transferTime, note })
    });
    if (!res.ok) {
      setMessage("Unable to submit payment info");
      return;
    }
    setMessage("Payment info submitted. Waiting for admin review.");
    const next = await res.json();
    setOrder(next);
  };

  if (!order) return <p>Loading...</p>;

  return (
    <div className="grid">
      <h1>Order {order.orderNumber}</h1>
      <div className="card">
        <h3>Status: {order.status}</h3>
        <p>Total amount: ${(order.totalAmount / 100).toFixed(2)}</p>
      </div>
      <div className="card">
        <h3>Payment Instructions</h3>
        <p>1. Transfer exact amount to bank account below.</p>
        <p>Bank: {process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME ?? "Demo Bank"}</p>
        <p>Account Name: {process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME ?? "Demo Store"}</p>
        <p>Account Number: {process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER ?? "123-456-7890"}</p>
        <p>2. Submit payment information for manual verification.</p>
      </div>
      <div className="card">
        <h3>Submit Payment Information</h3>
        <label>Last 5 digits of account</label>
        <input maxLength={5} value={last5Digits} onChange={(e) => setLast5Digits(e.target.value)} />
        <label style={{ marginTop: 10, display: "block" }}>Transfer time</label>
        <input value={transferTime} onChange={(e) => setTransferTime(e.target.value)} placeholder="2026-02-14 13:30" />
        <label style={{ marginTop: 10, display: "block" }}>Note</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
        <button onClick={submitPayment} style={{ marginTop: 12 }}>Submit for review</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
