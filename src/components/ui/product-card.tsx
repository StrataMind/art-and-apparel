"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Eye,
  Star,
  Zap,
  Shield,
  Truck,
  TrendingUp,
} from "lucide-react";
import { ModernCard } from "./modern-card";
import { ModernButton } from "./modern-button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    images?: string[];
    rating: number;
    reviews: number;
    seller: string;
    badge?: "bestseller" | "new" | "sale" | "premium" | "trending";
    discount?: number;
    freeShipping?: boolean;
    verified?: boolean;
    fastDelivery?: boolean;
  };
  variant?: "default" | "minimal" | "premium" | "compact";
  onAddToCart?: (productId: string) => void;
  onWishlist?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  className?: string;
}

const badgeConfig = {
  bestseller: { label: "Bestseller", color: "bg-gold text-white", icon: Zap },
  new: { label: "New", color: "bg-mint text-white", icon: Zap },
  sale: { label: "Sale", color: "bg-coral text-white", icon: Zap },
  premium: {
    label: "Premium",
    color: "bg-purple-600 text-white",
    icon: Shield,
  },
  trending: {
    label: "Trending",
    color: "bg-orange-500 text-white",
    icon: TrendingUp,
  },
};

export function ProductCard({
  product,
  variant = "default",
  onAddToCart,
  onWishlist,
  onQuickView,
  className,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    onWishlist?.(product.id);
  };

  const handleAddToCart = () => {
    onAddToCart?.(product.id);
  };

  const handleQuickView = () => {
    onQuickView?.(product.id);
  };

  const images = product.images || [product.image];
  const BadgeIcon = product.badge ? badgeConfig[product.badge].icon : null;

  return (
    <ModernCard
      variant={
        variant === "premium"
          ? "premium"
          : variant === "minimal"
          ? "minimal"
          : "floating"
      }
      animation="hover"
      spotlight={variant === "premium"}
      shimmer={variant === "premium"}
      className={cn("group cursor-pointer", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
        {/* Product Image */}
        <motion.img
          src={images[currentImageIndex]}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />

        {/* Image Navigation Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentImageIndex
                    ? "bg-white shadow-lg"
                    : "bg-white/50 hover:bg-white/75"
                )}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <div
            className={cn(
              "absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1",
              badgeConfig[product.badge].color
            )}
          >
            {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
            {badgeConfig[product.badge].label}
          </div>
        )}

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-3 right-3 bg-coral text-white px-2 py-1 rounded-full text-xs font-bold">
            -{product.discount}%
          </div>
        )}

        {/* Quick Actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-black/20 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex space-x-2">
                <motion.button
                  className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg backdrop-blur-sm"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleQuickView}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Eye className="w-4 h-4 text-gray-700" />
                </motion.button>

                <motion.button
                  className={cn(
                    "p-2 rounded-full shadow-lg backdrop-blur-sm transition-colors",
                    isWishlisted
                      ? "bg-coral text-white"
                      : "bg-white/90 hover:bg-white text-gray-700"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWishlist}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Heart
                    className={cn("w-4 h-4", isWishlisted && "fill-current")}
                  />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        {/* Seller & Verification */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">{product.seller}</span>
          {product.verified && (
            <div className="flex items-center gap-1 text-mint">
              <Shield className="w-3 h-3" />
              <span className="font-medium">Verified</span>
            </div>
          )}
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-coral transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-gold text-gold" />
            <span className="text-sm font-medium text-gray-700 ml-1">
              {product.rating}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            ({product.reviews} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          {product.freeShipping && (
            <div className="flex items-center gap-1">
              <Truck className="w-3 h-3" />
              <span>Free Shipping</span>
            </div>
          )}
          {product.fastDelivery && (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Fast Delivery</span>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <ModernButton
          variant="primary"
          size="default"
          icon={<ShoppingCart className="w-4 h-4" />}
          onClick={handleAddToCart}
          className="w-full mt-4"
          animation="shimmer"
        >
          Add to Cart
        </ModernButton>
      </div>
    </ModernCard>
  );
}

export default ProductCard;
