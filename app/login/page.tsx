import { Suspense } from "react";
import SignInForm from "@/frontend/components/auth/SignInForm";

export const metadata = { title: "Sign in — Estatify" };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
