import React from "react";
import { Phone, Mail, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function NeedHelpSection() {
  return (
    <div>
      {/* Need Help */}
      <div className="bg-gray-100 py-8 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6">
          <div>
            <h6 className="mb-1">Need help?</h6>
            <p className="text-sm text-gray-600">
              Contact our Customer Service team, or check our{" "}
              <Link href="#" className="underline">
                FAQs
              </Link>
              .
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Phone className="w-5 h-5 mt-1" />
            <div>
              <span>Call us</span>
              <br />
              <Link href="tel:+97112345678" className="text-sm">
                +971 1 234 5678
              </Link>
              <br />
              <span className="text-xs text-gray-600">
                Mon-Fri: 8am–9pm EST
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Mail className="w-5 h-5 mt-1" />
            <div>
              <span>Email us</span>
              <br />
              <Link href="mailto:help@aayeu.com" className="text-sm">
                help@aayeu.com
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <HelpCircle className="w-5 h-5 mt-1" />
            <div>
              <span>FAQs</span>
              <br />
              <span className="text-sm">
                Find answers in our <Link href="#">FAQs</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
