import React from "react";
import ProductCard from "./ProductCard";

function ProductCardGrid({
  products = [],
  onQuickView,
  onAddToCart,
  onOpenDetails,
  showWishlist = false,
  isWishlisted,
  isWishlistLoading,
  onToggleWishlist,
}) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 xl:gap-7">
      {products.map((product) => (
        <div key={product.id} className="h-full flex">
          <ProductCard
            product={product}
            onQuickView={() => onQuickView(product)}
            onAddToCart={() => onAddToCart(product)}
            onOpenDetails={() => onOpenDetails(product)}
            showWishlist={showWishlist}
            isWishlisted={isWishlisted ? isWishlisted(product) : false}
            isWishlistLoading={isWishlistLoading ? isWishlistLoading(product) : false}
            onToggleWishlist={onToggleWishlist ? () => onToggleWishlist(product) : undefined}
          />
        </div>
      ))}
    </div>
  );
}

export default ProductCardGrid;