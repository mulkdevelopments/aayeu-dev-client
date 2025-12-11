export const defaultSEO = {
  siteName: "Aayeu Ecommerce",
  baseUrl: "https://aayeu.com",

  // Title formatting
  titleTemplate: "%s | Aayeu",
  title: "Aayeu Ecommerce",
  description: "Aayeu - Best Ecommerce Shopping Experience",

  // Defaults
  defaultImage: "/seo/default-og.png",
  keywords: "Aayeu, Ecommerce, Online Shopping, Buy Products Online",
  type: "website",
  robots: "index, follow",

  // Structured data (global)
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Aayeu Ecommerce",
    url: "https://aayeu.com",
  },
};

export const routeSEO = {
  "/": {
    title: "Online Shopping Made Easy",
    description: "Shop the latest products with fast delivery on Aayeu.",
    type: "website",
  },

  "/categories": {
    title: "All Categories",
    description: "Browse all shopping categories on Aayeu.",
    type: "collection",
  },

  "/contact": {
    title: "Contact Us",
    description: "Get in touch with Aayeu customer support.",
    type: "website",
    robots: "index, follow",
  },

  "/terms-and-conditions": {
    title: "Terms and Conditions",
    description: "Read the terms and conditions of using Aayeu.",
    type: "legal",
  },

  "/privacy-policy": {
    title: "Privacy Policy",
    description: "Learn about how Aayeu protects your privacy.",
    type: "legal",
  },

  "/shipping-policy": {
    title: "Shipping Policy",
    description: "Understand Aayeu's shipping policies and procedures.",
    type: "legal",
  },

  "/payment-policy": {
    title: "Payment Policy",
    description: "Know more about payment options and policies at Aayeu.",
    type: "legal",
  },

  "/refund-policy": {
    title: "Refund Policy",
    description: "Learn about Aayeu's refund and cancellation policies.",
    type: "legal",
  },

  // Example for future scalability
  "/blog": {
    title: "Aayeu Blog",
    description: "Read guides, tips, and ecommerce insights.",
    type: "article-list",
  },
};
