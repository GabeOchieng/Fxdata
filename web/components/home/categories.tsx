import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { Reveal } from "@/components/reveal";

export function Categories() {
  return (
    <section className="container-content py-24">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-xl">
          <Reveal>
            <span className="kicker">250+ categories &amp; counting</span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              If it&apos;s a hustle, it&apos;s here
            </h2>
          </Reveal>
        </div>
        <Reveal delay={2}>
          <Link
            href="/market"
            className="btn-ghost whitespace-nowrap px-4 py-2.5 text-[13px]"
          >
            See the full map →
          </Link>
        </Reveal>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        {CATEGORIES.map((c, i) => (
          <Reveal key={c.slug} delay={Math.min(i, 8)} as="div">
            <div
              className="group flex items-center gap-2.5 rounded-full border border-line bg-white/[0.02] px-4 py-2.5 text-sm text-muted transition hover:border-line2 hover:text-fg"
              style={{ ["--dot" as string]: c.color }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full transition-transform group-hover:scale-125"
                style={{ background: c.color, boxShadow: `0 0 10px ${c.color}66` }}
              />
              <span className="text-base leading-none">{c.icon}</span>
              {c.name}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
