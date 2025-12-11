"use client";

import AddressCard from "@/components/_cards/AddressCard";
import CTAButton from "@/components/_common/CTAButton";
import AddAddressDialog from "@/components/_dialogs/AddAddressDialog";
import AddressForm from "@/components/_pages/addresses/AddressForm";
import useAxios from "@/hooks/useAxios";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

function AddressesPage() {
  const router = useRouter();
  const action = useSearchParams().get("action") || null;
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const { request: getAllAddresses, loading: addressesLoading } = useAxios();
  const { request: deleteAddress } = useAxios();

  // ✅ Fetch all addresses
  const fetchAddresses = async () => {
    const { data, error } = await getAllAddresses({
      url: `/users/get-addresses`,
      method: "GET",
      authRequired: true,
    });

    if (error) {
      console.error("Error fetching addresses:", error);
    } else {
      const payload = data?.data ?? data ?? [];
      setAddresses(payload);
    }
  };

  // ✅ Refetch whenever we come back from "add" action
  useEffect(() => {
    if (!action) fetchAddresses();
  }, [action]); // 👈 triggers when `action` changes (like coming back from add)

  // ✅ Show Add Address Form
  if (action === "add") {
    return <AddressForm onSuccess={() => router.back()} />;
  }

  // ✅ Show Edit Address Form
  if (action === "edit") {
    return (
      <AddressForm
        onSuccess={() => router.push("/addresses")}
        address={selectedAddress}
      />
    );
  }

  const handleEditAddress = (address) => {
    setSelectedAddress(address);
    router.push(`/addresses?action=edit&id=${address.id}`);
  };

  const handleDeleteAddress = async (address) => {
    const { data, error } = await deleteAddress({
      url: `/users/delete-address`,
      method: "PUT",
      authRequired: true,
      payload: { address_id: address.id },
    });

    if (error) {
      console.error("Error deleting address:", error);
    } else {
      setAddresses(addresses.filter((addr) => addr.id !== address.id));
    }
  };

  return (
    <div className="max-w-[1250px] mx-auto">
      {/* Header */}
      <div className="bg-white border p-4 mb-3">
        <h5 className="font-light text-lg mb-0">My Addresses</h5>
      </div>

      {/* Add New Address */}
      <div className="flex justify-end mt-6 mb-3">
        <CTAButton
          as="button"
          color="gold"
          onClick={() => router.push("/addresses?action=add")}
        >
          + Add New Address
        </CTAButton>
      </div>

      {/* Address Cards */}
      <div className="space-y-6">
        {addressesLoading && (
          <div className="bg-white border p-5">
            <p className="mb-0">Loading...</p>
          </div>
        )}
        {addresses.length > 0 &&
          addresses.map((addr, idx) => (
            <AddressCard
              key={addr.id || idx}
              address={addr}
              onEdit={() => handleEditAddress(addr)}
              onDelete={() => handleDeleteAddress(addr)}
            />
          ))}

        {addresses.length === 0 && !addressesLoading && (
          <div className="bg-white border p-5">
            <p className="mb-0">No addresses found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddressesPage;
