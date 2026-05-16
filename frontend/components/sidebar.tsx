"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  FlagIcon,
  MapIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { label: "Tổng quan", href: "/dashboard", icon: HomeIcon },
  { label: "Mục tiêu", href: "/goals", icon: FlagIcon },
  { label: "Lộ trình", href: "/roadmap", icon: MapIcon },
  { label: "Tài liệu", href: "/documents", icon: DocumentTextIcon },
  { label: "Gia sư AI", href: "/tutor", icon: AcademicCapIcon },
  { label: "Luyện tập", href: "/practice", icon: PencilSquareIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-slate-200 bg-white md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200">
            <AcademicCapIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              AI Study
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Personalized Learning
            </p>
          </div>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-4 pb-4 md:block md:space-y-1.5 md:overflow-visible md:px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition-all md:flex ${
                isActive
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200 translate-x-1"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
