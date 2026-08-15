"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { InstagramIcon, Facebook02Icon, WhatsappIcon, MapsLocation01Icon, PhoneCall, Clock01Icon } from "@hugeicons/core-free-icons";

export function Footer() {
  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-zinc-900 text-zinc-300 border-t border-zinc-800 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">

        {/* Main Grid */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 border-b border-zinc-800 pb-12">

          {/* Col 1 - Brand Info */}
          <div className="space-y-4">
            <span className="font-heading text-xl md:text-2xl font-black tracking-tight text-primary">
              Chatori Jeep<span className="text-white font-sans font-light"> Kitchen</span>
            </span>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-[240px]">
              Unified operations control center for Chatori Jeep Kitchen restaurant outlets and staff teams.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-primary hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <HugeiconsIcon icon={InstagramIcon} size={18} strokeWidth={2} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-primary hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <HugeiconsIcon icon={Facebook02Icon} size={18} strokeWidth={2} />
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-primary hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <HugeiconsIcon icon={WhatsappIcon} size={18} strokeWidth={2} />
              </a>
            </div>
          </div>
          
          {/* Col 2 - Product */}
          <div className="space-y-4">
            <h4 className="font-heading text-base font-bold text-white tracking-tight">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="#home"
                  onClick={(e) => handleScrollToSection(e, "home")}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Overview
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleScrollToSection(e, "features")}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleScrollToSection(e, "about")}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Kitchen Queue
                </a>
              </li>
              <li>
                <a
                  href="#dashboard"
                  onClick={(e) => handleScrollToSection(e, "dashboard")}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 - Support & Account */}
          <div className="space-y-4">
            <h4 className="font-heading text-base font-bold text-white tracking-tight">Account & Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Login Panel
                </Link>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => handleScrollToSection(e, "contact")}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 - Contact Info */}
          <div className="space-y-4">
            <h4 className="font-heading text-base font-bold text-white tracking-tight">Contact Us</h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-2.5">
                <HugeiconsIcon icon={PhoneCall} size={18} strokeWidth={2} className="text-primary shrink-0 mt-0.5" />
                <a href="tel:+919876543210" className="hover:text-primary transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <HugeiconsIcon icon={Clock01Icon} size={18} strokeWidth={2} className="text-primary shrink-0 mt-0.5" />
                <span>Mon - Sun: 11 AM - 11 PM</span>
              </li>
              <li className="flex items-start gap-2.5">
                <HugeiconsIcon icon={MapsLocation01Icon} size={18} strokeWidth={2} className="text-primary shrink-0 mt-0.5" />
                <span className="text-zinc-400">SG Highway, Ahmedabad, Gujarat - 380054</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-zinc-500">
          <span>&copy; 2026 Chatori Jeep Kitchen. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
