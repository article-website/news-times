"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Beranda", href: "/" },
  { label: "Nasional", href: "/categories/nasional" },
  { label: "Internasional", href: "/categories/internasional" },
  { label: "Ekonomi", href: "/categories/ekonomi" },
  { label: "Teknologi", href: "/categories/teknologi" },
  { label: "Olahraga", href: "/categories/olahraga" },
  { label: "Lifestyle", href: "/categories/lifestyle" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          News<span className="text-blue-600">Times</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={
                pathname === item.href
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600 transition-colors"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            aria-label="Cari"
            className="text-gray-600 hover:text-gray-900"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <Link
            href="/admin"
            aria-label="Admin / Akun"
            title="Panel Admin"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
