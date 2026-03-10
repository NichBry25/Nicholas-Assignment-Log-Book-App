import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Assignment Log Book API
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-100">
            REST API for managing assignments.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            Use the endpoints to create, list, update, and delete assignments. The
            interactive Swagger UI is available at /docs.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/docs"
            className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-900"
          >
            Open Swagger UI
          </Link>
          <a
            href="/api/docs"
            className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-200"
          >
            View OpenAPI JSON
          </a>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-slate-100">Core Endpoints</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>GET /api/assignments</li>
            <li>POST /api/assignments</li>
            <li>GET /api/assignments/{`{id}`}</li>
            <li>PUT /api/assignments/{`{id}`}</li>
            <li>DELETE /api/assignments/{`{id}`}</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
