import React from "react";
import { Phone, Mail, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function NeedHelpSection() {
  return (
    <div>
      {/* Need Help */}
      <div className="bg-gray-100 py-8 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6">
          
          <Link
            href="mailto:help@aayeu.com"
            className="flex items-start gap-2 hover:text-black transition-colors"
          >
            <Mail className="w-5 h-5 mt-1" />
            <div>
              <span>Need help?</span>
              <br />
              <span className="text-sm">help@aayeu.com</span>
            </div>
          </Link>

          <Link
            href="/faqs"
            className="flex items-start gap-2 hover:text-black transition-colors"
          >
            <HelpCircle className="w-5 h-5 mt-1" />
            <div>
              <span>FAQs</span>
              <br />
              <span className="text-sm">Find answers in our FAQs</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
