import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { RentalBrowser } from "@/components/rentals/rental-browser";

export const metadata: Metadata = {
  title: "Rentals — KaziHub",
  description:
    "Bedsitters, apartments, shops and event spaces across Nairobi — with matatu-stage distance and honest deposits. Enquire directly.",
};

export default function RentalsPage() {
  return (
    <>
      <PageHeader
        kicker="🏠 Rentals & Stays"
        title={
          <>
            Find your space in <span className="text-gradient">Nairobi</span>
          </>
        }
        subtitle="Bedsitters to event spaces — with matatu-stage distance and honest deposits. No agent fees, enquire straight to the landlord."
        accent="#00ffb3"
      />
      <RentalBrowser />
    </>
  );
}
