export default function HowToShopPage() {
  return (
    <div
      className="max-w-5xl mx-auto px-4 md:px-6 py-12"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
        How to Shop
      </h1>
      <p className="text-base md:text-lg text-gray-700 mb-8">
        Discover curated luxury and shop with confidence. Follow these simple
        steps to find, select, and purchase your items.
      </p>

      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            1. Browse Collections
          </h2>
          <p className="text-sm text-gray-600">
            Explore categories, use filters, and discover brands across our
            curated selection.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            2. Select Your Item
          </h2>
          <p className="text-sm text-gray-600">
            Choose size, color, and quantity on the product page. Review
            product details and images before adding to cart.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            3. Checkout Securely
          </h2>
          <p className="text-sm text-gray-600">
            Proceed to cart, confirm your order details, and complete payment
            using our secure checkout.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            4. Track Your Order
          </h2>
          <p className="text-sm text-gray-600">
            After purchase, track your order status in your account and watch
            for delivery updates.
          </p>
        </div>
      </div>
    </div>
  );
}
