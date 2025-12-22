// src/components/SmartProductCard.tsx
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Play, Eye, ShoppingBag } from "lucide-react";
import { useHoverVideo } from "@/hooks/useHoverVideo";
import InstantAddButton from "@/components/ui/instant-add-button";
import SignupModal from "@/components/SignupModal";
import QuickViewModal from "@/components/QuickViewModal";
import { formatPrice } from "@/utils/format";
import { Product } from "@/config/products";
import { cn } from "@/lib/utils";

interface SmartProductCardProps {
  product: Product;
}

export const SmartProductCard = ({ product }: SmartProductCardProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { shouldLoad, shouldShow, bind } = useHoverVideo();

  // Convert product to QuickViewModal format
  const quickViewProduct = {
    id: product.id,
    name: product.name,
    brand: product.category || "Pop Clozet",
    price: product.price,
    retailPrice: product.price * 4, // Approximate retail price
    images: [product.image, product.image], // Use same image if no gallery
    sizes: product.sizes || ["XS", "S", "M", "L", "XL"],
    color: product.category,
    modelStats: {
      height: "5'7\"",
      size: "M",
    },
  };

  return (
    <>
      <motion.div
        ref={containerRef}
        className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg transition-all"
        whileHover={{ y: -4 }}
        {...bind}
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <picture>
            <source srcSet={product.image} />
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </picture>

          {product.video && shouldLoad && (
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${shouldShow ? "opacity-100" : "opacity-0"}`}
              muted
              loop
              playsInline
              preload="none"
              onCanPlay={() => videoRef.current?.play().catch(() => null)}
              onLoadedData={() => videoRef.current?.play().catch(() => null)}
            >
              <source src={product.video} type="video/mp4" />
            </video>
          )}

          {product.video && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur flex items-center gap-1">
              <Play className="w-3 h-3" />
              Hover/long-press to preview
            </div>
          )}

          {/* Quick View Button - appears on hover */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.05 }}
            className={cn(
              "absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all",
              "px-4 py-2 rounded-full text-sm font-medium",
              "bg-white/90 dark:bg-black/80 backdrop-blur-md shadow-lg",
              "flex items-center gap-2",
              "hover:bg-white dark:hover:bg-black"
            )}
            onClick={(e) => {
              e.stopPropagation();
              setIsQuickViewOpen(true);
            }}
          >
            <Eye className="w-4 h-4" />
            Quick View
          </motion.button>

          <button
            aria-label="Join waitlist for this item"
            onClick={(e) => {
              e.stopPropagation();
              setIsSignupOpen(true);
            }}
            className="absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors bg-primary/80 text-white hover:bg-primary"
          >
            <Bell className="w-4 h-4" />
          </button>

          <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md">
            {product.category}
          </div>

          {/* Available Sizes - shown on hover */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="absolute bottom-14 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all">
              <div className="flex gap-1 flex-wrap justify-start">
                {product.sizes.slice(0, 5).map((size) => (
                  <span
                    key={size}
                    className="px-2 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded text-xs font-medium"
                  >
                    {size}
                  </span>
                ))}
                {product.sizes.length > 5 && (
                  <span className="px-2 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded text-xs font-medium">
                    +{product.sizes.length - 5}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-lg truncate">{product.name}</h3>
          </div>

          {/* FIXED: used div instead of p to avoid nesting <div> inside <p> */}
          <div className="text-sm text-muted-foreground flex justify-between items-center">
            <div className="flex-1">
              {/* you can show price here or other meta */}
              <div className="text-sm font-semibold">{formatPrice(product.price)}</div>
            </div>

            <div className="ml-4">
              <InstantAddButton productId={product.id} imageSrc={product.image} />
            </div>
          </div>
        </div>
      </motion.div>

      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={quickViewProduct}
      />
    </>
  );
};

export default SmartProductCard;

