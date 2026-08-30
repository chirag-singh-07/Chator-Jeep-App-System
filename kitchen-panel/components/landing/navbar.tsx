"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, ShoppingBag01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Dashboard", href: "#dashboard" },
];

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const targetId = href.replace("#", "");
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        scrolled
          ? "bg-background/90 backdrop-blur-md border-border/40 shadow-xs py-3"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="#home" className="flex items-center gap-2 group">
          <Image
            src="/Restaurant-app-logo.png"
            alt="Chatori Jeep Kitchen Logo"
            width={44}
            height={44}
            className="w-11 h-auto object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <span className="font-heading text-xl md:text-2xl font-black tracking-tight text-primary transition-colors">
            Chatori Jeep<span className="text-foreground dark:text-zinc-50 font-sans font-light"> Kitchen</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleScrollToSection(e, item.href)}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          {mounted && isAuthenticated ? (
            <Link href="/dashboard">
              <Button className="rounded-full px-6 font-bold shadow-md shadow-primary/20">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" className="rounded-full font-bold">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full px-6 font-bold shadow-md shadow-primary/20 hover:scale-105 transition-transform">
                  Join Now
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Navigation Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-full hover:bg-muted/50"
                  aria-label="Toggle Menu"
                >
                  <HugeiconsIcon icon={Menu01Icon} size={24} strokeWidth={2} className="text-foreground" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col justify-between p-6">
              <div className="space-y-8 mt-12">
                <div className="border-b pb-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/Restaurant-app-logo.png"
                      alt="Chatori Jeep Kitchen Logo"
                      width={36}
                      height={36}
                      className="w-9 h-auto object-contain"
                    />
                    <span className="font-heading text-xl font-black text-primary">
                      Chatori Jeep
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Kitchen Panel Landing</p>
                </div>
                
                <nav className="flex flex-col gap-5">
                  {navItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => handleScrollToSection(e, item.href)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors py-1"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <Link href="/login" className="w-full block" onClick={() => setIsOpen(false)}>
                  <Button className="w-full rounded-full py-6 font-bold text-base">
                    Login
                  </Button>
                </Link>
                <p className="text-center text-xs text-muted-foreground">
                  Control Center Entry Portal
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
