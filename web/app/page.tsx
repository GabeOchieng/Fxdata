import { Hero } from "@/components/home/hero";
import { Ticker } from "@/components/home/ticker";
import { Modules } from "@/components/home/modules";
import { HowItWorks } from "@/components/home/how-it-works";
import { Categories } from "@/components/home/categories";
import { CTA } from "@/components/home/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Ticker />
      <Modules />
      <HowItWorks />
      <Categories />
      <CTA />
    </>
  );
}
