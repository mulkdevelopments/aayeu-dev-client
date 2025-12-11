// /hooks/usePolicies.js
"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import useAxios from "@/hooks/useAxios";
import { setPolicy, setPolicies } from "@/store/slices/policiesSlice";

const CACHE_TIME = 1000 * 60 * 60; // 1 hour

export default function usePolicies() {
  const dispatch = useDispatch();
  const { request } = useAxios();

  const { policies, timestamps } = useSelector((state) => state.policies);

  /* -------------------------------------------------------
     Fetch ALL policies (cached for 1 hour)
  ------------------------------------------------------- */
  const fetchAllPolicies = useCallback(
    async ({ force = false } = {}) => {
      const last = timestamps?.all;

      const shouldUseCache = !force && last && Date.now() - last < CACHE_TIME;

      if (shouldUseCache) {
        return { cached: true, data: policies };
      }

      const { data, error } = await request({
        url: "/users/get-policies",
        method: "GET",
      });

      if (error) return { error };

      const arr = data?.data?.policies ?? [];

      // Normalize into map: { terms: {...}, privacy: {...} }
      const mapped = {};
      arr.forEach((p) => {
        mapped[p.policy_type] = p;
      });

      dispatch(setPolicies(mapped));

      return { data: mapped };
    },
    [request, policies, timestamps, dispatch]
  );

  /* -------------------------------------------------------
     Fetch SINGLE policy (fallback)
  ------------------------------------------------------- */
  const fetchPolicy = useCallback(
    async (type, { force = false } = {}) => {
      const last = timestamps?.[type];

      const shouldUseCache = !force && last && Date.now() - last < CACHE_TIME;

      if (policies[type] && shouldUseCache) {
        return { cached: true, data: policies[type] };
      }

      const { data, error } = await request({
        url: "/users/get-policies",
        method: "GET",
        params: { policy_type: type },
      });

      if (error) return { error };

      const policy = data?.data?.policy ?? null;

      if (policy) {
        dispatch(setPolicy({ type, data: policy }));
      }

      return { data: policy };
    },
    [request, policies, timestamps, dispatch]
  );

  /* -------------------------------------------------------
     ⭐ UNIVERSAL HELPERS
  ------------------------------------------------------- */

  // Ensures a policy is loaded with the minimum API calls possible
  const ensurePolicyLoaded = useCallback(
    async (type) => {
      // 1) First try global cache
      const globalHas = policies[type];
      const globalFresh =
        timestamps?.all && Date.now() - timestamps.all < CACHE_TIME;

      if (globalHas && globalFresh) {
        return { data: globalHas, cached: true };
      }

      // 2) Try loading all policies once
      const all = await fetchAllPolicies();
      if (all?.data?.[type]) {
        return { data: all.data[type] };
      }

      // 3) Fallback: fetch specific policy
      const single = await fetchPolicy(type);
      return { data: single.data };
    },
    [policies, timestamps, fetchAllPolicies, fetchPolicy]
  );

  return {
    policies,
    ensurePolicyLoaded,
    fetchAllPolicies,
    fetchPolicy,
  };
}
