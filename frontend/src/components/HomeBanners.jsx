import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { fileUrl } from "../lib/api";

export default function HomeBanners() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    api.get("/banners").then((r) => setBanners(r.data));
  }, []);

  if (!banners.length) return null;

  const topBanners = banners.filter((b) => b.position === "top");
  const sideBanners = banners.filter((b) => b.position === "side");

  return (
    <>
      {topBanners.length > 0 && (
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-4">Featured</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topBanners.map((b) => (
                <BannerCard key={b.id} banner={b} large />
              ))}
            </div>
          </div>
        </div>
      )}
      {sideBanners.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sideBanners.map((b) => (
              <BannerCard key={b.id} banner={b} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function BannerCard({ banner, large }) {
  const content = (
    <div className={`relative overflow-hidden border border-border group ${large ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
      <img
        src={banner.image_url.startsWith("/api") ? fileUrl(banner.image_url) : banner.image_url}
        alt={banner.caption}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {banner.caption && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-heading font-bold text-lg sm:text-xl drop-shadow-lg leading-tight">
            {banner.caption}
          </p>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
    </div>
  );

  if (banner.link_url) {
    return (
      <a href={banner.link_url} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }
  return content;
}
