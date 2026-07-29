import Link from "next/link";
import { Reveal } from "@/components/reveal";

export function CTA() {
  return (
    <section className="container-content pb-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-white/[0.05] to-white/[0.01] px-8 py-16 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:38px_38px] [mask-image:radial-gradient(ellipse_50%_60%_at_50%_50%,#000,transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full bg-brand-cyan/[0.12] blur-[100px]"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Ready to turn your skill into income?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              List your service in minutes. Get discovered, take orders on WhatsApp, and get paid
              with M-Pesa — with zero agent fees.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/hire" className="btn-primary">
                List your service
              </Link>
              <Link href="/market" className="btn-ghost">
                Browse the market
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
