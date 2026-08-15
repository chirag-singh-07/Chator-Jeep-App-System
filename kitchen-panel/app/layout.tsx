import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans, Merriweather } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const merriweatherHeading = Merriweather({subsets:['latin'],variable:'--font-heading'});

const ibmPlexSans = IBM_Plex_Sans({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chatori Jeep Kitchen | Restaurant Management Platform",
  description: "Manage restaurant orders, kitchen operations, menus and daily performance from one simple restaurant management panel.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", ibmPlexSans.variable, merriweatherHeading.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
