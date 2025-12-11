// config/routes.js
const routesConfig = {
  "/admin": {
    title: "Admin Dashboard",
    subtitle: "Overview of system activities",
    crumbs: [{ label: "Home", href: "/admin" }],
  },
  "/admin/staff": {
    title: "Staff Management",
    subtitle: "Manage, add, or remove staff",
    crumbs: [
      { label: "Home", href: "/admin" },
      { label: "Staff Management", href: "/admin/staff" },
    ],
    queryMap: {
      action: {
        add: "Add",
        edit: "Edit",
      },
    },
    paramsMap: {
      id: "Staff Details",
    },
  },

  "/admin/students": {
    title: "Student Management",
    subtitle: "Manage, add, or remove users",
    crumbs: [
      { label: "Home", href: "/admin" },
      { label: "Students", href: "/admin/students" },
    ],
    queryMap: {
      action: {
        add: "Add",
        edit: "Edit",
      },
    },
    paramsMap: {
      id: "Student Details",
    },
  },
  "/admin/reports": {
    title: "Reports",
    subtitle: "View and download reports",
    crumbs: [{ label: "Home", href: "/admin" }, { label: "Reports" }],
  },
  "/admin/bookings": {
    title: "Bookings",
    subtitle: "View and manage turf bookings",
    crumbs: [{ label: "Home", href: "/admin" }, { label: "Bookings" }],
  },
  "/admin/fees": {
    title: "Fees Management",
    subtitle: "Manage, add, or remove fees",
    crumbs: [{ label: "Home", href: "/admin" }, { label: "Fees" }],
  },
  "/admin/hostel": {
    title: "Hostel Management",
    subtitle: "Manage, add, or remove hostels",
    crumbs: [{ label: "Home", href: "/admin" }, { label: "Hostels" }],
  },
  "/admin/turf": {
    title: "Turf Management",
    subtitle: "Manage, add, or remove turfs",
    crumbs: [{ label: "Home", href: "/admin" }, { label: "Turf" }],
  },
  "/admin/settings": {
    title: "Settings",
    subtitle: "Manage application preferences",
    crumbs: [{ label: "Home", href: "/admin" }, { label: "Settings" }],
  },
  "/admin/settings/manage-fee-plans": {
    title: "Fee Plans",
    subtitle: "Manage tuition and fee structures for students.",
    crumbs: [
      { label: "Home", href: "/admin" },
      { label: "Settings", href: "/admin/settings" },
      { label: "Fee Plans" },
    ],
  },
  "/admin/settings/manage-dress-plans": {
    title: "Dress Plans",
    subtitle: "Manage uniforms or dress codes for students.",
    crumbs: [
      { label: "Home", href: "/admin" },
      { label: "Settings", href: "/admin/settings" },
      { label: "Dress Plans" },
    ],
  },
};

export default routesConfig;
