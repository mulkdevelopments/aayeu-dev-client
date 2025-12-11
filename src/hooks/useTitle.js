"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const useTitle = () => {
  const pathname = usePathname();

  useEffect(() => {
    const path = pathname.replace(/^\//, "");
    const segments = path.split("/").filter(Boolean);

    let title = "Aayeu";

    if (segments.length > 0) {
      const [mainRoute, subRoute, subSubRoute] = segments;
      
      // Simple mapping
      const routeNames = {
        admin: "Admin",
        pharmacy: "Pharmacy", 
        pathology: "Pathology"
      };

      const pageNames = {
        "": "Dashboard",
        "analytics": "Analytics",
        "users": "Manage Users",
        "medicines": "Manage Medicines",
        "pharmacy": "Manage Pharmacies",
        "pathology": "Manage Pathology",
        "banners": "Manage Banners",
        "offers": "Manage Offers",
        "policies": "Manage Policies",
        "settings": "Settings",
        "cash-management": "Cash Management",
        "payment-management": "Payment Management",
        "manual-assign-orders": "Manual Assign Orders",
        "manage-update-requests": "Manage Update Requests",
        "ambulance-booking": "Ambulance Bookings",
        "insurance": "Insurance Management",
        "nursing-care": "Nursing Care",
        "delivery": "Delivery Management",
        "order-management": "Order Management",
        "prescriptions": "Prescriptions",
        "earnings": "Earnings",
        "guideline": "Guidelines",
        "stock-management": "Stock Management",
        "test": "Test Management",
        "appointments": "Appointments",
        "patients": "Patients",
        "reports": "Reports",
        "guidelines": "Guidelines",
        "best-selling": "Best Selling",
        "featured-products": "Featured Products",
        "special-offers": "Special Offers",
        "delivery-partner": "Delivery Partner",
        "delivery-partner-orders": "Delivery Partner Orders",
        "pharmacy-orders": "Pharmacy Orders",
        "pathology-orders": "Pathology Orders",
        "create-invoice": "Create Invoice"
      };

      if (mainRoute && routeNames[mainRoute]) {
        if (subRoute && pageNames[subRoute]) {
          if (subSubRoute && pageNames[subSubRoute]) {
            title = `Medlivurr - ${routeNames[mainRoute]} - ${pageNames[subRoute]} - ${pageNames[subSubRoute]}`;
          } else {
            title = `Medlivurr - ${routeNames[mainRoute]} - ${pageNames[subRoute]}`;
          }
        } else {
          title = `Medlivurr - ${routeNames[mainRoute]} - Dashboard`;
        }
      } else {
        title = `Medlivurr - ${mainRoute ? mainRoute.charAt(0).toUpperCase() + mainRoute.slice(1) : "Dashboard"}`;
      }
    } else {
      title = "Medlivurr - Dashboard";
    }

    document.title = title;
  }, [pathname]);
}; 