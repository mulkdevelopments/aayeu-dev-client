"use client";

import React from "react";
import CTAButton from "../_common/CTAButton";

function SavedCard({ card, onRemove }) {
  return (
    <div className="bg-white border-l-4 border-yellow-700 p-5 relative">
      {/* Remove Button */}
      <div className="absolute top-5 right-5">
        <CTAButton
          variant="outline"
          color="danger"
          onClick={() => onRemove(card)}
        >
          Remove
        </CTAButton>
      </div>

      {/* Card Info */}
      <div className="flex justify-between items-center">
        <div>
          <div className="font-light text-lg">{card.number}</div>
          <small className="text-sm text-gray-500">
            {card.type} | Exp: {card.exp}
          </small>
        </div>
      </div>
    </div>
  );
}

export default SavedCard;
