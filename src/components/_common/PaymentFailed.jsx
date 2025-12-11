"use client";
import Link from "next/link";
import React from "react";

export default function PaymentFailed({ retryLink = "#" }) {
  return (
    <div className="container mx-auto text-center py-10 my-10">
      <img
        src="https://img.icons8.com/?size=96&id=hTfQjGh9UTfg&format=gif"
        alt="Failed"
        className="mx-auto mb-4 w-20 h-20"
      />

      <h2 className="text-4xl font-light">Retry Your Payment</h2>
      <p className="text-gray-600 mb-6">
        Unfortunately, your transaction could not be completed.
        <br />
        Please check your payment details and try again, or use a different
        payment method.
      </p>

      <div className="mt-4">
        <Link
          href={"/cart"}
          className="bg-black text-white px-6 py-2 inline-block hover:bg-gray-800 transition"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
