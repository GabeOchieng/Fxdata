import { Reveal } from "@/components/reveal";

const STEPS = [
  {
    n: "01",
    title: "Discover",
    body: "Browse the live skills map or search by trade and neighbourhood. Every pro shows ratings, packages and real portfolio work.",
    accent: "#00e5ff",
  },
  {
    n: "02",
    title: "Order on WhatsApp",
    body: "One tap builds a pre-formatted order message. No app to install, no account friction — chat is the checkout.",
    accent: "#00ffb3",
  },
  {
    n: "03",
    title: "Pay with M-Pesa",
    body: "Confirm and pay via M-Pesa STK Push. Funds are tracked, receipts are logged, and both sides get notified.",
    accent: "#f5a623",
  },
];

export function HowItWorks() {
  return (
    <section className="relative border-y border-line bg-ink-900/40">
      <div className="container-content py-24">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Reveal>
              <span className="kicker">Built for how Kenya transacts</span>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                WhatsApp-native.
                <br />
                <span className="text-gradient">M-Pesa-powered.</span>
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-4 max-w-md text-muted">
                No downloads, no agent fees, no friction. KaziHub meets people on the tools they
                already use every day.
              </p>
            </Reveal>
          </div>

          <ol className="space-y-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i} as="li">
                <div className="flex gap-5 rounded-2xl border border-line bg-white/[0.02] p-6 transition hover:border-line2 hover:bg-white/[0.04]">
                  <div
                    className="font-mono text-sm font-semibold"
                    style={{ color: s.accent }}
                  >
                    {s.n}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
