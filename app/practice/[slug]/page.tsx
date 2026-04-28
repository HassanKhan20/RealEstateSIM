import { notFound } from "next/navigation";
import { getScenario, SCENARIOS } from "@/lib/scenarios";
import ChatInterface from "@/components/ChatInterface";

export function generateStaticParams() {
  return SCENARIOS.map((s) => ({ slug: s.slug }));
}

export default function PracticePage({ params }: { params: { slug: string } }) {
  const scenario = getScenario(params.slug);
  if (!scenario) notFound();
  return <ChatInterface scenario={scenario} />;
}
