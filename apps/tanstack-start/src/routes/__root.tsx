/// <reference types="vite/client" />
import type * as React from "react";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { ThemeHotkey, ThemeProvider } from "@acme/ui/components/theme";
import { Toaster } from "@acme/ui/components/toast";

import appCss from "~/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground min-h-screen font-sans antialiased">
        <ThemeProvider>
          {children}
          <Toaster />
          <TanStackRouterDevtools position="bottom-right" />
          <ThemeHotkey />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
