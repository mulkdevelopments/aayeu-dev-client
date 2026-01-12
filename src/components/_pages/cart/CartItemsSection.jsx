"use client";

import CartItemCard from "@/components/_cards/CartItemCard";
import React from "react";
import { useSelector } from "react-redux";
import { selectCartItems } from "@/store/selectors/cartSelectors";
import useCart from "@/hooks/useCart";

export default function CartItemsSection({ liveStockMap, stockCheckLoading }) {
  const cartItems = useSelector(selectCartItems);
  const { updateQty, removeItem } = useCart();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const handleQtyChange = async (cartItemId, newQty) => {
    await updateQty({
      cart_item_id: cartItemId,
      newQty,
      isAuthenticated,
    });
  };

  const handleRemoveItem = async (cartItemId) => {
    await removeItem({
      cart_item_id: cartItemId,
      isAuthenticated,
    });
  };

  return (
    <div className="lg:col-span-2">
      <h2 className="text-2xl font-light mb-4">Shopping Bag</h2>

      {!cartItems.length ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        cartItems.map((item) => (
          <CartItemCard
            key={item.cart_item_id}
            product={{
              ...item,
              price: item.variant_price,
              qty: item.qty,
              stock: item.stock,
              images: item.images,
            }}
            liveStockData={liveStockMap[item.cart_item_id]}
            stockCheckLoading={stockCheckLoading}
            onQtyChange={(newQty) => handleQtyChange(item.cart_item_id, newQty)}
            onRemove={() => handleRemoveItem(item.cart_item_id)}
          />
        ))
      )}
    </div>
  );
}
