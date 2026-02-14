"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!res.ok) {
      setError("Invalid password");
      return;
    }
    router.push("/admin/orders");
  };

  return (
    <div className="card">
      <h1>Admin Login</h1>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={submit} style={{ marginTop: 12 }}>Login</button>
      {error && <p>{error}</p>}
    </div>
  );
}
