import Link from "next/link";

export function SiteHeader() {
  return (
    <header style={{ display: "flex", gap: 16, padding: 20, borderBottom: "1px solid #eee" }}>
      <Link href="/">Home</Link>
      <Link href="/cart">Cart</Link>
      <Link href="/admin/login">Admin</Link>
    </header>
  );
}
