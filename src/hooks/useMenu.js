import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import useAxios from "@/hooks/useAxios";
import { setMenu } from "@/store/slices/menuSlice";

const CACHE_TIME = 1000 * 60 * 10; // 10 minutes

export default function useMenu() {
  const dispatch = useDispatch();
  const { request } = useAxios();
  const { menu, timestamp } = useSelector((state) => state.menu);

  const fetchMenu = useCallback(
    async ({ force = false } = {}) => {
      const isFresh =
        timestamp && Date.now() - timestamp < CACHE_TIME && !force;

      if (isFresh) {
        return { cached: true, data: menu };
      }

      try {
        const { data } = await request({
          url: "/users/get-our-menubar",
          method: "GET",
        });

        const arr = data?.data || [];
        dispatch(setMenu(arr));

        return { cached: false, data: arr };
      } catch (err) {
        console.error("Failed to load menu:", err);
        return { error: err };
      }
    },
    [request, menu, timestamp, dispatch]
  );

  return {
    menu,
    fetchMenu,
  };
}
