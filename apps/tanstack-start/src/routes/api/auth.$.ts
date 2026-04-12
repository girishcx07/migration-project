import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: () =>
        Response.json(
          { message: "Auth is not enabled in this template." },
          { status: 404 },
        ),
      POST: () =>
        Response.json(
          { message: "Auth is not enabled in this template." },
          { status: 404 },
        ),
    },
  },
});
