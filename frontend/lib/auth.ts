// Client-side access gate + waitlist.
//
// IMPORTANT: This is an *access gate*, not secure authentication. State lives
// in localStorage, so it's bypassable by a determined user. That's acceptable
// for a pre-launch waitlist / demo. When we add a real backend (Supabase /
// Clerk), swap the bodies of these functions — call sites stay identical.

const KEYS = {
  auth: "auth-v1",
  waitlist: "waitlist-v1",
};

// Invite codes that unlock the app. In production these would be issued
// per-user and verified server-side.
const VALID_CODES = ["ESTATIFY", "FOUNDER", "EARLY2026", "DEMO"];

export type AuthUser = {
  email: string;
  name: string;
  code: string;
  signedInAt: number;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getUser(): AuthUser | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEYS.auth);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function isAuthed(): boolean {
  return getUser() !== null;
}

export function isValidCode(code: string): boolean {
  return VALID_CODES.includes(code.trim().toUpperCase());
}

export function signInWithCode(
  email: string,
  name: string,
  code: string
): { ok: boolean; error?: string } {
  const e = email.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) {
    return { ok: false, error: "Enter a valid email." };
  }
  if (!isValidCode(code)) {
    return { ok: false, error: "That access code isn't valid. Join the waitlist for one." };
  }
  const user: AuthUser = {
    email: e,
    name: name.trim() || e.split("@")[0],
    code: code.trim().toUpperCase(),
    signedInAt: Date.now(),
  };
  if (isBrowser()) {
    localStorage.setItem(KEYS.auth, JSON.stringify(user));
    window.dispatchEvent(new StorageEvent("storage", { key: KEYS.auth }));
  }
  return { ok: true };
}

export function signOut() {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.auth);
  window.dispatchEvent(new StorageEvent("storage", { key: KEYS.auth }));
}

// --- Waitlist ---

export type WaitlistEntry = { email: string; at: number };

// Seeded base so the counter looks alive pre-launch.
const WAITLIST_BASE = 1_240;

export function getWaitlist(): WaitlistEntry[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.waitlist) ?? "[]");
  } catch {
    return [];
  }
}

export function waitlistCount(): number {
  return WAITLIST_BASE + getWaitlist().length;
}

export function joinWaitlist(email: string): { ok: boolean; position?: number; error?: string } {
  const e = email.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) {
    return { ok: false, error: "Enter a valid email." };
  }
  const list = getWaitlist();
  if (list.some((x) => x.email === e)) {
    return { ok: true, position: WAITLIST_BASE + list.findIndex((x) => x.email === e) + 1 };
  }
  list.push({ email: e, at: Date.now() });
  if (isBrowser()) localStorage.setItem(KEYS.waitlist, JSON.stringify(list));
  return { ok: true, position: WAITLIST_BASE + list.length };
}

// Routes that don't require auth.
export function isPublicPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "/login") return true;
  if (pathname.startsWith("/result")) return true; // shareable archetype pages
  return false;
}
