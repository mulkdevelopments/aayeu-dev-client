import PaymentFailed from "@/components/_common/PaymentFailed";
import React from "react";

function StripeCheckoutCancelled() {
  return (
    <div>
      <PaymentFailed />
    </div>
  );
}

export default StripeCheckoutCancelled;
