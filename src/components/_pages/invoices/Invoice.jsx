"use client";

import CTAButton from "@/components/_common/CTAButton";
import React from "react";

// ✅ Reusable row component for table
const InvoiceRow = ({ description, qty, price }) => {
  const total = qty * price;
  return (
    <tr className="border-b">
      <td className="px-4 py-2">{description}</td>
      <td className="px-4 py-2 text-center">{qty}</td>
      <td className="px-4 py-2 text-right">AED {price.toFixed(2)}</td>
      <td className="px-4 py-2 text-right">AED {total.toFixed(2)}</td>
    </tr>
  );
};

export default function Invoice() {
  const items = [
    { description: "Product A", qty: 2, price: 499.0 },
    { description: "Product B", qty: 1, price: 799.0 },
    { description: "Service X", qty: 3, price: 299.0 },
  ];

  const subtotal = items.reduce((acc, i) => acc + i.qty * i.price, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg p-8 my-8 print:shadow-none print:p-0">
      {/* Header */}
      <header className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">INVOICE</h1>
          <p className="text-sm text-gray-600">Invoice #: 12345</p>
          <p className="text-sm text-gray-600">Date: 26 Sept 2025</p>
        </div>
        <div>
          <img
            src="https://placehold.co/150x50?text=Logo"
            alt="Company Logo"
            className="h-12 object-contain"
          />
        </div>
      </header>

      {/* Company & Client Info */}
      <section className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="font-semibold">From</h2>
          <p>My Company Pvt Ltd</p>
          <p>123 Street, City</p>
          <p>Email: info@company.com</p>
        </div>
        <div>
          <h2 className="font-semibold">Bill To</h2>
          <p>John Doe</p>
          <p>456 Avenue, City</p>
          <p>Email: john@example.com</p>
        </div>
      </section>

      {/* Items Table */}
      <table className="w-full border border-gray-300 mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-center">Qty</th>
            <th className="px-4 py-2 text-right">Price</th>
            <th className="px-4 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i, idx) => (
            <InvoiceRow key={idx} {...i} />
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-1/3">
          <div className="flex justify-between py-1">
            <span>Subtotal</span>
            <span>AED {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Tax (18%)</span>
            <span>AED {tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t mt-2 pt-2">
            <span>Total</span>
            <span>AED {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Barcode */}
      <section className="mb-6">
        <h2 className="font-semibold mb-1">Notes</h2>
        <p className="text-sm text-gray-600">
          Thank you for your business. Please make the payment within 7 days.
        </p>
      </section>

      <div className="flex justify-between items-center">
        <div id="barcode" className="text-gray-500 text-sm">
          {/* Placeholder barcode */}
          ||| ||| |||
        </div>
        <CTAButton onClick={() => window.print()}>Print Invoice</CTAButton>
      </div>
    </div>
  );
}
