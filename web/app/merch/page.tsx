import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { ProductGrid } from "@/components/shop/product-grid";

export const metadata: Metadata = {
  title: "Merch — KaziHub",
  description:
    "Wear your hustle — branded tees, hoodies, caps and bags. Size & colour variants, M-Pesa checkout, delivered countrywide.",
};

export default function MerchPage() {
  return (
    <>
      <PageHeader
        kicker="👕 Merch"
        title={
          <>
            Wear your <span className="text-gradient">hustle</span>
          </>
        }
        subtitle="Tees, hoodies, caps and bags repping the movement. Pick your size and colour, pay with M-Pesa, delivered countrywide."
        accent="#c8ff00"
      />
      <ProductGrid kind="merch" />
    </>
  );
}
