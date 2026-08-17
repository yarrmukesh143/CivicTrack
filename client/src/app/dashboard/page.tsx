"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type IssueStatus =
  | "Reported"
  | "Under Review"
  | "In Progress"
  | "Resolved";

type Issue = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  status: IssueStatus;
  createdAt?: string;
  imageUrl?: string;
};

type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: "citizen" | "official";
};

const statusStyles: Record<
  IssueStatus,
  string
> = {
  Reported:
    "border-white/10 bg-white/[0.05] text-white/60",

  "Under Review":
    "border-amber-400/20 bg-amber-400/10 text-amber-300",

  "In Progress":
    "border-blue-400/20 bg-blue-400/10 text-blue-300",

  Resolved:
    "border-[#159b91]/20 bg-[#159b91]/10 text-[#65d7cd]",
};

export default function DashboardPage() {
  const [user, setUser] =
    useState<User | null>(null);

  const [issues, setIssues] = useState<Issue[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] =
    useState(false);

  /* ---------------------------------------------
     Load User
  --------------------------------------------- */

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    try {
      const parsedUser = JSON.parse(
        storedUser
      );

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      window.location.href = "/login";
    }
  }, []);

  /* ---------------------------------------------
     Fetch Issues
  --------------------------------------------- */

  async function fetchIssues(
    showRefresh = false
  ) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      /*
       * IMPORTANT:
       *
       * Yahan apne backend ka actual endpoint
       * lagana hai agar tumhare backend me
       * endpoint different hai.
       *
       * Example:
       * /api/issues/my
       */

      const response = await fetch(
        "/api/issues/api",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load your reports."
        );
      }

      const data = await response.json();

      /*
       * Backend response agar:
       *
       * { issues: [...] }
       *
       * hai to ye chalega.
       */

      setIssues(data.issues || []);
    } catch (err) {
      console.error(err);

      setError(
        "Reports load nahi ho pa rahe. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (user) {
      fetchIssues();
    }
  }, [user]);

  /* ---------------------------------------------
     Logout
  --------------------------------------------- */

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  }

  /* ---------------------------------------------
     Stats
  --------------------------------------------- */

  const totalIssues = issues.length;

  const underReview = issues.filter(
    (issue) =>
      issue.status === "Under Review"
  ).length;

  const inProgress = issues.filter(
    (issue) =>
      issue.status === "In Progress"
  ).length;

  const resolved = issues.filter(
    (issue) => issue.status === "Resolved"
  ).length;

  return (
    <main className="min-h-screen bg-[#060f0e] text-white">
      {/* Ambient background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-150px] top-[100px] h-[400px] w-[400px] rounded-full bg-[#0d8179]/10 blur-[130px]" />

        <div className="absolute right-[-150px] top-[400px] h-[500px] w-[500px] rounded-full bg-[#18b7aa]/10 blur-[150px]" />
      </div>

      {/* -----------------------------------------
          NAVBAR
      ----------------------------------------- */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071312]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            Civic<span className="text-[#48cec3]">
              Track
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user?.name || "Citizen"}
              </p>

              <p className="text-xs capitalize text-white/35">
                {user?.role || "citizen"}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#159b91]/15 font-semibold text-[#65d7cd]">
              {user?.name
                ?.charAt(0)
                .toUpperCase() || "C"}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-red-400/20 px-4 py-2 text-xs font-medium text-red-300 transition hover:bg-red-400/10"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* -----------------------------------------
          CONTENT
      ----------------------------------------- */}

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        {/* Header */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#48cec3]">
              Citizen Dashboard
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back,{" "}
              <span className="text-[#65d7cd]">
                {user?.name || "Citizen"}
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
              Track your reported civic issues
              and see how they are progressing.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fetchIssues(true)}
              disabled={refreshing}
              className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium transition hover:border-[#159b91]/40 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

            <Link
              href="/report"
              className="rounded-full bg-[#159b91] px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-[#18afa4]"
            >
              + Report Issue
            </Link>
          </div>
        </div>

        {/* -----------------------------------------
            STATS
        ----------------------------------------- */}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Reports"
            value={totalIssues}
            icon="📋"
          />

          <StatCard
            label="Under Review"
            value={underReview}
            icon="🔎"
          />

          <StatCard
            label="In Progress"
            value={inProgress}
            icon="⚙️"
          />

          <StatCard
            label="Resolved"
            value={resolved}
            icon="✓"
          />
        </div>

        {/* -----------------------------------------
            REPORTS
        ----------------------------------------- */}

        <div className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                My Reports
              </h2>

              <p className="mt-1 text-sm text-white/35">
                Your latest civic reports
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/40">
              {issues.length} reports
            </span>
          </div>

          {/* Error */}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5">
              <p className="text-sm text-red-300">
                {error}
              </p>

              <button
                type="button"
                onClick={() => fetchIssues()}
                className="mt-3 text-xs font-semibold text-red-200 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading */}

          {loading && !error && (
            <div className="mt-6 grid gap-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.025] p-6"
                >
                  <div className="h-4 w-1/3 rounded bg-white/10" />

                  <div className="mt-4 h-3 w-2/3 rounded bg-white/5" />

                  <div className="mt-3 h-3 w-1/2 rounded bg-white/5" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}

          {!loading &&
            !error &&
            issues.length === 0 && (
              <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#159b91]/10 text-2xl">
                  📍
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  No reports yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
                  You haven't reported any civic
                  issues yet. Spot something that
                  needs attention?
                </p>

                <Link
                  href="/report"
                  className="mt-6 inline-flex rounded-full bg-[#159b91] px-6 py-3 text-sm font-semibold transition hover:bg-[#18afa4]"
                >
                  Report your first issue
                </Link>
              </div>
            )}

          {/* Issue Cards */}

          {!loading &&
            !error &&
            issues.length > 0 && (
              <div className="mt-6 grid gap-4">
                {issues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                  />
                ))}
              </div>
            )}
        </div>
      </section>
    </main>
  );
}

