"use client";

import { selectMiddleBanner } from "@/store/selectors/homeConfigSelectors";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function FullBanner() {
  const router = useRouter();

  const config = useSelector(selectMiddleBanner);

  if (!config || !config.media_url) return null;

  return (
    <section className="my-4">
      <div className="w-full">
        <img
          src={config?.media_url || "/placeholders/banner-full.png"}
          alt="Banner"
          className="w-full h-auto object-cover cursor-pointer"
          onClick={() => {
            if (config?.link_url) {
              router.push(config.link_url);
            }
          }}
        />
      </div>
    </section>
  );
}
