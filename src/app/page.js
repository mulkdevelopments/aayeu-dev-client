// app/page.tsx
import AboutContactSection from "@/components/_pages/home/AboutContactSection";
import BenefitsBar from "@/components/_pages/home/BenefitsBar";
import BestSellers from "@/components/_pages/home/BestSellers";
import FeaturedBrands from "@/components/_pages/home/FeaturedBrands";
import FullBanner from "@/components/_pages/home/FullBanner";
import HeroVideoSection from "@/components/_pages/home/HeroVideoSection";
import NewArrivals from "@/components/_pages/home/NewArrivals";
import ProductGridOverlay from "@/components/_pages/home/ProductGridOverlay";
import SaleSection from "@/components/_pages/home/SaleSection";
import ShopTheLook from "@/components/_pages/home/ShopTheLook";

export default function Home() {
  return (
    <>
      <HeroVideoSection />
      <ProductGridOverlay />
      <SaleSection />
      <FullBanner />
      <BestSellers />
      {/* <FeaturedBrands /> */}
      <ShopTheLook />
      <NewArrivals title="New Arrivals" />
      <AboutContactSection />
      <BenefitsBar />
    </>
  );
}
