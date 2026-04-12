import type { Metadata, Viewport } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";

import { ThemeHotkey, ThemeProvider } from "@acme/ui/components/theme";
import { Toaster } from "@acme/ui/components/toast";
import { cn } from "@acme/ui/lib/utils";

import "~/app/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Next.js Template",
  description: "Plain Next.js app template",
  openGraph: {
    title: "Next.js Template",
    description: "Plain Next.js app template",
    url: "http://localhost:3000",
    siteName: "Next.js Template",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "antialiased",
          fontMono.variable,
          "font-sans",
          spaceGrotesk.variable,
        )}
      >
        <ThemeProvider>
          {props.children}
          <Toaster />
          <ThemeHotkey />
        </ThemeProvider>
      </body>
    </html>
  );
}
