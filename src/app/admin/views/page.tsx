"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Monitor, Smartphone, RefreshCw } from "lucide-react";

type ViewRow = {
  id: string;
  path: string;
  query: string | null;
  referrer: string | null;
  userAgent: string | null;
  ip: string | null;
  sessionId: string;
  userId: string | null;
  source: string;
  createdAt: string;
  browser: string;
  device: string;
  user: { id: string; name: string; email: string } | null;
};

type ViewsResponse = {
  views: ViewRow[];
  pagination: { page: number; limit: number; total: number; pages: number };
  summary: {
    total: number;
    todayViews: number;
    uniqueSessionsToday: number;
    topPages: { path: string; count: number }[];
  };
};

export default function AdminViewsPage() {
  const [data, setData] = useState<ViewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pathFilter, setPathFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (pathFilter.trim()) params.set("path", pathFilter.trim());

    fetch(`/api/admin/views?${params}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [page, pathFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = data?.summary;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e2e5e]">Page Views</h1>
          <p className="mt-1 text-gray-500">All tracked visits across the public site</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {summary && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Total views" value={summary.total} />
          <SummaryCard label="Views today" value={summary.todayViews} />
          <SummaryCard label="Unique visitors today" value={summary.uniqueSessionsToday} />
          <SummaryCard label="Top page hits" value={summary.topPages[0]?.count ?? 0} sub={summary.topPages[0]?.path} />
        </div>
      )}

      {summary && summary.topPages.length > 0 && (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-[#1e2e5e]">Top pages</h2>
          <div className="mt-4 space-y-2">
            {summary.topPages.map((row) => (
              <div key={row.path} className="flex items-center justify-between text-sm">
                <span className="font-mono text-gray-700">{row.path}</span>
                <span className="font-semibold text-[#2D83C2]">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={pathFilter}
          onChange={(e) => {
            setPage(1);
            setPathFilter(e.target.value);
          }}
          placeholder="Filter by path, e.g. /offers"
          className="min-w-[240px] flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#2D83C2]"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3">Visitor</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Referrer</th>
                <th className="px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {data?.views.map((view) => (
                <tr key={view.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                    {new Date(view.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono font-medium text-[#1e2e5e]">
                      {view.path}
                      {view.query && <span className="text-gray-400">{view.query}</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {view.user ? (
                      <div>
                        <p className="font-medium">{view.user.name}</p>
                        <p className="text-xs text-gray-400">{view.user.email}</p>
                      </div>
                    ) : (
                      <p className="font-mono text-xs text-gray-400">{view.sessionId.slice(0, 8)}…</p>
                    )}
                    {view.ip && <p className="text-[10px] text-gray-400">{view.ip}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      {view.device === "Mobile" ? <Smartphone size={14} /> : <Monitor size={14} />}
                      <span>{view.browser}</span>
                    </div>
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-xs text-gray-400">
                    {view.referrer || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {view.source}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && (data?.views.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <Eye className="mx-auto mb-2 opacity-40" size={28} />
                    No views recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <span className="text-gray-500">
              Page {data.pagination.page} of {data.pagination.pages} · {data.pagination.total} total
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= data.pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-2xl font-bold text-[#1e2e5e]">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="mt-1 truncate font-mono text-xs text-gray-400">{sub}</p>}
    </div>
  );
}
