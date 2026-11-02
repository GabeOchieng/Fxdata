import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { ProductGrid } from "@/components/shop/product-grid";

export const metadata: Metadata = {
  title: "Footwear — KaziHub",
  description:
    "Locally-made sneakers and sandals with size × colour variants and M-Pesa checkout, delivered anywhere in Kenya.",
};

export default function FootwearPage() {
  return (
    <>
      <PageHeader
        kicker="👟 Footwear"
        title={
          <>
            Locally-made kicks, <span className="text-gradient">delivered</span>
          </>
        }
        subtitle="Sneakers and sandals crafted by Kenyan makers. Pick your size and colour, pay with M-Pesa, delivered countrywide."
        accent="#ff2d87"
      />
      <ProductGrid kind="footwear" />
    </>
  );
}
