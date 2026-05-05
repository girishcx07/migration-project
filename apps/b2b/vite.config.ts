import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc/plugin";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    dedupe: ["react", "react-dom"],
    noExternal: [
      /^@diceui\//,
      /^@floating-ui\//,
      /^@radix-ui\//,
      "@tanstack/react-query",
      "cmdk",
      "input-otp",
      "lucide-react",
      "motion",
      "next-themes",
      "radix-ui",
      "react-day-picker",
      "react-hook-form",
      "react-remove-scroll",
      "react-remove-scroll-bar",
      "react-style-singleton",
      "sonner",
      "use-callback-ref",
      "use-sidecar",
      "vaul",
    ],
    tsconfigPaths: true,
  },
  environments: {
    client: {
      optimizeDeps: {
        include: ["react-router", "react-router/internal/react-server-client"],
      },
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    rsc({
      entries: {
        client: "src/entry.browser.tsx",
        rsc: "src/entry.rsc.tsx",
        ssr: "src/entry.ssr.tsx",
      },
    }),
    devtoolsJson(),
  ],
});
