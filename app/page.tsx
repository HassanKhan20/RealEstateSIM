import WaitlistLanding from "@/frontend/components/auth/WaitlistLanding";

// The public landing is now a waitlist. The full product lives behind /login
// (access-code gated). Marketing/feature detail moved inside the app.
export default function Home() {
  return <WaitlistLanding />;
}