/* =================================================
   STAT CARD
================================================= */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#159b91]/30 hover:bg-white/[0.05]">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#159b91]/10 text-lg">
          {icon}
        </div>

        <span className="text-3xl font-semibold tracking-tight">
          {value}
        </span>
      </div>

      <p className="mt-5 text-sm text-white/40">
        {label}
      </p>
    </div>
  );
}

/* =================================================
   ISSUE CARD
================================================= */

function IssueCard({
  issue,
}: {
  issue: Issue;
}) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#159b91]/30 hover:bg-white/[0.04] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* LEFT */}

        <div className="flex min-w-0 gap-4">
          {/* Image */}

          {issue.imageUrl ? (
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="h-20 w-20 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#0d211e] text-2xl">
              📍
            </div>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold sm:text-lg">
                {issue.title}
              </h3>

              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-medium ${statusStyles[
                  issue.status
                ]}`}
              >
                {issue.status}
              </span>
            </div>

            {issue.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/40">
                {issue.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/30">
              {issue.location && (
                <span>
                  📍 {issue.location}
                </span>
              )}

              {issue.createdAt && (
                <span>
                  🕒 {formatDate(issue.createdAt)}
                </span>
              )}

              <span>
                ID: {issue.id}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex shrink-0 items-center gap-3 lg:justify-end">
          <Link
            href={`/issues/${issue.id}`}
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs font-semibold transition hover:border-[#159b91]/40 hover:bg-[#159b91]/10"
          >
            View Details →
          </Link>
        </div>
      </div>

      {/* STATUS PROGRESS */}

      <div className="mt-6 border-t border-white/10 pt-5">
        <StatusProgress status={issue.status} />
      </div>
    </div>
  );
}

/* =================================================
   STATUS PROGRESS
================================================= */

function StatusProgress({
  status,
}: {
  status: IssueStatus;
}) {
  const statuses: IssueStatus[] = [
    "Reported",
    "Under Review",
    "In Progress",
    "Resolved",
  ];

  const activeIndex =
    statuses.indexOf(status);

  return (
    <div>
      <div className="flex items-center justify-between">
        {statuses.map((item, index) => {
          const active =
            index <= activeIndex;

          return (
            <div
              key={item}
              className="flex flex-1 items-center"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold transition ${
                    active
                      ? "border-[#159b91]/40 bg-[#159b91] text-white"
                      : "border-white/10 bg-white/[0.03] text-white/20"
                  }`}
                >
                  {active ? "✓" : index + 1}
                </div>

                <span
                  className={`mt-2 hidden text-[10px] sm:block ${
                    active
                      ? "text-white/70"
                      : "text-white/20"
                  }`}
                >
                  {item}
                </span>
              </div>

              {index < statuses.length - 1 && (
                <div
                  className={`mx-2 h-px flex-1 ${
                    index < activeIndex
                      ? "bg-[#159b91]/60"
                      : "bg-white/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =================================================
   DATE
================================================= */

function formatDate(date?: string) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}