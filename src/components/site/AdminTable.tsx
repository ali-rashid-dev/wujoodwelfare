"use client";
import { ChevronLeft, ChevronRight, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type AdminColumn =
  | string
  | {
      label: string;
      type?: "text" | "number" | "date" | "textarea" | "select";
      options?: string[];
      placeholder?: string;
    };

function normalize(col: AdminColumn) {
  return typeof col === "string" ? { label: col, type: "text" as const } : { type: "text" as const, ...col };
}

export function AdminTable({
  title,
  description,
  columns,
  rows: initialRows,
}: {
  title: string;
  description?: string;
  columns: AdminColumn[];
  rows: string[][];
}) {
  const cols = columns.map(normalize);
  const [rows, setRows] = useState<string[][]>(initialRows);
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<string[]>(() =>
    cols.map((c) => (c.type === "select" && c.options?.[0]) || ""),
  );

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => r.some((c) => c.toLowerCase().includes(q)));
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pageStart = (page - 1) * pageSize;
  const pageRows = filtered.slice(pageStart, pageStart + pageSize);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (draft.some((v) => !v.trim())) {
      toast.error("Please fill in all fields");
      return;
    }
    setRows((prev) => [...prev, draft]);
    setDraft(cols.map((c) => (c.type === "select" && c.options?.[0]) || ""));
    setShowAdd(false);
    toast.success("Added successfully");
  }

  function handleDelete(row: string[]) {
    const realIndex = rows.indexOf(row);
    if (realIndex === -1) return;
    setRows((prev) => prev.filter((_, i) => i !== realIndex));
    toast.success("Removed");
  }

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="h-10 rounded-full border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-full gradient-gold px-5 py-2.5 text-sm font-semibold text-secondary-foreground shadow-gold hover:-translate-y-0.5 transition-transform"
          >
            <Plus className="h-4 w-4" /> Add new
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                {cols.map((c) => (
                  <th key={c.label} className="text-left font-semibold px-5 py-3 whitespace-nowrap">{c.label}</th>
                ))}
                <th className="px-5 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={cols.length + 1} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No results found.
                  </td>
                </tr>
              )}
              {pageRows.map((r, i) => (
                <tr key={pageStart + i} className="border-t border-border hover:bg-muted/40">
                  {r.map((cell, j) => (
                    <td key={j} className="px-5 py-3.5 whitespace-nowrap">
                      {j === r.length - 1 && isStatusCell(cell) ? (
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${cell === "Active" || cell === "Completed" || cell === "Yes" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{cell}</span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(r)}
                      aria-label="Delete row"
                      className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 px-5 py-3 text-xs text-muted-foreground border-t border-border bg-muted/30">
          <span>
            Showing {filtered.length === 0 ? 0 : pageStart + 1}–{pageStart + pageRows.length} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-background disabled:opacity-40 hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-8 min-w-8 px-2 rounded-full text-xs font-semibold ${p === page ? "gradient-gold text-secondary-foreground shadow-gold" : "border border-border bg-background hover:bg-muted"}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-background disabled:opacity-40 hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setShowAdd(false)}>
          <form
            onSubmit={handleAdd}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-blue p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add new entry</h3>
              <button type="button" onClick={() => setShowAdd(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {cols.map((c, i) => (
                <div key={c.label}>
                  <label className="text-sm font-medium">{c.label}</label>
                  {c.type === "select" ? (
                    <select
                      required
                      value={draft[i]}
                      onChange={(e) =>
                        setDraft((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                      }
                      className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {c.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : c.type === "textarea" ? (
                    <textarea
                      required
                      rows={3}
                      placeholder={c.placeholder}
                      value={draft[i]}
                      onChange={(e) =>
                        setDraft((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                      }
                      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <input
                      required
                      type={c.type === "number" ? "number" : c.type === "date" ? "date" : "text"}
                      placeholder={c.placeholder}
                      value={draft[i]}
                      onChange={(e) =>
                        setDraft((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                      }
                      className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                Cancel
              </button>
              <button type="submit" className="rounded-full gradient-gold px-5 py-2 text-sm font-semibold text-secondary-foreground shadow-gold">
                Add entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function isStatusCell(value: string) {
  return ["Active", "Completed", "Pending", "Yes", "No", "Draft", "Inactive"].includes(value);
}
