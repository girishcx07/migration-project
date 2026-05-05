import { Link } from "react-router";

import { getModuleFromPath } from "@/server/route-params";

export default function Component() {
  const module = getModuleFromPath();

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 px-6">
      <div className="max-w-md rounded border border-zinc-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Unauthorized</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Please return to the module start route and try again.
        </p>
        <Link
          className="mt-4 inline-flex rounded bg-zinc-900 px-4 py-2 text-sm text-white"
          to={`/${module}/initialize`}
        >
          Restart
        </Link>
      </div>
    </main>
  );
}
