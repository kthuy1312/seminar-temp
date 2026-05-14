"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_ROUTES = ["/login", "/register"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
    if (isPublic) {
      setChecking(false);
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
    } else {
      setChecking(false);
    }
  }, [pathname, router]);

  // Don't flash protected content while checking token
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (!isPublic && checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
