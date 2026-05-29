// Tiny client-side analytics layer.
// Today it writes to a circular buffer in localStorage so we can review the
// session's events at /debug/events. The same logEvent() call site will work
// when we wire Posthog / Plausible later — swap the body, keep the API.
//
// Why: gives us behavioral signal before we install a real analytics provider.
//      Doesn't block on third-party signup.

type EventRecord = {
  name: string;
  props?: Record<string, any>;
  at: number;
};

const KEY = "events-v1";
const MAX = 200;

function isBrowser() {
  return typeof window !== "undefined";
}

function read(): EventRecord[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as EventRecord[]) : [];
  } catch {
    return [];
  }
}

function write(list: EventRecord[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {}
}

export function logEvent(name: string, props?: Record<string, any>) {
  if (!isBrowser()) return;
  const list = read();
  const rec: EventRecord = { name, props, at: Date.now() };
  list.unshift(rec);
  write(list);
  // Console for dev observability
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(`[event] ${name}`, props ?? "");
  }
  // Hook point: when we install Posthog, this is where posthog.capture() goes.
  // window.posthog?.capture(name, props);
}

export function getEvents(): EventRecord[] {
  return read();
}

export function clearEvents() {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY);
}

export type { EventRecord };
