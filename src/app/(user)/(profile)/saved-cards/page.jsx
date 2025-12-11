"use client";

import SavedCard from "@/components/_cards/SavedCard";
import CTAButton from "@/components/_common/CTAButton";
import AddCardDialog from "@/components/_dialogs/AddCardDialog";
import React from "react";

function SavedCardsPage() {
  const cards = [
    { number: "•••• •••• •••• 1234", type: "VISA", exp: "08/26" },
    { number: "•••• •••• •••• 5678", type: "Mastercard", exp: "01/27" },
  ];

  const handleRemove = (card) => {
    if (process.env.NODE_ENV === "development") {
      console.log("Remove clicked for:", card);
    }
    // Add API call or state update logic here
  };

  return (
    <div className="max-w-[1250px] mx-auto">
      {/* Header */}
      <div className="bg-white border p-4 mb-3">
        <h5 className="font-light text-lg mb-0">Saved Cards</h5>
      </div>

      <div className="my-4">
        <AddCardDialog />
      </div>

      {/* Saved Card Entries */}
      <div className="space-y-4">
        {cards.map((card, idx) => (
          <SavedCard key={idx} card={card} onRemove={handleRemove} />
        ))}
      </div>
    </div>
  );
}

export default SavedCardsPage;
