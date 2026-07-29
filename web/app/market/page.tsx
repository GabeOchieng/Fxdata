import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { MarketExplorer } from "@/components/market/market-explorer";

export const metadata: Metadata = {
  title: "Market — KaziHub",
  description:
    "Explore 250+ service categories across Kenya, sized by live activity. Search a trade and find skilled pros near you.",
};

export default function MarketPage() {
  return (
    <>
      <PageHeader
        kicker="🗺 Skills Market"
        title={
          <>
            Every trade in Kenya, <span className="text-gradient">mapped live</span>
          </>
        }
        subtitle="250+ categories sized by real activity — pros, jobs done and community XP. Search a trade or tap a category to find talent near you."
        accent="#00e5ff"
      />
      <MarketExplorer />
    </>
  );
}
