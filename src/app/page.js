// app/page.tsx
import AboutContactSection from "@/components/_pages/home/AboutContactSection";
import BestSellers from "@/components/_pages/home/BestSellers";
import BrandsSection from "@/components/_pages/home/BrandsSection";
import FullBanner from "@/components/_pages/home/FullBanner";
import HeroVideoSection from "@/components/_pages/home/HeroVideoSection";
import Categories from "@/components/_pages/home/Categories";
import NewArrivals from "@/components/_pages/home/NewArrivals";
import SaleSection from "@/components/_pages/home/SaleSection";
import ShopTheLook from "@/components/_pages/home/ShopTheLook";
import RecentlyViewedSection from "@/components/_pages/home/RecentlyViewedSection";
import BrandsHighlightSection from "@/components/_pages/home/BrandsHighlightSection";

export default function Home() {
  return (
    <>
      <Categories />
      <NewArrivals />
      <HeroVideoSection />
      {/* <BrandsSection /> */}
      <BestSellers />
      <BrandsHighlightSection />
      <RecentlyViewedSection />
         {/* <ShopTheLook /> */}
      {/* <SaleSection /> */}

      {/* <FullBanner /> */}
   

      <AboutContactSection />
    </>
  );
}
