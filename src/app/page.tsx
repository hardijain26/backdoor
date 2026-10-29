export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-white">Backdoor v1.0</h1>
        <p className="text-slate-400">
          Career acceleration command center based on the Three Doors thesis.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <a
            href="/radar"
            className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 transition"
          >
            Launch Radar
          </a>
          <a
            href="/jobs"
            className="rounded border border-slate-700 bg-slate-900 px-4 py-2 font-medium text-slate-200 hover:bg-slate-800 transition"
          >
            View Jobs
          </a>
        </div>
      </div>
    </main>
  );
}
