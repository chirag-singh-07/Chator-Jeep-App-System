"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number; // delay in milliseconds
  duration?: number; // duration in milliseconds
  animation?: "fade-in-up" | "fade-in" | "slide-left" | "slide-right" | "zoom-in";
}

export function ScrollReveal({
  children,
  delay = 0,
  duration = 600,
  animation = "fade-in-up",
  className,
  ...props
}: ScrollRevealProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px", // Trigger slightly before it comes into view
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const animationClasses = {
    "fade-in-up": "opacity-0 translate-y-8 data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0",
    "fade-in": "opacity-0 data-[visible=true]:opacity-100",
    "slide-left": "opacity-0 -translate-x-12 data-[visible=true]:opacity-100 data-[visible=true]:translate-x-0",
    "slide-right": "opacity-0 translate-x-12 data-[visible=true]:opacity-100 data-[visible=true]:translate-x-0",
    "zoom-in": "opacity-0 scale-95 data-[visible=true]:opacity-100 data-[visible=true]:scale-100",
  };

  return (
    <div
      ref={ref}
      data-visible={isIntersecting}
      className={cn(
        "transition-all cubic-bezier(0.16, 1, 0.3, 1) motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100",
        animationClasses[animation],
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
export default ScrollReveal;
