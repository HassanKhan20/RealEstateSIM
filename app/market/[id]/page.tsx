import { notFound } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DealAnalyzer from "@/components/DealAnalyzer";
import HouseIllustration from "@/components/HouseIllustration";
import { getProperty, PROPERTIES, TYPE_LABELS } from "@/lib/properties";
import { fmtMoney } from "@/lib/finance";

export function generateStaticParams() {
  return PROPERTIES.map((p) => ({ id: p.id }));
}

export default function PropertyDetail({ params }: { params: { id: string } }) {
  const property = getProperty(params.id);
  if (!property) notFound();

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
        <div className="mb-4 flex items-center gap-2 text-xs text-muted">
          <Link href="/market" className="hover:text-slate-900">Market</Link>
          <span>·</span>
          <span>{property.neighborhood}</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          {/* Left: illustration + facts */}
          <div className="card overflow-hidden">
            <HouseIllustration property={property} height={280} />
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold">{property.address}</h1>
                  <div className="mt-1 text-sm text-muted">
                    {property.neighborhood}, {property.city}, {property.state} {property.zip}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold">{fmtMoney(property.price)}</div>
                  <div className="text-xs text-muted">
                    ARV {fmtMoney(property.estimatedArv)}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm italic text-slate-700">&ldquo;{property.hookLine}&rdquo;</p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <Fact label="Type" value={TYPE_LABELS[property.type]} />
                <Fact label="Beds / Baths" value={`${property.beds} / ${property.baths}`} />
                <Fact label="Sq ft" value={property.sqft.toLocaleString()} />
                <Fact label="Lot" value={property.lotSqft ? property.lotSqft.toLocaleString() + " sqft" : "—"} />
                <Fact label="Year built" value={String(property.yearBuilt)} />
                <Fact label="Days on market" value={`${property.daysOnMarket}d`} />
                <Fact label="Estimated rent" value={fmtMoney(property.estimatedRent) + "/mo"} />
                <Fact label="Rehab est." value={fmtMoney(property.estimatedRehab)} />
                <Fact label="Motivation" value={property.motivation} />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <Fact label="Flood zone" value={property.risk.floodZone} tone={property.risk.floodZone === "X" ? "good" : "warn"} />
                <Fact label="Hurricane" value={`${property.risk.hurricaneRisk}/5`} tone={property.risk.hurricaneRisk >= 4 ? "warn" : "neutral"} />
                <Fact label="Crime idx" value={String(property.risk.crimeIndex)} tone={property.risk.crimeIndex > 45 ? "warn" : "good"} />
                <Fact label="Schools" value={`${property.risk.schoolScore}/10`} tone={property.risk.schoolScore >= 7 ? "good" : "neutral"} />
                <Fact label="Walk score" value={String(property.risk.walkScore)} tone={property.risk.walkScore >= 60 ? "good" : "neutral"} />
                <Fact label="Appreciation" value={`${property.appreciationRate}%/yr`} />
              </div>

              <div className="mt-6 rounded-xl bg-[#F7F8FA] p-4 text-xs text-slate-700">
                <div className="mb-1 text-[10px] uppercase tracking-widest text-accent">
                  Monthly carrying costs
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><span className="text-muted">Taxes</span> {fmtMoney(property.monthlyTaxes)}</div>
                  <div><span className="text-muted">Insurance</span> {fmtMoney(property.monthlyInsurance)}</div>
                  <div><span className="text-muted">HOA</span> {fmtMoney(property.monthlyHoa)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: live deal analyzer */}
          <DealAnalyzer property={property} />
        </div>
      </main>
      <Footer />
    </>
  );
}

function Fact({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "warn" | "neutral";
}) {
  const color =
    tone === "good" ? "text-accent" :
    tone === "warn" ? "text-amber-700" :
    "text-slate-800";
  return (
    <div className="rounded-lg bg-[#F7F8FA] p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className={`mt-0.5 text-sm capitalize ${color}`}>{value}</div>
    </div>
  );
}
