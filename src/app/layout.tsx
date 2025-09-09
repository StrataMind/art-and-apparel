export const dynamic = 'force-dynamic'

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { CartProvider } from "@/contexts/cart-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import CartSidebar from "@/components/cart/cart-sidebar";
import ErrorBoundary from "@/components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false, // Only preload primary font
});

export const metadata: Metadata = {
  title: "Findora - E-commerce Platform",
  description: "Modern e-commerce platform with secure authentication and seamless user experience",
  keywords: ["e-commerce", "shopping", "secure", "authentication", "next.js"],
  authors: [{ name: "Findora Team" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192x192.svg",
  },
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-KJF42B5EK8"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-KJF42B5EK8', {
                page_title: document.title,
                page_location: window.location.href,
              });
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Providers>
            <WishlistProvider>
              <CartProvider>
                {children}
                <CartSidebar />
                <Toaster />
                <Sonner position="top-right" />
              </CartProvider>
            </WishlistProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
