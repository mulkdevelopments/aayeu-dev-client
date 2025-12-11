import { useDispatch, useSelector } from "react-redux";
import useAxios from "@/hooks/useAxios";
import { showToast } from "@/providers/ToastProvider";
import { setWishlist, addWish, removeWish } from "@/store/slices/wishlistSlice";

export default function useWishlist() {
  const dispatch = useDispatch();
  const { request, loading } = useAxios();

  const items = useSelector((s) => s.wishlist.items);

  /* -----------------------------------------------
      Fetch wishlist
  ------------------------------------------------ */
  const fetchWishlist = async () => {
    const { data, error } = await request({
      url: "/users/get-wishlist",
      method: "GET",
      authRequired: true,
    });

    if (error) return;
    dispatch(setWishlist(data?.data || []));
  };

  /* -----------------------------------------------
      Toggle wish (optimistic update)
  ------------------------------------------------ */
  const toggleWishlist = async (product_id) => {
    const exists = items.some((i) => i.product_id === product_id);

    // Optimistic update
    if (exists) {
      dispatch(removeWish(product_id));
    } else {
      dispatch(addWish({ product_id }));
    }

    const { data, error } = await request({
      url: exists
        ? `/users/remove-from-wishlist?product_id=${product_id}`
        : `/users/add-to-wishlist`,
      method: exists ? "DELETE" : "POST",
      payload: exists ? null : { product_id },
      authRequired: true,
    });

    // Rollback on error
    if (error) {
      if (exists) dispatch(addWish({ product_id }));
      else dispatch(removeWish(product_id));
      return;
    }

    if (data?.status === 200) {
      showToast("success", data.message);
    }
  };

  return {
    items,
    loading, // coming from useAxios
    fetchWishlist,
    toggleWishlist,
    isWishlisted: (id) => items.some((i) => i.product_id === id),
  };
}
