"use client";

import { useEffect, useState } from "react";

type IssueStatus =
  | "Reported"
  | "Under Review"
  | "In Progress"
  | "Resolved";

type Issue = {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  status: IssueStatus;
  assignedDepartment?: string;
  upvotes?: number;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  reportedBy?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  createdAt?: string;
};

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;
const statuses: IssueStatus[] = [
  "Reported",
  "Under Review",
  "In Progress",
  "Resolved",
];

const departments = [
  "Road Department",
  "Sanitation Department",
  "Water Department",
  "Electricity Department",
  "General Administration",
];

export default function OfficialDashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.role !== "official") {
        window.location.href = "/";
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  /* =====================================================
     FETCH ISSUES
  ===================================================== */

  async function fetchIssues() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/issues`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch issues"
        );
      }

      setIssues(data.issues || []);
    } catch (err: any) {
      console.error("Fetch issues error:", err);

      setError(
        err.message || "Unable to load issues"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "official") {
      fetchIssues();
    }
  }, [user]);

  /* =====================================================
     UPDATE STATUS
  ===================================================== */

  async function updateStatus(
    issueId: string,
    status: IssueStatus
  ) {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setUpdating(issueId);

      const response = await fetch(
        `${API_URL}/issues/${issueId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update status"
        );
      }

      setIssues((prev) =>
        prev.map((issue) =>
          issue._id === issueId
            ? {
                ...issue,
                status: data.issue?.status || status,
              }
            : issue
        )
      );
    } catch (err: any) {
      console.error("Update status error:", err);

      alert(
        err.message || "Unable to update status"
      );
    } finally {
      setUpdating(null);
    }
  }

  /* =====================================================
     UPDATE DEPARTMENT
  ===================================================== */

  async function updateDepartment(
    issueId: string,
    department: string
  ) {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setUpdating(issueId);

      const response = await fetch(
        `${API_URL}/issues/${issueId}/department`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            department,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update department"
        );
      }

      setIssues((prev) =>
        prev.map((issue) =>
          issue._id === issueId
            ? {
                ...issue,
                assignedDepartment:
                  data.issue?.assignedDepartment ||
                  department,
              }
            : issue
        )
      );
    } catch (err: any) {
      console.error(
        "Update department error:",
        err
      );

      alert(
        err.message ||
          "Unable to update department"
      );
    } finally {
      setUpdating(null);
    }
  }

  /* =====================================================
     LOGOUT
  ===================================================== */

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  }

  /* =====================================================
     STATUS STYLE
  ===================================================== */

  function getStatusStyle(status: IssueStatus) {
    switch (status) {
      case "Reported":
        return "border-white/10 bg-white/[0.04] text-white/60";

      case "Under Review":
        return "border-amber-400/20 bg-amber-400/10 text-amber-300";

      case "In Progress":
        return "border-blue-400/20 bg-blue-400/10 text-blue-300";

      case "Resolved":
        return "border-[#38d4c8]/20 bg-[#38d4c8]/10 text-[#65d7cd]";

      default:
        return "border-white/10 bg-white/[0.04] text-white/60";
    }
  }

  /* =====================================================
     STATS
  ===================================================== */

  const totalIssues = issues.length;

  const reportedIssues = issues.filter(
    (issue) => issue.status === "Reported"
  ).length;

  const reviewIssues = issues.filter(
    (issue) => issue.status === "Under Review"
  ).length;

  const progressIssues = issues.filter(
    (issue) => issue.status === "In Progress"
  ).length;

  const resolvedIssues = issues.filter(
    (issue) => issue.status === "Resolved"
  ).length;

  /* =====================================================
     LOADING
  ===================================================== */

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#040b0a] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#38d4c8]" />

          <p className="mt-4 text-sm text-white/40">
            Checking access...
          </p>
        </div>
      </main>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#040b0a] text-white">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-200px] top-[-150px] h-[500px] w-[500px] rounded-full bg-[#159b91]/10 blur-[140px]" />

        <div className="absolute right-[-200px] top-[400px] h-[500px] w-[500px] rounded-full bg-[#18b7aa]/10 blur-[150px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(21,155,145,.08),transparent_35%)]" />
      </div>

      {/* NAVBAR */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#06100e]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <div>
            <p className="text-lg font-semibold tracking-tight">
              Civic<span className="text-[#4ed6cb]">Track</span>
            </p>

            <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/30">
              Official Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                {user.name || "Official"}
              </p>

              <p className="text-[11px] capitalize text-[#59d8ce]">
                {user.role}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#159b91]/15 font-bold text-[#65d7cd]">
              {user.name?.charAt(0).toUpperCase() ||
                "O"}
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-red-400/15 px-4 py-2.5 text-xs font-semibold text-red-300 transition hover:border-red-400/30 hover:bg-red-400/10"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#48cec3]">
              Administration
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              Issue management
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
              Review citizen reports, assign departments,
              and keep the community updated.
            </p>
          </div>

          <button
            onClick={fetchIssues}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          >
            ↻ Refresh issues
          </button>
        </div>

        {/* STATS */}

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              label: "Total",
              value: totalIssues,
            },
            {
              label: "Reported",
              value: reportedIssues,
            },
            {
              label: "Under Review",
              value: reviewIssues,
            },
            {
              label: "In Progress",
              value: progressIssues,
            },
            {
              label: "Resolved",
              value: resolvedIssues,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
            >
              <p className="text-xs text-white/35">
                {stat.label}
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/5 p-5 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="mt-10 grid gap-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/[0.025]"
              />
            ))}
          </div>
        )}

        {/* EMPTY */}

        {!loading && !error && issues.length === 0 && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.025] p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#159b91]/10 text-2xl">
              ✓
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No issues yet
            </h2>

            <p className="mt-2 text-sm text-white/35">
              Citizen reports will appear here.
            </p>
          </div>
        )}

        {/* ISSUES */}

        {!loading && issues.length > 0 && (
          <div className="mt-10 space-y-5">
            {issues.map((issue) => (
              <article
                key={issue._id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-[#081412]/90 shadow-2xl"
              >
                <div className="grid lg:grid-cols-[280px_1fr]">
                  {/* IMAGE */}

                  <div className="relative min-h-[220px] bg-[#0b1b18]">
                    {issue.imageUrl ? (
                      <img
                        src={issue.imageUrl}
                        alt={issue.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-[220px] items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl">
                            📍
                          </div>

                          <p className="mt-3 text-xs text-white/25">
                            No image provided
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="absolute left-4 top-4">
                      <span
                        className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${getStatusStyle(
                          issue.status
                        )}`}
                      >
                        {issue.status}
                      </span>
                    </div>
                  </div>

                  {/* DETAILS */}

                  <div className="p-6 sm:p-7">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#48cec3]">
                          {issue.category}
                        </p>

                        <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
                          {issue.title}
                        </h2>

                        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/40">
                          {issue.description}
                        </p>
                      </div>

                      {typeof issue.upvotes ===
                        "number" && (
                        <div className="h-fit shrink-0 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center">
                          <p className="text-lg font-semibold">
                            {issue.upvotes}
                          </p>

                          <p className="text-[9px] uppercase tracking-wider text-white/30">
                            Upvotes
                          </p>
                        </div>
                      )}
                    </div>

                    {/* META */}

                    <div className="mt-6 grid gap-3 border-y border-white/10 py-5 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-white/25">
                          Reported by
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {issue.reportedBy?.name ||
                            "Unknown citizen"}
                        </p>

                        {issue.reportedBy?.email && (
                          <p className="mt-0.5 text-xs text-white/30">
                            {issue.reportedBy.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-white/25">
                          Reported
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {issue.createdAt
                            ? new Date(
                                issue.createdAt
                              ).toLocaleString()
                            : "Unknown"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-white/25">
                          Location
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {issue.location?.coordinates
                            ? `${issue.location.coordinates[1].toFixed(
                                5
                              )}, ${issue.location.coordinates[0].toFixed(
                                5
                              )}`
                            : "Location unavailable"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-white/25">
                          Department
                        </p>

                        <p className="mt-1 text-sm font-medium text-[#65d7cd]">
                          {issue.assignedDepartment ||
                            "Not assigned"}
                        </p>
                      </div>
                    </div>

                    {/* CONTROLS */}

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {/* STATUS */}

                      <div>
                        <label
                          htmlFor={`status-${issue._id}`}
                          className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-white/30"
                        >
                          Update status
                        </label>

                        <select
                          id={`status-${issue._id}`}
                          value={issue.status}
                          disabled={
                            updating === issue._id
                          }
                          onChange={(e) =>
                            updateStatus(
                              issue._id,
                              e.target
                                .value as IssueStatus
                            )
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#0b1917] px-4 py-3 text-sm text-white outline-none transition focus:border-[#159b91]/50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {statuses.map((status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* DEPARTMENT */}

                      <div>
                        <label
                          htmlFor={`department-${issue._id}`}
                          className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-white/30"
                        >
                          Assign department
                        </label>

                        <select
                          id={`department-${issue._id}`}
                          value={
                            issue.assignedDepartment ||
                            ""
                          }
                          disabled={
                            updating === issue._id
                          }
                          onChange={(e) => {
                            if (!e.target.value) return;

                            updateDepartment(
                              issue._id,
                              e.target.value
                            );
                          }}
                          className="w-full rounded-xl border border-white/10 bg-[#0b1917] px-4 py-3 text-sm text-white outline-none transition focus:border-[#159b91]/50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">
                            Select department
                          </option>

                          {departments.map(
                            (department) => (
                              <option
                                key={department}
                                value={department}
                              >
                                {department}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>

                    {/* MAP BUTTON */}

                    {issue.location?.coordinates && (
                      <a
                        href={`https://www.google.com/maps?q=${issue.location.coordinates[1]},${issue.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-xs font-medium text-white/55 transition hover:border-[#159b91]/30 hover:bg-[#159b91]/5 hover:text-[#65d7cd]"
                      >
                        📍 Open location in Maps →
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}