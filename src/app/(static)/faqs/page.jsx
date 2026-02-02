export default function FAQsPage() {
  const faqs = [
    {
      question: "How do I place an order?",
      answer:
        "Add items to your cart, review your selection, and complete checkout using your preferred payment method.",
    },
    {
      question: "Can I change or cancel my order?",
      answer:
        "If your order has not shipped, contact us as soon as possible and we will do our best to help.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes, we ship to many regions. Shipping options and costs will appear at checkout.",
    },
    {
      question: "How do returns work?",
      answer:
        "Please review our Returns Policy. If eligible, our team will guide you through the return process.",
    },
  ];

  return (
    <div
      className="max-w-5xl mx-auto px-4 md:px-6 py-12"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
        FAQs
      </h1>
      <p className="text-base md:text-lg text-gray-700 mb-8">
        Find quick answers to common questions. Need more help? Email us at
        help@aayeu.com.
      </p>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.question} className="border border-gray-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {faq.question}
            </h2>
            <p className="text-sm text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
