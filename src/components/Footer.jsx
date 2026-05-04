import React from "react";
import SocialLinks from "./others/SocialLinks";
/**
 * Footer
 * - Responsive 4-column footer matching the provided design.
 * - Uses your semantic utilities: bg-primary-gradient / bg-primary / bg-neutral,
 *   text-heading, text-body, text-hover, bg-accent, etc.
 * - Accessible: landmarks, aria labels, keyboard-focus styles.
 *
 * Usage: <Footer />
 */

export default function Footer() {
  return (
    <footer className="bg-primary dark:bg-secondary text-heading transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand + Description */}
          <div>
            <a href="/" className="inline-flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-accent text-heading font-heading">
                <img
                  src="https://kafjvkvzsdkofnzevohc.supabase.co/storage/v1/object/public/gsl/logo/gsl_logo.png" // 🔗 Replace with your own logo URL
                  alt="Company Logo"
                  className="w-10 h-10 rounded-full object-contain"
                />
              </div>
              <span className="sr-only">Grupo Sourcing Ltd.</span>
            </a>

            <p className="text-sm text-body max-w-sm">
              We are specialized in Knitwear, Sweater and Woven items. All are
              composite top class factories with all modern facilities and
              internationally certified.
            </p>

           <SocialLinks />

          </div>

          {/* Column 2: Get Started */}
          <nav aria-label="Get started" className="flex flex-col gap-2">
            <h3 className="text-sm font-heading mb-2">Get Started</h3>
            <a
              href="services/knit"
              className="text-body text-sm hover:text-hover hover:underline"
            >
              Knit Showroom
            </a>
            <a
              href="/services/woven"
              className="text-body text-sm hover:text-hover hover:underline"
            >
              Woven Showroom
            </a>
            <a
              href="/services/sample"
              className="text-body text-sm hover:text-hover hover:underline"
            >
              Sample Section
            </a>
            <a
              href="/services/merchandising"
              className="text-body text-sm hover:text-hover hover:underline"
            >
             Merchandising
            </a>
          </nav>

          {/* Column 3: About */}
          <nav aria-label="About" className="flex flex-col gap-2">
            <h3 className="text-sm font-heading mb-2">About</h3>
            <a
              href="contact"
              className="text-body text-sm hover:text-hover hover:underline"
            >
              Contact
            </a>
            <a
              href="#"
              className="text-body text-sm hover:text-hover hover:underline"
            >
              Clients
            </a>
            <a
              href="compliance"
              className="text-body text-sm hover:text-hover hover:underline"
            >
              Compliance & Ethics
            </a>
          
          </nav>

          {/* Column 4: Locate Us */}
          <address className="not-italic text-sm text-body space-y-2">
            <h3 className="text-sm font-heading mb-2">Locate Us</h3>

            <p className="text-body text-sm">
             House 256, Road: 03 (East Side) DOHS
Baridhara, Dhaka-1206, Bangladesh 
            </p>

            <p className="text-body text-sm">
              <a
                href="mailto:zamal@gruposourcing.com"
                className="hover:text-hover hover:underline"
              >
                zamal@gruposourcing.com
              </a>
            </p>

            <p className="text-body text-sm">
              <a
                href="tel:+8801711556131"
                className="hover:text-hover hover:underline"
              >
                +88 01711556131
              </a>
            </p>

            <p className="text-body text-sm">
              <a
                href="tel:+8801711556131"
                className="hover:text-hover hover:underline"
              >
                +88 01711556131
              </a>
            </p>
          </address>
        </div>

        <div className="mt-10 border-t border-accent pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-body">
            &copy; {new Date().getFullYear()} GRUPOSOURCINGLTD. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-sm text-body hover:text-hover hover:underline"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-body hover:text-hover hover:underline"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
