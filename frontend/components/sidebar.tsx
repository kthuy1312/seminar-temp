"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Goals", href: "/goals" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Documents", href: "/documents" },
  { label: "AI Tutor", href: "/tutor" },
  { label: "Practice", href: "/practice" },
  { label: "Progress", href: "/progress" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-slate-200 bg-white md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="px-6 py-5">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          AI Study Assistant
        </h1>
        <p className="mt-1 text-xs text-slate-500">Study smarter, every day</p>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-4 pb-4 md:block md:space-y-1 md:overflow-visible">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition md:flex ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
