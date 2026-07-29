import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { ProDirectory } from "@/components/hire/pro-directory";

export const metadata: Metadata = {
  title: "Hire a Pro — KaziHub",
  description:
    "Browse verified professional portfolios across Kenya. Compare ratings, packages and past work, then book instantly on WhatsApp.",
};

export default function HirePage() {
  return (
    <>
      <PageHeader
        kicker="👔 Hire a Pro"
        title={
          <>
            Verified pros, <span className="text-gradient">ready to work</span>
          </>
        }
        subtitle="Compare ratings, community level and rates — then book instantly on WhatsApp. Every pro is reviewed by the people they've served."
        accent="#a78bfa"
      />
      <ProDirectory />
    </>
  );
}
