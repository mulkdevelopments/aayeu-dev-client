"use client";

import React from "react";
import {
  Heart,
  CreditCard,
  Wallet,
  Home,
  Ticket,
  Package,
  EditIcon,
} from "lucide-react";
import Link from "next/link";
import CTAButton from "@/components/_common/CTAButton";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";

function ProfileOverviewPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/auth?type=signin";
    // router.push("/auth?type=signin");
  };

  const profileCards = [
    {
      title: "Orders",
      desc: "Check your order status",
      icon: <Package className="w-8 h-8 text-gray-700" />,
      path: "/orders",
      isActive: true,
    },
    {
      title: "Wishlist",
      desc: "Your curated product collections",
      icon: <Heart className="w-8 h-8 text-gray-700" />,
      path: "/wishlists",
      isActive: true,
    },
    {
      title: "Saved Cards",
      desc: "Faster checkout experience",
      icon: <CreditCard className="w-8 h-8 text-gray-700" />,
      path: "/saved-cards",
      isActive: false,
    },
    {
      title: "Wallets",
      desc: "View saved wallets",
      icon: <Wallet className="w-8 h-8 text-gray-700" />,
      path: "/saved-wallets",
      isActive: false,
    },
    {
      title: "Addresses",
      desc: "Save multiple addresses",
      icon: <Home className="w-8 h-8 text-gray-700" />,
      path: "/addresses",
      isActive: true,
    },
    {
      title: "Coupons",
      desc: "Manage discount coupons",
      icon: <Ticket className="w-8 h-8 text-gray-700" />,
      path: "/coupons",
      isActive: false, // ⛔ hidden, but still in code
    },
  ];

  return (
    <div className="bg-white border p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6 mb-6">
        {/* Left section — profile info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
          {/* Profile Image */}
          <div className="relative shrink-0">
            <img
              src={`https://placehold.co/80x80?text=${
                user.full_name || "User"
              }`}
              alt="Profile"
              className="w-20 h-20 rounded-full border object-cover"
            />
            <label
              htmlFor="profileImageInput"
              className="absolute bottom-0 right-0 bg-white border rounded-full w-7 h-7 flex items-center justify-center cursor-pointer shadow-sm"
            >
              <EditIcon className="w-4 h-4 text-gray-600" />
            </label>
            <input type="file" id="profileImageInput" className="hidden" />
          </div>

          {/* Name + Email */}
          <div className="text-center sm:text-left">
            {user.full_name && (
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                {user.full_name}
              </h2>
            )}
            {user.email && (
              <p className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-none">
                {user.email}
              </p>
            )}
          </div>
        </div>

        {/* Edit Button */}
        <div className="w-full sm:w-auto flex justify-center sm:justify-end">
          <CTAButton
            color="black"
            onClick={() => router.push("/profile")}
            className="w-full sm:w-auto"
          >
            Edit Profile
          </CTAButton>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profileCards
          .filter((card) => card.isActive)
          .map((card) => (
            <Link href={card.path} key={card.title} passHref>
              <div className="border p-5 flex flex-col items-center text-center hover:bg-gray-50 transition">
                <span className="text-2xl">{card.icon}</span>
                <h6 className="mt-2 font-medium text-gray-700">
                  {card.title}
                </h6>
                <p className="text-sm text-gray-500">{card.desc}</p>
              </div>
            </Link>
          ))}
      </div>

      <div className="mt-6 text-center">
        <CTAButton color="black" onClick={handleLogout}>
          Logout
        </CTAButton>
      </div>
    </div>
  );
}

export default ProfileOverviewPage;
