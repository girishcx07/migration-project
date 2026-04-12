import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trpc/$")({
  server: {
    handlers: {
      GET: () =>
        Response.json(
          { message: "tRPC is not enabled in this template." },
          { status: 404 },
        ),
      POST: () =>
        Response.json(
          { message: "tRPC is not enabled in this template." },
          { status: 404 },
        ),
    },
  },
});
