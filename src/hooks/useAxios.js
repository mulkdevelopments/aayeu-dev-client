"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice"; // ✅ Ensure you have this action
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { showToast } from "@/providers/ToastProvider";

/**
 * useAxios - A robust custom Axios hook with auth, error handling & auto logout on 401.
 */
export default function useAxios() {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [errorData, setErrorData] = useState(null);

  /**
   * Make API requests with better flexibility.
   *
   * @param {object} options - Request options
   * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param {string} options.url - API endpoint
   * @param {object|FormData} [options.payload] - Request payload (optional)
   * @param {boolean} [options.authRequired=false] - Whether to include token
   * @param {object} [options.headers={}] - Custom headers
   * @param {object} [options.params={}] - Query params for GET requests
   *
   * @returns {Promise<{ data: any, error: string | null, errorData: any }>}
   */
  const request = async ({
    method,
    url,
    payload = null,
    authRequired = false,
    headers = {},
    params = {},
  }) => {
    setLoading(true);
    setError(null);
    setErrorData(null);

    try {
      const requestHeaders = { ...headers };

      // ✅ Handle Content-Type dynamically
      if (payload instanceof FormData) {
        delete requestHeaders["Content-Type"]; // Let browser set it
      } else if (payload && typeof payload === "object") {
        requestHeaders["Content-Type"] = "application/json";
      }

      // ✅ Add auth token
      if (authRequired && token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }

      const axiosConfig = {
        method,
        url,
        headers: requestHeaders,
        ...(method === "GET" || method === "DELETE"
          ? { params }
          : { data: payload }),
      };

      const response = await axiosInstance(axiosConfig);

      setData(response.data);
      return { data: response.data, error: null, errorData: null };
    } catch (err) {
      // ✅ Extract details safely
      const status = err.response?.status;
      const responseData = err.response?.data || null;
      const message =
        responseData?.message || "Something went wrong. Please try again.";

      // ✅ Handle 401 globally (session expired / invalid token)
      if (status === 401) {
        dispatch(logout());
        // showToast("error", "Session expired. Please log in again.", "error");
        router.replace("/auth?type=signin");
      }

      setError(message);
      setErrorData(responseData);
      return { data: null, error: message, errorData: responseData };
    } finally {
      setLoading(false);
    }
  };

  return { request, loading, data, error, errorData };
}
