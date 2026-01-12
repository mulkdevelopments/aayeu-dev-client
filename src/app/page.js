// app/page.tsx
import AboutContactSection from "@/components/_pages/home/AboutContactSection";
import BestSellers from "@/components/_pages/home/BestSellers";
import BrandsSection from "@/components/_pages/home/BrandsSection";
import FullBanner from "@/components/_pages/home/FullBanner";
import HeroVideoSection from "@/components/_pages/home/HeroVideoSection";
import NewArrivals from "@/components/_pages/home/NewArrivals";
import SaleSection from "@/components/_pages/home/SaleSection";
import ShopTheLook from "@/components/_pages/home/ShopTheLook";

export default function Home() {
  return (
    <>
      <HeroVideoSection />
      <BrandsSection />
      <NewArrivals title="New Arrivals" />
         <ShopTheLook />
      {/* <SaleSection /> */}
      <BestSellers />
      {/* <FullBanner /> */}
   

      {/* <AboutContactSection /> */}
    </>
  );
}
