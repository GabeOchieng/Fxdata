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
            Every hustle in Kenya, <span className="text-gradient">mapped live</span>
          </>
        }
        subtitle="259 hustles across 21 categories, each bubble sized by community XP. Search, filter, drag a bubble around, or click one to meet the pros."
        accent="#00e5ff"
      />
      <MarketExplorer />
    </>
  );
}
