// hooks/useApiQuery.js
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { useSelector } from "react-redux";

/**
 * Generic GET Query Hook
 */
export function useApiQuery(
  key,
  url,
  { enabled = true, authRequired = false, params = {} } = {}
) {
  const authUser = useSelector((state) => state.auth);

  return useQuery({
    queryKey: [key, params], // caching key
    queryFn: async () => {
      const headers = {};
      if (authRequired && authUser?.token) {
        headers.Authorization = `Bearer ${authUser.token}`;
      }
      const res = await axiosInstance.get(url, { params, headers });
      return res.data;
    },
    enabled,
  });
}

/**
 * Generic Mutation Hook (POST, PUT, DELETE)
 */
export function useApiMutation(method, url, { authRequired = false } = {}) {
  const authUser = useSelector((state) => state.auth);

  return useMutation({
    mutationFn: async (payload) => {
      const headers = {};
      if (authRequired && authUser?.token) {
        headers.Authorization = `Bearer ${authUser.token}`;
      }
      const res = await axiosInstance({
        method,
        url,
        data: payload,
        headers,
      });
      return res.data;
    },
  });
}
