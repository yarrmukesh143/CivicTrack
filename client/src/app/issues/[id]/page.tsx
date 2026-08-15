"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Issue = {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  status: "Reported" | "Under Review" | "In Progress" | "Resolved";
  upvotes: number;
  location?: {
    type: "Point";
    coordinates: number[];
  };
  reportedBy?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  createdAt: string;
};

export default function IssueDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchIssue = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/issues/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load issue");
        }

        setIssue(data.issue);
      } catch (error) {
        console.error("Get issue error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load issue"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  const handleUpvote = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to upvote an issue.");
      return;
    }

    try {
      setUpvoting(true);

      const response = await fetch(
        `http://localhost:5000/api/issues/${id}/upvote`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upvote");
      }

      setIssue((currentIssue) =>
        currentIssue
          ? {
              ...currentIssue,
              upvotes: data.upvotes,
            }
          : currentIssue
      );
    } catch (error) {
      console.error("Upvote error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to upvote issue"
      );
    } finally {
      setUpvoting(false);
    }
  };

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusStyle = (status: Issue["status"]) => {
    switch (status) {
      case "Resolved":
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

      case "In Progress":
        return "border-blue-400/20 bg-blue-400/10 text-blue-300";

      case "Under Review":
        return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";

      default:
        return "border-white/10 bg-white/5 text-white/60";
    }
  };

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-[#06110f] text-white">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <div className="animate-pulse">
            <div className="h-5 w-32 rounded bg-white/10" />

            <div className="mt-8 h-80 rounded-3xl bg-white/5" />

            <div className="mt-8 h-8 w-2/3 rounded bg-white/10" />

            <div className="mt-4 h-20 rounded bg-white/5" />
          </div>
        </div>
      </main>
    );
  }

  // Error
  if (error || !issue) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06110f] px-5 text-white">
        <div className="w-full max-w-md rounded-3xl border border-red-400/20 bg-red-400/10 p-8 text-center">
          <div className="text-4xl">⚠️</div>

          <h1 className="mt-4 text-xl font-semibold">
            Issue not found
          </h1>

          <p className="mt-2 text-sm text-white/50">
            {error || "This report may have been removed."}
          </p>

          <Link
            href="/issues"
            className="mt-6 inline-flex rounded-xl bg-[#159b91] px-5 py-3 text-sm font-semibold transition hover:bg-[#18afa4]"
          >
            ← Back to reports
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#06110f] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/">
            <Image
              src="/civictrack_logo.png"
              alt="CivicTrack"
              width={155}
              height={80}
              className="h-11 w-auto object-contain"
              priority
            />
          </Link>

          <Link
            href="/issues"
            className="text-sm text-white/50 transition hover:text-white"
          >
            ← All Reports
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Back */}
        <Link
          href="/issues"
          className="text-sm text-[#55d2c8] transition hover:text-white"
        >
          ← Back to reports
        </Link>

        {/* Image */}
        <div className="relative mt-6 h-[280px] overflow-hidden rounded-3xl border border-white/10 bg-[#0b1b19] sm:h-[420px]">
          {issue.imageUrl ? (
            <Image
              src={issue.imageUrl}
              alt={issue.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-7xl opacity-20">🏙️</span>
            </div>
          )}
        </div>

        {/* Main card */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
          {/* Category + Status */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#48cec3]/20 bg-[#48cec3]/10 px-3 py-1.5 text-xs font-medium text-[#67ddd4]">
              {formatCategory(issue.category)}
            </span>

            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusStyle(
                issue.status
              )}`}
            >
              {issue.status}
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            {issue.title}
          </h1>

          {/* Description */}
          <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-white/55 sm:text-base">
            {issue.description}
          </p>

          {/* Meta */}
          <div className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/30">
                Reported by
              </p>

              <p className="mt-1 text-sm text-white/70">
                {issue.reportedBy?.name || "Citizen"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-white/30">
                Reported on
              </p>

              <p className="mt-1 text-sm text-white/70">
                {formatDate(issue.createdAt)}
              </p>
            </div>
          </div>

          {/* Location */}
          {issue.location?.coordinates?.length === 2 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4">
              <p className="text-xs uppercase tracking-wider text-white/30">
                Location
              </p>

              <p className="mt-2 text-sm text-white/60">
                📍 Latitude: {issue.location.coordinates[1]}
              </p>

              <p className="mt-1 text-sm text-white/60">
                📍 Longitude: {issue.location.coordinates[0]}
              </p>
            </div>
          )}

          {/* Upvote */}
          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white/40">
                Help this issue get attention
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {issue.upvotes}
                <span className="ml-2 text-sm font-normal text-white/40">
                  {issue.upvotes === 1 ? "upvote" : "upvotes"}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleUpvote}
              disabled={upvoting}
              className="rounded-xl bg-[#159b91] px-7 py-3.5 font-semibold transition hover:bg-[#18afa4] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {upvoting ? "Upvoting..." : "👍 Upvote Issue"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}