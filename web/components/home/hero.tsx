"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { STATS } from "@/lib/constants";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_35%,#000_35%,transparent_100%)]"
      />
      {/* aurora glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-brand-cyan/[0.10] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[8%] top-24 h-[280px] w-[280px] rounded-full bg-brand-magenta/[0.08] blur-[110px]"
      />

      <div className="container-content relative flex flex-col items-center pt-2 pb-16 pt-20 text-center sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <span className="kicker">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green shadow-[0_0_8px_#00ffb3]" />
            Kenya&apos;s Gig Economy Platform
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.06 }}
          className="mt-6 max-w-4xl font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl"
        >
          Every hustle.
          <br />
          <span className="text-gradient">One platform.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.12 }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-muted"
        >
          Find a skilled pro, rent a space, or buy locally-made footwear across{" "}
          <span className="text-fg">250+ service categories</span> in Nairobi — all connected,
          WhatsApp-native, and powered by M-Pesa. Zero agent fees.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.18 }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link href="/market" className="btn-primary">
            🗺 Explore the market
          </Link>
          <Link href="/hire" className="btn-ghost">
            👔 Hire a pro
          </Link>
        </motion.div>

        {/* stat strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.26 }}
          className="mt-16 grid w-full max-w-3xl grid-cols-2 divide-x divide-line rounded-2xl border border-line bg-white/[0.02] sm:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.label} className="px-4 py-5">
              <div className="font-display text-2xl font-bold text-fg">{s.value}</div>
              <div className="mt-1 text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
