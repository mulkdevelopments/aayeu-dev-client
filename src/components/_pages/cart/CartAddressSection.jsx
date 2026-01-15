"use client";

import React from "react";
import CTAButton from "@/components/_common/CTAButton";
import AddAddressDialog from "@/components/_dialogs/AddAddressDialog";
import AddressCard from "@/components/_cards/AddressCard";

export default function CartAddressSection({
  addresses,
  shippingAddress,
  billingAddress,
  onAddNewAddress,
  onSelectShipping,
  onSelectBilling,
  openAddDialog,
  setOpenAddDialog,
}) {
  return (
    <>
      {/* Shipping Address */}
      <div className="mt-4">
        <div className="flex justify-between items-center">
          <h6 className="text-xl">Shipping Address</h6>
          <AddAddressDialog
            trigger={<CTAButton color="black">+ Add New</CTAButton>}
            onAddressSubmit={onAddNewAddress}
            open={openAddDialog}
            onOpenChange={setOpenAddDialog}
          />
        </div>

        {addresses.length === 0 ? (
          <p className="text-gray-500 mt-2">No addresses found.</p>
        ) : (
          addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              radioMode
              name="shipping"
              selected={shippingAddress === address.id}
              onSelect={() => onSelectShipping(address.id)}
            />
          ))
        )}
      </div>

      {/* Billing Address */}
      <div className="mt-4">
        <h6 className="text-xl">Billing Address</h6>
        {addresses.length === 0 ? (
          <p className="text-gray-500 mt-2">No addresses found.</p>
        ) : (
          addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              radioMode
              name="billing"
              selected={billingAddress === address.id}
              onSelect={() => onSelectBilling(address.id)}
            />
          ))
        )}
      </div>
    </>
  );
}
