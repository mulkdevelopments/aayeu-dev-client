"use client";

export default function BenefitsSection() {
  return (
    <section className="relative isolate my-12 w-full bg-white py-10 px-4 md:px-6">
      <div className="mx-auto max-w-[1250px]">
        {/* <h2 className="mb-6 text-2xl font-light tracking-wide">
          Benefits
        </h2> */}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Shipping, Returns and Payments */}
          <div className="h-full rounded-lg border border-gray-200 bg-white transition-all hover:border-black">
            <div className="p-6">
              <h6 className="mb-2 text-sm font-semibold tracking-[0.2em] uppercase text-gray-900">
                Shipping, Returns and Payments
              </h6>
              <p className="text-sm leading-7 text-gray-700">
                Enjoy fast, reliable shipping and easy returns.
                <br />
                Multiple secure payment options available.
                <br />
                Transparent policies for a smooth experience.
              </p>
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="h-full rounded-lg border border-gray-200 bg-white transition-all hover:border-black">
            <div className="p-6">
              <h6 className="mb-2 text-sm font-semibold tracking-[0.2em] uppercase text-gray-900">
                Environmental Impact
              </h6>
              <p className="text-sm leading-7 text-gray-700">
                We use sustainable packaging and shipping methods.
                <br />
                Our products are crafted with eco-friendly materials.
                <br />
                Every purchase supports global green initiatives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
