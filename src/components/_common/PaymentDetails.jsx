"use client";
import Link from "next/link";
import React from "react";

export default function PaymentDetails({
  orderSummary = [
    { label: "Subtotal", value: "$100.00" },
    { label: "Tax", value: "$8.00" },
    { label: "Shipping", value: "$5.00" },
    { label: "Total", value: "$113.00" },
  ],
  customer = {
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
  },
  payment = {
    method: "Credit Card",
    status: "Paid",
    transactionId: "TXN123456",
  },
  continueLink = "#",
}) {
  return (
    <div className="container mx-auto my-10">
      <div className="bg-white p-6 shadow rounded">
        <h1 className="text-center mb-8 text-3xl font-light">
          Payment Details
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div>
            <h4 className="font-light">Order Summary</h4>
            <hr className="my-2" />
            {orderSummary.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between mb-3 text-gray-600"
              >
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Customer Details */}
          <div>
            <h4 className="font-light">Customer Details</h4>
            <hr className="my-2" />
            {Object.entries(customer).map(([label, value], idx) => (
              <div
                key={idx}
                className="flex justify-between mb-3 text-gray-600"
              >
                <span>{label}:</span>
                <span className="text-right">{value}</span>
              </div>
            ))}
          </div>

          {/* Payment Details */}
          <div>
            <h4 className="font-light">Payment Details</h4>
            <hr className="my-2" />
            {Object.entries(payment).map(([label, value], idx) => (
              <div
                key={idx}
                className="flex justify-between mb-3 text-gray-600"
              >
                <span>{label}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center mt-6">
          <Link
            href={continueLink}
            className="bg-black text-white px-6 py-2 inline-block hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
