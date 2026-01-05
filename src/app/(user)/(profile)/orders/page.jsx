"use client";

import OrderCard from "@/components/_cards/OrderCard";
import useAxios from "@/hooks/useAxios";
import React, { useEffect, useState } from "react";

export default function OrdersPage() {
  const { request: getOrders, loading } = useAxios();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const { data, error } = await getOrders({
      url: "/users/get-paid-orders?order_status=all",
      method: "GET",
      authRequired: true,
    });

    if (error) {
      console.error("❌ Error fetching orders:", error);
      setOrders([]);
      return;
    }

    setOrders(data?.data?.orders || []);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="col-span-9">
      {/* Header */}
      <div className="bg-white p-4 border mb-3">
        <h5 className="second-level mb-0">Orders & Return</h5>
      </div>

      {/* Orders */}
      <div className="my-5 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
}
