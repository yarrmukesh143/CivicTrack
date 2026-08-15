"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Issue = {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  photoUrl?: string;
  status: string;
  upvotes: number;
  location?: {
    type: string;
    coordinates: number[];
  };
  reportedBy?: {
    name?: string;
    email?: string;
  };
  createdAt: string;
};

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError("");

      const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/issues`,
  {
    method: "GET",
    cache: "no-store",
  }
);

        const data = await response.json();

        console.log("API RESPONSE:", data);

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch issues"
          );
        }

        setIssues(data.issues || []);
      } catch (error) {
        console.error("Fetch issues error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load issues"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#071211] px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-white/50">Loading issues...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#071211] px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6">
            <h2 className="text-xl font-semibold text-red-300">
              Unable to load issues
            </h2>

            <p className="mt-2 text-sm text-red-200/70">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#071211] px-5 py-12 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-[#48cec3]">
            CivicTrack
          </p>

          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
            Community Issues
          </h1>

          <p className="mt-3 max-w-2xl text-white/50">
            See problems reported by citizens and help bring
            attention to the issues that matter.
          </p>
        </div>

        {/* Empty state */}
        {issues.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-10 text-center">
            <h2 className="text-2xl font-semibold">
              No issues reported yet
            </h2>

            <p className="mt-2 text-white/50">
              Be the first person to report an issue in your area.
            </p>

            <Link
              href="/report"
              className="mt-6 inline-flex rounded-xl bg-[#159b91] px-6 py-3 font-semibold transition hover:bg-[#18afa4]"
            >
              Report an issue →
            </Link>
          </div>
        ) : (
          /* Cards */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue) => (
              <Link
                href={`/issues/${issue._id}`}
                key={issue._id}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] transition duration-300 hover:-translate-y-1 hover:border-[#159b91]/40 hover:bg-white/[0.055]"
              >
                {/* Image */}
                {issue.imageUrl || issue.photoUrl ? (
                  <div className="h-52 overflow-hidden bg-black/20">
                    <img
                      src={
                        issue.imageUrl || issue.photoUrl
                      }
                      alt={issue.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-52 items-center justify-center bg-gradient-to-br from-[#0d2926] to-[#071211]">
                    <span className="text-5xl">🏙️</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">

                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#159b91]/10 px-3 py-1 text-xs font-medium capitalize text-[#55d2c8]">
                      {issue.category}
                    </span>

                    <span className="text-xs text-white/40">
                      {issue.status}
                    </span>
                  </div>

                  <h2 className="mt-4 line-clamp-2 text-xl font-semibold">
                    {issue.title}
                  </h2>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/50">
                    {issue.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">

                    <span className="text-sm text-white/40">
                      👍 {issue.upvotes} upvotes
                    </span>

                    <span className="text-sm font-medium text-[#55d2c8] transition group-hover:text-white">
                      View details →
                    </span>

                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
