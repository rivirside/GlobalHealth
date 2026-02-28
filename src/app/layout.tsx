import type { Metadata } from "next";
import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global Health Outbreak Context Dashboard",
  description:
    "Real-time disease outbreak alerts combined with health system capacity data for affected countries.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-gray-200 bg-white relative">
          <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">
                Outbreak Context
              </span>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded px-2 py-0.5">
                BETA
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/timeline"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Timeline
              </Link>
              <Link
                href="/compare"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Compare
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                About
              </Link>
            </nav>
            <MobileNav />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
