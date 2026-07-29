import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-ink-950/60">
      <div className="container-content grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted">
            Kenya&apos;s gig economy platform. Every hustle, one place — WhatsApp-native and
            M-Pesa-powered.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            Marketplaces
          </h4>
          <ul className="space-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted transition-colors hover:text-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            Company
          </h4>
          <ul className="space-y-2 text-sm">
            {["About", "For Pros", "Pricing", "Contact"].map((x) => (
              <li key={x}>
                <span className="cursor-default text-muted transition-colors hover:text-fg">
                  {x}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            Powered by
          </h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>💚 M-Pesa · Daraja API</li>
            <li>💬 WhatsApp Business</li>
            <li>📍 Nairobi, Kenya</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-content flex flex-col items-center justify-between gap-3 py-6 text-xs text-faint sm:flex-row">
          <span>© {new Date().getFullYear()} KaziHub · Built on the hustle 🇰🇪</span>
          <span className="font-mono">Nairobi · Kenya</span>
        </div>
      </div>
    </footer>
  );
}
