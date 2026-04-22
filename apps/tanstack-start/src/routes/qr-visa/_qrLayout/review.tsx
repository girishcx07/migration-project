import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/qr-visa/_qrLayout/review")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Review Page Pending Migration</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          The `new-visa` flow now routes here from the shared module. The review
          module can be migrated next onto the same shared package boundary.
        </p>
      </section>
    </main>
  );
}
