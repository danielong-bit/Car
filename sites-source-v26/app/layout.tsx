import type { Metadata } from "next";
import "./globals.css";
import "./showroom-polish.css";

export const metadata: Metadata = {
  title: "Japan Recon Car Gallery | Available Vehicles",
  description: "Explore verified Japan recon stock and inspect the Audi S5 photo tour.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
