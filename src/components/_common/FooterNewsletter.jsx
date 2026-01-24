import NewsletterForm from "../_pages/home/NewsletterForm";

export default function FooterNewsletter() {
  return (
    <section className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-light text-gray-900 mb-2">
              Never miss a thing
            </h3>
            <p className="text-sm text-gray-700">
              Sign up for promotions, tailored new arrivals, stock updates and more — straight to your inbox.
            </p>
          </div>
          <div className="lg:col-span-1">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-900 mb-3">
              Get updates by
            </p>
            <NewsletterForm />
            <p className="text-xs text-gray-700 mt-3">
              By signing up, you consent to receiving marketing by email. You can unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
