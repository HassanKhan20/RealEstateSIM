"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthed, isPublicPath } from "@/frontend/lib/auth";

// Wraps the whole app. Public paths render immediately. Gated paths render
// nothing until we confirm auth client-side — if unauthed, redirect to /login.
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const pub = isPublicPath(pathname);
  const [allowed, setAllowed] = useState(pub);

  useEffect(() => {
    if (pub) {
      setAllowed(true);
      return;
    }
    if (isAuthed()) {
      setAllowed(true);
    } else {
      setAllowed(false);
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, pub, router]);

  if (!pub && !allowed) {
    // Brief gated-route guard — avoids flashing protected content.
    return (
      <div className="grid min-h-screen place-items-center bg-white">
        <div className="dot-typing" aria-hidden>
          <span /><span /><span />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
