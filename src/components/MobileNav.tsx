"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 text-gray-600 hover:text-gray-900"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {open ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex flex-col gap-3 z-50">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Dashboard
          </Link>
          <Link
            href="/diseases"
            onClick={() => setOpen(false)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Diseases
          </Link>
          <Link
            href="/regions"
            onClick={() => setOpen(false)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Regions
          </Link>
          <Link
            href="/timeline"
            onClick={() => setOpen(false)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Timeline
          </Link>
          <Link
            href="/compare"
            onClick={() => setOpen(false)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Compare
          </Link>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            About
          </Link>
        </div>
      )}
    </div>
  );
}
