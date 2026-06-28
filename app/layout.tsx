import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Familienhub",
  description: "Der Organizer für eure Familie – Termine, Einkauf, Kinder & Wetter.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F7EEF4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="max-w-[480px] mx-auto min-h-screen relative overflow-x-hidden">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
