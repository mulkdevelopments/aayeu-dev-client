export const defaultSEO = {
  siteName: "AAYEU powered by FashionTV",
  baseUrl: "https://aayeu.com",

  // Title formatting
  titleTemplate: "%s | AAYEU powered by FashionTV",
  title: "AAYEU powered by FashionTV | Defining Luxury and Quality",
  description: "AAYEU powered by FashionTV — Defining luxury and quality. Designer fashion and lifestyle ecommerce for men and women.",

  // Defaults
  defaultImage: "/seo/default-og.png",
  keywords: "AAYEU, FashionTV, Luxury, Quality, Designer Fashion, Ecommerce, Online Shopping",
  type: "website",
  robots: "index, follow",

  // Structured data (global)
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AAYEU powered by FashionTV | Defining Luxury and Quality",
    url: "https://aayeu.com",
  },
};

export const routeSEO = {
  "/": {
    title: "AAYEU powered by FashionTV | Defining Luxury and Quality",
    description: "AAYEU powered by FashionTV — Defining luxury and quality. Shop designer fashion and lifestyle with fast delivery.",
    type: "website",
  },

  "/categories": {
    title: "All Categories",
    description: "Browse all shopping categories on AAYEU powered by FashionTV.",
    type: "collection",
  },

  "/contact": {
    title: "Contact Us",
    description: "Get in touch with AAYEU powered by FashionTV customer support.",
    type: "website",
    robots: "index, follow",
  },

  "/terms-and-conditions": {
    title: "Terms and Conditions",
    description: "Read the terms and conditions of using AAYEU powered by FashionTV.",
    type: "legal",
  },

  "/privacy-policy": {
    title: "Privacy Policy",
    description: "Learn about how AAYEU protects your privacy.",
    type: "legal",
  },

  "/shipping-policy": {
    title: "Shipping Policy",
    description: "Understand AAYEU's shipping policies and procedures.",
    type: "legal",
  },

  "/payment-policy": {
    title: "Payment Policy",
    description: "Know more about payment options and policies at AAYEU.",
    type: "legal",
  },

  "/refund-policy": {
    title: "Refund Policy",
    description: "Learn about AAYEU's refund and cancellation policies.",
    type: "legal",
  },

  // Example for future scalability
  "/blog": {
    title: "Blog",
    description: "Read guides, tips, and ecommerce insights from AAYEU powered by FashionTV.",
    type: "article-list",
  },
};
