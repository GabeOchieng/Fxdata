import Link from "next/link";
import { MODULES } from "@/lib/constants";
import { Reveal } from "@/components/reveal";

export function Modules() {
  return (
    <section className="container-content py-24" id="modules">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <span className="kicker">Four marketplaces · one login</span>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            One platform for the whole hustle
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="mt-4 text-muted">
            Services, professionals, rentals and commerce — unified under shared identity, ratings
            and a WhatsApp-native checkout.
          </p>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {MODULES.map((m, i) => (
          <Reveal key={m.key} delay={i} as="div">
            <Link
              href={m.href}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.02] p-7 transition duration-300 hover:border-line2 hover:bg-white/[0.04]"
            >
              {/* accent glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-0 blur-[70px] transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: m.accent }}
              />
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl border text-2xl"
                style={{
                  borderColor: `${m.accent}44`,
                  background: `${m.accent}14`,
                }}
              >
                {m.emoji}
              </div>

              <h3 className="mt-5 font-display text-2xl font-bold">{m.title}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{m.blurb}</p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {m.points.map((p) => (
                  <li
                    key={p}
                    className="rounded-full border border-line px-3 py-1 text-xs text-muted"
                  >
                    {p}
                  </li>
                ))}
              </ul>

              <span
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: m.accent }}
              >
                Open {m.title}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M6 3l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
