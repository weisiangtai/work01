import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Ecommerce MVP",
  description: "Manual payment verification ecommerce MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <SiteHeader />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
